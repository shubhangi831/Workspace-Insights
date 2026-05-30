# # Copyright (c) 2026, sk and contributors
# # For license information, please see license.txt

# import frappe
# from frappe import _
# import re

# MONTH_ORDER = [
#     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
#     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
# ]


# def month_key(m):
#     """
#     'Jan 2025' → 202501
#     '' or None or bad string → 0
#     """
#     try:
#         parts = (m or "").strip().split(" ")
#         if len(parts) < 2:
#             return 0
#         mon = MONTH_ORDER.index(parts[0]) + 1
#         yr  = int(parts[1])
#         return yr * 100 + mon
#     except Exception:
#         return 0


# def safe_fieldname(sub, prefix):
#     """
#     Convert subscription name to a safe fieldname.
#     Removes ALL non-alphanumeric chars (including parentheses).

#     'Google Workspace Additional Storage (100 GB)'
#         → 'p_google_workspace_additional_storage_100_gb_amt'

#     BUG FIX: old code used .replace(" ","_") which kept ( ) brackets
#     in fieldnames — those brackets silently break Frappe's datatable.
#     """
#     clean = re.sub(r'[^a-z0-9]', '_', sub.lower())
#     clean = re.sub(r'_+', '_', clean).strip('_')
#     return f"{prefix}_{clean}"


# def get_short_label_map():
#     """
#     Fetch short_label from Subscription Plan doctype for ALL plans in one query.
#     Returns a dict: { full_subscription_name → short_label }

#     If short_label is blank for a plan, falls back to auto_short_label().
#     User can fill in short labels from the Subscription Plan list view.
#     """
#     rows = frappe.db.get_all(
#         'Subscription Plan',
#         fields=['subscription', 'short_label'],
#         order_by='subscription asc'
#     )
#     return {
#         r.subscription: (r.short_label.strip() if r.short_label and r.short_label.strip() else None)
#         for r in rows
#     }


# def auto_short_label(sub):
#     """
#     Generic short label — works for ANY subscription name, no hardcoded patterns.
#     Algorithm: acronym of all words except last + last word. Truncates to 15 chars.

#     'Google Workspace Business Starter'            → 'GWB Starter'
#     'Google Workspace Additional Storage (100 GB)' → 'GWAS 100GB'
#     'Microsoft 365 Business Standard'              → 'M3B Standard'
#     'Zoho Mail Premium'                            → 'ZM Premium'
#     'Slack Pro'                                    → 'Slack Pro'
#     """
#     s = (sub or '').strip()
#     if not s:
#         return ''

#     s = re.sub(r'\(\s*([^)]+?)\s*\)', lambda m: m.group(1).replace(' ', ''), s)
#     s = re.sub(r'\s+', ' ', s).strip()

#     if len(s) <= 12:
#         return s

#     words = [w for w in s.split(' ') if w]
#     if len(words) == 1:
#         return s[:12]

#     acronym   = ''.join(w[0].upper() for w in words[:-1])
#     last_word = words[-1]
#     result    = f"{acronym} {last_word}"

#     if len(result) <= 15:
#         return result

#     space = 15 - len(acronym) - 1
#     return f"{acronym} {last_word[:space]}".strip()[:15]


# def col_label(sub, short_map):
#     """
#     Return display label for a subscription column header.
#     Priority: Subscription Plan.short_label (DB) → auto_short_label() fallback.
#     """
#     return short_map.get(sub) or auto_short_label(sub)


# @frappe.whitelist()
# def get_filter_options():
#     """Return all available domains and months for the filter dropdowns."""

#     domain_rows = frappe.db.sql("""
#         SELECT DISTINCT LOWER(TRIM(domain)) AS domain
#         FROM (
#             SELECT domain FROM `tabPurchase Invoice Items`
#             WHERE domain IS NOT NULL AND domain != ''
#             UNION
#             SELECT domain FROM `tabSale Invoice Items`
#             WHERE domain IS NOT NULL AND domain != ''
#         ) combined
#         ORDER BY domain ASC
#     """, as_dict=True)

#     domains = [r.domain for r in domain_rows if r.domain]

#     # invoice_date from PARENT tables — authoritative billing month
#     date_rows = frappe.db.sql("""
#         SELECT DISTINCT invoice_date FROM (
#             SELECT invoice_date FROM `tabPurchase Invoice`
#             WHERE invoice_date IS NOT NULL
#             UNION
#             SELECT invoice_date FROM `tabSale Invoice`
#             WHERE invoice_date IS NOT NULL
#         ) combined
#         ORDER BY invoice_date ASC
#     """, as_dict=True)

#     month_set = set()
#     for r in date_rows:
#         d = r.invoice_date
#         if d:
#             month_set.add(MONTH_ORDER[d.month - 1] + " " + str(d.year))

#     months = sorted(month_set, key=month_key)
#     return {"domains": domains, "months": months}


# @frappe.whitelist()
# def get_month_detail(domain, month):
#     """Per-invoice breakdown for month-click popup.
#     Applies max_end_date rule for qty (same as fetch_pivot).
#     Returns child_rows per group so JS can expand them.
#     """
#     import unicodedata
#     from collections import defaultdict

#     domain = (domain or "").strip().lower()
#     try:
#         parts   = month.strip().split(" ")
#         mon_idx = MONTH_ORDER.index(parts[0]) + 1
#         year    = int(parts[1])
#     except Exception:
#         return []

#     args = {"domain": domain, "mon": mon_idx, "yr": year}

#     def build_groups(rows):
#         """Group individual rows by (doc_name, subscription), apply max_end_date rule."""
#         groups = defaultdict(list)
#         for r in rows:
#             key = (r["doc_name"], r["subscription"] or "Unknown")
#             groups[key].append(r)

#         result = []
#         for (doc_name, sub), group_rows in groups.items():
#             first     = group_rows[0]
#             total_amt = sum(float(r["amount"] or 0) for r in group_rows)

#             # max_end_date rule for qty
#             end_dates = [r["end_date"] for r in group_rows if r["end_date"]]
#             max_end   = max(end_dates) if end_dates else None
#             if max_end:
#                 active    = [r for r in group_rows
#                              if r["end_date"] and r["start_date"]
#                              and r["start_date"] <= max_end
#                              and r["end_date"]   >= max_end]
#                 total_qty = sum(int(r["quantity"] or 0) for r in active)
#             else:
#                 total_qty = sum(int(r["quantity"] or 0) for r in group_rows)

#             result.append({
#                 "type":           first["type"],
#                 "doc_name":       doc_name,
#                 "invoice_number": first["invoice_number"],
#                 "invoice_date":   str(first["invoice_date"] or ""),
#                 "subscription":   sub,
#                 "amount":         total_amt,
#                 "quantity":       total_qty,
#                 "child_rows":     [
#                     {
#                         "start_date":  str(r["start_date"]  or ""),
#                         "end_date":    str(r["end_date"]    or ""),
#                         "description": r["description"]     or "",
#                         "order_name":  r.get("order_name")  or "",
#                         "po_number":   r.get("po_number")   or "",
#                         "customer_id": r.get("customer_id") or "",
#                         "sku_id":      r.get("sku_id")      or "",
#                         "quantity":    int(r["quantity"]    or 0),
#                         "amount":      float(r["amount"]    or 0),
#                     }
#                     for r in group_rows
#                 ]
#             })
#         return result

#     purchase_rows = frappe.db.sql("""
#         SELECT 'Purchase'        AS type,
#                pi.name           AS doc_name,
#                pi.invoice_number,
#                pi.invoice_date,
#                pii.subscription,
#                pii.amount,
#                pii.quantity,
#                pii.start_date,
#                pii.end_date,
#                pii.description,
#                pii.order_name,
#                pii.po_number,
#                pii.customer_id,
#                pii.sku_id
#         FROM `tabPurchase Invoice Items` pii
#         INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
#         WHERE LOWER(TRIM(pii.domain)) = %(domain)s
#           AND MONTH(pi.invoice_date) = %(mon)s
#           AND YEAR(pi.invoice_date)  = %(yr)s
#         ORDER BY pi.invoice_date ASC, pii.subscription, pii.end_date ASC
#     """, args, as_dict=True)

