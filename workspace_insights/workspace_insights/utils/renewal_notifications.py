# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

"""
Daily scheduler job: check subscriptions expiring in 10 days.
Sends:
  1. Frappe bell notification (Notification Log) to each System Manager user
  2. One summary email to all System Manager users
"""

import frappe
from frappe.utils import today, add_days, getdate, nowdate


def check_renewals():
    """
    Entry point called by Frappe scheduler every day.
    Finds Purchase Invoice Items where end_date = today + 10 days.
    """
    target_date = getdate(add_days(today(), 10))

    # Fetch all expiring rows
    rows = frappe.db.sql("""
        SELECT
            pii.domain,
            pii.subscription,
            pii.end_date,
            pii.quantity,
            pi.name           AS doc_name,
            pi.invoice_number,
            pi.invoice_date
        FROM `tabPurchase Invoice Items` pii
        INNER JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name
        WHERE DATE(pii.end_date) = %s
          AND pii.domain        IS NOT NULL AND pii.domain        != ''
          AND pii.subscription  IS NOT NULL AND pii.subscription  != ''
        ORDER BY pii.domain ASC, pii.subscription ASC
    """, (target_date,), as_dict=True)

    if not rows:
        return   # Nothing expiring — skip

    # Get all active System Manager users
    sm_users = frappe.db.sql("""
        SELECT DISTINCT u.name, u.email, u.full_name
        FROM `tabUser` u
        INNER JOIN `tabHas Role` r ON r.parent = u.name
        WHERE r.role         = 'System Manager'
          AND u.enabled      = 1
          AND u.name     NOT IN ('Administrator', 'Guest')
          AND u.email    IS NOT NULL
          AND u.email    != ''
    """, as_dict=True)

    if not sm_users:
        frappe.log_error("No active System Manager users found for renewal notifications",
                         "Renewal Notification")
        return

    subject = (f"\u26a0 Workspace Renewal Alert — "
               f"{len(rows)} subscription(s) expiring on {target_date}")

    # ── Bell notifications ────────────────────────────────────────
    for user in sm_users:
        try:
            frappe.get_doc({
                'doctype':       'Notification Log',
                'subject':       subject,
                'for_user':      user.name,
                'type':          'Alert',
                'document_type': 'Purchase Invoice',
                'document_name': rows[0].doc_name,
                'message':       _build_bell_message(rows, target_date)
            }).insert(ignore_permissions=True)
        except Exception:
            frappe.log_error(frappe.get_traceback(), 'Renewal Bell Notification Error')

    frappe.db.commit()

    # ── Summary email ─────────────────────────────────────────────
    email_list = [u.email for u in sm_users if u.email]
    if email_list:
        try:
            frappe.sendmail(
                recipients = email_list,
                subject    = subject,
                message    = _build_email_html(rows, target_date),
                now        = True
            )
        except Exception:
            frappe.log_error(frappe.get_traceback(), 'Renewal Email Notification Error')


def _build_bell_message(rows, target_date):
    """Short text shown in the Frappe notification panel."""
    lines = [f"{len(rows)} subscription(s) expire on {target_date}:", ""]
    for r in rows:
        lines.append(
            f"• {r.domain} — {r.subscription} "
            f"(Qty: {r.quantity}) → {r.doc_name}"
        )
    return '\n'.join(lines)


def _build_email_html(rows, target_date):
    """Full HTML email with a styled summary table."""
    rows_html = ''.join([f"""
        <tr>
            <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;">{r.domain}</td>
            <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;">{r.subscription}</td>
            <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;text-align:center;">{r.quantity}</td>
            <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;">{r.end_date}</td>
            <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;">
                <a href="/app/purchase-invoice/{r.doc_name}"
                   style="color:#1e40af;text-decoration:none;">{r.doc_name}</a>
            </td>
        </tr>
    """ for r in rows])

    return f"""
    <div style="font-family:Arial,sans-serif;max-width:720px;color:#111;">

        <div style="background:#fef3c7;border-left:4px solid #f59e0b;
                    padding:14px 18px;border-radius:0 6px 6px 0;margin-bottom:20px;">
            <strong style="font-size:15px;">&#9888; Workspace Subscription Renewal Alert</strong><br>
            <span style="font-size:13px;color:#78350f;">
                <strong>{len(rows)}</strong> subscription(s) are expiring on
                <strong>{target_date}</strong> &mdash; 10 days from today.
                Please renew them before the expiry date.
            </span>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
                <tr style="background:#1e40af;">
                    <th style="padding:10px 14px;text-align:left;color:#fff;font-weight:600;">Domain</th>
                    <th style="padding:10px 14px;text-align:left;color:#fff;font-weight:600;">Subscription</th>
                    <th style="padding:10px 14px;text-align:center;color:#fff;font-weight:600;">Qty</th>
                    <th style="padding:10px 14px;text-align:left;color:#fff;font-weight:600;">Expiry Date</th>
                    <th style="padding:10px 14px;text-align:left;color:#fff;font-weight:600;">Invoice</th>
                </tr>
            </thead>
            <tbody>{rows_html}</tbody>
        </table>

        <p style="font-size:12px;color:#6b7280;margin-top:20px;
                  border-top:1px solid #e2e8f0;padding-top:12px;">
            This is an automated daily notification from
            <strong>Workspace Insights</strong>.
            Generated on {nowdate()}.
        </p>

    </div>
    """