# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

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
#         → 'p_google_workspace_additional_storage__100_gb__amt'
    
#     BUG FIX: old code used .replace(" ","_") which kept ( ) brackets
#     in fieldnames — those brackets silently break Frappe's datatable.
#     """
#     clean = re.sub(r'[^a-z0-9]', '_', sub.lower())
#     # Collapse multiple underscores
#     clean = re.sub(r'_+', '_', clean).strip('_')
#     return f"{prefix}_{clean}"


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
#     """Per-invoice breakdown for month-click popup."""
#     domain = (domain or "").strip().lower()
#     try:
#         parts   = month.strip().split(" ")
#         mon_idx = MONTH_ORDER.index(parts[0]) + 1
#         year    = int(parts[1])
#     except Exception:
#         return []

#     args = {"domain": domain, "mon": mon_idx, "yr": year}

#     purchase = frappe.db.sql("""
#         SELECT 'Purchase'         AS type,
#                pi.name            AS doc_name,
#                pi.invoice_number,
#                pi.invoice_date,
#                pii.subscription,
#                SUM(pii.amount)    AS amount,
#                SUM(pii.quantity)  AS quantity
#         FROM `tabPurchase Invoice Items` pii
#         INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
#         WHERE LOWER(TRIM(pii.domain)) = %(domain)s
#           AND MONTH(pi.invoice_date) = %(mon)s
#           AND YEAR(pi.invoice_date)  = %(yr)s
#         GROUP BY pi.name, pii.subscription
#         ORDER BY pi.invoice_date ASC
#     """, args, as_dict=True)

#     sale = frappe.db.sql("""
#         SELECT 'Sale'             AS type,
#                si.name            AS doc_name,
#                si.invoice_number,
#                si.invoice_date,
#                sii.subscription,
#                SUM(sii.amount)    AS amount,
#                SUM(sii.quantity)  AS quantity
#         FROM `tabSale Invoice Items` sii
#         INNER JOIN `tabSale Invoice` si ON sii.parent = si.name
#         WHERE LOWER(TRIM(sii.domain)) = %(domain)s
#           AND MONTH(si.invoice_date) = %(mon)s
#           AND YEAR(si.invoice_date)  = %(yr)s
#         GROUP BY si.name, sii.subscription
#         ORDER BY si.invoice_date ASC
#     """, args, as_dict=True)

#     return list(purchase) + list(sale)


# def fetch_pivot(parent_dt, child_dt, domain, from_key, to_key):
#     """
#     Fetch all child rows for a domain and pivot them by (invoice_month, subscription).

#     FIXES applied:
#     1. Uses pi.invoice_date (parent) — consistent with get_filter_options.
#     2. BUG FIX: When from_key=0 or to_key=0 (filter not yet set / empty),
#        DOES NOT use BETWEEN. Old code had BETWEEN 0 AND 0 → zero rows always.
#        Now skips the date clause entirely → fetches all available data.
#     """
#     params = {"domain": domain}

#     # Only add date filter when BOTH keys are valid non-zero values
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
#         # Both zero → no date filter → return all data for this domain
#         date_clause = ""

#     # Fetch every individual row — do NOT pre-aggregate qty in SQL.
#     # We need start_date + end_date per row to apply the max_end_date rule in Python.
#     # AMT is still summed correctly (all rows in a group contribute to cost).
#     # QTY uses the rule: sum qty of rows active on the last billed day of the month.
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
#         WHERE LOWER(TRIM(ci.domain)) = %(domain)s
#           AND pi.invoice_date IS NOT NULL
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
#     filters  = filters or {}
#     domain   = (filters.get("domain") or "").strip().lower()
#     from_m   = (filters.get("from_month") or "").strip()
#     to_m     = (filters.get("to_month")   or "").strip()

#     if not domain:
#         frappe.throw(_("Please select a Domain to view the report."))

#     from_key = month_key(from_m)   # 0 when filter is empty — handled in fetch_pivot
#     to_key   = month_key(to_m)     # 0 when filter is empty

#     p_pivot, p_subs = fetch_pivot(
#         "Purchase Invoice", "Purchase Invoice Items",
#         domain, from_key, to_key
#     )
#     s_pivot, s_subs = fetch_pivot(
#         "Sale Invoice", "Sale Invoice Items",
#         domain, from_key, to_key
#     )