#     sale_rows = frappe.db.sql("""
#         SELECT 'Sale'            AS type,
#                si.name           AS doc_name,
#                si.invoice_number,
#                si.invoice_date,
#                sii.subscription,
#                sii.amount,
#                sii.quantity,
#                sii.start_date,
#                sii.end_date,
#                sii.description,
#                sii.order_name,
#                sii.po_number
#         FROM `tabSale Invoice Items` sii
#         INNER JOIN `tabSale Invoice` si ON sii.parent = si.name
#         WHERE LOWER(TRIM(sii.domain)) = %(domain)s
#           AND MONTH(si.invoice_date) = %(mon)s
#           AND YEAR(si.invoice_date)  = %(yr)s
#         ORDER BY si.invoice_date ASC, sii.subscription, sii.end_date ASC
#     """, args, as_dict=True)

#     return build_groups(purchase_rows) + build_groups(sale_rows)


# def _build_domain_in_clause(domains, field_expr):
#     """
#     Build a parameterized IN clause for a list of domain strings.
#     Returns (sql_snippet, params_dict).

#     Example: ["a.com", "b.com"] →
#         "AND LOWER(TRIM(ci.domain)) IN (%(dom_0)s, %(dom_1)s)"
#         {"dom_0": "a.com", "dom_1": "b.com"}
#     """
#     if not domains:
#         return "AND 1=0", {}
#     keys = {f"dom_{i}": d for i, d in enumerate(domains)}
#     placeholders = ", ".join(f"%(dom_{i})s" for i in range(len(domains)))
#     return f"AND {field_expr} IN ({placeholders})", keys


# def fetch_pivot(parent_dt, child_dt, domains, from_key, to_key):
#     """
#     Fetch all child rows for one or more domains and pivot by (invoice_month, subscription).
#     `domains` is a list of lowercased domain strings.
#     """
#     domain_clause, params = _build_domain_in_clause(domains, "LOWER(TRIM(ci.domain))")

#     if from_key and to_key:
#         date_clause = """
#             AND (YEAR(pi.invoice_date) * 100 + MONTH(pi.invoice_date))
#                 BETWEEN %(from_key)s AND %(to_key)s
#         """
#         params["from_key"] = from_key
#         params["to_key"]   = to_key
#     elif from_key:
#         date_clause = """
#             AND (YEAR(pi.invoice_date) * 100 + MONTH(pi.invoice_date)) >= %(from_key)s
#         """
#         params["from_key"] = from_key
#     elif to_key:
#         date_clause = """
#             AND (YEAR(pi.invoice_date) * 100 + MONTH(pi.invoice_date)) <= %(to_key)s
#         """
#         params["to_key"] = to_key
#     else:
#         date_clause = ""

#     sql = f"""
#         SELECT
#             YEAR(pi.invoice_date)  AS yr,
#             MONTH(pi.invoice_date) AS mon,
#             ci.subscription        AS subscription,
#             ci.amount              AS amt,
#             ci.quantity            AS qty,
#             ci.start_date          AS start_date,
#             ci.end_date            AS end_date
#         FROM `tab{child_dt}` ci
#         INNER JOIN `tab{parent_dt}` pi ON ci.parent = pi.name
#         WHERE pi.invoice_date IS NOT NULL
#           {domain_clause}
#           {date_clause}
#         ORDER BY yr ASC, mon ASC, ci.subscription, ci.end_date ASC
#     """

#     raw_rows = frappe.db.sql(sql, params, as_dict=True)

#     # ── Group individual rows by (month, subscription) ───────────
#     from collections import defaultdict
#     groups = defaultdict(list)   # key = (month_str, sub) → list of row dicts

#     for r in raw_rows:
#         month = MONTH_ORDER[r["mon"] - 1] + " " + str(r["yr"])
#         sub   = (r["subscription"] or "Unknown").strip()
#         groups[(month, sub)].append(r)

#     # ── Build pivot applying the correct LIC rule ─────────────────
#     pivot = {}
#     subs  = set()

#     for (month, sub), group_rows in groups.items():

#         # AMT — simple sum of every row in the group
#         total_amt = sum(float(r["amt"] or 0) for r in group_rows)

#         # QTY — "max_end_date" rule:
#         #   1. Find the latest end_date in this group (= last billed day).
#         #   2. Sum qty only for rows that are still active on that date,
#         #      i.e. start_date <= max_end AND end_date >= max_end.
#         #
#         # Example — chemfields Business Starter (Mar 2026):
#         #   Base:   01-Mar → 31-Mar, qty=40  active on 31-Mar → ✅ include
#         #   Addon1: 18-Mar → 31-Mar, qty=1   active on 31-Mar → ✅ include
#         #   Addon2: 20-Mar → 31-Mar, qty=1   active on 31-Mar → ✅ include
#         #   LIC = 40 + 1 + 1 = 42  ✓
#         #
#         # Example — astralcad Business Starter (Mar 2026):
#         #   Row1: 01-Mar → 05-Mar, qty=37  end < 31-Mar → ❌ exclude
#         #   Row2: 06-Mar → 31-Mar, qty=37  active on 31-Mar → ✅ include
#         #   LIC = 37  ✓

#         end_dates  = [r["end_date"] for r in group_rows if r["end_date"]]
#         max_end    = max(end_dates) if end_dates else None

#         if max_end:
#             active = [
#                 r for r in group_rows
#                 if r["end_date"]
#                 and r["start_date"]
#                 and r["start_date"] <= max_end
#                 and r["end_date"]   >= max_end
#             ]
#             total_qty = sum(int(r["qty"] or 0) for r in active)
#         else:
#             # No end_date stored — fall back to simple sum
#             total_qty = sum(int(r["qty"] or 0) for r in group_rows)

#         if month not in pivot:
#             pivot[month] = {}

#         pivot[month][sub] = {"amt": total_amt, "qty": total_qty}
#         subs.add(sub)

#     return pivot, subs


# def execute(filters=None):
#     filters   = filters or {}
#     domain_raw = (filters.get("domain") or "").strip().lower()
#     from_m    = (filters.get("from_month") or "").strip()
#     to_m      = (filters.get("to_month")   or "").strip()

#     if not domain_raw:
#         frappe.throw(_("Please select a Domain to view the report."))

#     # Support comma-separated multi-domain selection from the custom dropdown
#     domains = [d.strip() for d in domain_raw.split(",") if d.strip()]

#     from_key = month_key(from_m)
#     to_key   = month_key(to_m)

#     p_pivot, p_subs = fetch_pivot(
#         "Purchase Invoice", "Purchase Invoice Items",
#         domains, from_key, to_key
#     )
#     s_pivot, s_subs = fetch_pivot(
#         "Sale Invoice", "Sale Invoice Items",
#         domains, from_key, to_key
#     )

#     if not p_pivot and not s_pivot:
#         label = domains[0] if len(domains) == 1 else f"{len(domains)} selected domains"
#         frappe.throw(_(f"No data found for {label}"))

#     # ── Build month list ──────────────────────────────────────────
#     # BUG FIX: Old code did month_range(0, 0) → int(0/100)=0 → year 0 → wrong months.
#     # Fix: if keys are valid, build a continuous range (so empty months still appear).
#     #      If keys are 0, fall back to data-driven month list.
#     if from_key and to_key:
#         all_months = []
#         for yr in range(from_key // 100, (to_key // 100) + 1):
#             for mon in range(1, 13):
#                 mk = yr * 100 + mon
#                 if mk < from_key or mk > to_key:
#                     continue
#                 all_months.append(MONTH_ORDER[mon - 1] + " " + str(yr))
#     else:
#         # Fall back to months that have actual data
#         all_months = sorted(
#             set(list(p_pivot.keys()) + list(s_pivot.keys())),
#             key=month_key
#         )

