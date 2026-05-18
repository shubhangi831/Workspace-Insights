// // Copyright (c) 2026, sk and contributors
// // For license information, please see license.txt

frappe.query_reports["Workspace Analysis Report"] = {

	onload: function (report) {
		const domainFilter = report.get_filter("domain");
		if (domainFilter) domainFilter.set_value('');

		// ── CSS ───────────────────────────────────────────────────
		if (!document.getElementById('wa-report-style')) {
			const style = document.createElement('style');
			style.id    = 'wa-report-style';
			style.textContent = `
				.page-form .frappe-control { margin-right: 20px !important; }

				/* Domain dropdown — responsive */
				.wa-select-wrap { position:relative; display:inline-block; width:100%; min-width:0; }
				.wa-select-display {
					border:1px solid var(--border-color,#d1d8dd); border-radius:6px;
					padding:6px 32px 6px 10px; font-size:13px;
					color:var(--text-color,#333); background:var(--control-bg,#fff);
					cursor:pointer; user-select:none; white-space:nowrap; overflow:hidden;
					text-overflow:ellipsis; width:100%; min-width:120px; max-width:100%;
					height:34px; display:flex; align-items:center; box-sizing:border-box;
				}
				.wa-select-display:hover { border-color:#1a56db; }
				.wa-select-arrow { position:absolute; right:10px; top:50%; transform:translateY(-50%);
					pointer-events:none; color:var(--text-muted,#8d99a6); font-size:10px; }
				.wa-select-dropdown {
					position:absolute; top:calc(100% + 4px); left:0; min-width:100%;
					width:max-content; max-width:min(380px, 90vw); background:var(--card-bg,#fff);
					border:1px solid var(--border-color,#d1d8dd); border-radius:8px;
					box-shadow:0 8px 24px rgba(0,0,0,0.13); z-index:99999; display:none;
				}
				.wa-select-dropdown.open { display:block; }
				.wa-search-box { padding:8px 10px; border-bottom:1px solid var(--border-color,#d1d8dd);
					display:flex; align-items:center; gap:7px; background:var(--control-bg,#f9f9f9);
					border-radius:8px 8px 0 0; }
				.wa-search-box svg { flex-shrink:0; color:var(--text-muted,#8d99a6); }
				.wa-search-input { border:none; outline:none; background:transparent;
					font-size:13px; width:100%; min-width:0; color:var(--text-color,#333); }
				.wa-search-input::placeholder { color:var(--text-muted,#aaa); }
				.wa-options-list { max-height:220px; overflow-y:auto; padding:4px 0; }
				.wa-option { padding:9px 14px; font-size:13px; cursor:pointer;
					color:var(--text-color,#333); white-space:nowrap; }
				.wa-option:hover  { background:#eef2ff; color:#1a56db; }
				.wa-option.active { background:#1a56db; color:#fff; font-weight:600; }
				.wa-no-result { padding:14px; font-size:13px; color:#aaa; text-align:center; }
				.wa-options-list::-webkit-scrollbar { width:4px; }
				.wa-options-list::-webkit-scrollbar-thumb { background:#ddd; border-radius:4px; }

				/* Summary cards — Frappe widget format */
				.wa-card {
					background: var(--card-bg, #fff);
					border: 1px solid var(--border-color, #e2e8f0);
					border-radius: 8px;
					box-shadow: 0 1px 3px rgba(0,0,0,0.05);
					padding: 14px 16px;
					transition: box-shadow 0.15s;
					min-width: 0; overflow: hidden;
				}
				.wa-card.clickable { cursor: pointer; }
				.wa-card.clickable:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
				.wa-card-label {
					font-size: 10px; font-weight: 600; letter-spacing: .5px;
					text-transform: uppercase; color: var(--text-muted, #8d99a6);
					margin-bottom: 6px; white-space: nowrap;
				}
				.wa-card-value {
					font-size: 18px; font-weight: 700;
					color: var(--text-color, #111); font-family: monospace;
					white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
				}

				/* TOTAL row — Frappe native light style */
				.dt-scrollable .dt-row:last-child .dt-cell {
					position:sticky !important; bottom:0 !important; z-index:10 !important;
					background:var(--control-bg,#f5f7fa) !important; font-weight:700 !important;
					border-top:2px solid var(--border-color,#d1d8dd) !important;
				}
				.dt-scrollable .dt-row:last-child .dt-cell .dt-cell__content,
				.dt-scrollable .dt-row:last-child .dt-cell span {
					color:var(--text-color,#333) !important;
				}
			`;
			document.head.appendChild(style);
		}

		// ── Fetch filter options ──────────────────────────────────
		frappe.call({
			method: "workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_filter_options",
			callback: function (r) {
				if (!r.message) return;
				const { domains, months } = r.message;

				// Month dropdowns
				if (months.length) {
					const opts = "\n" + months.join("\n");
					const ff   = report.get_filter("from_month");
					const tf   = report.get_filter("to_month");
					if (ff) { ff.df.options = opts; ff.refresh(); ff.set_value(months[0]); }
					if (tf) { tf.df.options = opts; tf.refresh(); tf.set_value(months[months.length - 1]); }
				}

				// Domain dropdown
				if (domains.length) {
					wa_build_domain_select(report, domains);
				}

				// Inject cards + clear button
				setTimeout(() => {
					wa_inject_cards(report);
					wa_inject_clear_button(report);
					wa_refresh_cards(report);
				}, 400);
			}
		});
	},

	// ── Color column headers ──────────────────────────────────────
	after_datatable_render: function (datatable) {
		setTimeout(() => {
			const $dt = $(datatable.wrapper);

			$dt.find('.dt-cell--header').each(function () {
				const label = $(this).find('.dt-cell__content').text().trim();
				if (label.startsWith('P |')) {
					$(this).css({ 'background': '#eff6ff', 'border-bottom': '2px solid #93c5fd' });
					$(this).find('.dt-cell__content').css({ 'color': '#1e40af', 'font-weight': '700' });
				} else if (label.startsWith('S |')) {
					$(this).css({ 'background': '#ecfdf5', 'border-bottom': '2px solid #6ee7b7' });
					$(this).find('.dt-cell__content').css({ 'color': '#065f46', 'font-weight': '700' });
				} else if (label.includes('Balance')) {
					$(this).css({ 'background': '#f5f3ff', 'border-bottom': '2px solid #c4b5fd' });
					$(this).find('.dt-cell__content').css({ 'color': '#5b21b6', 'font-weight': '700' });
				}
			});

			// TOTAL row — Frappe native light style (matches screenshot)
			$dt.find('.dt-row').each(function () {
				const text = $(this).find('.dt-cell').first().find('.dt-cell__content').text().trim();
				if (text === 'TOTAL') {
					$(this).css({ 'position': 'sticky', 'bottom': '0', 'z-index': '10' });
					$(this).find('.dt-cell').css({
						'background':  'var(--control-bg, #f5f7fa)',
						'font-weight': '700',
						'border-top':  '2px solid var(--border-color, #d1d8dd)',
						'box-shadow':  '0 -2px 6px rgba(0,0,0,0.05)'
					});
					$(this).find('.dt-cell__content, span').css({ 'color': 'var(--text-color, #333)' });
				}
			});

			// Refresh card values after report re-renders
			wa_refresh_cards(frappe.query_report);

		}, 400);
	},

	// ── Cell formatter ────────────────────────────────────────────
	formatter: function (value, row, column, data, default_formatter) {
		if (!data) return default_formatter(value, row, column, data);

		const fn  = column.fieldname || '';
		const num = parseFloat(value) || 0;

		if (fn === 'month') {
			if (data.month === 'TOTAL') return `<strong style="color:var(--text-color,#333);">TOTAL</strong>`;
			return `<a style="color:#1a56db;text-decoration:none;font-weight:600;cursor:pointer;"
				onclick="event.preventDefault();wa_show_month_detail('${data.month}')"
				href="#">${data.month}</a>`;
		}

		if (fn.startsWith('p_') && fn.endsWith('_amt') && value !== null && value !== undefined) {
			return `<span style="font-family:monospace;">₹${num.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>`;
		}

		if (fn.startsWith('s_') && fn.endsWith('_amt') && value !== null && value !== undefined) {
			return `<span style="font-family:monospace;">₹${num.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>`;
		}

		if (fn === 'balance' && value !== null && value !== undefined) {
			const abs = '₹' + Math.abs(num).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
			return num < 0
				? `<span style="color:#dc2626;font-family:monospace;">-${abs}</span>`
				: `<span style="font-family:monospace;">${abs}</span>`;
		}

		return default_formatter(value, row, column, data);
	},

	filters: [
		{ fieldname: "domain",     label: __("Domain"),     fieldtype: "Data",   reqd: 1, default: "" },
		{ fieldname: "from_month", label: __("From Month"), fieldtype: "Select", options: "", reqd: 0 },
		{ fieldname: "to_month",   label: __("To Month"),   fieldtype: "Select", options: "", reqd: 0 }
	]
};