#     if not p_pivot and not s_pivot:
#         frappe.throw(_(f"No data found for domain: {domain}"))

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

#     # ── Columns ──────────────────────────────────────────────────
#     columns = [{
#         "label":     _("Month"),
#         "fieldname": "month",
#         "fieldtype": "Data",
#         "width":     130
#     }]

#     # Purchase columns — "P | Sub AMT / LIC"
#     # BUG FIX: use safe_fieldname() — old .replace(" ","_") kept ( ) brackets
#     # which silently broke the datatable for "Additional Storage (100 GB)" etc.
#     for sub in p_subs_list:
#         fn_base = safe_fieldname(sub, "p")
#         columns.append({
#             "label":     _("P | " + sub + " AMT"),
#             "fieldname": fn_base + "_amt",
#             "fieldtype": "Float",
#             "width":     175,
#             "precision": 2
#         })
#         columns.append({
#             "label":     _("P | " + sub + " LIC"),
#             "fieldname": fn_base + "_lic",
#             "fieldtype": "Int",
#             "width":     90
#         })

#     # Sale columns — "S | Sub AMT / LIC"
#     for sub in s_subs_list:
#         fn_base = safe_fieldname(sub, "s")
#         columns.append({
#             "label":     _("S | " + sub + " AMT"),
#             "fieldname": fn_base + "_amt",
#             "fieldtype": "Float",
#             "width":     175,
#             "precision": 2
#         })
#         columns.append({
#             "label":     _("S | " + sub + " LIC"),
#             "fieldname": fn_base + "_lic",
#             "fieldtype": "Int",
#             "width":     90
#         })

#     columns.append({
#         "label":     _("Balance (S - P)"),
#         "fieldname": "balance",
#         "fieldtype": "Float",
#         "width":     160,
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



# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

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
#     """Per-invoice breakdown for month-click popup."""
#     domain = (domain or "").strip().lower()
#     try:
#         parts   = month.strip().split(" ")
#         mon_idx = MONTH_ORDER.index(parts[0]) + 1
#         year    = int(parts[1])
#     except Exception:
#         return []

#     args = {"domain": domain, "mon": mon_idx, "yr": year}

#     purchase = frappe.db.sql("""
#         SELECT 'Purchase'         AS type,
#                pi.name            AS doc_name,
#                pi.invoice_number,
#                pi.invoice_date,
#                pii.subscription,
#                SUM(pii.amount)    AS amount,
#                SUM(pii.quantity)  AS quantity
#         FROM `tabPurchase Invoice Items` pii
#         INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
#         WHERE LOWER(TRIM(pii.domain)) = %(domain)s
#           AND MONTH(pi.invoice_date) = %(mon)s
#           AND YEAR(pi.invoice_date)  = %(yr)s
#         GROUP BY pi.name, pii.subscription
#         ORDER BY pi.invoice_date ASC
#     """, args, as_dict=True)

#     sale = frappe.db.sql("""
#         SELECT 'Sale'             AS type,
#                si.name            AS doc_name,
#                si.invoice_number,
#                si.invoice_date,
#                sii.subscription,
#                SUM(sii.amount)    AS amount,
#                SUM(sii.quantity)  AS quantity
#         FROM `tabSale Invoice Items` sii
#         INNER JOIN `tabSale Invoice` si ON sii.parent = si.name
#         WHERE LOWER(TRIM(sii.domain)) = %(domain)s
#           AND MONTH(si.invoice_date) = %(mon)s
#           AND YEAR(si.invoice_date)  = %(yr)s
#         GROUP BY si.name, sii.subscription
#         ORDER BY si.invoice_date ASC
#     """, args, as_dict=True)

#     return list(purchase) + list(sale)


# def fetch_pivot(parent_dt, child_dt, domain, from_key, to_key):
#     """
#     Fetch all child rows for a domain and pivot them by (invoice_month, subscription).

#     FIXES applied:
#     1. Uses pi.invoice_date (parent) — consistent with get_filter_options.
#     2. BUG FIX: When from_key=0 or to_key=0 (filter not yet set / empty),
#        DOES NOT use BETWEEN. Old code had BETWEEN 0 AND 0 → zero rows always.
#        Now skips the date clause entirely → fetches all available data.
#     """
#     params = {"domain": domain}