#     p_subs_list = sorted(p_subs)
#     s_subs_list = sorted(s_subs)

#     # ── Fetch short labels from Subscription Plan doctype ─────────
#     # User sets these in the Subscription Plan list view.
#     # Fallback: auto_short_label() abbreviates automatically.
#     short_map = get_short_label_map()

#     # ── Columns ──────────────────────────────────────────────────
#     columns = [{
#         "label":     _("Month"),
#         "fieldname": "month",
#         "fieldtype": "Data",
#         "width":     200
#     }]

#     # Purchase columns — label uses short name, fieldname uses safe full name
#     for sub in p_subs_list:
#         fn_base = safe_fieldname(sub, "p")
#         lbl     = col_label(sub, short_map)   # DB short_label or auto fallback
#         columns.append({
#             "label":     _("P | " + lbl + " AMT"),
#             "fieldname": fn_base + "_amt",
#             "fieldtype": "Float",
#             "width":     200,
#             "precision": 2
#         })
#         columns.append({
#             "label":     _("P | " + lbl + " LIC"),
#             "fieldname": fn_base + "_lic",
#             "fieldtype": "Int",
#             "width":     200
#         })

#     # Sale columns
#     for sub in s_subs_list:
#         fn_base = safe_fieldname(sub, "s")
#         lbl     = col_label(sub, short_map)
#         columns.append({
#             "label":     _("S | " + lbl + " AMT"),
#             "fieldname": fn_base + "_amt",
#             "fieldtype": "Float",
#             "width":     200,
#             "precision": 2
#         })
#         columns.append({
#             "label":     _("S | " + lbl + " LIC"),
#             "fieldname": fn_base + "_lic",
#             "fieldtype": "Int",
#             "width":     200
#         })

#     columns.append({
#         "label":     _("Balance"),
#         "fieldname": "balance",
#         "fieldtype": "Float",
#         "width":     200,
#         "precision": 2
#     })

#     # ── Data rows ─────────────────────────────────────────────────
#     data         = []
#     gp_amt       = {sub: 0.0 for sub in p_subs_list}
#     gs_amt       = {sub: 0.0 for sub in s_subs_list}
#     g_balance    = 0.0
#     # LIC in TOTAL = last month's seat count (seats are a snapshot, NOT cumulative)
#     # 11 seats × 15 months ≠ 165 — it should show 11 (current seat count)
#     last_p_lic   = {sub: 0 for sub in p_subs_list}
#     last_s_lic   = {sub: 0 for sub in s_subs_list}

#     for month in all_months:
#         row  = {"month": month}
#         pm   = p_pivot.get(month, {})
#         sm   = s_pivot.get(month, {})
#         mt_p = 0.0
#         mt_s = 0.0

#         for sub in p_subs_list:
#             fn_base = safe_fieldname(sub, "p")
#             cl      = pm.get(sub, {"amt": 0.0, "qty": 0})
#             row[fn_base + "_amt"] = cl["amt"]
#             row[fn_base + "_lic"] = cl["qty"]
#             gp_amt[sub] += cl["amt"]
#             mt_p        += cl["amt"]
#             # Track last seen non-zero qty — used for TOTAL row
#             if cl["qty"]:
#                 last_p_lic[sub] = cl["qty"]

#         for sub in s_subs_list:
#             fn_base = safe_fieldname(sub, "s")
#             cl      = sm.get(sub, {"amt": 0.0, "qty": 0})
#             row[fn_base + "_amt"] = cl["amt"]
#             row[fn_base + "_lic"] = cl["qty"]
#             gs_amt[sub] += cl["amt"]
#             mt_s        += cl["amt"]
#             if cl["qty"]:
#                 last_s_lic[sub] = cl["qty"]

#         balance        = mt_s - mt_p
#         row["balance"] = balance
#         g_balance     += balance
#         data.append(row)

#     # ── TOTAL row ─────────────────────────────────────────────────
#     total_row = {"month": "TOTAL"}
#     for sub in p_subs_list:
#         fn_base = safe_fieldname(sub, "p")
#         total_row[fn_base + "_amt"] = gp_amt[sub]
#         total_row[fn_base + "_lic"] = last_p_lic[sub]  # last month's seats, not sum
#     for sub in s_subs_list:
#         fn_base = safe_fieldname(sub, "s")
#         total_row[fn_base + "_amt"] = gs_amt[sub]
#         total_row[fn_base + "_lic"] = last_s_lic[sub]  # last month's seats, not sum
#     total_row["balance"] = g_balance
#     data.append(total_row)

#     return columns, data


# # ─────────────────────────────────────────────────────────────────
# # Card summary methods
# # ─────────────────────────────────────────────────────────────────

# @frappe.whitelist()
# def get_card_summary(domain='', from_month='', to_month=''):
#     """
#     Returns summary values for the 4 report cards.
#     - No domain selected → totals across ALL domains
#     - Domain selected    → totals for that domain only
#     """
#     from_key = month_key(from_month)
#     to_key   = month_key(to_month)

#     total_domains = frappe.db.count('Domains')

#     # Domain filter — empty = all domains
#     if domain:
#         dom_p = "AND LOWER(TRIM(pii.domain)) = %(domain)s"
#         dom_s = "AND LOWER(TRIM(sii.domain)) = %(domain)s"
#     else:
#         dom_p = ""
#         dom_s = ""

#     params = {'domain': (domain or '').strip().lower()}

#     if from_key and to_key:
#         p_date = "AND (YEAR(pi.invoice_date)*100+MONTH(pi.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
#         s_date = "AND (YEAR(si.invoice_date)*100+MONTH(si.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
#         params['from_key'] = from_key
#         params['to_key']   = to_key
#     else:
#         p_date = s_date = ""

#     purchase_total = frappe.db.sql(f"""
#         SELECT COALESCE(SUM(pii.amount), 0)
#         FROM `tabPurchase Invoice Items` pii
#         INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
#         WHERE pi.invoice_date IS NOT NULL {dom_p} {p_date}
#     """, params)[0][0] or 0

#     sale_total = frappe.db.sql(f"""
#         SELECT COALESCE(SUM(sii.amount), 0)
#         FROM `tabSale Invoice Items` sii
#         INNER JOIN `tabSale Invoice` si ON sii.parent = si.name
#         WHERE si.invoice_date IS NOT NULL {dom_s} {s_date}
#     """, params)[0][0] or 0

#     p = float(purchase_total)
#     s = float(sale_total)
#     return {
#         'total_domains':  total_domains,
#         'purchase_total': p,
#         'sale_total':     s,
#         'margin':         s - p,
#         'has_domain':     bool(domain)
#     }


# @frappe.whitelist()
# def get_domain_all_months(domain, from_month='', to_month='', inv_type='purchase'):
#     """
#     Returns all months data for a domain — used in Purchase / Sale card popup.
#     Each month has: month label, total_amount, and list of invoices with child_rows.
#     """
#     from collections import defaultdict

#     domain   = (domain or '').strip().lower()
#     from_key = month_key(from_month)
#     to_key   = month_key(to_month)

#     if inv_type == 'purchase':
#         parent_dt = 'Purchase Invoice'
#         child_dt  = 'Purchase Invoice Items'
#         pa = 'pi'
#         ca = 'pii'
#     else:
#         parent_dt = 'Sale Invoice'
#         child_dt  = 'Sale Invoice Items'
#         pa = 'si'
#         ca = 'sii'