// ═══════════════════════════════════════════════════════════════════
// Domain custom dropdown
// ═══════════════════════════════════════════════════════════════════
function wa_build_domain_select(report, allOptions) {
	const filter = report.get_filter("domain");
	if (!filter) return;

	function attach() {
		const $wrapper = filter.$wrapper;
		if (!$wrapper || !$wrapper.length) return false;
		if ($wrapper.find('.wa-select-wrap').length) return true;

		$wrapper.find('input, .link-btn').hide();

		const $wrap = $(`
			<div class="wa-select-wrap">
				<div class="wa-select-display">
					<span class="wa-placeholder" style="color:var(--text-muted,#aaa)">Select domain...</span>
				</div>
				<span class="wa-select-arrow">▼</span>
				<div class="wa-select-dropdown">
					<div class="wa-search-box">
						<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<circle cx="11" cy="11" r="8"/>
							<line x1="21" y1="21" x2="16.65" y2="16.65"/>
						</svg>
						<input class="wa-search-input" type="text" placeholder="Search domain..." autocomplete="off"/>
					</div>
					<div class="wa-options-list"></div>
				</div>
			</div>
		`);
		$wrapper.append($wrap);

		const $display  = $wrap.find('.wa-select-display');
		const $ph       = $wrap.find('.wa-placeholder');
		const $dropdown = $wrap.find('.wa-select-dropdown');
		const $search   = $wrap.find('.wa-search-input');
		const $list     = $wrap.find('.wa-options-list');
		let   selected  = '';

		function renderOptions(query) {
			const q        = (query || '').toLowerCase().trim();
			const filtered = q ? allOptions.filter(o => o.toLowerCase().includes(q)) : allOptions;
			if (!filtered.length) { $list.html('<div class="wa-no-result">No domain found</div>'); return; }
			$list.html(filtered.map(o =>
				`<div class="wa-option${o === selected ? ' active' : ''}" data-val="${o}">${o}</div>`
			).join(''));

			$list.find('.wa-option').on('click', function (e) {
				e.stopPropagation();
				selected = $(this).data('val');
				$ph.remove();
				$display.html(`<span style="color:var(--text-color,#333);font-weight:500;">${selected}</span>`);
				$dropdown.removeClass('open');
				$search.val('');
				renderOptions('');
				filter.set_value(selected);
				// ✅ FIX: refresh cards when domain changes
				setTimeout(() => {
					report.refresh();
					wa_refresh_cards(report);
				}, 120);
			});
		}

		renderOptions('');

		$display.on('click', function (e) {
			e.stopPropagation();
			const wasOpen = $dropdown.hasClass('open');
			$('.wa-select-dropdown').removeClass('open');
			if (!wasOpen) { $dropdown.addClass('open'); requestAnimationFrame(() => $search[0] && $search[0].focus()); }
		});
		$search.on('input', function () { renderOptions(this.value); });
		$search.on('click mousedown touchstart', e => e.stopPropagation());
		$(document).off('click.wa-domain-dd').on('click.wa-domain-dd', () => {
			$dropdown.removeClass('open'); $search.val(''); renderOptions('');
		});

		return true;
	}

	if (!attach()) {
		const obs = new MutationObserver(function (_, o) { if (attach()) o.disconnect(); });
		obs.observe(document.body, { childList: true, subtree: true });
	}
}


