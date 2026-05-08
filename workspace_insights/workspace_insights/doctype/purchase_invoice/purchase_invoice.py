# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import frappe
import csv
import io
from frappe.model.document import Document
from frappe.utils import nowdate


class PurchaseInvoice(Document):
	pass


@frappe.whitelist()
def import_workspace_csv_content(csv_content):
	try:
		# BOM remove
		if csv_content.startswith('\ufeff'):
			csv_content = csv_content[1:]

		lines = csv_content.replace('\r', '').split('\n')
		lines = [l.strip() for l in lines]

		# ── Header section parse ──
		header         = {}
		data_start_idx = -1

		for i, line in enumerate(lines):
			if not line:
				continue
			cols = parse_line(line)
			if not cols:
				continue

			key = cols[0].strip()

			if key == 'Bill to':          header['bill_to']        = cols[1] if len(cols) > 1 else ''
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
			return {'success': False, 'error': 'Invalid CSV — Invoice number nahi mila'}

		if data_start_idx < 0:
			return {'success': False, 'error': 'Invalid CSV — Data section nahi mila'}

		# ── Duplicate check ──
		existing = frappe.db.get_value(
			'Purchase Invoice',                        # ✅ sahi naam
			{'invoice_number': header['invoice_number']},
			'name'
		)
		if existing:
			return {
				'success':        False,
				'duplicate':      True,
				'invoice_number': header['invoice_number'],
				'existing_doc':   existing,
				'error':          f"Invoice {header['invoice_number']} already imported hai ({existing})"
			}

		# ── Child rows parse ──
		child_rows = []
		for line in lines[data_start_idx:]:
			if not line:
				continue
			cols = parse_line(line)
			if not cols:
				continue

			domain = cols[0].strip()
			if not domain or '.' not in domain:
				continue

			subscription = cols[1].strip() if len(cols) > 1 else ''
			if not subscription:
				continue

			child_rows.append({
				'doctype':      'Purchase Invoice Items',  # child table ka naam same hai
				'domain':       domain,
				'subscription': subscription,
				'description':  cols[2].strip() if len(cols) > 2 else '',
				'order_name':   cols[3].strip() if len(cols) > 3 else '',
				'start_date':   parse_date_short(cols[4] if len(cols) > 4 else '', header.get('invoice_date', '')),
				'end_date':     parse_date_short(cols[5] if len(cols) > 5 else '', header.get('invoice_date', '')),
				'quantity':     safe_int(cols[6] if len(cols) > 6 else '0'),
				'po_number':    cols[7].strip() if len(cols) > 7 else '',
				'amount':       parse_amount(cols[8] if len(cols) > 8 else '0'),
				'customer_id':  cols[9].strip() if len(cols) > 9 else '',
				'sku_id':       cols[10].strip() if len(cols) > 10 else '',
			})

		if not child_rows:
			return {'success': False, 'error': 'CSV mein koi valid domain rows nahi mile'}

		# ── Parent + Child save ──
		doc = frappe.get_doc({
			'doctype':        'Purchase Invoice',          # ✅ sahi naam
			'bill_to':        header.get('bill_to', ''),
			'invoice_number': header.get('invoice_number', ''),
			'invoice_date':   header.get('invoice_date'),
			'due_date':       header.get('due_date'),
			'billing_id':     header.get('billing_id', ''),
			'currency':       header.get('currency', 'INR'),
			'invoice_amount': header.get('invoice_amount', 0),
			'domain_details': child_rows
		})
		doc.insert(ignore_permissions=True)
		frappe.db.commit()

		return {
			'success':        True,
			'name':           doc.name,
			'invoice_number': doc.invoice_number,
			'billing_id':     doc.billing_id,
			'total_rows':     len(child_rows),
			'message':        f"{doc.invoice_number} imported — {len(child_rows)} rows"
		}

	except Exception as e:
		frappe.log_error(frappe.get_traceback(), "Workspace CSV Import Error")
		return {'success': False, 'error': str(e)}


# ── Helpers ───────────────────────────────────────────────────────
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
	"""
	Handles both formats:
	  '31 Jan 2025'  → '2025-01-31'
	  '31-Mar-26'    → '2026-03-31'
	  '31-Mar-2026'  → '2026-03-31'
	"""
	if not raw:
		return None
	raw = raw.strip()
	months = {
		'Jan':'01','Feb':'02','Mar':'03','Apr':'04',
		'May':'05','Jun':'06','Jul':'07','Aug':'08',
		'Sep':'09','Oct':'10','Nov':'11','Dec':'12'
	}
	# Format: "31-Mar-26" or "31-Mar-2026"
	if '-' in raw:
		parts = raw.split('-')
		if len(parts) == 3:
			day = parts[0].zfill(2)
			mon = months.get(parts[1], '01')
			yr  = parts[2] if len(parts[2]) == 4 else '20' + parts[2]
			return f"{yr}-{mon}-{day}"
	# Format: "31 Jan 2025"
	parts = raw.split()
	if len(parts) == 3:
		return f"{parts[2]}-{months.get(parts[1], '01')}-{parts[0].zfill(2)}"
	return None


def parse_date_short(raw, invoice_date_str):
	"""
	Handles both formats:
	  '01-Mar'  → '2026-03-01'
	  '1 Jan'   → '2025-01-01'
	"""
	if not raw or not raw.strip():
		return None
	raw = raw.strip()
	months = {
		'Jan':'01','Feb':'02','Mar':'03','Apr':'04',
		'May':'05','Jun':'06','Jul':'07','Aug':'08',
		'Sep':'09','Oct':'10','Nov':'11','Dec':'12'
	}
	year = invoice_date_str[:4] if invoice_date_str and len(invoice_date_str) >= 4 else nowdate()[:4]

	# Format: "01-Mar"
	if '-' in raw:
		parts = raw.split('-')
		if len(parts) == 2:
			day = parts[0].zfill(2)
			mon = months.get(parts[1], '01')
			return f"{year}-{mon}-{day}"
	# Format: "1 Jan"
	parts = raw.split()
	if len(parts) == 2:
		return f"{year}-{months.get(parts[1], '01')}-{parts[0].zfill(2)}"
	return None
