#     params = {'domain': domain}
#     if from_key and to_key:
#         date_clause = f"AND (YEAR({pa}.invoice_date)*100+MONTH({pa}.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
#         params['from_key'] = from_key
#         params['to_key']   = to_key
#     elif from_key:
#         date_clause = f"AND (YEAR({pa}.invoice_date)*100+MONTH({pa}.invoice_date)) >= %(from_key)s"
#         params['from_key'] = from_key
#     elif to_key:
#         date_clause = f"AND (YEAR({pa}.invoice_date)*100+MONTH({pa}.invoice_date)) <= %(to_key)s"
#         params['to_key'] = to_key
#     else:
#         date_clause = ""

#     rows = frappe.db.sql(f"""
#         SELECT
#             YEAR({pa}.invoice_date)   AS yr,
#             MONTH({pa}.invoice_date)  AS mon,
#             {pa}.name                 AS doc_name,
#             {pa}.invoice_number,
#             {ca}.subscription,
#             {ca}.amount,
#             {ca}.quantity,
#             {ca}.start_date,
#             {ca}.end_date,
#             {ca}.description,
#             {ca}.order_name,
#             {ca}.po_number
#         FROM `tab{child_dt}` {ca}
#         INNER JOIN `tab{parent_dt}` {pa} ON {ca}.parent = {pa}.name
#         WHERE LOWER(TRIM({ca}.domain)) = %(domain)s
#           AND {pa}.invoice_date IS NOT NULL
#           {date_clause}
#         ORDER BY yr ASC, mon ASC, {ca}.subscription, {ca}.end_date ASC
#     """, params, as_dict=True)

#     # Group rows → month → (doc_name, subscription)
#     months_map = defaultdict(lambda: defaultdict(list))
#     for r in rows:
#         month = MONTH_ORDER[r['mon'] - 1] + ' ' + str(r['yr'])
#         key   = (r['doc_name'], r['subscription'] or 'Unknown')
#         months_map[month][key].append(r)

#     result = []
#     for month in sorted(months_map.keys(), key=month_key):
#         groups    = months_map[month]
#         total_amt = sum(float(r['amount'] or 0) for g in groups.values() for r in g)
#         invoices  = []

#         for (doc_name, sub), group_rows in groups.items():
#             first     = group_rows[0]
#             grp_amt   = sum(float(r['amount'] or 0) for r in group_rows)
#             end_dates = [r['end_date'] for r in group_rows if r['end_date']]
#             max_end   = max(end_dates) if end_dates else None
#             if max_end:
#                 active  = [r for r in group_rows if r['end_date'] and r['start_date']
#                            and r['start_date'] <= max_end and r['end_date'] >= max_end]
#                 grp_qty = sum(int(r['quantity'] or 0) for r in active)
#             else:
#                 grp_qty = sum(int(r['quantity'] or 0) for r in group_rows)

#             invoices.append({
#                 'doc_name':       doc_name,
#                 'invoice_number': first['invoice_number'],
#                 'subscription':   sub,
#                 'amount':         grp_amt,
#                 'quantity':       grp_qty,
#                 'child_rows':     [
#                     {
#                         'start_date':  str(r['start_date']  or ''),
#                         'end_date':    str(r['end_date']    or ''),
#                         'description': r['description']     or '',
#                         'order_name':  r.get('order_name')  or '',
#                         'po_number':   r.get('po_number')   or '',
#                         'quantity':    int(r['quantity']    or 0),
#                         'amount':      float(r['amount']    or 0),
#                     }
#                     for r in group_rows
#                 ]
#             })

#         result.append({
#             'month':        month,
#             'total_amount': total_amt,
#             'invoices':     invoices
#         })

#     return result


# @frappe.whitelist()
# def get_all_domains_margin(from_month='', to_month=''):
#     """
#     Returns purchase, sale, and margin for EVERY domain.
#     Used in the Margin card popup.
#     Sorted by margin descending (most profitable first).
#     """
#     from_key = month_key(from_month)
#     to_key   = month_key(to_month)

#     params = {}
#     if from_key and to_key:
#         p_date = "AND (YEAR(pi.invoice_date)*100+MONTH(pi.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
#         s_date = "AND (YEAR(si.invoice_date)*100+MONTH(si.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
#         params = {'from_key': from_key, 'to_key': to_key}
#     else:
#         p_date = s_date = ""

#     purchase_rows = frappe.db.sql(f"""
#         SELECT LOWER(TRIM(pii.domain)) AS domain, SUM(pii.amount) AS total
#         FROM `tabPurchase Invoice Items` pii
#         INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
#         WHERE pii.domain IS NOT NULL AND pii.domain != '' {p_date}
#         GROUP BY LOWER(TRIM(pii.domain))
#     """, params, as_dict=True)

#     sale_rows = frappe.db.sql(f"""
#         SELECT LOWER(TRIM(sii.domain)) AS domain, SUM(sii.amount) AS total
#         FROM `tabSale Invoice Items` sii
#         INNER JOIN `tabSale Invoice` si ON sii.parent = si.name
#         WHERE sii.domain IS NOT NULL AND sii.domain != '' {s_date}
#         GROUP BY LOWER(TRIM(sii.domain))
#     """, params, as_dict=True)

#     p_map = {r.domain: float(r.total or 0) for r in purchase_rows}
#     s_map = {r.domain: float(r.total or 0) for r in sale_rows}

#     all_domains = sorted(set(list(p_map.keys()) + list(s_map.keys())))
#     result = []
#     for dom in all_domains:
#         p = p_map.get(dom, 0)
#         s = s_map.get(dom, 0)
#         result.append({
#             'domain':   dom,
#             'purchase': p,
#             'sale':     s,
#             'margin':   s - p
#         })

#     result.sort(key=lambda x: x['margin'], reverse=True)
#     return result












# // This code is giving a graph & advance structure on report


import frappe
from frappe import _
import re

MONTH_ORDER = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]


def month_key(m):
    try:
        parts = (m or "").strip().split(" ")
        if len(parts) < 2:
            return 0
        mon = MONTH_ORDER.index(parts[0]) + 1
        yr  = int(parts[1])
        return yr * 100 + mon
    except Exception:
        return 0


def safe_fieldname(sub, prefix):
    clean = re.sub(r'[^a-z0-9]', '_', sub.lower())
    clean = re.sub(r'_+', '_', clean).strip('_')
    return f"{prefix}_{clean}"


def get_short_label_map():
    rows = frappe.db.get_all(
        'Subscription Plan',
        fields=['subscription', 'short_label'],
        order_by='subscription asc'
    )
    return {
        r.subscription: (r.short_label.strip() if r.short_label and r.short_label.strip() else None)
        for r in rows
    }


def auto_short_label(sub):
    s = (sub or '').strip()
    if not s:
        return ''

    s = re.sub(r'\(\s*([^)]+?)\s*\)', lambda m: m.group(1).replace(' ', ''), s)
    s = re.sub(r'\s+', ' ', s).strip()

    if len(s) <= 12:
        return s

    words = [w for w in s.split(' ') if w]
    if len(words) == 1:
        return s[:12]

    acronym   = ''.join(w[0].upper() for w in words[:-1])
    last_word = words[-1]
    result    = f"{acronym} {last_word}"

    if len(result) <= 15:
        return result

    space = 15 - len(acronym) - 1
    return f"{acronym} {last_word[:space]}".strip()[:15]


def col_label(sub, short_map):
    return short_map.get(sub) or auto_short_label(sub)


