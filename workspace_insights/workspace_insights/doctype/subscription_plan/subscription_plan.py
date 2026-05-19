# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

# import frappe
# from frappe.model.document import Document


# class SubscriptionPlan(Document):
# 	pass


import frappe
import re
from frappe.model.document import Document


class SubscriptionPlan(Document):

    def before_save(self):
        """Auto-fill short_label if it is blank when saving."""
        if not self.short_label and self.subscription:
            self.short_label = auto_short_label(self.subscription)


def auto_short_label(sub):
    """
    Generic short label generator — works for ANY subscription name.
    No hardcoded vendor patterns. Algorithm:
      1. Strip parentheses: "(100 GB)" → "100GB"
      2. If already ≤ 12 chars → return as-is
      3. Acronym of every word except last (first letter, uppercase)
      4. Append last word → e.g. "GWB Starter", "ZM Premium"
      5. If > 15 chars → truncate last word to fit

    Examples:
      'Google Workspace Business Starter'            → 'GWB Starter'
      'Google Workspace Additional Storage (100 GB)' → 'GWAS 100GB'
      'Microsoft 365 Business Standard'              → 'M3B Standard'
      'Zoho Mail Premium'                            → 'ZM Premium'
      'Dropbox Business Advanced'                    → 'DB Advanced'
      'Slack Pro'                                    → 'Slack Pro'
    """
    s = (sub or '').strip()
    if not s:
        return ''

    # "(100 GB)" → "100GB"
    s = re.sub(r'\(\s*([^)]+?)\s*\)', lambda m: m.group(1).replace(' ', ''), s)
    s = re.sub(r'\s+', ' ', s).strip()

    if len(s) <= 12:
        return s  # already short — keep as-is

    words = [w for w in s.split(' ') if w]
    if len(words) == 1:
        return s[:12]

    acronym   = ''.join(w[0].upper() for w in words[:-1])
    last_word = words[-1]

    result = f"{acronym} {last_word}"
    if len(result) <= 15:
        return result

    # Truncate last word to fit within 15 chars
    space = 15 - len(acronym) - 1
    return f"{acronym} {last_word[:space]}".strip()[:15]