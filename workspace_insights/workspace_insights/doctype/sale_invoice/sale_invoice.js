// Copyright (c) 2026, sk and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Sale Invoice", {
// 	refresh(frm) {

// 	},
// });


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


frappe.ui.form.on('Sale Invoice', {

    onload: function(frm) {
        // Highlight child rows matching subscription from URL hash
        // URL format: /app/sale-invoice/SI-XXX#subscription=D Hosting
        const hash = decodeURIComponent(window.location.hash || '');
        if (!hash.startsWith('#subscription=')) return;

        const target_sub = hash.replace('#subscription=', '').trim().toLowerCase();
        if (!target_sub) return;

        setTimeout(function() {
            frm.$wrapper.find('.grid-row').each(function() {
                const row_name = $(this).attr('data-name');
                if (!row_name) return;

                const row = (frm.doc.domain_details || []).find(r => r.name === row_name);
                if (!row) return;

                const row_sub = (row.subscription || '').trim().toLowerCase();
                if (row_sub === target_sub || row_sub.includes(target_sub) || target_sub.includes(row_sub)) {
                    $(this).css({
                        'background':  '#fef9c3',
                        'border-left': '4px solid #f59e0b'
                    });
                }
            });

            // Scroll to first highlighted row
            const $first = frm.$wrapper.find('.grid-row').filter(function() {
                return $(this).css('background-color') === 'rgb(254, 249, 195)';
            }).first();
            if ($first.length) {
                $first[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 800);
    },

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



