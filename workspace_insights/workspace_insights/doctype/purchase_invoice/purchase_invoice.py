# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import frappe
import csv
import io
import base64
from frappe.model.document import Document
from frappe.utils import nowdate


class PurchaseInvoice(Document):
    pass


# ── xlsx → CSV converter ──

def xlsx_to_csv(b64_content):
    """
    Decode base64-encoded xlsx file and convert its first sheet to a CSV string.
    Uses openpyxl (bundled with Frappe/Python).
    Proper CSV quoting is applied so cells with commas don't break parsing.
    """
    try:
        import openpyxl
    except ImportError:
        frappe.throw("openpyxl is required for Excel import. Run: pip install openpyxl --break-system-packages")

    raw   = base64.b64decode(b64_content)
    wb    = openpyxl.load_workbook(io.BytesIO(raw), data_only=True)
    ws    = wb.active

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    for row in ws.iter_rows(values_only=True):
        writer.writerow(['' if c is None else str(c) for c in row])

    return output.getvalue()


# ── Main import method ──

@frappe.whitelist()
def import_workspace_csv_content(csv_content='', file_type='csv'):
    """
    Parse a Google Workspace invoice file (CSV or XLSX) and create a Purchase Invoice.

    Parameters:
      csv_content — plain CSV text (for csv) OR base64-encoded xlsx bytes (for xlsx)
      file_type   — 'csv' | 'xlsx'

    Key behaviours:
    - Duplicate invoice → stopped immediately, existing doc returned.
    - Unregistered domains → skipped (not blocked), listed in response.
    - New Subscription Plan records → auto-created on first import.
    """
    try:
        # ── Convert xlsx → csv string if needed ──────────────────
        if file_type == 'xlsx':
            try:
                csv_content = xlsx_to_csv(csv_content)
            except Exception as e:
                return {
                    'success': False,
                    'error':   f"Could not read Excel file: {str(e)}"
                }

        # ── Strip BOM ─────────────────────────────────────────────
        if csv_content.startswith('\ufeff'):
            csv_content = csv_content[1:]

        lines = csv_content.replace('\r', '').split('\n')
        lines = [l.strip() for l in lines]

        # ── Parse invoice header ──────────────────────────────────
        header         = {}
        data_start_idx = -1

        for i, line in enumerate(lines):
            if not line:
                continue
            cols = parse_line(line)
            if not cols:
                continue
            key = cols[0].strip()

            if   key == 'Bill to':        header['bill_to']        = cols[1] if len(cols) > 1 else ''
            elif key == 'Invoice number': header['invoice_number'] = cols[1] if len(cols) > 1 else ''
            elif key == 'Invoice date':   header['invoice_date']   = parse_date(cols[1] if len(cols) > 1 else '')
            elif key == 'Due Date':       header['due_date']       = parse_date(cols[1] if len(cols) > 1 else '')
            elif key == 'Billing ID':     header['billing_id']     = cols[1] if len(cols) > 1 else ''
            elif key == 'Currency':       header['currency']       = cols[1] if len(cols) > 1 else 'INR'
            elif key == 'Invoice amount': header['invoice_amount'] = parse_amount(cols[1] if len(cols) > 1 else '0')
            elif key == 'Domain name':
                data_start_idx = i + 1
                break

        if not header.get('invoice_number'):
            return {
                'success': False,
                'error':   (
                    'Invalid file — "Invoice number" row not found.\n'
                    'Please use the original Google Workspace invoice file '
                    '(CSV or Excel) downloaded from Google Admin console.'
                )
            }

        if data_start_idx < 0:
            return {
                'success': False,
                'error':   'Invalid file — "Domain name" header row not found.'
            }

        # ── Duplicate check ───────────────────────────────────────
        existing = frappe.db.get_value(
            'Purchase Invoice',
            {'invoice_number': header['invoice_number']},
            'name'
        )
        if existing:
            return {
                'success':        False,
                'duplicate':      True,
                'invoice_number': header['invoice_number'],
                'existing_doc':   existing,
                'error':          f"Invoice {header['invoice_number']} already imported as {existing}."
            }

        # ── Build normalized subscription plan lookup ─────────────
        # Use unicodedata NFKC normalization — converts ALL Unicode
        # whitespace variants (\xa0, \u2009, \u00a0, etc.) to regular
        # space. This is the definitive fix for Google CSV's non-breaking
        # spaces inside brackets like "(100\xa0GB)".

        import unicodedata

        def norm(s):
            s = unicodedata.normalize('NFKC', s or '')
            return ' '.join(s.split()).lower()

        all_plans   = frappe.get_all('Subscription Plan', fields=['name', 'subscription'])
        plan_lookup = {}
        for p in all_plans:
            if p.subscription:
                plan_lookup[norm(p.subscription)] = p.name
            if p.name:
                plan_lookup[norm(p.name)] = p.name

        # ── First pass — scan ALL rows ────────────────────────────
        missing_domains       = []
        missing_subscriptions = []
        valid_rows            = []

        for line in lines[data_start_idx:]:
            if not line:
                continue
            cols = parse_line(line)
            if not cols:
                continue

            domain = cols[0].strip()
            if not domain or '.' not in domain:
                continue

            # Normalize subscription text from CSV
            raw_sub           = cols[1].strip() if len(cols) > 1 else ''
            subscription_text = unicodedata.normalize('NFKC', raw_sub)
            subscription_text = ' '.join(subscription_text.split())
            if not subscription_text:
                continue

            # ── Domain check ──────────────────────────────────────
            if not frappe.db.exists('Domains', domain):
                if domain not in missing_domains:
                    missing_domains.append(domain)
                continue

            # ── Subscription check ────────────────────────────────
            plan_doc_name = plan_lookup.get(norm(subscription_text))

            if not plan_doc_name:
                if subscription_text not in missing_subscriptions:
                    missing_subscriptions.append(subscription_text)
                continue

            valid_rows.append({
                'doctype':      'Purchase Invoice Items',
                'domain':       domain,
                'subscription': subscription_text,
                'description':  cols[2].strip() if len(cols) > 2 else '',
                'order_name':   cols[3].strip() if len(cols) > 3 else '',
                'start_date':   parse_date_short(cols[4] if len(cols) > 4 else '', header.get('invoice_date', '')),
                'end_date':     parse_date_short(cols[5] if len(cols) > 5 else '', header.get('invoice_date', '')),
                'quantity':     safe_int(cols[6]   if len(cols) > 6  else '0'),
                'po_number':    cols[7].strip()    if len(cols) > 7  else '',
                'amount':       parse_amount(cols[8] if len(cols) > 8 else '0'),
                'customer_id':  cols[9].strip()    if len(cols) > 9  else '',
                'sku_id':       cols[10].strip()   if len(cols) > 10 else '',
            })

        # ── Nothing to import ─────────────────────────────────────
        if not valid_rows:
            msg = "Nothing imported."
            if missing_domains:
                msg += f" {len(missing_domains)} domain(s) not registered."
            if missing_subscriptions:
                msg += f" {len(missing_subscriptions)} subscription(s) not found in Subscription Plan."
            return {
                'success':                False,
                'missing_domains':        missing_domains,
                'missing_subscriptions':  missing_subscriptions,
                'error':                  msg
            }

        # ── Create Purchase Invoice ───────────────────────────────
        doc = frappe.get_doc({
            'doctype':        'Purchase Invoice',
            'bill_to':        header.get('bill_to', ''),
            'invoice_number': header.get('invoice_number', ''),
            'invoice_date':   header.get('invoice_date'),
            'due_date':       header.get('due_date'),
            'billing_id':     header.get('billing_id', ''),
            'currency':       header.get('currency', 'INR'),
            'invoice_amount': header.get('invoice_amount', 0),
            'domain_details': valid_rows
        })
        doc.insert(ignore_permissions=True)
        frappe.db.commit()

        return {
            'success':                True,
            'name':                   doc.name,
            'invoice_number':         doc.invoice_number,
            'billing_id':             doc.billing_id,
            'total_rows':             len(valid_rows),
            'missing_domains':        missing_domains,
            'missing_subscriptions':  missing_subscriptions,
            'message':                f"{doc.invoice_number} imported — {len(valid_rows)} domain rows added."
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'Workspace CSV Import Error')
        return {'success': False, 'error': str(e)}