// ═══════════════════════════════════════════════════════════════════
// Summary Cards — Frappe native white format
// ═══════════════════════════════════════════════════════════════════
function wa_inject_cards(report) {
	if ($('#wa-cards-wrap').length) return;

	const $cards = $(`
		<div id="wa-cards-wrap" style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin:0 0 16px;padding:8px;">

			<div class="wa-card" id="wa-card-domains" style="border-left:4px solid var(--border-color,#e2e8f0);">
				<div class="wa-card-label">All Domains</div>
				<div class="wa-card-value" id="wa-val-domains">—</div>
			</div>

			<div class="wa-card clickable" id="wa-card-purchase" style="border-left:4px solid #3b82f6;">
				<div class="wa-card-label" style="color:#1e40af;">Purchase</div>
				<div class="wa-card-value" id="wa-val-purchase">—</div>
				<div id="wa-sub-purchase" style="font-size:11px;color:var(--text-muted,#9ca3af);margin-top:4px;">Loading...</div>
			</div>

			<div class="wa-card clickable" id="wa-card-sale" style="border-left:4px solid #22c55e;">
				<div class="wa-card-label" style="color:#15803d;">Sale</div>
				<div class="wa-card-value" id="wa-val-sale">—</div>
				<div id="wa-sub-sale" style="font-size:11px;color:var(--text-muted,#9ca3af);margin-top:4px;">Loading...</div>
			</div>

			<div class="wa-card clickable" id="wa-card-margin" style="border-left:4px solid #a855f7;">
				<div class="wa-card-label" style="color:#6b21a8;">Margin</div>
				<div class="wa-card-value" id="wa-val-margin">—</div>
				<div id="wa-sub-margin" style="font-size:11px;color:var(--text-muted,#9ca3af);margin-top:4px;">Loading...</div>
			</div>

		</div>
	`);

	// Insert before the filter bar — works for all Frappe report page structures
	const $pageForm = $('.page-form');
	if ($pageForm.length) {
		$pageForm.before($cards);
	} else {
		$('.layout-main-section, .main-section, .page-body').first().prepend($cards);
	}

	// Card click handlers
	$('#wa-card-purchase').on('click', function () {
		const domain = frappe.query_report.get_filter_value('domain');
		if (!domain) {
			wa_open_all_domains_invoice_popup(report, 'purchase');
			return;
		}
		wa_open_invoice_popup(report, domain, 'purchase');
	});

	$('#wa-card-sale').on('click', function () {
		const domain = frappe.query_report.get_filter_value('domain');
		if (!domain) { frappe.show_alert({ message: 'Please select a domain first', indicator: 'orange' }, 3); return; }
		wa_open_invoice_popup(report, domain, 'sale');
	});

	$('#wa-card-margin').on('click', function () {
		wa_open_margin_popup(report);
	});
}


