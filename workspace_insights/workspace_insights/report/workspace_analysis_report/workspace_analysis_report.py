# import frappe
# from frappe import _

# MONTH_ORDER = [
#     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
#     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
# ]


# def month_key(m):
#     try:
#         parts = m.strip().split(" ")
#         mon = MONTH_ORDER.index(parts[0]) + 1
#         yr  = int(parts[1])
#         return yr * 100 + mon
#     except Exception:
#         return 0


# @frappe.whitelist()
# def get_filter_options():
#     domain_rows = frappe.db.sql("""
#         SELECT DISTINCT LOWER(TRIM(domain)) as domain
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
#     domain = (domain or "").strip().lower()
#     try:
#         parts   = month.strip().split(" ")
#         mon_idx = MONTH_ORDER.index(parts[0]) + 1
#         year    = int(parts[1])
#     except Exception:
#         return []

#     args = {"domain": domain, "mon": mon_idx, "yr": year}

#     purchase = frappe.db.sql("""
#         SELECT 'Purchase' AS type,
#             wa.name AS doc_name, wa.invoice_number, wa.invoice_date,
#             wai.subscription,
#             SUM(wai.amount)   AS amount,
#             SUM(wai.quantity) AS quantity
#         FROM `tabPurchase Invoice Items` wai
#         INNER JOIN `tabPurchase Invoice` wa ON wai.parent = wa.name
#         WHERE LOWER(TRIM(wai.domain)) = %(domain)s
#           AND MONTH(wa.invoice_date) = %(mon)s
#           AND YEAR(wa.invoice_date)  = %(yr)s
#         GROUP BY wa.name, wai.subscription
#         ORDER BY wa.invoice_date ASC
#     """, args, as_dict=True)

#     sale = frappe.db.sql("""
#         SELECT 'Sale' AS type,
#             wa.name AS doc_name, wa.invoice_number, wa.invoice_date,
#             wai.subscription,
#             SUM(wai.amount)   AS amount,
#             SUM(wai.quantity) AS quantity
#         FROM `tabSale Invoice Items` wai
#         INNER JOIN `tabSale Invoice` wa ON wai.parent = wa.name
#         WHERE LOWER(TRIM(wai.domain)) = %(domain)s
#           AND MONTH(wa.invoice_date) = %(mon)s
#           AND YEAR(wa.invoice_date)  = %(yr)s
#         GROUP BY wa.name, wai.subscription
#         ORDER BY wa.invoice_date ASC
#     """, args, as_dict=True)

#     return list(purchase) + list(sale)


# def fetch_pivot(parent_table, child_table, domain, from_key, to_key):
#     raw = frappe.db.sql(f"""
#         SELECT
#             wa.invoice_date,
#             wai.subscription,
#             SUM(wai.quantity) AS quantity,
#             SUM(wai.amount)   AS amount
#         FROM `tab{child_table}` wai
#         INNER JOIN `tab{parent_table}` wa ON wai.parent = wa.name
#         WHERE LOWER(TRIM(wai.domain)) = %(domain)s
#           AND wa.invoice_date IS NOT NULL
#         GROUP BY
#             YEAR(wa.invoice_date),
#             MONTH(wa.invoice_date),
#             wai.subscription
#         ORDER BY wa.invoice_date ASC
#     """, {"domain": domain}, as_dict=True)

#     pivot = {}
#     subs  = set()

#     for row in raw:
#         month = MONTH_ORDER[row.invoice_date.month - 1] + " " + str(row.invoice_date.year)
#         mk    = month_key(month)

#         if from_key and mk < from_key:
#             continue
#         if to_key and mk > to_key:
#             continue

#         sub = (row.subscription or "").strip()
#         sub = sub.replace("Google Workspace ", "").replace("G Suite ", "G Suite ")

#         pivot.setdefault(month, {})
#         pivot[month][sub] = {
#             "amt": float(row.amount   or 0),
#             "qty": int(row.quantity   or 0)
#         }
#         subs.add(sub)

#     return pivot, subs


# def execute(filters=None):
#     filters  = filters or {}
#     domain   = (filters.get("domain") or "").strip().lower()
#     from_m   = filters.get("from_month") or ""
#     to_m     = filters.get("to_month")   or ""