@frappe.whitelist()
def get_filter_options():
    domain_rows = frappe.db.sql("""
        SELECT DISTINCT LOWER(TRIM(domain)) AS domain
        FROM (
            SELECT domain FROM `tabPurchase Invoice Items`
            WHERE domain IS NOT NULL AND domain != ''
            UNION
            SELECT domain FROM `tabSale Invoice Items`
            WHERE domain IS NOT NULL AND domain != ''
        ) combined
        ORDER BY domain ASC
    """, as_dict=True)

    domains = [r.domain for r in domain_rows if r.domain]

    minmax = frappe.db.sql("""
        SELECT MIN(invoice_date) AS min_date, MAX(invoice_date) AS max_date
        FROM (
            SELECT invoice_date FROM `tabPurchase Invoice`
            WHERE invoice_date IS NOT NULL
            UNION ALL
            SELECT invoice_date FROM `tabSale Invoice`
            WHERE invoice_date IS NOT NULL
        ) combined
    """, as_dict=True)

    months = []
    if minmax and minmax[0].min_date and minmax[0].max_date:
        min_d = minmax[0].min_date
        max_d = minmax[0].max_date
        yr    = min_d.year
        mon   = min_d.month
        while (yr, mon) <= (max_d.year, max_d.month):
            months.append(MONTH_ORDER[mon - 1] + ' ' + str(yr))
            mon += 1
            if mon > 12:
                mon = 1
                yr += 1
    return {"domains": domains, "months": months}


@frappe.whitelist()
def get_month_detail(domain, month):
    import unicodedata
    from collections import defaultdict

    domain_list = [d.strip().lower() for d in (domain or '').split(',') if d.strip()]
    if not domain_list:
        return []

    try:
        parts   = month.strip().split(" ")
        mon_idx = MONTH_ORDER.index(parts[0]) + 1
        year    = int(parts[1])
    except Exception:
        return []

    escaped         = ', '.join(frappe.db.escape(d) for d in domain_list)
    domain_clause   = f"LOWER(TRIM(pii.domain)) IN ({escaped})"
    s_domain_clause = f"LOWER(TRIM(sii.domain)) IN ({escaped})"

    args = {"mon": mon_idx, "yr": year}

    def build_groups(rows, type_label):
        groups = defaultdict(list)
        for r in rows:
            key = (r["doc_name"], r["subscription"] or "Unknown", r.get("domain_val", ""))
            groups[key].append(r)

        result = []
        for (doc_name, sub, dom), group_rows in groups.items():
            first     = group_rows[0]
            total_amt  = sum(float(r["amount"] or 0) for r in group_rows)
            end_groups = defaultdict(list)
            for r in group_rows:
                end_groups[r["end_date"]].append(r)
            if end_groups:
                total_qty = max(
                    sum(int(r["quantity"] or 0) for r in rows)
                    for rows in end_groups.values()
                )
            else:
                total_qty = sum(int(r["quantity"] or 0) for r in group_rows)

            result.append({
                "type":           type_label,
                "domain":         dom,
                "doc_name":       doc_name,
                "invoice_number": first["invoice_number"],
                "invoice_date":   str(first["invoice_date"] or ""),
                "subscription":   sub,
                "amount":         total_amt,
                "quantity":       total_qty,
                "child_rows":     [
                    {
                        "start_date":  str(r["start_date"]  or ""),
                        "end_date":    str(r["end_date"]    or ""),
                        "description": r["description"]     or "",
                        "order_name":  r.get("order_name")  or "",
                        "po_number":   r.get("po_number")   or "",
                        "quantity":    int(r["quantity"]    or 0),
                        "amount":      float(r["amount"]    or 0),
                    }
                    for r in group_rows
                ]
            })
        return result

    purchase_rows = frappe.db.sql(f"""
        SELECT 'Purchase'        AS type,
               pi.name           AS doc_name,
               pi.invoice_number,
               pi.invoice_date,
               LOWER(TRIM(pii.domain)) AS domain_val,
               pii.subscription,
               pii.amount,
               pii.quantity,
               pii.start_date,
               pii.end_date,
               pii.description,
               pii.order_name,
               pii.po_number
        FROM `tabPurchase Invoice Items` pii
        INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
        WHERE {domain_clause}
          AND MONTH(pi.invoice_date) = %(mon)s
          AND YEAR(pi.invoice_date)  = %(yr)s
        ORDER BY pii.domain ASC, pi.invoice_date ASC, pii.subscription, pii.end_date ASC
    """, args, as_dict=True)

    sale_rows = frappe.db.sql(f"""
        SELECT 'Sale'            AS type,
               si.name           AS doc_name,
               si.invoice_number,
               si.invoice_date,
               LOWER(TRIM(sii.domain)) AS domain_val,
               sii.subscription,
               sii.amount,
               sii.quantity,
               sii.start_date,
               sii.end_date,
               sii.description,
               sii.order_name,
               sii.po_number
        FROM `tabSale Invoice Items` sii
        INNER JOIN `tabSale Invoice` si ON sii.parent = si.name
        WHERE {s_domain_clause}
          AND MONTH(si.invoice_date) = %(mon)s
          AND YEAR(si.invoice_date)  = %(yr)s
        ORDER BY sii.domain ASC, si.invoice_date ASC, sii.subscription, sii.end_date ASC
    """, args, as_dict=True)

    return build_groups(purchase_rows, 'Purchase') + build_groups(sale_rows, 'Sale')


def fetch_pivot(parent_dt, child_dt, domains, from_key, to_key):
    from collections import defaultdict

    if domains:
        escaped      = ', '.join(frappe.db.escape(d) for d in domains)
        domain_clause = f"AND LOWER(TRIM(ci.domain)) IN ({escaped})"
    else:
        domain_clause = ""

    params = {}

    if from_key and to_key:
        date_clause = """
            AND (YEAR(pi.invoice_date) * 100 + MONTH(pi.invoice_date))
                BETWEEN %(from_key)s AND %(to_key)s
        """
        params["from_key"] = from_key
        params["to_key"]   = to_key
    elif from_key:
        date_clause = """
            AND (YEAR(pi.invoice_date) * 100 + MONTH(pi.invoice_date)) >= %(from_key)s
        """
        params["from_key"] = from_key
    elif to_key:
        date_clause = """
            AND (YEAR(pi.invoice_date) * 100 + MONTH(pi.invoice_date)) <= %(to_key)s
        """
        params["to_key"] = to_key
    else:
        date_clause = ""

    sql = f"""
        SELECT
            YEAR(pi.invoice_date)  AS yr,
            MONTH(pi.invoice_date) AS mon,
            ci.subscription        AS subscription,
            ci.amount              AS amt,
            ci.quantity            AS qty,
            ci.start_date          AS start_date,
            ci.end_date            AS end_date
        FROM `tab{child_dt}` ci
        INNER JOIN `tab{parent_dt}` pi ON ci.parent = pi.name
        WHERE pi.invoice_date IS NOT NULL
          {domain_clause}
          {date_clause}
        ORDER BY yr ASC, mon ASC, ci.subscription, ci.end_date ASC
    """

    raw_rows = frappe.db.sql(sql, params, as_dict=True)

    groups = defaultdict(list)
    for r in raw_rows:
        month = MONTH_ORDER[r["mon"] - 1] + " " + str(r["yr"])
        sub   = (r["subscription"] or "Unknown").strip()
        groups[(month, sub)].append(r)

    pivot = {}
    subs  = set()

    for (month, sub), group_rows in groups.items():

        # AMT — simple sum of every row in the group
        total_amt = sum(float(r["amt"] or 0) for r in group_rows)

        # ── QTY fix: group by end_date, sum qty per group, take max ──
        # This handles months with multiple billing periods
        # e.g. Commitment (01-28 Aug, qty=297) + Usage (29-31 Aug, qty=296)
        # max group qty = 297 ✓  (not just 1 from last end_date)
        end_groups = defaultdict(list)
        for r in group_rows:
            end_groups[r["end_date"]].append(r)

        total_qty = max(
            sum(int(r["qty"] or 0) for r in rows)
            for rows in end_groups.values()
        )

        if month not in pivot:
            pivot[month] = {}

        pivot[month][sub] = {"amt": total_amt, "qty": total_qty}
        subs.add(sub)

    return pivot, subs