// ── Refresh card values ───────────────────────────────────────────
function wa_refresh_cards(report) {
	if (!$('#wa-cards-wrap').length) return;

	const domain     = frappe.query_report.get_filter_value('domain') || '';
	const from_month = frappe.query_report.get_filter_value('from_month') || '';
	const to_month   = frappe.query_report.get_filter_value('to_month') || '';

	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_card_summary',
		args: { domain, from_month, to_month },
		callback: function (r) {
			if (!r.message) return;
			const d = r.message;

			function fmt(n) { return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 }); }

			// Always show totals — all domains or selected domain
			const subtitle = d.has_domain ? domain : 'All domains';

			$('#wa-val-domains').text(d.total_domains);

			$('#wa-val-purchase').css('color', '#1e40af').text(fmt(d.purchase_total));
			$('#wa-sub-purchase').text(subtitle);

			$('#wa-val-sale').css('color', '#15803d').text(fmt(d.sale_total));
			$('#wa-sub-sale').text(subtitle);

			const mc   = d.margin >= 0 ? '#15803d' : '#dc2626';
			const sign = d.margin >= 0 ? '+' : '-';
			$('#wa-val-margin').css('color', mc).text(sign + fmt(d.margin));
			$('#wa-sub-margin').text(subtitle);
		}
	});
}