#     # Only add date filter when BOTH keys are valid non-zero values
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
#         # Both zero → no date filter → return all data for this domain
#         date_clause = ""

#     # Fetch every individual row — do NOT pre-aggregate qty in SQL.
#     # We need start_date + end_date per row to apply the max_end_date rule in Python.
#     # AMT is still summed correctly (all rows in a group contribute to cost).
#     # QTY uses the rule: sum qty of rows active on the last billed day of the month.
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
#         WHERE LOWER(TRIM(ci.domain)) = %(domain)s
#           AND pi.invoice_date IS NOT NULL
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
#     filters  = filters or {}
#     domain   = (filters.get("domain") or "").strip().lower()
#     from_m   = (filters.get("from_month") or "").strip()
#     to_m     = (filters.get("to_month")   or "").strip()

#     if not domain:
#         frappe.throw(_("Please select a Domain to view the report."))

#     from_key = month_key(from_m)   # 0 when filter is empty — handled in fetch_pivot
#     to_key   = month_key(to_m)     # 0 when filter is empty

#     p_pivot, p_subs = fetch_pivot(
#         "Purchase Invoice", "Purchase Invoice Items",
#         domain, from_key, to_key
#     )
#     s_pivot, s_subs = fetch_pivot(
#         "Sale Invoice", "Sale Invoice Items",
#         domain, from_key, to_key
#     )

#     if not p_pivot and not s_pivot:
#         frappe.throw(_(f"No data found for domain: {domain}"))

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
#         "width":     130
#     }]

#     # Purchase columns — label uses short name, fieldname uses safe full name
#     for sub in p_subs_list:
#         fn_base = safe_fieldname(sub, "p")
#         lbl     = col_label(sub, short_map)   # DB short_label or auto fallback
#         columns.append({
#             "label":     _("P | " + lbl + " AMT"),
#             "fieldname": fn_base + "_amt",
#             "fieldtype": "Float",
#             "width":     155,
#             "precision": 2
#         })
#         columns.append({
#             "label":     _("P | " + lbl + " LIC"),
#             "fieldname": fn_base + "_lic",
#             "fieldtype": "Int",
#             "width":     85
#         })

#     # Sale columns
#     for sub in s_subs_list:
#         fn_base = safe_fieldname(sub, "s")
#         lbl     = col_label(sub, short_map)
#         columns.append({
#             "label":     _("S | " + lbl + " AMT"),
#             "fieldname": fn_base + "_amt",
#             "fieldtype": "Float",
#             "width":     155,
#             "precision": 2
#         })
#         columns.append({
#             "label":     _("S | " + lbl + " LIC"),
#             "fieldname": fn_base + "_lic",
#             "fieldtype": "Int",
#             "width":     85
#         })

#     columns.append({
#         "label":     _("Balance (S - P)"),
#         "fieldname": "balance",
#         "fieldtype": "Float",
#         "width":     160,
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


# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import frappe
from frappe import _
import re

MONTH_ORDER = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]


def month_key(m):
    """
    'Jan 2025' → 202501
    '' or None or bad string → 0
    """
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
    """
    Convert subscription name to a safe fieldname.
    Removes ALL non-alphanumeric chars (including parentheses).

    'Google Workspace Additional Storage (100 GB)'
        → 'p_google_workspace_additional_storage_100_gb_amt'

    BUG FIX: old code used .replace(" ","_") which kept ( ) brackets
    in fieldnames — those brackets silently break Frappe's datatable.
    """
    clean = re.sub(r'[^a-z0-9]', '_', sub.lower())
    clean = re.sub(r'_+', '_', clean).strip('_')
    return f"{prefix}_{clean}"


