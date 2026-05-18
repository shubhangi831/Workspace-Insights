// Copyright (c) 2026, sk and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Sale Invoice", {
// 	refresh(frm) {

// 	},
// });

// Copyright (c) 2026, sk and contributors
// For license information, please see license.txt

frappe.ui.form.on('Sale Invoice', {

    refresh: function(frm) {
        calculate_gst(frm);
    },

    gst_rate: function(frm) {
        calculate_gst(frm);
    }
});

// Trigger on any change in child table rows
frappe.ui.form.on('Sale Invoice Items', {
    amount: function(frm) {
        calculate_gst(frm);
    },
    quantity: function(frm) {
        calculate_gst(frm);
    },
    domain_details_remove: function(frm) {
        calculate_gst(frm);
    }
});

function calculate_gst(frm) {
    // Sum all child row amounts
    let subtotal = 0;
    (frm.doc.domain_details || []).forEach(row => {
        subtotal += flt(row.amount);
    });

    const gst_rate    = flt(frm.doc.gst_rate) || 18;
    const gst_amount  = flt((subtotal * gst_rate / 100).toFixed(2));
    const grand_total = flt((subtotal + gst_amount).toFixed(2));

    // Update fields without triggering unnecessary saves
    frm.doc.subtotal        = subtotal;
    frm.doc.gst_amount      = gst_amount;
    frm.doc.grand_total     = grand_total;
    frm.doc.invoice_amount  = grand_total;

    frm.refresh_field('subtotal');
    frm.refresh_field('gst_amount');
    frm.refresh_field('grand_total');
    frm.refresh_field('invoice_amount');
}