// ═══════════════════════════════════════════════════════════════════
// Clear button
// ═══════════════════════════════════════════════════════════════════
function wa_inject_clear_button(report) {
	if ($('#wa-clear-btn').length) return;

	const $btn = $(`
		<button id="wa-clear-btn" class="btn btn-default"
		        style="margin-left:8px;margin-top:8px;height:30px;padding:0 15px;font-size:12px;
		               display:inline-flex;align-items:center;gap:5px;
		               border:1px solid var(--border-color,#d1d8dd);
		               background:var(--card-bg,#fff);color:var(--text-color,#333);
		               border-radius:6px;cursor:pointer;vertical-align:middle;">
			<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
				<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
			</svg>
			Clear
		</button>
	`);
	$('.page-form').append($btn);

	$btn.on('click', function () {
		// Reset domain dropdown display
		$('.wa-select-display').html('<span style="color:var(--text-muted,#aaa)">Select domain...</span>');
		$('.wa-select-dropdown').removeClass('open');

		// ✅ FIX: Reset ALL filters — domain + months
		const df = report.get_filter('domain');
		if (df) df.set_value('');

		// Re-fetch filter options to get valid month values to reset to
		frappe.call({
			method: "workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_filter_options",
			callback: function (r) {
				if (!r.message) return;
				const { months } = r.message;
				const ff = report.get_filter('from_month');
				const tf = report.get_filter('to_month');
				if (ff && months.length) ff.set_value(months[0]);
				if (tf && months.length) tf.set_value(months[months.length - 1]);

				// Reset card values
				$('#wa-val-purchase, #wa-val-sale, #wa-val-margin').css('color', 'var(--text-color,#111)').text('Select a domain');
				wa_refresh_cards(report);
			}
		});
	});
}


// ═══════════════════════════════════════════════════════════════════
// Shared helpers for popups
// ═══════════════════════════════════════════════════════════════════
function wa_fmt(n) {
	return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

// Child entries table — no Doc column (already visible in parent row)
function wa_entries_table(child_rows) {
	if (!child_rows || !child_rows.length) return '<p style="color:#9ca3af;font-size:12px;padding:6px 0;">No entries</p>';
	return `
	<table style="width:100%;border-collapse:collapse;font-size:11px;background:var(--bg-color,#f9fafb);">
		<thead>
			<tr style="background:var(--border-color,#e5e7eb);">
				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Start Date</th>
				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">End Date</th>
				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Description</th>
				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Order Name</th>
				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">PO Number</th>
				<th style="padding:5px 10px;text-align:right;color:var(--text-muted,#6b7280);">Qty</th>
				<th style="padding:5px 10px;text-align:right;color:var(--text-muted,#6b7280);">Amount</th>
			</tr>
		</thead>
		<tbody>
			${child_rows.map((r, i) => `
			<tr style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.start_date || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.end_date || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.description || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.order_name || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.po_number || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;">${r.quantity}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;font-family:monospace;">${wa_fmt(r.amount)}</td>
			</tr>`).join('')}
		</tbody>
	</table>`;
}

function wa_child_table_html(child_rows) {
	if (!child_rows || !child_rows.length) return '<p style="color:#9ca3af;font-size:12px;padding:6px 0;">No entries</p>';
	return `
	<table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:6px;background:var(--bg-color,#f9fafb);">
		<thead>
			<tr style="background:var(--border-color,#e5e7eb);">
				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Start Date</th>
				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">End Date</th>
				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Description</th>
				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Order Name</th>
				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">PO Number</th>
				<th style="padding:5px 10px;text-align:right;color:var(--text-muted,#6b7280);">Qty</th>
				<th style="padding:5px 10px;text-align:right;color:var(--text-muted,#6b7280);">Amount</th>
			</tr>
		</thead>
		<tbody>
			${child_rows.map((r, i) => `
			<tr style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.start_date || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.end_date || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.description || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.order_name || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.po_number || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;">${r.quantity}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;font-family:monospace;">${wa_fmt(r.amount)}</td>
			</tr>`).join('')}
		</tbody>
	</table>`;
}

function wa_invoice_table_html(invoices, color, url_prefix, id_prefix) {
	if (!invoices || !invoices.length) return '<p style="color:#9ca3af;font-size:12px;padding:6px 0;">No data</p>';

	const table_id   = `tbl-${id_prefix}`;
	const light_bg   = color === '#1e40af' ? '#eff6ff' : color === '#15803d' ? '#f0fdf4' : '#faf5ff';
	const light_bdr  = color === '#1e40af' ? '#bfdbfe' : color === '#15803d' ? '#bbf7d0' : '#e9d5ff';

	return `
	<table id="${table_id}" style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px;">
		<thead>
			<tr style="background:#f3f3f3;border-bottom:2px solid #f3f3f3;">
				<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;font-weight:700;">Invoice No</th>
				<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;font-weight:700;">Subscription</th>
				<th style="padding:8px 12px;text-align:right;color:#000;font-size:11px;font-weight:700;">Amount</th>
				<th style="padding:8px 12px;text-align:right;color:#000;font-size:11px;font-weight:700;">Qty</th>
				<th style="padding:8px 12px;text-align:center;color:#000;font-size:11px;font-weight:700;width:80px;"></th>
			</tr>
		</thead>
		<tbody>
			${invoices.map((inv, i) => {
				const row_id = `${id_prefix}-${i}`;
				return `
				<tr class="wa-inv-row" style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.invoice_number}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.subscription}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#000;">${wa_fmt(inv.amount)}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;">${inv.quantity}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:center;">
						<button class="btn btn-xs btn-default wa-entries-btn" data-target="${row_id}"
						        style="font-size:10px;">Entries</button>
					</td>
				</tr>
				<tr id="${row_id}" style="display:none;background:#f3f3f3;">
					<td colspan="5" style="padding:8px 16px;border-bottom:1px solid var(--border-color,#e2e8f0);">
						${wa_child_table_html(inv.child_rows)}
					</td>
				</tr>`;
			}).join('')}
		</tbody>
	</table>`;
}