#     if not domain:
#         frappe.throw(_("Please select a Domain."))

#     from_key = month_key(from_m)
#     to_key   = month_key(to_m)

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

#     all_months  = sorted(
#         set(list(p_pivot.keys()) + list(s_pivot.keys())),
#         key=month_key
#     )
#     p_subs_list = sorted(p_subs)
#     s_subs_list = sorted(s_subs)

#     # ── Columns ──────────────────────────────────────────────────
#     columns = [{
#         "label":     _("Month"),
#         "fieldname": "month",
#         "fieldtype": "Data",
#         "width":     110
#     }]

#     # Purchase columns
#     for sub in p_subs_list:
#         safe = "p_" + sub.lower().replace(" ", "_")
#         columns.append({
#             "label":     _(sub + " AMT"),
#             "fieldname": safe + "_amt",
#             "fieldtype": "Float",
#             "width":     160,
#             "precision": 2
#         })
#         columns.append({
#             "label":     _(sub + " LIC"),
#             "fieldname": safe + "_lic",
#             "fieldtype": "Int",
#             "width":     80
#         })

#     # Sale columns
#     for sub in s_subs_list:
#         safe = "s_" + sub.lower().replace(" ", "_")
#         columns.append({
#             "label":     _(sub + " AMT"),
#             "fieldname": safe + "_amt",
#             "fieldtype": "Float",
#             "width":     160,
#             "precision": 2
#         })
#         columns.append({
#             "label":     _(sub + " LIC"),
#             "fieldname": safe + "_lic",
#             "fieldtype": "Int",
#             "width":     80
#         })

#     # Balance column (Purchase - Sale)
#     columns.append({
#         "label":     _("Balance"),
#         "fieldname": "balance",
#         "fieldtype": "Float",
#         "width":     150,
#         "precision": 2
#     })

#     # ── Data rows ─────────────────────────────────────────────────
#     data    = []
#     gp_amt  = {sub: 0.0 for sub in p_subs_list}
#     gp_lic  = {sub: 0   for sub in p_subs_list}
#     gs_amt  = {sub: 0.0 for sub in s_subs_list}
#     gs_lic  = {sub: 0   for sub in s_subs_list}
#     g_balance = 0.0

#     for month in all_months:
#         row  = {"month": month}
#         pm   = p_pivot.get(month, {})
#         sm   = s_pivot.get(month, {})
#         mt_p = 0.0
#         mt_s = 0.0

#         for sub in p_subs_list:
#             safe = "p_" + sub.lower().replace(" ", "_")
#             cl   = pm.get(sub, {"amt": 0.0, "qty": 0})
#             row[safe + "_amt"] = cl["amt"]
#             row[safe + "_lic"] = cl["qty"]
#             gp_amt[sub] += cl["amt"]
#             if cl["qty"]: gp_lic[sub] = cl["qty"]
#             mt_p += cl["amt"]

#         for sub in s_subs_list:
#             safe = "s_" + sub.lower().replace(" ", "_")
#             cl   = sm.get(sub, {"amt": 0.0, "qty": 0})
#             row[safe + "_amt"] = cl["amt"]
#             row[safe + "_lic"] = cl["qty"]
#             gs_amt[sub] += cl["amt"]
#             if cl["qty"]: gs_lic[sub] = cl["qty"]
#             mt_s += cl["amt"]

#         balance = mt_p - mt_s
#         row["balance"] = balance
#         g_balance += balance
#         data.append(row)

#     # ── Total row ─────────────────────────────────────────────────
#     total_row = {"month": "TOTAL"}
#     for sub in p_subs_list:
#         safe = "p_" + sub.lower().replace(" ", "_")
#         total_row[safe + "_amt"] = gp_amt[sub]
#         total_row[safe + "_lic"] = gp_lic[sub]
#     for sub in s_subs_list:
#         safe = "s_" + sub.lower().replace(" ", "_")
#         total_row[safe + "_amt"] = gs_amt[sub]
#         total_row[safe + "_lic"] = gs_lic[sub]

#     total_row["balance"] = g_balance
#     data.append(total_row)

#     return columns, data










# workspace_analysis_report.py

import frappe
from frappe import _
import re

MONTH_ORDER = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]


