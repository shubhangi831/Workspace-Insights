// Copyright (c) 2026, sk and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Subscription Plan", {
// 	refresh(frm) {

// 	},
// });


frappe.ui.form.on('Subscription Plan', {

    subscription: function(frm) {
        const sub = (frm.doc.subscription || '').trim();
        if (!sub) return;

        // Use direct doc assignment — NOT frm.set_value()
        // frm.set_value() triggers the short_label handler which was
        // incorrectly setting __user_edited_short_label = true even on
        // programmatic changes, causing auto-fill to stop after first char.
        frm.doc.short_label = auto_short_label(sub);
        frm.refresh_field('short_label');
    },

    refresh: function(frm) {
        // Fill short_label if it is empty when opening an existing doc
        if (frm.doc.subscription && !frm.doc.short_label) {
            frm.doc.short_label = auto_short_label(frm.doc.subscription);
            frm.refresh_field('short_label');
        }
    }
});


/**
 * Generic short label generator — works for ANY subscription name.
 *
 * Algorithm:
 *   1. Strip parentheses:  "(100 GB)" → "100GB"
 *   2. If ≤ 12 chars → return as-is (already short)
 *   3. Acronym of every word except last (first letter, uppercase)
 *   4. Append last word  →  "GWB Starter", "ZM Premium", "DB Advanced"
 *   5. If still > 15 chars → truncate last word to fit
 *
 * Examples:
 *   "Google Workspace Business Starter"            → "GWB Starter"
 *   "Google Workspace Additional Storage (100 GB)" → "GWAS 100GB"
 *   "Microsoft 365 Business Standard"              → "M3B Standard"
 *   "Zoho Mail Premium"                            → "ZM Premium"
 *   "Slack Pro"                                    → "Slack Pro"
 */
function auto_short_label(sub) {
    let s = (sub || '').trim();
    if (!s) return '';

    // "(100 GB)" → "100GB"
    s = s.replace(/\(\s*([^)]+?)\s*\)/g, (_, m) => m.replace(/\s+/g, ''));
    s = s.replace(/\s+/g, ' ').trim();

    if (s.length <= 12) return s;

    const words    = s.split(' ').filter(Boolean);
    if (words.length === 1) return s.slice(0, 12);

    const acronym  = words.slice(0, -1).map(w => w[0].toUpperCase()).join('');
    const lastWord = words[words.length - 1];
    const result   = acronym + ' ' + lastWord;

    if (result.length <= 15) return result;

    const space = 15 - acronym.length - 1;
    return (acronym + ' ' + lastWord.slice(0, space)).trim().slice(0, 15);
}