function wa_bind_entries(d) {
	setTimeout(() => {
		// Entries expand/collapse
		d.$wrapper.find('.wa-entries-btn').on('click', function () {
			const $row = d.$wrapper.find('#' + $(this).data('target'));
			$row.toggle(!$row.is(':visible'));
		});

		// Search filter — right-aligned compact input above each table
		d.$wrapper.find('.wa-popup-search').on('input', function () {
			const q      = this.value.toLowerCase().trim();
			const tbl_id = $(this).data('table');
			const $tbl   = d.$wrapper.find('#' + tbl_id);

			$tbl.find('.wa-inv-row').each(function () {
				const text    = $(this).text().toLowerCase();
				const matches = !q || text.includes(q);
				$(this).toggle(matches);
				// Also hide the expanded entries row when parent is hidden
				const entries_id = $(this).next('tr').attr('id');
				if (entries_id) d.$wrapper.find('#' + entries_id).toggle(matches && false);
			});
		});
	}, 100);
}


// ═══════════════════════════════════════════════════════════════════
// Month detail popup (clicking month in report table)
// ═══════════════════════════════════════════════════════════════════
window.wa_show_month_detail = function (month) {
	const domain = frappe.query_report.get_filter_value('domain');
	if (!domain) { frappe.show_alert({ message: 'Please select a domain first', indicator: 'orange' }, 3); return; }

	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_month_detail',
		args: { domain, month },
		callback: function (r) {
			if (!r.message || !r.message.length) {
				frappe.msgprint(`No data for ${domain} — ${month}`);
				return;
			}

			const rows     = r.message;
			const purchase = rows.filter(x => x.type === 'Purchase');
			const sale     = rows.filter(x => x.type === 'Sale');
			const totalP   = purchase.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
			const totalS   = sale.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
			const balance  = totalS - totalP;
			const bColor   = balance >= 0 ? '#15803d' : '#dc2626';

			const html = `
			<div>
				<!-- Compact summary strip -->
				<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px;">
					<div style="border:1px solid #bfdbfe;border-left:3px solid #3b82f6;border-radius:6px;
					            padding:10px 14px;background:#fff;">
						<div style="font-size:10px;font-weight:600;color:#000;letter-spacing:.5px;margin-bottom:4px;">PURCHASE</div>
						<div style="font-size:16px;font-weight:700;color:#000;font-family:monospace;">${wa_fmt(totalP)}</div>
					</div>
					<div style="border:1px solid #bbf7d0;border-left:3px solid #22c55e;border-radius:6px;
					            padding:10px 14px;background:#fff;">
						<div style="font-size:10px;font-weight:600;color:#000;letter-spacing:.5px;margin-bottom:4px;">SALE</div>
						<div style="font-size:16px;font-weight:700;color:#000;font-family:monospace;">${wa_fmt(totalS)}</div>
					</div>
					<div style="border:1px solid #e9d5ff;border-left:3px solid #a855f7;border-radius:6px;
					            padding:10px 14px;background:#fff;">
						<div style="font-size:10px;font-weight:600;color:#000;letter-spacing:.5px;margin-bottom:4px;">BALANCE</div>
						<div style="font-size:16px;font-weight:700;color:${bColor};font-family:monospace;">${balance >= 0 ? '+' : '-'}${wa_fmt(balance)}</div>
					</div>
				</div>

				<!-- Purchase -->
				<div style="font-size:11px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;">Purchase Invoice</div>
				${wa_invoice_table_html(purchase, '#1e40af', 'purchase-invoice', 'mpd-p')}

				<!-- Sale -->
				<div style="font-size:11px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:.6px;margin:16px 0 8px;">Sale Invoice</div>
				${wa_invoice_table_html(sale, '#15803d', 'sale-invoice', 'mpd-s')}
			</div>`;

			const d = new frappe.ui.Dialog({
				title: `${domain} — ${month}`,
				fields: [{ fieldname: 'body', fieldtype: 'HTML', options: html }],
				size: 'extra-large'
			});
			d.show();
			wa_bind_entries(d);
		}
	});
};