def get_short_label_map():
    """
    Fetch short_label from Subscription Plan doctype for ALL plans in one query.
    Returns a dict: { full_subscription_name → short_label }

    If short_label is blank for a plan, falls back to auto_short_label().
    User can fill in short labels from the Subscription Plan list view.
    """
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
    """
    Generic short label — works for ANY subscription name, no hardcoded patterns.
    Algorithm: acronym of all words except last + last word. Truncates to 15 chars.

    'Google Workspace Business Starter'            → 'GWB Starter'
    'Google Workspace Additional Storage (100 GB)' → 'GWAS 100GB'
    'Microsoft 365 Business Standard'              → 'M3B Standard'
    'Zoho Mail Premium'                            → 'ZM Premium'
    'Slack Pro'                                    → 'Slack Pro'
    """
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
    """
    Return display label for a subscription column header.
    Priority: Subscription Plan.short_label (DB) → auto_short_label() fallback.
    """
    return short_map.get(sub) or auto_short_label(sub)


@frappe.whitelist()
def get_filter_options():
    """Return all available domains and months for the filter dropdowns."""

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

    # invoice_date from PARENT tables — authoritative billing month
    date_rows = frappe.db.sql("""
        SELECT DISTINCT invoice_date FROM (
            SELECT invoice_date FROM `tabPurchase Invoice`
            WHERE invoice_date IS NOT NULL
            UNION
            SELECT invoice_date FROM `tabSale Invoice`
            WHERE invoice_date IS NOT NULL
        ) combined
        ORDER BY invoice_date ASC
    """, as_dict=True)

    month_set = set()
    for r in date_rows:
        d = r.invoice_date
        if d:
            month_set.add(MONTH_ORDER[d.month - 1] + " " + str(d.year))

    months = sorted(month_set, key=month_key)
    return {"domains": domains, "months": months}


@frappe.whitelist()
def get_month_detail(domain, month):
    """Per-invoice breakdown for month-click popup.
    Applies max_end_date rule for qty (same as fetch_pivot).
    Returns child_rows per group so JS can expand them.
    """
    import unicodedata
    from collections import defaultdict

    domain = (domain or "").strip().lower()
    try:
        parts   = month.strip().split(" ")
        mon_idx = MONTH_ORDER.index(parts[0]) + 1
        year    = int(parts[1])
    except Exception:
        return []

    args = {"domain": domain, "mon": mon_idx, "yr": year}

    def build_groups(rows):
        """Group individual rows by (doc_name, subscription), apply max_end_date rule."""
        groups = defaultdict(list)
        for r in rows:
            key = (r["doc_name"], r["subscription"] or "Unknown")
            groups[key].append(r)

        result = []
        for (doc_name, sub), group_rows in groups.items():
            first     = group_rows[0]
            total_amt = sum(float(r["amount"] or 0) for r in group_rows)

            # max_end_date rule for qty
            end_dates = [r["end_date"] for r in group_rows if r["end_date"]]
            max_end   = max(end_dates) if end_dates else None
            if max_end:
                active    = [r for r in group_rows
                             if r["end_date"] and r["start_date"]
                             and r["start_date"] <= max_end
                             and r["end_date"]   >= max_end]
                total_qty = sum(int(r["quantity"] or 0) for r in active)
            else:
                total_qty = sum(int(r["quantity"] or 0) for r in group_rows)

            result.append({
                "type":           first["type"],
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
                        "quantity":    int(r["quantity"]    or 0),
                        "amount":      float(r["amount"]    or 0),
                        "description": r["description"]     or "",
                    }
                    for r in group_rows
                ]
            })
        return result

    purchase_rows = frappe.db.sql("""
        SELECT 'Purchase'        AS type,
               pi.name           AS doc_name,
               pi.invoice_number,
               pi.invoice_date,
               pii.subscription,
               pii.amount,
               pii.quantity,
               pii.start_date,
               pii.end_date,
               pii.description
        FROM `tabPurchase Invoice Items` pii
        INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
        WHERE LOWER(TRIM(pii.domain)) = %(domain)s
          AND MONTH(pi.invoice_date) = %(mon)s
          AND YEAR(pi.invoice_date)  = %(yr)s
        ORDER BY pi.invoice_date ASC, pii.subscription, pii.end_date ASC
    """, args, as_dict=True)

    sale_rows = frappe.db.sql("""
        SELECT 'Sale'            AS type,
               si.name           AS doc_name,
               si.invoice_number,
               si.invoice_date,
               sii.subscription,
               sii.amount,
               sii.quantity,
               sii.start_date,
               sii.end_date,
               sii.description
        FROM `tabSale Invoice Items` sii
        INNER JOIN `tabSale Invoice` si ON sii.parent = si.name
        WHERE LOWER(TRIM(sii.domain)) = %(domain)s
          AND MONTH(si.invoice_date) = %(mon)s
          AND YEAR(si.invoice_date)  = %(yr)s
        ORDER BY si.invoice_date ASC, sii.subscription, sii.end_date ASC
    """, args, as_dict=True)

    return build_groups(purchase_rows) + build_groups(sale_rows)