def execute(filters=None):
    filters    = filters or {}
    domain_str = (filters.get("domain") or "").strip()
    domains    = [d.strip().lower() for d in domain_str.split(",") if d.strip()]

    if not domains:
        return [], []

    from_m     = (filters.get("from_month") or "").strip()
    to_m       = (filters.get("to_month")   or "").strip()

    from_key = month_key(from_m)
    to_key   = month_key(to_m)

    p_pivot, p_subs = fetch_pivot(
        "Purchase Invoice", "Purchase Invoice Items",
        domains, from_key, to_key
    )
    s_pivot, s_subs = fetch_pivot(
        "Sale Invoice", "Sale Invoice Items",
        domains, from_key, to_key
    )

    if not p_pivot and not s_pivot:
        label = ', '.join(domains) if domains else 'all domains'
        frappe.throw(_(f"No data found for: {label}"))

    if from_key and to_key:
        all_months = []
        for yr in range(from_key // 100, (to_key // 100) + 1):
            for mon in range(1, 13):
                mk = yr * 100 + mon
                if mk < from_key or mk > to_key:
                    continue
                all_months.append(MONTH_ORDER[mon - 1] + " " + str(yr))
    else:
        all_months = sorted(
            set(list(p_pivot.keys()) + list(s_pivot.keys())),
            key=month_key
        )

    p_subs_list = sorted(p_subs)
    s_subs_list = sorted(s_subs)

    short_map = get_short_label_map()

    columns = [{
        "label":     _("Month"),
        "fieldname": "month",
        "fieldtype": "Data",
        "width":     200
    }]

    for sub in p_subs_list:
        fn_base = safe_fieldname(sub, "p")
        lbl     = col_label(sub, short_map)
        columns.append({
            "label":     _("P | " + lbl + " AMT"),
            "fieldname": fn_base + "_amt",
            "fieldtype": "Float",
            "width":     155,
            "precision": 2
        })
        columns.append({
            "label":     _("P | " + lbl + " LIC"),
            "fieldname": fn_base + "_lic",
            "fieldtype": "Int",
            "width":     100
        })

    for sub in s_subs_list:
        fn_base = safe_fieldname(sub, "s")
        lbl     = col_label(sub, short_map)
        columns.append({
            "label":     _("S | " + lbl + " AMT"),
            "fieldname": fn_base + "_amt",
            "fieldtype": "Float",
            "width":     200,
            "precision": 2
        })
        columns.append({
            "label":     _("S | " + lbl + " LIC"),
            "fieldname": fn_base + "_lic",
            "fieldtype": "Int",
            "width":     100
        })

    columns.append({
        "label":     _("Balance (S - P)"),
        "fieldname": "balance",
        "fieldtype": "Float",
        "width":     180,
        "precision": 2
    })

    data         = []
    gp_amt       = {sub: 0.0 for sub in p_subs_list}
    gs_amt       = {sub: 0.0 for sub in s_subs_list}
    g_balance    = 0.0
    last_p_lic   = {sub: 0 for sub in p_subs_list}
    last_s_lic   = {sub: 0 for sub in s_subs_list}

    for month in all_months:
        row  = {"month": month}
        pm   = p_pivot.get(month, {})
        sm   = s_pivot.get(month, {})
        mt_p = 0.0
        mt_s = 0.0

        for sub in p_subs_list:
            fn_base = safe_fieldname(sub, "p")
            cl      = pm.get(sub, {"amt": 0.0, "qty": 0})
            row[fn_base + "_amt"] = cl["amt"]
            row[fn_base + "_lic"] = cl["qty"]
            gp_amt[sub] += cl["amt"]
            mt_p        += cl["amt"]
            if cl["qty"]:
                last_p_lic[sub] = cl["qty"]

        for sub in s_subs_list:
            fn_base = safe_fieldname(sub, "s")
            cl      = sm.get(sub, {"amt": 0.0, "qty": 0})
            row[fn_base + "_amt"] = cl["amt"]
            row[fn_base + "_lic"] = cl["qty"]
            gs_amt[sub] += cl["amt"]
            mt_s        += cl["amt"]
            if cl["qty"]:
                last_s_lic[sub] = cl["qty"]

        balance        = mt_s - mt_p
        row["balance"] = balance
        row["mt_p"]    = mt_p
        row["mt_s"]    = mt_s
        g_balance     += balance
        data.append(row)

    total_row = {"month": "TOTAL"}
    for sub in p_subs_list:
        fn_base = safe_fieldname(sub, "p")
        total_row[fn_base + "_amt"] = gp_amt[sub]
        total_row[fn_base + "_lic"] = last_p_lic[sub]
    for sub in s_subs_list:
        fn_base = safe_fieldname(sub, "s")
        total_row[fn_base + "_amt"] = gs_amt[sub]
        total_row[fn_base + "_lic"] = last_s_lic[sub]
    total_row["balance"]       = g_balance
    data.append(total_row)

    return columns, data


@frappe.whitelist()
def get_card_summary(domain='', from_month='', to_month=''):
    from_key = month_key(from_month)
    to_key   = month_key(to_month)

    total_domains = frappe.db.count('Domains')

    domain_list = [d.strip().lower() for d in (domain or '').split(',') if d.strip()]

    if domain_list:
        escaped = ', '.join(frappe.db.escape(d) for d in domain_list)
        dom_p   = f"AND LOWER(TRIM(pii.domain)) IN ({escaped})"
        dom_s   = f"AND LOWER(TRIM(sii.domain)) IN ({escaped})"
    else:
        dom_p = ""
        dom_s = ""

    params = {}

    if from_key and to_key:
        p_date = "AND (YEAR(pi.invoice_date)*100+MONTH(pi.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
        s_date = "AND (YEAR(si.invoice_date)*100+MONTH(si.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
        params['from_key'] = from_key
        params['to_key']   = to_key
    else:
        p_date = s_date = ""

    purchase_total = frappe.db.sql(f"""
        SELECT COALESCE(SUM(pii.amount), 0)
        FROM `tabPurchase Invoice Items` pii
        INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
        WHERE pi.invoice_date IS NOT NULL {dom_p} {p_date}
    """, params)[0][0] or 0

    sale_total = frappe.db.sql(f"""
        SELECT COALESCE(SUM(sii.amount), 0)
        FROM `tabSale Invoice Items` sii
        INNER JOIN `tabSale Invoice` si ON sii.parent = si.name
        WHERE si.invoice_date IS NOT NULL {dom_s} {s_date}
    """, params)[0][0] or 0

    p = float(purchase_total)
    s = float(sale_total)
    return {
        'total_domains':  total_domains,
        'purchase_total': p,
        'sale_total':     s,
        'margin':         s - p,
        'has_domain':     bool(domain)
    }


@frappe.whitelist()
def get_domain_all_months(domain, from_month='', to_month='', inv_type='purchase'):
    from collections import defaultdict

    domain   = (domain or '').strip().lower()
    from_key = month_key(from_month)
    to_key   = month_key(to_month)

    if inv_type == 'purchase':
        parent_dt = 'Purchase Invoice'
        child_dt  = 'Purchase Invoice Items'
        pa = 'pi'
        ca = 'pii'
    else:
        parent_dt = 'Sale Invoice'
        child_dt  = 'Sale Invoice Items'
        pa = 'si'
        ca = 'sii'

    params = {'domain': domain}
    if from_key and to_key:
        date_clause = f"AND (YEAR({pa}.invoice_date)*100+MONTH({pa}.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
        params['from_key'] = from_key
        params['to_key']   = to_key
    elif from_key:
        date_clause = f"AND (YEAR({pa}.invoice_date)*100+MONTH({pa}.invoice_date)) >= %(from_key)s"
        params['from_key'] = from_key
    elif to_key:
        date_clause = f"AND (YEAR({pa}.invoice_date)*100+MONTH({pa}.invoice_date)) <= %(to_key)s"
        params['to_key'] = to_key
    else:
        date_clause = ""

    rows = frappe.db.sql(f"""
        SELECT
            YEAR({pa}.invoice_date)   AS yr,
            MONTH({pa}.invoice_date)  AS mon,
            {pa}.name                 AS doc_name,
            {pa}.invoice_number,
            {ca}.subscription,
            {ca}.amount,
            {ca}.quantity,
            {ca}.start_date,
            {ca}.end_date,
            {ca}.description,
            {ca}.order_name,
            {ca}.po_number
        FROM `tab{child_dt}` {ca}
        INNER JOIN `tab{parent_dt}` {pa} ON {ca}.parent = {pa}.name
        WHERE LOWER(TRIM({ca}.domain)) = %(domain)s
          AND {pa}.invoice_date IS NOT NULL
          {date_clause}
        ORDER BY yr ASC, mon ASC, {ca}.subscription, {ca}.end_date ASC
    """, params, as_dict=True)

    months_map = defaultdict(lambda: defaultdict(list))
    for r in rows:
        month = MONTH_ORDER[r['mon'] - 1] + ' ' + str(r['yr'])
        key   = (r['doc_name'], r['subscription'] or 'Unknown')
        months_map[month][key].append(r)

    result = []
    for month in sorted(months_map.keys(), key=month_key):
        groups    = months_map[month]
        total_amt = sum(float(r['amount'] or 0) for g in groups.values() for r in g)
        invoices  = []

        for (doc_name, sub), group_rows in groups.items():
            first     = group_rows[0]
            grp_amt   = sum(float(r['amount'] or 0) for r in group_rows)
            end_dates = [r['end_date'] for r in group_rows if r['end_date']]
            max_end   = max(end_dates) if end_dates else None
            if max_end:
                active  = [r for r in group_rows if r['end_date'] and r['start_date']
                           and r['start_date'] <= max_end and r['end_date'] >= max_end]
                grp_qty = sum(int(r['quantity'] or 0) for r in active)
            else:
                grp_qty = sum(int(r['quantity'] or 0) for r in group_rows)

            invoices.append({
                'doc_name':       doc_name,
                'invoice_number': first['invoice_number'],
                'subscription':   sub,
                'amount':         grp_amt,
                'quantity':       grp_qty,
                'child_rows':     [
                    {
                        'start_date':  str(r['start_date']  or ''),
                        'end_date':    str(r['end_date']    or ''),
                        'description': r['description']     or '',
                        'order_name':  r.get('order_name')  or '',
                        'po_number':   r.get('po_number')   or '',
                        'quantity':    int(r['quantity']    or 0),
                        'amount':      float(r['amount']    or 0),
                    }
                    for r in group_rows
                ]
            })

        result.append({
            'month':        month,
            'total_amount': total_amt,
            'invoices':     invoices
        })

    return result


@frappe.whitelist()
def get_all_domains_margin(from_month='', to_month=''):
    from_key = month_key(from_month)
    to_key   = month_key(to_month)

    params = {}
    if from_key and to_key:
        p_date = "AND (YEAR(pi.invoice_date)*100+MONTH(pi.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
        s_date = "AND (YEAR(si.invoice_date)*100+MONTH(si.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
        params = {'from_key': from_key, 'to_key': to_key}
    else:
        p_date = s_date = ""

    purchase_rows = frappe.db.sql(f"""
        SELECT LOWER(TRIM(pii.domain)) AS domain, SUM(pii.amount) AS total
        FROM `tabPurchase Invoice Items` pii
        INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
        WHERE pii.domain IS NOT NULL AND pii.domain != '' {p_date}
        GROUP BY LOWER(TRIM(pii.domain))
    """, params, as_dict=True)

    sale_rows = frappe.db.sql(f"""
        SELECT LOWER(TRIM(sii.domain)) AS domain, SUM(sii.amount) AS total
        FROM `tabSale Invoice Items` sii
        INNER JOIN `tabSale Invoice` si ON sii.parent = si.name
        WHERE sii.domain IS NOT NULL AND sii.domain != '' {s_date}
        GROUP BY LOWER(TRIM(sii.domain))
    """, params, as_dict=True)

    p_map = {r.domain: float(r.total or 0) for r in purchase_rows}
    s_map = {r.domain: float(r.total or 0) for r in sale_rows}

    all_domains = sorted(set(list(p_map.keys()) + list(s_map.keys())))
    result = []
    for dom in all_domains:
        p = p_map.get(dom, 0)
        s = s_map.get(dom, 0)
        result.append({
            'domain':   dom,
            'purchase': p,
            'sale':     s,
            'margin':   s - p
        })

    result.sort(key=lambda x: x['margin'], reverse=True)
    return result


@frappe.whitelist()
def get_export_detail(domain, from_month='', to_month=''):
    domain   = (domain or '').strip().lower()
    from_key = month_key(from_month)
    to_key   = month_key(to_month)

    params = {'domain': domain}
    if from_key and to_key:
        p_date = "AND (YEAR(pi.invoice_date)*100+MONTH(pi.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
        s_date = "AND (YEAR(si.invoice_date)*100+MONTH(si.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
        params['from_key'] = from_key
        params['to_key']   = to_key
    else:
        p_date = s_date = ""

    purchase = frappe.db.sql(f"""
        SELECT
            pi.invoice_number, pi.invoice_date,
            pii.domain, pii.subscription, pii.description,
            pii.start_date, pii.end_date,
            pii.quantity, pii.amount, pii.order_name, pii.po_number
        FROM `tabPurchase Invoice Items` pii
        INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
        WHERE LOWER(TRIM(pii.domain)) = %(domain)s
          AND pi.invoice_date IS NOT NULL {p_date}
        ORDER BY pi.invoice_date ASC, pii.subscription
    """, params, as_dict=True)

    sale = frappe.db.sql(f"""
        SELECT
            si.invoice_number, si.invoice_date,
            sii.domain, sii.subscription, sii.description,
            sii.start_date, sii.end_date,
            sii.quantity, sii.amount, sii.order_name, sii.po_number
        FROM `tabSale Invoice Items` sii
        INNER JOIN `tabSale Invoice` si ON sii.parent = si.name
        WHERE LOWER(TRIM(sii.domain)) = %(domain)s
          AND si.invoice_date IS NOT NULL {s_date}
        ORDER BY si.invoice_date ASC, sii.subscription
    """, params, as_dict=True)

    def clean(rows):
        for r in rows:
            for k, v in r.items():
                if hasattr(v, 'strftime'):
                    r[k] = str(v)
        return rows

    return {
        'purchase': clean(purchase),
        'sale':     clean(sale)
    }


@frappe.whitelist()
def get_comparison_data(domain1, domain2, from_month='', to_month=''):
    from_key = month_key(from_month)
    to_key   = month_key(to_month)

    def get_monthly(domain):
        params = {'domain': domain.strip().lower()}
        if from_key and to_key:
            params['from_key'] = from_key
            params['to_key']   = to_key
            date_filter = "AND (YEAR(pi.invoice_date)*100+MONTH(pi.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
        else:
            date_filter = ""

        rows = frappe.db.sql(f"""
            SELECT
                YEAR(pi.invoice_date)  AS yr,
                MONTH(pi.invoice_date) AS mon,
                SUM(pii.amount)        AS purchase
            FROM `tabPurchase Invoice Items` pii
            INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
            WHERE LOWER(TRIM(pii.domain)) = %(domain)s
              AND pi.invoice_date IS NOT NULL {date_filter}
            GROUP BY yr, mon ORDER BY yr, mon
        """, params, as_dict=True)
        p_map = {MONTH_ORDER[r.mon-1]+' '+str(r.yr): float(r.purchase or 0) for r in rows}

        if from_key and to_key:
            date_filter_s = "AND (YEAR(si.invoice_date)*100+MONTH(si.invoice_date)) BETWEEN %(from_key)s AND %(to_key)s"
        else:
            date_filter_s = ""

        rows_s = frappe.db.sql(f"""
            SELECT
                YEAR(si.invoice_date)  AS yr,
                MONTH(si.invoice_date) AS mon,
                SUM(sii.amount)        AS sale
            FROM `tabSale Invoice Items` sii
            INNER JOIN `tabSale Invoice` si ON sii.parent = si.name
            WHERE LOWER(TRIM(sii.domain)) = %(domain)s
              AND si.invoice_date IS NOT NULL {date_filter_s}
            GROUP BY yr, mon ORDER BY yr, mon
        """, params, as_dict=True)
        s_map = {MONTH_ORDER[r.mon-1]+' '+str(r.yr): float(r.sale or 0) for r in rows_s}

        all_months = sorted(set(list(p_map.keys()) + list(s_map.keys())), key=month_key)
        return [
            {
                'month':    m,
                'purchase': p_map.get(m, 0),
                'sale':     s_map.get(m, 0),
                'balance':  s_map.get(m, 0) - p_map.get(m, 0)
            }
            for m in all_months
        ]

    d1_data = get_monthly(domain1)
    d2_data = get_monthly(domain2)

    all_months = sorted(
        set([r['month'] for r in d1_data] + [r['month'] for r in d2_data]),
        key=month_key
    )
    d1_map = {r['month']: r for r in d1_data}
    d2_map = {r['month']: r for r in d2_data}

    result = []
    for m in all_months:
        r1 = d1_map.get(m, {'purchase': 0, 'sale': 0, 'balance': 0})
        r2 = d2_map.get(m, {'purchase': 0, 'sale': 0, 'balance': 0})
        result.append({
            'month':      m,
            'd1_purchase': r1['purchase'],
            'd1_sale':     r1['sale'],
            'd1_balance':  r1['balance'],
            'd2_purchase': r2['purchase'],
            'd2_sale':     r2['sale'],
            'd2_balance':  r2['balance'],
        })

    return result


@frappe.whitelist()
def generate_excel_export(domain, from_month='', to_month='', heading='', export_type='all'):
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        import io, base64, re
    except ImportError:
        frappe.throw("openpyxl required: pip install openpyxl --break-system-packages")

    domains   = [d.strip() for d in (domain or '').split(',') if d.strip()]
    is_multi  = len(domains) > 1
    period    = f"{from_month or 'All'} to {to_month or 'Present'}"

    if not domains:
        if export_type == 'all':
            domains = frappe.db.sql("""
                SELECT DISTINCT LOWER(TRIM(domain)) AS domain
                FROM (
                    SELECT domain FROM `tabPurchase Invoice Items`
                    WHERE domain IS NOT NULL AND domain != ''
                    UNION
                    SELECT domain FROM `tabSale Invoice Items`
                    WHERE domain IS NOT NULL AND domain != ''
                ) combined
                ORDER BY domain ASC
            """, pluck='domain')
        else:
            frappe.throw("No domain selected for export.")

    hdr_font   = Font(bold=True, color="FFFFFF", size=11)
    p_fill     = PatternFill("solid", fgColor="1E40AF")
    s_fill     = PatternFill("solid", fgColor="15803D")
    sum_fill   = PatternFill("solid", fgColor="374151")
    total_fill = PatternFill("solid", fgColor="F3F4F6")
    total_font = Font(bold=True, size=11)
    title_font = Font(bold=True, size=13, color="111827")
    sub_font   = Font(size=10, color="6B7280")
    center     = Alignment(horizontal="center", vertical="center")
    right_aln  = Alignment(horizontal="right")
    thin_bdr   = Border(bottom=Side(style='thin', color='E5E7EB'))

    def style_header(ws, row_idx, fill):
        for cell in ws[row_idx]:
            if cell.value is not None:
                cell.font      = hdr_font
                cell.fill      = fill
                cell.alignment = center

    def style_data(ws, row_idx, is_total=False):
        for cell in ws[row_idx]:
            cell.border = thin_bdr
            if isinstance(cell.value, (int, float)):
                cell.alignment = right_aln
            if is_total:
                cell.font = total_font
                cell.fill = total_fill

    def auto_width(ws, max_w=40):
        for col in ws.columns:
            w = max((len(str(c.value or '')) for c in col), default=10)
            ws.column_dimensions[col[0].column_letter].width = min(w + 4, max_w)

    def add_heading_rows(ws, dom, type_label):
        ws.append([f"{type_label}  —  {dom}"])
        ws.cell(row=ws.max_row, column=1).font = title_font
        ws.append([f"Period: {period}"])
        ws.cell(row=ws.max_row, column=1).font = sub_font
        ws.append([])

    def make_sheet_name(dom, suffix):
        clean = re.sub(r'[:\\/?*\[\]]', '_', dom)
        if export_type == 'all':
            return clean[:31]
        name  = f"{clean[:25]}_{suffix}" if is_multi else suffix
        return name[:31]

    det_headers = ['Invoice Number', 'Invoice Date', 'Domain', 'Subscription',
                   'Description', 'Start Date', 'End Date', 'Quantity', 'Amount',
                   'Order Name', 'PO Number']

    def add_detail_sheet(ws, dom, rows, fill, type_label):
        add_heading_rows(ws, dom, type_label)
        ws.append(det_headers)
        style_header(ws, ws.max_row, fill)
        for r in rows:
            ws.append([
                r.get('invoice_number'), str(r.get('invoice_date') or ''),
                r.get('domain'), r.get('subscription'), r.get('description'),
                str(r.get('start_date') or ''), str(r.get('end_date') or ''),
                r.get('quantity'), r.get('amount'),
                r.get('order_name'), r.get('po_number')
            ])
            style_data(ws, ws.max_row)
        auto_width(ws)

    _cache = {}
    def get_detail(dom):
        if dom not in _cache:
            _cache[dom] = get_export_detail(dom, from_month, to_month)
        return _cache[dom]

    wb = openpyxl.Workbook()
    wb.remove(wb.active)

    for dom in domains:
        detail = get_detail(dom)

        if export_type in ('summary', 'all'):
            sname = make_sheet_name(dom, 'Summary' if not is_multi else 'Sum')
            ws    = wb.create_sheet(title=sname)
            add_heading_rows(ws, dom, 'Summary')
            try:
                cols, data = execute({'domain': dom, 'from_month': from_month, 'to_month': to_month})
                ws.append([c['label'] for c in cols])
                style_header(ws, ws.max_row, sum_fill)
                for row in data:
                    ws.append([row.get(c['fieldname'], '') for c in cols])
                    style_data(ws, ws.max_row, row.get('month') == 'TOTAL')
                auto_width(ws)
            except Exception as e:
                ws.append([f"No summary data — {e}"])

        if export_type == 'purchase':
            sname = make_sheet_name(dom, 'Purchase' if not is_multi else 'P')
            ws    = wb.create_sheet(title=sname)
            add_detail_sheet(ws, dom, detail.get('purchase') or [], p_fill, 'Purchase Invoice')

        if export_type == 'sale':
            sname = make_sheet_name(dom, 'Sale' if not is_multi else 'S')
            ws    = wb.create_sheet(title=sname)
            add_detail_sheet(ws, dom, detail.get('sale') or [], s_fill, 'Sale Invoice')

    if not wb.sheetnames:
        wb.create_sheet("No Data")

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    type_map   = {'purchase': 'Purchase', 'sale': 'Sale', 'summary': 'Summary', 'all': 'All'}
    type_label = type_map.get(export_type, 'Export')
    filename   = f"{type_label}.xlsx"

    return {
        'content':  base64.b64encode(output.read()).decode(),
        'filename': filename
    }










