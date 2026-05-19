// Copyright (c) 2026, sk and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Purchase Invoice", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Purchase Invoice', {

    refresh: function(frm) {
        // setTimeout ensures grid DOM is fully rendered before injecting
        setTimeout(() => setup_domain_search(frm), 500);
    },

    onload_post_render: function(frm) {
        setTimeout(() => setup_domain_search(frm), 500);
    }
});


function setup_domain_search(frm) {
    const grid_field = frm.fields_dict['domain_details'];
    if (!grid_field) return;

    const $wrapper = grid_field.$wrapper;

    // Don't inject twice
    if ($wrapper.find('.pi-search-wrap').length) return;

    // ── Inject search box before the grid table ───────────────────
    const $search_wrap = $(`
        <div class="pi-search-wrap" style="
            display: flex;
            justify-content: flex-end;
            margin-bottom: 8px;
        ">
            <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 5px 10px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                width: 260px;
				margin-bottom: -20px;
            ">
                <svg width="13" height="13" fill="none" stroke="#9ca3af"
                     stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0;">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                    class="pi-search-input"
                    type="text"
                    placeholder="Search domain..."
                    style="
                        border: none;
                        outline: none;
                        background: transparent;
                        font-size: 12px;
                        flex: 1;
                        color: var(--text-color, #333);
                        min-width: 0;
                    "
                />
                <span class="pi-search-count" style="
                    font-size: 11px;
                    color: #6b7280;
                    white-space: nowrap;
                    display: none;
                "></span>
                <span class="pi-search-clear" style="
                    cursor: pointer;
                    color: #9ca3af;
                    font-size: 16px;
                    line-height: 1;
                    display: none;
                ">×</span>
            </div>
        </div>
    `);

    // ✅ FIX: inject directly before the grid-wrapper (the table itself)
    const $grid_wrapper = $wrapper.find('.grid-wrapper');
    if ($grid_wrapper.length) {
        $grid_wrapper.before($search_wrap);
    } else {
        // fallback — prepend to field wrapper
        $wrapper.prepend($search_wrap);
    }

    const $input = $search_wrap.find('.pi-search-input');
    const $count = $search_wrap.find('.pi-search-count');
    const $clear = $search_wrap.find('.pi-search-clear');

    // ── Search on input ───────────────────────────────────────────
    $input.on('input', function() {
        const q = this.value.trim().toLowerCase();
        do_filter(frm, q, $count, $clear);
    });

    // ── Clear button ──────────────────────────────────────────────
    $clear.on('click', function() {
        $input.val('');
        do_filter(frm, '', $count, $clear);
        $input.focus();
    });
}


function do_filter(frm, query, $count, $clear) {
    const grid = frm.fields_dict['domain_details'] &&
                 frm.fields_dict['domain_details'].grid;
    if (!grid) return;

    // Show/hide clear button
    $clear.toggle(query.length > 0);
    $count.toggle(query.length > 0);

    if (!query) {
        // No query — show all rows
        if (grid.grid_rows) {
            grid.grid_rows.forEach(r => {
                if (r.row) r.row.show();
            });
        }
        return;
    }

    // ── Filter rows ───────────────────────────────────────────────
    let shown = 0;
    const total = (grid.grid_rows || []).length;

    (grid.grid_rows || []).forEach(function(grid_row) {
        const doc = grid_row.doc || {};

        const domain = (doc.domain        || '').toLowerCase();
        const sub    = (doc.subscription  || '').toLowerCase();
        const desc   = (doc.description   || '').toLowerCase();
        const order  = (doc.order_name    || '').toLowerCase();

        const matches = domain.includes(query)
                     || sub.includes(query)
                     || desc.includes(query)
                     || order.includes(query);

        // Toggle the row DOM element
        if (grid_row.row) {
            grid_row.row.toggle(matches);
        }

        if (matches) shown++;
    });

    // ── Update count label ────────────────────────────────────────
    $count.text(`${shown} of ${total} rows`);
    $count.css('color', shown === 0 ? '#dc2626' : '#6b7280');
}