def fetch_pivot(parent_dt, child_dt, domain, from_key, to_key):
    """
    Fetch all child rows for a domain and pivot them by (invoice_month, subscription).

    FIXES applied:
    1. Uses pi.invoice_date (parent) — consistent with get_filter_options.
    2. BUG FIX: When from_key=0 or to_key=0 (filter not yet set / empty),
       DOES NOT use BETWEEN. Old code had BETWEEN 0 AND 0 → zero rows always.
       Now skips the date clause entirely → fetches all available data.
    """
    params = {"domain": domain}

    # Only add date filter when BOTH keys are valid non-zero values
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
        # Both zero → no date filter → return all data for this domain
        date_clause = ""

    # Fetch every individual row — do NOT pre-aggregate qty in SQL.
    # We need start_date + end_date per row to apply the max_end_date rule in Python.
    # AMT is still summed correctly (all rows in a group contribute to cost).
    # QTY uses the rule: sum qty of rows active on the last billed day of the month.
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
        WHERE LOWER(TRIM(ci.domain)) = %(domain)s
          AND pi.invoice_date IS NOT NULL
          {date_clause}
        ORDER BY yr ASC, mon ASC, ci.subscription, ci.end_date ASC
    """

    raw_rows = frappe.db.sql(sql, params, as_dict=True)

    # ── Group individual rows by (month, subscription) ───────────
    from collections import defaultdict
    groups = defaultdict(list)   # key = (month_str, sub) → list of row dicts

    for r in raw_rows:
        month = MONTH_ORDER[r["mon"] - 1] + " " + str(r["yr"])
        sub   = (r["subscription"] or "Unknown").strip()
        groups[(month, sub)].append(r)

    # ── Build pivot applying the correct LIC rule ─────────────────
    pivot = {}
    subs  = set()

    for (month, sub), group_rows in groups.items():

        # AMT — simple sum of every row in the group
        total_amt = sum(float(r["amt"] or 0) for r in group_rows)

        # QTY — "max_end_date" rule:
        #   1. Find the latest end_date in this group (= last billed day).
        #   2. Sum qty only for rows that are still active on that date,
        #      i.e. start_date <= max_end AND end_date >= max_end.
        #
        # Example — chemfields Business Starter (Mar 2026):
        #   Base:   01-Mar → 31-Mar, qty=40  active on 31-Mar → ✅ include
        #   Addon1: 18-Mar → 31-Mar, qty=1   active on 31-Mar → ✅ include
        #   Addon2: 20-Mar → 31-Mar, qty=1   active on 31-Mar → ✅ include
        #   LIC = 40 + 1 + 1 = 42  ✓
        #
        # Example — astralcad Business Starter (Mar 2026):
        #   Row1: 01-Mar → 05-Mar, qty=37  end < 31-Mar → ❌ exclude
        #   Row2: 06-Mar → 31-Mar, qty=37  active on 31-Mar → ✅ include
        #   LIC = 37  ✓

        end_dates  = [r["end_date"] for r in group_rows if r["end_date"]]
        max_end    = max(end_dates) if end_dates else None

        if max_end:
            active = [
                r for r in group_rows
                if r["end_date"]
                and r["start_date"]
                and r["start_date"] <= max_end
                and r["end_date"]   >= max_end
            ]
            total_qty = sum(int(r["qty"] or 0) for r in active)
        else:
            # No end_date stored — fall back to simple sum
            total_qty = sum(int(r["qty"] or 0) for r in group_rows)

        if month not in pivot:
            pivot[month] = {}

        pivot[month][sub] = {"amt": total_amt, "qty": total_qty}
        subs.add(sub)

    return pivot, subs


def execute(filters=None):
    filters  = filters or {}
    domain   = (filters.get("domain") or "").strip().lower()
    from_m   = (filters.get("from_month") or "").strip()
    to_m     = (filters.get("to_month")   or "").strip()

    if not domain:
        frappe.throw(_("Please select a Domain to view the report."))

    from_key = month_key(from_m)   # 0 when filter is empty — handled in fetch_pivot
    to_key   = month_key(to_m)     # 0 when filter is empty

    p_pivot, p_subs = fetch_pivot(
        "Purchase Invoice", "Purchase Invoice Items",
        domain, from_key, to_key
    )
    s_pivot, s_subs = fetch_pivot(
        "Sale Invoice", "Sale Invoice Items",
        domain, from_key, to_key
    )

    if not p_pivot and not s_pivot:
        frappe.throw(_(f"No data found for domain: {domain}"))

    # ── Build month list ──────────────────────────────────────────
    # BUG FIX: Old code did month_range(0, 0) → int(0/100)=0 → year 0 → wrong months.
    # Fix: if keys are valid, build a continuous range (so empty months still appear).
    #      If keys are 0, fall back to data-driven month list.
    if from_key and to_key:
        all_months = []
        for yr in range(from_key // 100, (to_key // 100) + 1):
            for mon in range(1, 13):
                mk = yr * 100 + mon
                if mk < from_key or mk > to_key:
                    continue
                all_months.append(MONTH_ORDER[mon - 1] + " " + str(yr))
    else:
        # Fall back to months that have actual data
        all_months = sorted(
            set(list(p_pivot.keys()) + list(s_pivot.keys())),
            key=month_key
        )

    p_subs_list = sorted(p_subs)
    s_subs_list = sorted(s_subs)

    # ── Fetch short labels from Subscription Plan doctype ─────────
    # User sets these in the Subscription Plan list view.
    # Fallback: auto_short_label() abbreviates automatically.
    short_map = get_short_label_map()

    # ── Columns ──────────────────────────────────────────────────
    columns = [{
        "label":     _("Month"),
        "fieldname": "month",
        "fieldtype": "Data",
        "width":     200
    }]

    # Purchase columns — label uses short name, fieldname uses safe full name
    for sub in p_subs_list:
        fn_base = safe_fieldname(sub, "p")
        lbl     = col_label(sub, short_map)   # DB short_label or auto fallback
        columns.append({
            "label":     _("P | " + lbl + " AMT"),
            "fieldname": fn_base + "_amt",
            "fieldtype": "Float",
            "width":     200,
            "precision": 2
        })
        columns.append({
            "label":     _("P | " + lbl + " LIC"),
            "fieldname": fn_base + "_lic",
            "fieldtype": "Int",
            "width":     200
        })

    # Sale columns
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
            "width":     200
        })

    columns.append({
        "label":     _("Balance"),
        "fieldname": "balance",
        "fieldtype": "Float",
        "width":     200,
        "precision": 2
    })

    # ── Data rows ─────────────────────────────────────────────────
    data         = []
    gp_amt       = {sub: 0.0 for sub in p_subs_list}
    gs_amt       = {sub: 0.0 for sub in s_subs_list}
    g_balance    = 0.0
    # LIC in TOTAL = last month's seat count (seats are a snapshot, NOT cumulative)
    # 11 seats × 15 months ≠ 165 — it should show 11 (current seat count)
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
            # Track last seen non-zero qty — used for TOTAL row
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
        g_balance     += balance
        data.append(row)

    # ── TOTAL row ─────────────────────────────────────────────────
    total_row = {"month": "TOTAL"}
    for sub in p_subs_list:
        fn_base = safe_fieldname(sub, "p")
        total_row[fn_base + "_amt"] = gp_amt[sub]
        total_row[fn_base + "_lic"] = last_p_lic[sub]  # last month's seats, not sum
    for sub in s_subs_list:
        fn_base = safe_fieldname(sub, "s")
        total_row[fn_base + "_amt"] = gs_amt[sub]
        total_row[fn_base + "_lic"] = last_s_lic[sub]  # last month's seats, not sum
    total_row["balance"] = g_balance
    data.append(total_row)

    return columns, data