// ═══════════════════════════════════════════════════════════════════
// Purchase / Sale card popup — all months
// ═══════════════════════════════════════════════════════════════════
function wa_open_invoice_popup(report, domain, inv_type) {
	const from_month = frappe.query_report.get_filter_value('from_month') || '';
	const to_month   = frappe.query_report.get_filter_value('to_month')   || '';
	const color      = inv_type === 'purchase' ? '#f3f3f3' : '#f3f3f3';
	const label      = inv_type === 'purchase' ? 'Purchase' : 'Sale';
	const url_prefix = inv_type === 'purchase' ? 'purchase-invoice' : 'sale-invoice';

	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_domain_all_months',
		args: { domain, from_month, to_month, inv_type },
		callback: function (r) {
			if (!r.message || !r.message.length) {
				frappe.msgprint(`No ${label} data for ${domain}`);
				return;
			}

			// Flatten all months into one row list
			let grand_total = 0;
			let all_rows    = [];
			r.message.forEach(m => {
				grand_total += m.total_amount;
				(m.invoices || []).forEach((inv, i) => {
					all_rows.push({ ...inv, month: m.month, row_id: `inv-${inv_type}-${m.month.replace(' ','-')}-${i}` });
				});
			});

			const rows_html = all_rows.map((inv, i) => `
				<tr class="wa-inv-row" style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);white-space:nowrap;color:#000;font-weight:400;">${inv.month}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.invoice_number}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.subscription}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#000;font-weight:400;">${wa_fmt(inv.amount)}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;">${inv.quantity}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:center;">
						<button class="btn btn-xs btn-default wa-entries-btn"
						        data-target="${inv.row_id}"
						        style="font-size:10px;">Entries</button>
					</td>
				</tr>
				<tr id="${inv.row_id}" style="display:none;background:#f3f3f3;">
					<td colspan="6" style="padding:8px 16px;border-bottom:1px solid var(--border-color,#e2e8f0);">
						${wa_entries_table(inv.child_rows)}
					</td>
				</tr>
			`).join('');

			const html = `
			<div style="display:flex;justify-content:space-between;align-items:center;
			            padding:10px 14px;background:var(--bg-color,#f8fafc);
			            border-radius:6px;margin-bottom:12px;">
				<span style="font-size:12px;color:var(--text-muted,#6b7280);font-weight:500;">
					Domain: <strong>${domain}</strong>
				</span>
				<span style="font-size:14px;font-weight:700;color:#000;font-family:monospace;">
					Total: ${wa_fmt(grand_total)}
				</span>
			</div>

			<div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
				<div style="display:flex;align-items:center;gap:6px;
				            border:1px solid var(--border-color,#d1d8dd);border-radius:6px;
				            padding:4px 10px;background:var(--card-bg,#fff);width:220px;">
					<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
					</svg>
					<input id="wa-inv-search" type="text" placeholder="Search..."
					       style="border:none;outline:none;background:transparent;font-size:12px;width:100%;">
				</div>
			</div>

			<table id="wa-inv-table" style="width:100%;border-collapse:collapse;font-size:12px;">
				<thead>
					<tr style="background:${color};">
						<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;">Month</th>
						<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;">Invoice No</th>
						<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;">Subscription</th>
						<th style="padding:8px 12px;text-align:right;color:#000;font-size:11px;">Amount</th>
						<th style="padding:8px 12px;text-align:right;color:#000;font-size:11px;">Qty</th>
						<th style="padding:8px 12px;text-align:center;color:#fff;font-size:11px;width:70px;"></th>
					</tr>
				</thead>
				<tbody>${rows_html}</tbody>
			</table>`;

			const d = new frappe.ui.Dialog({
				title: `${domain} — ${label} Invoice (All Months)`,
				fields: [{ fieldname: 'body', fieldtype: 'HTML', options: html }],
				size: 'extra-large'
			});
			d.show();

			setTimeout(() => {
				// Entries expand/collapse
				d.$wrapper.find('.wa-entries-btn').on('click', function () {
					const $row = d.$wrapper.find('#' + $(this).data('target'));
					$row.toggle(!$row.is(':visible'));
				});

				// Single search — filters all invoice rows
				d.$wrapper.find('#wa-inv-search').on('input', function () {
					const q = this.value.toLowerCase().trim();
					d.$wrapper.find('.wa-inv-row').each(function () {
						$(this).toggle(!q || $(this).text().toLowerCase().includes(q));
					});
				});
			}, 100);
		}
	});
}