def month_key(m):
    try:
        parts = m.strip().split(" ")
        mon = MONTH_ORDER.index(parts[0]) + 1
        yr  = int(parts[1])
        return yr * 100 + mon
    except Exception:
        return 0


def clean_sub(raw):
    """
    Clean subscription name:
    'Google Workspace Business Starter' → 'Business Starter'
    'Google Worspace Business Starter'  → 'Business Starter'  (typo bhi handle)
    'G Suite Basic'                     → 'G Suite Basic'
    """
    s = (raw or "").strip()
    # Remove any variation of "Google Workspace" or "Google Worspace" (typo)
    s = re.sub(r'(?i)google\s+wor[ks]pace\s+', '', s).strip()
    # Remove "G Suite " prefix if needed (keep as is)
    return s


@frappe.whitelist()
def get_filter_options():
    domain_rows = frappe.db.sql("""
        SELECT DISTINCT LOWER(TRIM(domain)) as domain
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
    domain = (domain or "").strip().lower()
    try:
        parts   = month.strip().split(" ")
        mon_idx = MONTH_ORDER.index(parts[0]) + 1
        year    = int(parts[1])
    except Exception:
        return []

    args = {"domain": domain, "mon": mon_idx, "yr": year}

    purchase = frappe.db.sql("""
        SELECT 'Purchase' AS type,
            wa.name AS doc_name, wa.invoice_number, wa.invoice_date,
            wai.subscription,
            SUM(wai.amount)   AS amount,
            SUM(wai.quantity) AS quantity
        FROM `tabPurchase Invoice Items` wai
        INNER JOIN `tabPurchase Invoice` wa ON wai.parent = wa.name
        WHERE LOWER(TRIM(wai.domain)) = %(domain)s
          AND MONTH(wa.invoice_date) = %(mon)s
          AND YEAR(wa.invoice_date)  = %(yr)s
        GROUP BY wa.name, wai.subscription
        ORDER BY wa.invoice_date ASC
    """, args, as_dict=True)

    sale = frappe.db.sql("""
        SELECT 'Sale' AS type,
            wa.name AS doc_name, wa.invoice_number, wa.invoice_date,
            wai.subscription,
            SUM(wai.amount)   AS amount,
            SUM(wai.quantity) AS quantity
        FROM `tabSale Invoice Items` wai
        INNER JOIN `tabSale Invoice` wa ON wai.parent = wa.name
        WHERE LOWER(TRIM(wai.domain)) = %(domain)s
          AND MONTH(wa.invoice_date) = %(mon)s
          AND YEAR(wa.invoice_date)  = %(yr)s
        GROUP BY wa.name, wai.subscription
        ORDER BY wa.invoice_date ASC
    """, args, as_dict=True)

    return list(purchase) + list(sale)


def fetch_pivot(parent_table, child_table, domain, from_key, to_key):
    raw = frappe.db.sql(f"""
        SELECT
            wa.invoice_date,
            wai.subscription,
            SUM(wai.quantity) AS quantity,
            SUM(wai.amount)   AS amount
        FROM `tab{child_table}` wai
        INNER JOIN `tab{parent_table}` wa ON wai.parent = wa.name
        WHERE LOWER(TRIM(wai.domain)) = %(domain)s
          AND wa.invoice_date IS NOT NULL
        GROUP BY
            YEAR(wa.invoice_date),
            MONTH(wa.invoice_date),
            wai.subscription
        ORDER BY wa.invoice_date ASC
    """, {"domain": domain}, as_dict=True)

    pivot = {}
    subs  = set()

    for row in raw:
        month = MONTH_ORDER[row.invoice_date.month - 1] + " " + str(row.invoice_date.year)
        mk    = month_key(month)

        if from_key and mk < from_key:
            continue
        if to_key and mk > to_key:
            continue

        # ✅ FIX: regex se clean karo — typo bhi handle hoga
        sub = clean_sub(row.subscription)

        pivot.setdefault(month, {})
        pivot[month][sub] = {
            "amt": float(row.amount   or 0),
            "qty": int(row.quantity   or 0)
        }
        subs.add(sub)

    return pivot, subs


def execute(filters=None):
    filters  = filters or {}
    domain   = (filters.get("domain") or "").strip().lower()
    from_m   = filters.get("from_month") or ""
    to_m     = filters.get("to_month")   or ""

    if not domain:
        frappe.throw(_("Please select a Domain."))

    from_key = month_key(from_m)
    to_key   = month_key(to_m)

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

    all_months  = sorted(
        set(list(p_pivot.keys()) + list(s_pivot.keys())),
        key=month_key
    )
    p_subs_list = sorted(p_subs)
    s_subs_list = sorted(s_subs)

    # ── Columns ──────────────────────────────────────────────────
    # Column label mein prefix lagao taaki grouping clear ho
    # 🔵 P | = Purchase group
    # 🟢 S | = Sale group

    columns = [{
        "label":     _("Month"),
        "fieldname": "month",
        "fieldtype": "Data",
        "width":     120
    }]

    # ── Purchase columns — "P | Sub AMT" format ──
    for sub in p_subs_list:
        safe = "p_" + sub.lower().replace(" ", "_")
        columns.append({
            "label":     _("P | " + sub + " AMT"),
            "fieldname": safe + "_amt",
            "fieldtype": "Float",
            "width":     170,
            "precision": 2
        })
        columns.append({
            "label":     _("P | " + sub + " LIC"),
            "fieldname": safe + "_lic",
            "fieldtype": "Int",
            "width":     90
        })

    # ── Sale columns — "S | Sub AMT" format ──
    for sub in s_subs_list:
        safe = "s_" + sub.lower().replace(" ", "_")
        columns.append({
            "label":     _("S | " + sub + " AMT"),
            "fieldname": safe + "_amt",
            "fieldtype": "Float",
            "width":     170,
            "precision": 2
        })
        columns.append({
            "label":     _("S | " + sub + " LIC"),
            "fieldname": safe + "_lic",
            "fieldtype": "Int",
            "width":     90
        })

    # ── Balance column ──
    columns.append({
        "label":     _("Balance (S - P)"),
        "fieldname": "balance",
        "fieldtype": "Float",
        "width":     150,
        "precision": 2
    })

    # ── Data rows ─────────────────────────────────────────────────
    data      = []
    gp_amt    = {sub: 0.0 for sub in p_subs_list}
    gp_lic    = {sub: 0   for sub in p_subs_list}
    gs_amt    = {sub: 0.0 for sub in s_subs_list}
    gs_lic    = {sub: 0   for sub in s_subs_list}
    g_balance = 0.0

    for month in all_months:
        row  = {"month": month}
        pm   = p_pivot.get(month, {})
        sm   = s_pivot.get(month, {})
        mt_p = 0.0
        mt_s = 0.0

        for sub in p_subs_list:
            safe = "p_" + sub.lower().replace(" ", "_")
            cl   = pm.get(sub, {"amt": 0.0, "qty": 0})
            row[safe + "_amt"] = cl["amt"] if cl["amt"] else None
            row[safe + "_lic"] = cl["qty"] if cl["qty"] else None
            gp_amt[sub] += cl["amt"]
            if cl["qty"]: gp_lic[sub] = cl["qty"]
            mt_p += cl["amt"]

        for sub in s_subs_list:
            safe = "s_" + sub.lower().replace(" ", "_")
            cl   = sm.get(sub, {"amt": 0.0, "qty": 0})
            row[safe + "_amt"] = cl["amt"] if cl["amt"] else None
            row[safe + "_lic"] = cl["qty"] if cl["qty"] else None
            gs_amt[sub] += cl["amt"]
            if cl["qty"]: gs_lic[sub] = cl["qty"]
            mt_s += cl["amt"]

        # Balance = Sale - Purchase (positive = profit)
        balance        = mt_s - mt_p
        row["balance"] = balance
        g_balance     += balance
        data.append(row)

    # ── Total row ─────────────────────────────────────────────────
    total_row = {"month": "TOTAL"}
    for sub in p_subs_list:
        safe = "p_" + sub.lower().replace(" ", "_")
        total_row[safe + "_amt"] = gp_amt[sub]
        total_row[safe + "_lic"] = gp_lic[sub]
    for sub in s_subs_list:
        safe = "s_" + sub.lower().replace(" ", "_")
        total_row[safe + "_amt"] = gs_amt[sub]
        total_row[safe + "_lic"] = gs_lic[sub]

    total_row["balance"] = g_balance
    data.append(total_row)

    return columns, data