# ── Helpers ──

def parse_line(line):
    try:
        reader = csv.reader(io.StringIO(line))
        for row in reader:
            return [c.strip() for c in row]
    except Exception:
        pass
    return []


def parse_amount(raw):
    try:
        return float(str(raw).replace(',', '').strip())
    except Exception:
        return 0.0


def safe_int(raw):
    try:
        return int(str(raw).strip().replace(',', ''))
    except Exception:
        return 0


def parse_date(raw):
    if not raw:
        return None
    raw = raw.strip()
    months = {
        'Jan':'01','Feb':'02','Mar':'03','Apr':'04',
        'May':'05','Jun':'06','Jul':'07','Aug':'08',
        'Sep':'09','Oct':'10','Nov':'11','Dec':'12'
    }
    if '-' in raw:
        parts = raw.split('-')
        if len(parts) == 3:
            day = parts[0].zfill(2)
            mon = months.get(parts[1][:3].title(), parts[1].zfill(2))
            yr  = ('20' + parts[2]) if len(parts[2]) == 2 else parts[2]
            return f"{yr}-{mon}-{day}"
    if '/' in raw:
        parts = raw.split('/')
        if len(parts) == 3:
            day = parts[0].zfill(2)
            mon = parts[1].zfill(2)
            yr  = ('20' + parts[2]) if len(parts[2]) == 2 else parts[2]
            return f"{yr}-{mon}-{day}"
    parts = raw.split()
    if len(parts) == 3:
        day = parts[0].zfill(2)
        mon = months.get(parts[1][:3].title(), '01')
        yr  = ('20' + parts[2]) if len(parts[2]) == 2 else parts[2]
        return f"{yr}-{mon}-{day}"
    return None


def parse_date_short(raw, invoice_date_str):
    if not raw or not raw.strip():
        return None
    raw = raw.strip()
    months = {
        'Jan':'01','Feb':'02','Mar':'03','Apr':'04',
        'May':'05','Jun':'06','Jul':'07','Aug':'08',
        'Sep':'09','Oct':'10','Nov':'11','Dec':'12'
    }
    year = invoice_date_str[:4] if invoice_date_str and len(invoice_date_str) >= 4 else nowdate()[:4]
    if '-' in raw:
        parts = raw.split('-')
        if len(parts) == 2:
            day = parts[0].zfill(2)
            mon = months.get(parts[1][:3].title(), '01')
            return f"{year}-{mon}-{day}"
    parts = raw.split()
    if len(parts) == 2:
        day = parts[0].zfill(2)
        mon = months.get(parts[1][:3].title(), '01')
        return f"{year}-{mon}-{day}"
    return None

