// ═══════════════════════════════════════════════════════════════════
// Margin card popup — all domains
// ═══════════════════════════════════════════════════════════════════
function wa_open_margin_popup(report) {
	const from_month = frappe.query_report.get_filter_value('from_month') || '';
	const to_month   = frappe.query_report.get_filter_value('to_month')   || '';

	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_all_domains_margin',
		args: { from_month, to_month },
		callback: function (r) {
			if (!r.message || !r.message.length) { frappe.msgprint('No margin data found'); return; }

			const html = `			
			<div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
				<div style="display:flex;align-items:center;gap:6px;
				            border:1px solid var(--border-color,#d1d8dd);border-radius:6px;
				            padding:4px 10px;background:var(--card-bg,#fff);width:220px;">
					<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
					</svg>
					<input id="wa-margin-search" type="text" placeholder="Search..."
					       style="border:none;outline:none;background:transparent;font-size:12px;width:100%;">
				</div>
			</div>
			<table id="wa-margin-tbl" style="width:100%;border-collapse:collapse;font-size:12px;">
				<thead>
					<tr style="background:#f3f3f3;">
						<th style="padding:10px 14px;text-align:left;color:#000;">Domain</th>
						<th style="padding:10px 14px;text-align:right;color:#000;">Purchase</th>
						<th style="padding:10px 14px;text-align:right;color:#000;">Sale</th>
						<th style="padding:10px 14px;text-align:right;color:#000;">Margin</th>
					</tr>
				</thead>
				<tbody>
					${r.message.map((d, i) => {
						const mc   = d.margin >= 0 ? '#15803d' : '#dc2626';
						const sign = d.margin >= 0 ? '+' : '-';
						return `<tr class="wa-margin-row" style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
							<td style="padding:8px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);">${d.domain}</td>
							<td style="padding:8px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#1e40af;">${wa_fmt(d.purchase)}</td>
							<td style="padding:8px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#15803d;">${wa_fmt(d.sale)}</td>
							<td style="padding:8px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;font-weight:700;color:${mc};">${sign}${wa_fmt(d.margin)}</td>
						</tr>`;
					}).join('')}
				</tbody>
			</table>`;

			const dlg = new frappe.ui.Dialog({
				title: 'All Domains — Margin / Profit',
				fields: [{ fieldname: 'body', fieldtype: 'HTML', options: html }],
				size: 'extra-large'
			});
			dlg.show();

			setTimeout(() => {
				dlg.$wrapper.find('#wa-margin-search').on('input', function () {
					const q = this.value.toLowerCase().trim();
					dlg.$wrapper.find('.wa-margin-row').each(function () {
						$(this).toggle(!q || $(this).text().toLowerCase().includes(q));
					});
				});
			}, 100);
		}
	});
}
























