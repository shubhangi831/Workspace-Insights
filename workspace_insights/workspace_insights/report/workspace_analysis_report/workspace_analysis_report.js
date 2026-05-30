// // Copyright (c) 2026, sk and contributors
// // For license information, please see license.txt

// frappe.query_reports["Workspace Analysis Report"] = {

// 	onload: function (report) {
// 		const domainFilter = report.get_filter("domain");
// 		if (domainFilter) domainFilter.set_value('');

// 		// ── CSS ───────────────────────────────────────────────────
// 		if (!document.getElementById('wa-report-style')) {
// 			const style = document.createElement('style');
// 			style.id    = 'wa-report-style';
// 			style.textContent = `
// 				.page-form .frappe-control { margin-right: 20px !important; }

// 				/* Domain dropdown — responsive */
// 				.wa-select-wrap { position:relative; display:inline-block; width:100%; min-width:0; }
// 				.wa-select-display {
// 					border:1px solid var(--border-color,#d1d8dd); border-radius:6px;
// 					padding:6px 32px 6px 10px; font-size:13px;
// 					color:var(--text-color,#333); background:var(--control-bg,#fff);
// 					cursor:pointer; user-select:none; white-space:nowrap; overflow:hidden;
// 					text-overflow:ellipsis; width:100%; min-width:120px; max-width:100%;
// 					height:34px; display:flex; align-items:center; box-sizing:border-box;
// 				}
// 				.wa-select-display:hover { border-color:#1a56db; }
// 				.wa-select-arrow { position:absolute; right:10px; top:50%; transform:translateY(-50%);
// 					pointer-events:none; color:var(--text-muted,#8d99a6); font-size:10px; }
// 				.wa-select-dropdown {
// 					position:absolute; top:calc(100% + 4px); left:0; min-width:100%;
// 					width:max-content; max-width:min(380px, 90vw); background:var(--card-bg,#fff);
// 					border:1px solid var(--border-color,#d1d8dd); border-radius:8px;
// 					box-shadow:0 8px 24px rgba(0,0,0,0.13); z-index:99999; display:none;
// 				}
// 				.wa-select-dropdown.open { display:block; }
// 				.wa-search-box { padding:8px 10px; border-bottom:1px solid var(--border-color,#d1d8dd);
// 					display:flex; align-items:center; gap:7px; background:var(--control-bg,#f9f9f9);
// 					border-radius:8px 8px 0 0; }
// 				.wa-search-box svg { flex-shrink:0; color:var(--text-muted,#8d99a6); }
// 				.wa-search-input { border:none; outline:none; background:transparent;
// 					font-size:13px; width:100%; min-width:0; color:var(--text-color,#333); }
// 				.wa-search-input::placeholder { color:var(--text-muted,#aaa); }
// 				.wa-options-list { max-height:220px; overflow-y:auto; padding:4px 0; }
// 				.wa-option { padding:9px 14px; font-size:13px; cursor:pointer;
// 					color:var(--text-color,#333); white-space:nowrap; }
// 				.wa-option:hover  { background:#eef2ff; color:#1a56db; }
// 				.wa-option.active { background:#1a56db; color:#fff; font-weight:600; }
// 				.wa-no-result { padding:14px; font-size:13px; color:#aaa; text-align:center; }
// 				.wa-options-list::-webkit-scrollbar { width:4px; }
// 				.wa-options-list::-webkit-scrollbar-thumb { background:#ddd; border-radius:4px; }

// 				/* Summary cards — Frappe widget format */
// 				.wa-card {
// 					background: var(--card-bg, #fff);
// 					border: 1px solid var(--border-color, #e2e8f0);
// 					border-radius: 8px;
// 					box-shadow: 0 1px 3px rgba(0,0,0,0.05);
// 					padding: 14px 16px;
// 					transition: box-shadow 0.15s;
// 					min-width: 0; overflow: hidden;
// 				}
// 				.wa-card.clickable { cursor: pointer; }
// 				.wa-card.clickable:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
// 				.wa-card-label {
// 					font-size: 10px; font-weight: 600; letter-spacing: .5px;
// 					text-transform: uppercase; color: var(--text-muted, #8d99a6);
// 					margin-bottom: 6px; white-space: nowrap;
// 				}
// 				.wa-card-value {
// 					font-size: 18px; font-weight: 700;
// 					color: var(--text-color, #111); font-family: monospace;
// 					white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
// 				}

// 				/* TOTAL row — Frappe native light style */
// 				.dt-scrollable .dt-row:last-child .dt-cell {
// 					position:sticky !important; bottom:0 !important; z-index:10 !important;
// 					background:var(--control-bg,#f5f7fa) !important; font-weight:700 !important;
// 					border-top:2px solid var(--border-color,#d1d8dd) !important;
// 				}
// 				.dt-scrollable .dt-row:last-child .dt-cell .dt-cell__content,
// 				.dt-scrollable .dt-row:last-child .dt-cell span {
// 					color:var(--text-color,#333) !important;
// 				}
// 			`;
// 			document.head.appendChild(style);
// 		}

// 		// ── Fetch filter options ──────────────────────────────────
// 		frappe.call({
// 			method: "workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_filter_options",
// 			callback: function (r) {
// 				if (!r.message) return;
// 				const { domains, months } = r.message;

// 				// Month dropdowns
// 				if (months.length) {
// 					const opts = "\n" + months.join("\n");
// 					const ff   = report.get_filter("from_month");
// 					const tf   = report.get_filter("to_month");
// 					if (ff) { ff.df.options = opts; ff.refresh(); ff.set_value(months[0]); }
// 					if (tf) { tf.df.options = opts; tf.refresh(); tf.set_value(months[months.length - 1]); }
// 				}

// 				// Domain dropdown
// 				if (domains.length) {
// 					wa_build_domain_select(report, domains);
// 				}

// 				// Inject cards + clear button
// 				setTimeout(() => {
// 					wa_inject_cards(report);
// 					wa_inject_clear_button(report);
// 					wa_refresh_cards(report);
// 				}, 400);
// 			}
// 		});
// 	},

// 	// ── Color column headers ──────────────────────────────────────
// 	after_datatable_render: function (datatable) {
// 		setTimeout(() => {
// 			const $dt = $(datatable.wrapper);

// 			$dt.find('.dt-cell--header').each(function () {
// 				const label = $(this).find('.dt-cell__content').text().trim();
// 				if (label.startsWith('P |')) {
// 					$(this).css({ 'background': '#eff6ff', 'border-bottom': '2px solid #93c5fd' });
// 					$(this).find('.dt-cell__content').css({ 'color': '#1e40af', 'font-weight': '700' });
// 				} else if (label.startsWith('S |')) {
// 					$(this).css({ 'background': '#ecfdf5', 'border-bottom': '2px solid #6ee7b7' });
// 					$(this).find('.dt-cell__content').css({ 'color': '#065f46', 'font-weight': '700' });
// 				} else if (label.includes('Balance')) {
// 					$(this).css({ 'background': '#f5f3ff', 'border-bottom': '2px solid #c4b5fd' });
// 					$(this).find('.dt-cell__content').css({ 'color': '#5b21b6', 'font-weight': '700' });
// 				}
// 			});

// 			// TOTAL row — Frappe native light style (matches screenshot)
// 			$dt.find('.dt-row').each(function () {
// 				const text = $(this).find('.dt-cell').first().find('.dt-cell__content').text().trim();
// 				if (text === 'TOTAL') {
// 					$(this).css({ 'position': 'sticky', 'bottom': '0', 'z-index': '10' });
// 					$(this).find('.dt-cell').css({
// 						'background':  'var(--control-bg, #f5f7fa)',
// 						'font-weight': '700',
// 						'border-top':  '2px solid var(--border-color, #d1d8dd)',
// 						'box-shadow':  '0 -2px 6px rgba(0,0,0,0.05)'
// 					});
// 					$(this).find('.dt-cell__content, span').css({ 'color': 'var(--text-color, #333)' });
// 				}
// 			});

// 			// Refresh card values after report re-renders
// 			wa_refresh_cards(frappe.query_report);

// 		}, 400);
// 	},

// 	// ── Cell formatter ────────────────────────────────────────────
// 	formatter: function (value, row, column, data, default_formatter) {
// 		if (!data) return default_formatter(value, row, column, data);

// 		const fn  = column.fieldname || '';
// 		const num = parseFloat(value) || 0;

// 		if (fn === 'month') {
// 			if (data.month === 'TOTAL') return `<strong style="color:var(--text-color,#333);">TOTAL</strong>`;
// 			return `<a style="color:#1a56db;text-decoration:none;font-weight:600;cursor:pointer;"
// 				onclick="event.preventDefault();wa_show_month_detail('${data.month}')"
// 				href="#">${data.month}</a>`;
// 		}

// 		if (fn.startsWith('p_') && fn.endsWith('_amt') && value !== null && value !== undefined) {
// 			return `<span style="font-family:monospace;">₹${num.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>`;
// 		}

// 		if (fn.startsWith('s_') && fn.endsWith('_amt') && value !== null && value !== undefined) {
// 			return `<span style="font-family:monospace;">₹${num.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>`;
// 		}

// 		if (fn === 'balance' && value !== null && value !== undefined) {
// 			const abs = '₹' + Math.abs(num).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
// 			return num < 0
// 				? `<span style="color:#dc2626;font-family:monospace;">-${abs}</span>`
// 				: `<span style="font-family:monospace;">${abs}</span>`;
// 		}

// 		return default_formatter(value, row, column, data);
// 	},

// 	filters: [
// 		{ fieldname: "domain",     label: __("Domain"),     fieldtype: "Data",   reqd: 1, default: "" },
// 		{ fieldname: "from_month", label: __("From Month"), fieldtype: "Select", options: "", reqd: 0 },
// 		{ fieldname: "to_month",   label: __("To Month"),   fieldtype: "Select", options: "", reqd: 0 }
// 	]
// };


// // ═══════════════════════════════════════════════════════════════════
// // Domain custom dropdown
// // ═══════════════════════════════════════════════════════════════════
// function wa_build_domain_select(report, allOptions) {
// 	const filter = report.get_filter("domain");
// 	if (!filter) return;

// 	function attach() {
// 		const $wrapper = filter.$wrapper;
// 		if (!$wrapper || !$wrapper.length) return false;
// 		if ($wrapper.find('.wa-select-wrap').length) return true;

// 		$wrapper.find('input, .link-btn').hide();

// 		const $wrap = $(`
// 			<div class="wa-select-wrap">
// 				<div class="wa-select-display">
// 					<span class="wa-placeholder" style="color:var(--text-muted,#aaa)">Select domain...</span>
// 				</div>
// 				<span class="wa-select-arrow">▼</span>
// 				<div class="wa-select-dropdown">
// 					<div class="wa-search-box">
// 						<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
// 							<circle cx="11" cy="11" r="8"/>
// 							<line x1="21" y1="21" x2="16.65" y2="16.65"/>
// 						</svg>
// 						<input class="wa-search-input" type="text" placeholder="Search domain..." autocomplete="off"/>
// 					</div>
// 					<div class="wa-options-list"></div>
// 				</div>
// 			</div>
// 		`);
// 		$wrapper.append($wrap);

// 		const $display  = $wrap.find('.wa-select-display');
// 		const $ph       = $wrap.find('.wa-placeholder');
// 		const $dropdown = $wrap.find('.wa-select-dropdown');
// 		const $search   = $wrap.find('.wa-search-input');
// 		const $list     = $wrap.find('.wa-options-list');
// 		let   selected  = '';

// 		function renderOptions(query) {
// 			const q        = (query || '').toLowerCase().trim();
// 			const filtered = q ? allOptions.filter(o => o.toLowerCase().includes(q)) : allOptions;
// 			if (!filtered.length) { $list.html('<div class="wa-no-result">No domain found</div>'); return; }
// 			$list.html(filtered.map(o =>
// 				`<div class="wa-option${o === selected ? ' active' : ''}" data-val="${o}">${o}</div>`
// 			).join(''));

// 			$list.find('.wa-option').on('click', function (e) {
// 				e.stopPropagation();
// 				selected = $(this).data('val');
// 				$ph.remove();
// 				$display.html(`<span style="color:var(--text-color,#333);font-weight:500;">${selected}</span>`);
// 				$dropdown.removeClass('open');
// 				$search.val('');
// 				renderOptions('');
// 				filter.set_value(selected);
// 				// ✅ FIX: refresh cards when domain changes
// 				setTimeout(() => {
// 					report.refresh();
// 					wa_refresh_cards(report);
// 				}, 120);
// 			});
// 		}

// 		renderOptions('');

// 		$display.on('click', function (e) {
// 			e.stopPropagation();
// 			const wasOpen = $dropdown.hasClass('open');
// 			$('.wa-select-dropdown').removeClass('open');
// 			if (!wasOpen) { $dropdown.addClass('open'); requestAnimationFrame(() => $search[0] && $search[0].focus()); }
// 		});
// 		$search.on('input', function () { renderOptions(this.value); });
// 		$search.on('click mousedown touchstart', e => e.stopPropagation());
// 		$(document).off('click.wa-domain-dd').on('click.wa-domain-dd', () => {
// 			$dropdown.removeClass('open'); $search.val(''); renderOptions('');
// 		});

// 		return true;
// 	}

// 	if (!attach()) {
// 		const obs = new MutationObserver(function (_, o) { if (attach()) o.disconnect(); });
// 		obs.observe(document.body, { childList: true, subtree: true });
// 	}
// }


// // ═══════════════════════════════════════════════════════════════════
// // Summary Cards — Frappe native white format
// // ═══════════════════════════════════════════════════════════════════
// function wa_inject_cards(report) {
// 	if ($('#wa-cards-wrap').length) return;

// 	const $cards = $(`
// 		<div id="wa-cards-wrap" style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin:0 0 16px;padding:8px;">

// 			<div class="wa-card" id="wa-card-domains" style="border-left:4px solid var(--border-color,#e2e8f0);">
// 				<div class="wa-card-label">All Domains</div>
// 				<div class="wa-card-value" id="wa-val-domains">—</div>
// 			</div>

// 			<div class="wa-card clickable" id="wa-card-purchase" style="border-left:4px solid #3b82f6;">
// 				<div class="wa-card-label" style="color:#1e40af;">Purchase</div>
// 				<div class="wa-card-value" id="wa-val-purchase">—</div>
// 				<div id="wa-sub-purchase" style="font-size:11px;color:var(--text-muted,#9ca3af);margin-top:4px;">Loading...</div>
// 			</div>

// 			<div class="wa-card clickable" id="wa-card-sale" style="border-left:4px solid #22c55e;">
// 				<div class="wa-card-label" style="color:#15803d;">Sale</div>
// 				<div class="wa-card-value" id="wa-val-sale">—</div>
// 				<div id="wa-sub-sale" style="font-size:11px;color:var(--text-muted,#9ca3af);margin-top:4px;">Loading...</div>
// 			</div>

// 			<div class="wa-card clickable" id="wa-card-margin" style="border-left:4px solid #a855f7;">
// 				<div class="wa-card-label" style="color:#6b21a8;">Margin</div>
// 				<div class="wa-card-value" id="wa-val-margin">—</div>
// 				<div id="wa-sub-margin" style="font-size:11px;color:var(--text-muted,#9ca3af);margin-top:4px;">Loading...</div>
// 			</div>

// 		</div>
// 	`);

// 	// Insert before the filter bar — works for all Frappe report page structures
// 	const $pageForm = $('.page-form');
// 	if ($pageForm.length) {
// 		$pageForm.before($cards);
// 	} else {
// 		$('.layout-main-section, .main-section, .page-body').first().prepend($cards);
// 	}

// 	// Card click handlers
// 	$('#wa-card-purchase').on('click', function () {
// 		const domain = frappe.query_report.get_filter_value('domain');
// 		if (!domain) {
// 			wa_open_all_domains_invoice_popup(report, 'purchase');
// 			return;
// 		}
// 		wa_open_invoice_popup(report, domain, 'purchase');
// 	});

// 	$('#wa-card-sale').on('click', function () {
// 		const domain = frappe.query_report.get_filter_value('domain');
// 		if (!domain) { frappe.show_alert({ message: 'Please select a domain first', indicator: 'orange' }, 3); return; }
// 		wa_open_invoice_popup(report, domain, 'sale');
// 	});

// 	$('#wa-card-margin').on('click', function () {
// 		wa_open_margin_popup(report);
// 	});
// }


// // ── Refresh card values ───────────────────────────────────────────
// function wa_refresh_cards(report) {
// 	if (!$('#wa-cards-wrap').length) return;

// 	const domain     = frappe.query_report.get_filter_value('domain') || '';
// 	const from_month = frappe.query_report.get_filter_value('from_month') || '';
// 	const to_month   = frappe.query_report.get_filter_value('to_month') || '';

// 	frappe.call({
// 		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_card_summary',
// 		args: { domain, from_month, to_month },
// 		callback: function (r) {
// 			if (!r.message) return;
// 			const d = r.message;

// 			function fmt(n) { return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 }); }

// 			// Always show totals — all domains or selected domain
// 			const subtitle = d.has_domain ? domain : 'All domains';

// 			$('#wa-val-domains').text(d.total_domains);

// 			$('#wa-val-purchase').css('color', '#1e40af').text(fmt(d.purchase_total));
// 			$('#wa-sub-purchase').text(subtitle);

// 			$('#wa-val-sale').css('color', '#15803d').text(fmt(d.sale_total));
// 			$('#wa-sub-sale').text(subtitle);

// 			const mc   = d.margin >= 0 ? '#15803d' : '#dc2626';
// 			const sign = d.margin >= 0 ? '+' : '-';
// 			$('#wa-val-margin').css('color', mc).text(sign + fmt(d.margin));
// 			$('#wa-sub-margin').text(subtitle);
// 		}
// 	});
// }


// // ═══════════════════════════════════════════════════════════════════
// // Clear button
// // ═══════════════════════════════════════════════════════════════════
// function wa_inject_clear_button(report) {
// 	if ($('#wa-clear-btn').length) return;

// 	const $btn = $(`
// 		<button id="wa-clear-btn" class="btn btn-default"
// 		        style="margin-left:8px;margin-top:8px;height:30px;padding:0 15px;font-size:12px;
// 		               display:inline-flex;align-items:center;gap:5px;
// 		               border:1px solid var(--border-color,#d1d8dd);
// 		               background:var(--card-bg,#fff);color:var(--text-color,#333);
// 		               border-radius:6px;cursor:pointer;vertical-align:middle;">
// 			<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
// 				<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
// 			</svg>
// 			Clear
// 		</button>
// 	`);
// 	$('.page-form').append($btn);

// 	$btn.on('click', function () {
// 		// Reset domain dropdown display
// 		$('.wa-select-display').html('<span style="color:var(--text-muted,#aaa)">Select domain...</span>');
// 		$('.wa-select-dropdown').removeClass('open');

// 		// ✅ FIX: Reset ALL filters — domain + months
// 		const df = report.get_filter('domain');
// 		if (df) df.set_value('');

// 		// Re-fetch filter options to get valid month values to reset to
// 		frappe.call({
// 			method: "workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_filter_options",
// 			callback: function (r) {
// 				if (!r.message) return;
// 				const { months } = r.message;
// 				const ff = report.get_filter('from_month');
// 				const tf = report.get_filter('to_month');
// 				if (ff && months.length) ff.set_value(months[0]);
// 				if (tf && months.length) tf.set_value(months[months.length - 1]);

// 				// Reset card values
// 				$('#wa-val-purchase, #wa-val-sale, #wa-val-margin').css('color', 'var(--text-color,#111)').text('Select a domain');
// 				wa_refresh_cards(report);
// 			}
// 		});
// 	});
// }


// // ═══════════════════════════════════════════════════════════════════
// // Shared helpers for popups
// // ═══════════════════════════════════════════════════════════════════
// function wa_fmt(n) {
// 	return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
// }

// // Child entries table — no Doc column (already visible in parent row)
// function wa_entries_table(child_rows) {
// 	if (!child_rows || !child_rows.length) return '<p style="color:#9ca3af;font-size:12px;padding:6px 0;">No entries</p>';
// 	return `
// 	<table style="width:100%;border-collapse:collapse;font-size:11px;background:var(--bg-color,#f9fafb);">
// 		<thead>
// 			<tr style="background:var(--border-color,#e5e7eb);">
// 				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Start Date</th>
// 				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">End Date</th>
// 				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Description</th>
// 				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Order Name</th>
// 				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">PO Number</th>
// 				<th style="padding:5px 10px;text-align:right;color:var(--text-muted,#6b7280);">Qty</th>
// 				<th style="padding:5px 10px;text-align:right;color:var(--text-muted,#6b7280);">Amount</th>
// 			</tr>
// 		</thead>
// 		<tbody>
// 			${child_rows.map((r, i) => `
// 			<tr style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.start_date || ''}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.end_date || ''}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.description || ''}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.order_name || ''}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.po_number || ''}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;">${r.quantity}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;font-family:monospace;">${wa_fmt(r.amount)}</td>
// 			</tr>`).join('')}
// 		</tbody>
// 	</table>`;
// }

// function wa_child_table_html(child_rows) {
// 	if (!child_rows || !child_rows.length) return '<p style="color:#9ca3af;font-size:12px;padding:6px 0;">No entries</p>';
// 	return `
// 	<table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:6px;background:var(--bg-color,#f9fafb);">
// 		<thead>
// 			<tr style="background:var(--border-color,#e5e7eb);">
// 				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Start Date</th>
// 				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">End Date</th>
// 				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Description</th>
// 				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Order Name</th>
// 				<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">PO Number</th>
// 				<th style="padding:5px 10px;text-align:right;color:var(--text-muted,#6b7280);">Qty</th>
// 				<th style="padding:5px 10px;text-align:right;color:var(--text-muted,#6b7280);">Amount</th>
// 			</tr>
// 		</thead>
// 		<tbody>
// 			${child_rows.map((r, i) => `
// 			<tr style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.start_date || ''}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.end_date || ''}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.description || ''}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.order_name || ''}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.po_number || ''}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;">${r.quantity}</td>
// 				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;font-family:monospace;">${wa_fmt(r.amount)}</td>
// 			</tr>`).join('')}
// 		</tbody>
// 	</table>`;
// }

// function wa_invoice_table_html(invoices, color, url_prefix, id_prefix) {
// 	if (!invoices || !invoices.length) return '<p style="color:#9ca3af;font-size:12px;padding:6px 0;">No data</p>';

// 	const table_id   = `tbl-${id_prefix}`;
// 	const light_bg   = color === '#1e40af' ? '#eff6ff' : color === '#15803d' ? '#f0fdf4' : '#faf5ff';
// 	const light_bdr  = color === '#1e40af' ? '#bfdbfe' : color === '#15803d' ? '#bbf7d0' : '#e9d5ff';

// 	return `
// 	<table id="${table_id}" style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px;">
// 		<thead>
// 			<tr style="background:#f3f3f3;border-bottom:2px solid #f3f3f3;">
// 				<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;font-weight:700;">Invoice No</th>
// 				<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;font-weight:700;">Subscription</th>
// 				<th style="padding:8px 12px;text-align:right;color:#000;font-size:11px;font-weight:700;">Amount</th>
// 				<th style="padding:8px 12px;text-align:right;color:#000;font-size:11px;font-weight:700;">Qty</th>
// 				<th style="padding:8px 12px;text-align:center;color:#000;font-size:11px;font-weight:700;width:80px;"></th>
// 			</tr>
// 		</thead>
// 		<tbody>
// 			${invoices.map((inv, i) => {
// 				const row_id = `${id_prefix}-${i}`;
// 				return `
// 				<tr class="wa-inv-row" style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
// 					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.invoice_number}</td>
// 					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.subscription}</td>
// 					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#000;">${wa_fmt(inv.amount)}</td>
// 					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;">${inv.quantity}</td>
// 					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:center;">
// 						<button class="btn btn-xs btn-default wa-entries-btn" data-target="${row_id}"
// 						        style="font-size:10px;">Entries</button>
// 					</td>
// 				</tr>
// 				<tr id="${row_id}" style="display:none;background:#f3f3f3;">
// 					<td colspan="5" style="padding:8px 16px;border-bottom:1px solid var(--border-color,#e2e8f0);">
// 						${wa_child_table_html(inv.child_rows)}
// 					</td>
// 				</tr>`;
// 			}).join('')}
// 		</tbody>
// 	</table>`;
// }

// function wa_bind_entries(d) {
// 	setTimeout(() => {
// 		// Entries expand/collapse
// 		d.$wrapper.find('.wa-entries-btn').on('click', function () {
// 			const $row = d.$wrapper.find('#' + $(this).data('target'));
// 			$row.toggle(!$row.is(':visible'));
// 		});

// 		// Search filter — right-aligned compact input above each table
// 		d.$wrapper.find('.wa-popup-search').on('input', function () {
// 			const q      = this.value.toLowerCase().trim();
// 			const tbl_id = $(this).data('table');
// 			const $tbl   = d.$wrapper.find('#' + tbl_id);

// 			$tbl.find('.wa-inv-row').each(function () {
// 				const text    = $(this).text().toLowerCase();
// 				const matches = !q || text.includes(q);
// 				$(this).toggle(matches);
// 				// Also hide the expanded entries row when parent is hidden
// 				const entries_id = $(this).next('tr').attr('id');
// 				if (entries_id) d.$wrapper.find('#' + entries_id).toggle(matches && false);
// 			});
// 		});
// 	}, 100);
// }


// // ═══════════════════════════════════════════════════════════════════
// // Month detail popup (clicking month in report table)
// // ═══════════════════════════════════════════════════════════════════
// window.wa_show_month_detail = function (month) {
// 	const domain = frappe.query_report.get_filter_value('domain');
// 	if (!domain) { frappe.show_alert({ message: 'Please select a domain first', indicator: 'orange' }, 3); return; }

// 	frappe.call({
// 		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_month_detail',
// 		args: { domain, month },
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) {
// 				frappe.msgprint(`No data for ${domain} — ${month}`);
// 				return;
// 			}

// 			const rows     = r.message;
// 			const purchase = rows.filter(x => x.type === 'Purchase');
// 			const sale     = rows.filter(x => x.type === 'Sale');
// 			const totalP   = purchase.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
// 			const totalS   = sale.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
// 			const balance  = totalS - totalP;
// 			const bColor   = balance >= 0 ? '#15803d' : '#dc2626';

// 			const html = `
// 			<div>
// 				<!-- Compact summary strip -->
// 				<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px;">
// 					<div style="border:1px solid #bfdbfe;border-left:3px solid #3b82f6;border-radius:6px;
// 					            padding:10px 14px;background:#fff;">
// 						<div style="font-size:10px;font-weight:600;color:#000;letter-spacing:.5px;margin-bottom:4px;">PURCHASE</div>
// 						<div style="font-size:16px;font-weight:700;color:#000;font-family:monospace;">${wa_fmt(totalP)}</div>
// 					</div>
// 					<div style="border:1px solid #bbf7d0;border-left:3px solid #22c55e;border-radius:6px;
// 					            padding:10px 14px;background:#fff;">
// 						<div style="font-size:10px;font-weight:600;color:#000;letter-spacing:.5px;margin-bottom:4px;">SALE</div>
// 						<div style="font-size:16px;font-weight:700;color:#000;font-family:monospace;">${wa_fmt(totalS)}</div>
// 					</div>
// 					<div style="border:1px solid #e9d5ff;border-left:3px solid #a855f7;border-radius:6px;
// 					            padding:10px 14px;background:#fff;">
// 						<div style="font-size:10px;font-weight:600;color:#000;letter-spacing:.5px;margin-bottom:4px;">BALANCE</div>
// 						<div style="font-size:16px;font-weight:700;color:${bColor};font-family:monospace;">${balance >= 0 ? '+' : '-'}${wa_fmt(balance)}</div>
// 					</div>
// 				</div>

// 				<!-- Purchase -->
// 				<div style="font-size:11px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;">Purchase Invoice</div>
// 				${wa_invoice_table_html(purchase, '#1e40af', 'purchase-invoice', 'mpd-p')}

// 				<!-- Sale -->
// 				<div style="font-size:11px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:.6px;margin:16px 0 8px;">Sale Invoice</div>
// 				${wa_invoice_table_html(sale, '#15803d', 'sale-invoice', 'mpd-s')}
// 			</div>`;

// 			const d = new frappe.ui.Dialog({
// 				title: `${domain} — ${month}`,
// 				fields: [{ fieldname: 'body', fieldtype: 'HTML', options: html }],
// 				size: 'extra-large'
// 			});
// 			d.show();
// 			wa_bind_entries(d);
// 		}
// 	});
// };


// // ═══════════════════════════════════════════════════════════════════
// // Purchase / Sale card popup — all months
// // ═══════════════════════════════════════════════════════════════════
// function wa_open_invoice_popup(report, domain, inv_type) {
// 	const from_month = frappe.query_report.get_filter_value('from_month') || '';
// 	const to_month   = frappe.query_report.get_filter_value('to_month')   || '';
// 	const color      = inv_type === 'purchase' ? '#f3f3f3' : '#f3f3f3';
// 	const label      = inv_type === 'purchase' ? 'Purchase' : 'Sale';
// 	const url_prefix = inv_type === 'purchase' ? 'purchase-invoice' : 'sale-invoice';

// 	frappe.call({
// 		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_domain_all_months',
// 		args: { domain, from_month, to_month, inv_type },
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) {
// 				frappe.msgprint(`No ${label} data for ${domain}`);
// 				return;
// 			}

// 			// Flatten all months into one row list
// 			let grand_total = 0;
// 			let all_rows    = [];
// 			r.message.forEach(m => {
// 				grand_total += m.total_amount;
// 				(m.invoices || []).forEach((inv, i) => {
// 					all_rows.push({ ...inv, month: m.month, row_id: `inv-${inv_type}-${m.month.replace(' ','-')}-${i}` });
// 				});
// 			});

// 			const rows_html = all_rows.map((inv, i) => `
// 				<tr class="wa-inv-row" style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
// 					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);white-space:nowrap;color:#000;font-weight:400;">${inv.month}</td>
// 					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.invoice_number}</td>
// 					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.subscription}</td>
// 					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#000;font-weight:400;">${wa_fmt(inv.amount)}</td>
// 					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;">${inv.quantity}</td>
// 					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:center;">
// 						<button class="btn btn-xs btn-default wa-entries-btn"
// 						        data-target="${inv.row_id}"
// 						        style="font-size:10px;">Entries</button>
// 					</td>
// 				</tr>
// 				<tr id="${inv.row_id}" style="display:none;background:#f3f3f3;">
// 					<td colspan="6" style="padding:8px 16px;border-bottom:1px solid var(--border-color,#e2e8f0);">
// 						${wa_entries_table(inv.child_rows)}
// 					</td>
// 				</tr>
// 			`).join('');

// 			const html = `
// 			<div style="display:flex;justify-content:space-between;align-items:center;
// 			            padding:10px 14px;background:var(--bg-color,#f8fafc);
// 			            border-radius:6px;margin-bottom:12px;">
// 				<span style="font-size:12px;color:var(--text-muted,#6b7280);font-weight:500;">
// 					Domain: <strong>${domain}</strong>
// 				</span>
// 				<span style="font-size:14px;font-weight:700;color:#000;font-family:monospace;">
// 					Total: ${wa_fmt(grand_total)}
// 				</span>
// 			</div>

// 			<div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
// 				<div style="display:flex;align-items:center;gap:6px;
// 				            border:1px solid var(--border-color,#d1d8dd);border-radius:6px;
// 				            padding:4px 10px;background:var(--card-bg,#fff);width:220px;">
// 					<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24">
// 						<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
// 					</svg>
// 					<input id="wa-inv-search" type="text" placeholder="Search..."
// 					       style="border:none;outline:none;background:transparent;font-size:12px;width:100%;">
// 				</div>
// 			</div>

// 			<table id="wa-inv-table" style="width:100%;border-collapse:collapse;font-size:12px;">
// 				<thead>
// 					<tr style="background:${color};">
// 						<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;">Month</th>
// 						<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;">Invoice No</th>
// 						<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;">Subscription</th>
// 						<th style="padding:8px 12px;text-align:right;color:#000;font-size:11px;">Amount</th>
// 						<th style="padding:8px 12px;text-align:right;color:#000;font-size:11px;">Qty</th>
// 						<th style="padding:8px 12px;text-align:center;color:#fff;font-size:11px;width:70px;"></th>
// 					</tr>
// 				</thead>
// 				<tbody>${rows_html}</tbody>
// 			</table>`;

// 			const d = new frappe.ui.Dialog({
// 				title: `${domain} — ${label} Invoice (All Months)`,
// 				fields: [{ fieldname: 'body', fieldtype: 'HTML', options: html }],
// 				size: 'extra-large'
// 			});
// 			d.show();

// 			setTimeout(() => {
// 				// Entries expand/collapse
// 				d.$wrapper.find('.wa-entries-btn').on('click', function () {
// 					const $row = d.$wrapper.find('#' + $(this).data('target'));
// 					$row.toggle(!$row.is(':visible'));
// 				});

// 				// Single search — filters all invoice rows
// 				d.$wrapper.find('#wa-inv-search').on('input', function () {
// 					const q = this.value.toLowerCase().trim();
// 					d.$wrapper.find('.wa-inv-row').each(function () {
// 						$(this).toggle(!q || $(this).text().toLowerCase().includes(q));
// 					});
// 				});
// 			}, 100);
// 		}
// 	});
// }


// // ═══════════════════════════════════════════════════════════════════
// // Margin card popup — all domains
// // ═══════════════════════════════════════════════════════════════════
// function wa_open_margin_popup(report) {
// 	const from_month = frappe.query_report.get_filter_value('from_month') || '';
// 	const to_month   = frappe.query_report.get_filter_value('to_month')   || '';

// 	frappe.call({
// 		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_all_domains_margin',
// 		args: { from_month, to_month },
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) { frappe.msgprint('No margin data found'); return; }

// 			const html = `			
// 			<div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
// 				<div style="display:flex;align-items:center;gap:6px;
// 				            border:1px solid var(--border-color,#d1d8dd);border-radius:6px;
// 				            padding:4px 10px;background:var(--card-bg,#fff);width:220px;">
// 					<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24">
// 						<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
// 					</svg>
// 					<input id="wa-margin-search" type="text" placeholder="Search..."
// 					       style="border:none;outline:none;background:transparent;font-size:12px;width:100%;">
// 				</div>
// 			</div>
// 			<table id="wa-margin-tbl" style="width:100%;border-collapse:collapse;font-size:12px;">
// 				<thead>
// 					<tr style="background:#f3f3f3;">
// 						<th style="padding:10px 14px;text-align:left;color:#000;">Domain</th>
// 						<th style="padding:10px 14px;text-align:right;color:#000;">Purchase</th>
// 						<th style="padding:10px 14px;text-align:right;color:#000;">Sale</th>
// 						<th style="padding:10px 14px;text-align:right;color:#000;">Margin</th>
// 					</tr>
// 				</thead>
// 				<tbody>
// 					${r.message.map((d, i) => {
// 						const mc   = d.margin >= 0 ? '#15803d' : '#dc2626';
// 						const sign = d.margin >= 0 ? '+' : '-';
// 						return `<tr class="wa-margin-row" style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
// 							<td style="padding:8px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);">${d.domain}</td>
// 							<td style="padding:8px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#1e40af;">${wa_fmt(d.purchase)}</td>
// 							<td style="padding:8px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#15803d;">${wa_fmt(d.sale)}</td>
// 							<td style="padding:8px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;font-weight:700;color:${mc};">${sign}${wa_fmt(d.margin)}</td>
// 						</tr>`;
// 					}).join('')}
// 				</tbody>
// 			</table>`;

// 			const dlg = new frappe.ui.Dialog({
// 				title: 'All Domains — Margin / Profit',
// 				fields: [{ fieldname: 'body', fieldtype: 'HTML', options: html }],
// 				size: 'extra-large'
// 			});
// 			dlg.show();

// 			setTimeout(() => {
// 				dlg.$wrapper.find('#wa-margin-search').on('input', function () {
// 					const q = this.value.toLowerCase().trim();
// 					dlg.$wrapper.find('.wa-margin-row').each(function () {
// 						$(this).toggle(!q || $(this).text().toLowerCase().includes(q));
// 					});
// 				});
// 			}, 100);
// 		}
// 	});
// }









// This code is giving a graph & advance structure on report


frappe.query_reports["Workspace Analysis Report"] = {

	onload: function (report) {
		const domainFilter = report.get_filter("domain");
		if (domainFilter) domainFilter.set_value('');

		// ── CSS ───────────────────────────────────────────────────
		if (!document.getElementById('wa-report-style')) {
			const style = document.createElement('style');
			style.id    = 'wa-report-style';
			style.textContent = `
				.page-form{align-items: center;}
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

				/* Summary cards — compact size */
				.wa-card {
					background: var(--card-bg, #fff);
					border: 1px solid var(--border-color, #e2e8f0);
					border-radius: 6px;
					box-shadow: 0 1px 2px rgba(0,0,0,0.04);
					padding: 8px 12px;
					transition: box-shadow 0.15s;
					min-width: 0; overflow: hidden;
				}
				.wa-card.clickable { cursor: pointer; }
				.wa-card.clickable:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
				.wa-card-label {
					font-size: 9px; font-weight: 700; letter-spacing: .6px;
					text-transform: uppercase; color: var(--text-muted, #8d99a6);
					margin-bottom: 2px; white-space: nowrap;
				}
				.wa-card-value {
					font-size: 13px; font-weight: 700;
					color: var(--text-color, #111); font-family: monospace;
					white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
				}

				/* TOTAL row handled by wa_inject_total_footer() in JS */

				/* Sticky footer */
				#wa-sticky-footer {
					position: sticky !important;
					bottom: 0 !important;
					z-index: 50 !important;
					background: #f3f4f6 !important;
					border-top: 2px solid #d1d5db !important;
					width: 100% !important;
					display: block !important;
					overflow: hidden;
				}
				#wa-sticky-footer > div {
					background: #f3f4f6 !important;
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

				// Month dropdowns — custom scrollable select
				if (months.length) {
					const opts = "\n" + months.join("\n");
					const ff   = report.get_filter("from_month");
					const tf   = report.get_filter("to_month");
					if (ff) { ff.df.options = opts; ff.refresh(); ff.set_value(months[0]); }
					if (tf) { tf.df.options = opts; tf.refresh(); tf.set_value(months[months.length - 1]); }

					// Replace native selects with custom scrollable dropdowns
					setTimeout(() => {
						wa_build_month_select(report, 'from_month', months, months[0]);
						wa_build_month_select(report, 'to_month',   months, months[months.length - 1]);
					}, 200);
				}

				// Domain dropdown
				if (domains.length) {
					frappe.query_report._all_domain_count = domains.length;
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

	// ── Color column headers after render ─────────────────────────
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

			wa_refresh_cards(frappe.query_report);
			wa_inject_chart(frappe.query_report);

			// Sticky footer — same approach as FT Drawing Part report
			wa_attach_sticky_footer();


			// Hide original TOTAL row permanently via CSS (works with virtual scroll)
			$dt.find('.dt-row').each(function() {
				const txt = $(this).find('.dt-cell').first().find('.dt-cell__content').text().trim();
				if (txt === 'TOTAL') {
					const idx = $(this).attr('data-row-index');
					if (idx !== undefined) {
						const style_id = 'wa-hide-total-row';
						$('#' + style_id).remove();
						$('<style id="' + style_id + '">'
							+ '.dt-row[data-row-index="' + idx + '"] { visibility:hidden !important; pointer-events:none !important; }'
							+ '</style>').appendTo('head');
					}
					$(this).css({ 'visibility': 'hidden', 'pointer-events': 'none' });
				}
			});

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
		{ fieldname: "domain",     label: __("Domain"),     fieldtype: "Data",   reqd: 0, default: "" },
		{ fieldname: "from_month", label: __("From Month"), fieldtype: "Select", options: "", reqd: 0 },
		{ fieldname: "to_month",   label: __("To Month"),   fieldtype: "Select", options: "", reqd: 0 }
	]
};


// ═══════════════════════════════════════════════════════════════════
// TOTAL row footer — header style, synced on column resize
// ═══════════════════════════════════════════════════════════════════
function wa_inject_total_footer($dt) {
	$('.wa-total-footer-wrap').remove();

	const $scroll = $dt.find('.dt-scrollable');
	if (!$scroll.length) return;

	// Get TOTAL row from report data
	const all_data  = frappe.query_report.data || [];
	const total_row = all_data.find(r => r.month === 'TOTAL');
	if (!total_row) return;

	const columns = frappe.query_report.columns || [];
	if (!columns.length) return;

	function build_footer() {
		$('.wa-total-footer-inner').remove();

		const $header_cells = $dt.find('.dt-cell--header');
		if (!$header_cells.length) return;

		const col_widths = [];
		$header_cells.each(function() { col_widths.push($(this).outerWidth() || 100); });

		const checkbox_w = col_widths[0] || 30;
		const srno_w     = col_widths[1] || 50;
		const data_widths = col_widths.slice(2);

		function fmt_num(v, fieldtype) {
			if (v === null || v === undefined || v === '') return '';
			const n = parseFloat(v);
			if (isNaN(n)) return '';
			if (fieldtype === 'Int') return n === 0 ? '0' : n.toLocaleString('en-IN');
			return (n < 0 ? '-' : '') + '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
		}

		const month_w = data_widths[0] || 130;

		var cells_html = '<div style="'
			+ 'flex:0 0 ' + (checkbox_w + srno_w + month_w) + 'px;'
			+ 'width:' + (checkbox_w + srno_w + month_w) + 'px;'
			+ 'padding:8px 12px;box-sizing:border-box;'
			+ 'font-weight:700;font-size:13px;color:#000;'
			+ 'white-space:nowrap;border-right:1px solid #d1d5db;'
			+ '">TOTAL</div>';

		columns.slice(1).forEach(function(col, i) {
			var w     = data_widths[i + 1] || 100;
			var val   = total_row[col.fieldname];
			var txt   = fmt_num(val, col.fieldtype);
			var align = (col.fieldtype === 'Float' || col.fieldtype === 'Int') ? 'right' : 'left';
			var color = '#000';
			if (col.fieldname === 'balance') {
				color = parseFloat(val) >= 0 ? '#15803d' : '#dc2626';
			}
			cells_html += '<div style="'
				+ 'flex:0 0 ' + w + 'px;width:' + w + 'px;min-width:' + w + 'px;'
				+ 'padding:8px 12px;box-sizing:border-box;'
				+ 'text-align:' + align + ';font-weight:700;'
				+ 'white-space:nowrap;'
				+ 'color:' + color + ';font-family:monospace;'
				+ 'border-right:1px solid #d1d5db;'
				+ '">' + txt + '</div>';
		});

		var total_width = col_widths.reduce(function(s, w) { return s + w; }, 0);
		var $inner = $('<div class="wa-total-footer-inner" style="display:flex;min-width:' + total_width + 'px;">' + cells_html + '</div>');

		$('.wa-total-footer-wrap').append($inner);

		$scroll.off('scroll.wa-total').on('scroll.wa-total', function () {
			$inner.css('transform', 'translateX(-' + this.scrollLeft + 'px)');
		});
		$inner.css('transform', 'translateX(-' + ($scroll.scrollLeft() || 0) + 'px)');
	}

	const $wrap = $('<div class="wa-total-footer-wrap" style="'
		+ 'overflow:hidden;'
		+ 'background:#f3f4f6;'
		+ 'border-top:2px solid #d1d5db;'
		+ 'position:relative;z-index:20;'
		+ '"></div>');
	$scroll.after($wrap);
	build_footer();

	const $header_row = $dt.find('.dt-row--header').first();
	if ($header_row.length && window.MutationObserver) {
		const obs = new MutationObserver(function() {
			clearTimeout(wa_inject_total_footer._resize_timer);
			wa_inject_total_footer._resize_timer = setTimeout(build_footer, 80);
		});
		obs.observe($header_row[0], { attributes: true, subtree: true, attributeFilter: ['style'] });
	}
}


// ═══════════════════════════════════════════════════════════════════
// Sticky TOTAL footer
// ═══════════════════════════════════════════════════════════════════
function wa_attach_sticky_footer() {
	$('#wa-sticky-footer').remove();

	var data    = frappe.query_report.data    || [];
	var columns = frappe.query_report.columns || [];
	if (!data.length || !columns.length) return;

	var total_row = data[data.length - 1];
	if (!total_row || total_row.month !== 'TOTAL') return;

	function fmt(v, fieldtype) {
		if (v === null || v === undefined || v === '') return '';
		var n = parseFloat(v);
		if (isNaN(n)) return '';
		if (fieldtype === 'Int') {
			return n === 0 ? '0' : n.toLocaleString('en-IN');
		}
		var abs = '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
		return n < 0 ? '-' + abs : abs;
	}

	function build_footer_inner() {
		var col_widths = [];
		$('.dt-header .dt-cell').each(function() {
			var w = $(this).outerWidth();
			col_widths.push(w > 0 ? w : 100);
		});
		if (!col_widths.length) return;

		var cells_html = '<div style="'
			+ 'width:' + (col_widths[0] || 30) + 'px;'
			+ 'min-width:' + (col_widths[0] || 30) + 'px;'
			+ 'display:inline-flex;align-items:center;justify-content:center;'
			+ 'padding:8px 4px;border-right:1px solid #d1d5db;'
			+ 'flex-shrink:0;box-sizing:border-box;'
			+ '"></div>';

		columns.forEach(function(col, i) {
			var w   = col_widths[i + 1] || 100;
			var fn  = col.fieldname || '';
			var val = total_row[fn];
			var txt = '';
			var color = '#000';
			var align = 'right';

			if (fn === 'month') {
				txt   = '<span style="font-weight:900;font-size:13px;color:#000;">TOTAL</span>';
				align = 'left';
			} else if (fn === 'balance') {
				var n = parseFloat(val || 0);
				txt   = fmt(val, col.fieldtype);
				color = n >= 0 ? '#15803d' : '#dc2626';
			} else {
				txt = fmt(val, col.fieldtype);
			}

			cells_html += '<div style="'
				+ 'width:' + w + 'px;min-width:' + w + 'px;max-width:' + w + 'px;'
				+ 'display:inline-flex;align-items:center;justify-content:' + (align === 'left' ? 'flex-start' : 'flex-end') + ';'
				+ 'padding:8px 4px;border-right:1px solid #d1d5db;'
				+ 'flex-shrink:0;box-sizing:border-box;'
				+ 'font-weight:700;font-size:13px;white-space:nowrap;color:' + color + ';'
				+ '">' + txt + '</div>';
		});

		$('#wa-footer-inner').html(cells_html);
		var scrollLeft = $('.dt-scrollable').first().scrollLeft() || 0;
		$('#wa-footer-inner').css('transform', 'translateX(-' + scrollLeft + 'px)');
	}

	var $footer = $('<div id="wa-sticky-footer">'
		+ '<div id="wa-footer-inner" style="display:inline-flex;flex-wrap:nowrap;transform:translateX(0px);">'
		+ '</div></div>');

	var $dt_body = $('.dt-scrollable').first();
	if (!$dt_body.length) return;
	$dt_body.after($footer);

	build_footer_inner();

	$dt_body.off('scroll.wa_footer').on('scroll.wa_footer', function() {
		$('#wa-footer-inner').css('transform', 'translateX(-' + this.scrollLeft + 'px)');
	});

	var total_idx = data.length - 1;
	$('#wa-hide-total').remove();
	$('<style id="wa-hide-total">'
		+ '.dt-row[data-row-index="' + total_idx + '"]{'
		+ 'display:none!important;}'
		+ '</style>').appendTo('head');

	var $dt_body_el = $('.dt-body').first();
	if ($dt_body_el.length) {
		var row_h = 36;
		var $first_row = $('.dt-row[data-row-index="0"]');
		if ($first_row.length) row_h = $first_row.outerHeight() || 36;
		var cur_h = parseInt($dt_body_el[0].style.height) || $dt_body_el.height();
		if (cur_h > row_h) {
			$dt_body_el.css('height', (cur_h - row_h) + 'px');
		}
	}

	// ── MutationObserver — rebuild footer on column resize ──
	var $header_row = $('.dt-row--header').first();
	if ($header_row.length && window.MutationObserver) {
		if (wa_attach_sticky_footer._obs) {
			wa_attach_sticky_footer._obs.disconnect();
		}
		var obs = new MutationObserver(function() {
			clearTimeout(wa_attach_sticky_footer._resize_timer);
			wa_attach_sticky_footer._resize_timer = setTimeout(build_footer_inner, 80);
		});
		obs.observe($header_row[0], { attributes: true, subtree: true, attributeFilter: ['style'] });
		wa_attach_sticky_footer._obs = obs;
	}
}

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

		const options_html = allOptions.map(o => `
			<div class="wa-cb-option" data-val="${o}"
			     style="display:flex;align-items:center;gap:8px;
			            padding:8px 12px;cursor:pointer;user-select:none;">
				<input type="checkbox" class="wa-cb" style="cursor:pointer;flex-shrink:0;"
				       onclick="event.stopPropagation();">
				<span style="font-size:13px;color:var(--text-color,#333);">${o}</span>
			</div>
		`).join('');

		const $wrap = $(`
			<div class="wa-select-wrap">
				<div class="wa-select-display">
					<span style="color:var(--text-muted,#aaa)">Select domain...</span>
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
					<div class="wa-bulk-actions" style="display:flex;gap:6px;padding:6px 10px;
					     border-bottom:1px solid var(--border-color,#e5e7eb);
					     background:var(--bg-color,#f9f9f9);">
						<button class="wa-select-all btn btn-xs btn-default"
						        style="flex:1;font-size:11px;">Select All</button>
					</div>
					<div class="wa-options-list">${options_html}</div>
					<div class="wa-dropdown-footer" style="padding:6px 10px;
					     border-top:1px solid var(--border-color,#e5e7eb);
					     background:var(--bg-color,#f9f9f9);">
						<button class="wa-clear-selection btn btn-xs btn-default"
						        style="width:100%;font-size:11px;">Clear Selection</button>
					</div>
				</div>
			</div>
		`);
		$wrapper.append($wrap);

		const $display  = $wrap.find('.wa-select-display');
		const $dropdown = $wrap.find('.wa-select-dropdown');
		const $search   = $wrap.find('.wa-search-input');
		const $list     = $wrap.find('.wa-options-list');
		let   selected  = [];

		function updateDisplay() {
			const n = selected.length;
			if (!n) {
				$display.html(`<span style="color:var(--text-muted,#aaa)">Select domain...</span>`);
			} else if (n === 1) {
				$display.html(`<span style="font-weight:500;">${selected[0]}</span>`);
			} else if (n === allOptions.length) {
				$display.html(`<span style="font-weight:500;">All domains (${n})</span>`);
			} else {
				$display.html(`<span style="font-weight:500;">${n} domains selected</span>`);
			}
		}

		function syncCheckboxes() {
			$list.find('.wa-cb-option').each(function () {
				const val   = $(this).data('val');
				const isSel = selected.includes(val);
				$(this).find('.wa-cb')[0].checked = isSel;
				$(this).css('background', isSel ? '#eff6ff' : '');
			});
		}

		function filterVisible(query) {
			const q = (query || '').toLowerCase().trim();
			$list.find('.wa-cb-option').each(function () {
				$(this).toggle(!q || $(this).data('val').toLowerCase().includes(q));
			});
		}

		function applyFilter() {
			const val = selected.length === allOptions.length ? '' : selected.join(',');
			filter.set_value(val);
			$wrapper.find('input').first().val(val);

			if (!selected.length) {
				wa_refresh_cards(report);
				$('#wa-chart-wrap').remove();
				return;
			}

			setTimeout(() => {
				frappe.query_report.refresh();
				wa_refresh_cards(report);
			}, 150);
		}

		$list.on('click', '.wa-cb-option', function (e) {
			e.stopPropagation();
			const val = $(this).data('val');
			const cb  = $(this).find('.wa-cb')[0];
			if (selected.includes(val)) {
				selected = selected.filter(d => d !== val);
				cb.checked = false;
				$(this).css('background', '');
			} else {
				selected.push(val);
				cb.checked = true;
				$(this).css('background', '#eff6ff');
			}
			updateDisplay();
			applyFilter();
		});

		$wrap.find('.wa-select-all').on('click', function (e) {
			e.stopPropagation();
			const $visible = $list.find('.wa-cb-option:visible');
			if ($visible.length < allOptions.length) {
				$visible.each(function () {
					const val = $(this).data('val');
					if (!selected.includes(val)) selected.push(val);
				});
			} else {
				selected = [...allOptions];
			}
			syncCheckboxes();
			updateDisplay();
			applyFilter();
		});

		$wrap.find('.wa-clear-selection').on('click', function (e) {
			e.stopPropagation();
			selected = [];
			syncCheckboxes();
			updateDisplay();
			applyFilter();
		});

		$search.on('input', function () { filterVisible(this.value); });
		$search.on('click mousedown touchstart', e => e.stopPropagation());
		$wrap.find('.wa-bulk-actions, .wa-dropdown-footer').on('click mousedown', e => e.stopPropagation());

		$display.on('click', function (e) {
			e.stopPropagation();
			const wasOpen = $dropdown.hasClass('open');
			$('.wa-select-dropdown').removeClass('open');
			$('.wa-month-dropdown').hide();
			if (!wasOpen) {
				$dropdown.addClass('open');
				requestAnimationFrame(() => $search[0] && $search[0].focus());
			}
		});

		$(document).off('click.wa-domain-dd').on('click.wa-domain-dd', () => {
			$dropdown.removeClass('open');
			$search.val('');
			filterVisible('');
		});

		$(document).off('wa:clear-domain').on('wa:clear-domain', function () {
			selected = [];
			syncCheckboxes();
			updateDisplay();
		});

		updateDisplay();
		return true;
	}

	if (!attach()) {
		const obs = new MutationObserver(function (_, o) { if (attach()) o.disconnect(); });
		obs.observe(document.body, { childList: true, subtree: true });
	}
}

function wa_build_month_select(report, fieldname, allMonths, defaultVal) {
	const filter = report.get_filter(fieldname);
	if (!filter) return;

	function attach() {
		const $wrapper = filter.$wrapper;
		if (!$wrapper || !$wrapper.length) return false;
		if ($wrapper.find('.wa-month-wrap').length) return true;

		$wrapper.find('select').css({ 'position': 'absolute', 'opacity': '0', 'pointer-events': 'none', 'height': '0' });

		let selected = defaultVal || allMonths[0];

		const $wrap = $(`
			<div class="wa-month-wrap" style="position:relative;display:inline-block;width:100%;min-width:0;">
				<div class="wa-month-display" style="
					border:1px solid var(--border-color,#d1d8dd);border-radius:6px;
					padding:6px 32px 6px 10px;font-size:13px;
					color:var(--text-color,#333);background:var(--control-bg,#fff);
					cursor:pointer;user-select:none;white-space:nowrap;overflow:hidden;
					text-overflow:ellipsis;width:100%;min-width:100px;
					height:34px;display:flex;align-items:center;box-sizing:border-box;">
					<span class="wa-month-val">${selected}</span>
				</div>
				<span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);
				             pointer-events:none;color:var(--text-muted,#8d99a6);font-size:10px;">▼</span>
				<div class="wa-month-dropdown" style="
					display:none;position:absolute;top:calc(100% + 4px);left:0;
					width:max-content;min-width:100%;max-width:200px;
					background:var(--card-bg,#fff);
					border:1px solid var(--border-color,#d1d8dd);border-radius:8px;
					box-shadow:0 8px 24px rgba(0,0,0,0.13);z-index:99999;
					max-height:220px;overflow-y:auto;">
					${allMonths.map(m => `
						<div class="wa-month-opt${m === selected ? ' wa-month-active' : ''}" data-val="${m}"
						     style="padding:8px 14px;font-size:13px;cursor:pointer;
						            color:var(--text-color,#333);white-space:nowrap;
						            ${m === selected ? 'background:#1a56db;color:#fff;font-weight:600;' : ''}">
							${m}
						</div>
					`).join('')}
				</div>
			</div>
		`);
		$wrapper.append($wrap);

		const $display  = $wrap.find('.wa-month-display');
		const $dropdown = $wrap.find('.wa-month-dropdown');
		const $val      = $wrap.find('.wa-month-val');

		function setSelected(val) {
			selected = val;
			$val.text(val);
			$dropdown.find('.wa-month-opt').each(function () {
				const active = $(this).data('val') === val;
				$(this).css({
					'background':  active ? '#1a56db' : '',
					'color':       active ? '#fff' : 'var(--text-color,#333)',
					'font-weight': active ? '600' : ''
				});
			});
			filter.set_value(val);
			setTimeout(() => report.refresh(), 120);
		}

		$display.on('click', function (e) {
			e.stopPropagation();
			const wasOpen = $dropdown.is(':visible');
			$('.wa-month-dropdown').hide();
			$('.wa-select-dropdown').removeClass('open');
			if (!wasOpen) {
				$dropdown.show();
				const $active = $dropdown.find('.wa-month-opt').filter(function () { return $(this).data('val') === selected; });
				if ($active.length) $dropdown.scrollTop($active.offset().top - $dropdown.offset().top - 80);
			}
		});

		$dropdown.find('.wa-month-opt').on('click', function (e) {
			e.stopPropagation();
			setSelected($(this).data('val'));
			$dropdown.hide();
		});

		$dropdown.on('click mousedown', e => e.stopPropagation());
		$(document).off(`click.wa-month-${fieldname}`).on(`click.wa-month-${fieldname}`, () => $dropdown.hide());
		$dropdown.css({ 'scrollbar-width': 'thin' });

		return true;
	}

	if (!attach()) {
		const obs = new MutationObserver((_, o) => { if (attach()) o.disconnect(); });
		obs.observe(document.body, { childList: true, subtree: true });
	}
}


// ═══════════════════════════════════════════════════════════════════
// Summary Cards
// ═══════════════════════════════════════════════════════════════════
function wa_inject_cards(report) {
	if ($('#wa-cards-wrap').length) return;

	const $cards = $(`
		<div id="wa-cards-wrap" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 16px;width:70%;padding: 12px;">

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

	if ($('#wa-chart-wrap').length) {
		$('#wa-chart-wrap').before($cards);
	} else {
		$('.page-form').before($cards);
	}

	$('#wa-card-purchase').on('click', function () {
		const domain_raw = frappe.query_report.get_filter_value('domain') || '';
		const domains    = domain_raw.split(',').map(d => d.trim()).filter(Boolean);
		if (!domains.length) {
			frappe.show_alert({ message: 'Please select a primary domain first', indicator: 'orange' }, 3);
			return;
		}
		wa_open_invoice_popup(report, domain_raw, 'purchase');
	});

	$('#wa-card-sale').on('click', function () {
		const domain_raw = frappe.query_report.get_filter_value('domain') || '';
		const domains    = domain_raw.split(',').map(d => d.trim()).filter(Boolean);
		if (!domains.length) {
			frappe.show_alert({ message: 'Please select a primary domain first', indicator: 'orange' }, 3);
			return;
		}
		wa_open_invoice_popup(report, domain_raw, 'sale');
	});

	$('#wa-card-margin').on('click', function () {
		wa_open_margin_popup(report);
	});
}


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

			const domain_raw  = frappe.query_report.get_filter_value('domain') || '';
			const sel_domains = domain_raw.split(',').map(d => d.trim()).filter(Boolean);
			const all_count   = frappe.query_report._all_domain_count || 0;

			let subtitle;
			if (!sel_domains.length || sel_domains.length >= all_count) {
				subtitle = `All domains (${d.total_domains})`;
			} else if (sel_domains.length === 1) {
				subtitle = sel_domains[0];
			} else {
				subtitle = `${sel_domains.length} domains selected`;
			}

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
// Clear button + Export + Compare + Monthly Overview
// ═══════════════════════════════════════════════════════════════════
function wa_inject_clear_button(report) {
	if ($('#wa-clear-btn').length) return;

	const $btn = $(`
		<button id="wa-clear-btn" class="btn btn-default"
		        style="margin-left:8px;height:34px;padding:0 12px;font-size:13px;
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

	const $export_btn = $(`
		<div id="wa-export-wrap" class="dropdown" style="display:inline-block;margin-left:8px;vertical-align:middle;">
			<button class="btn btn-default dropdown-toggle" data-toggle="dropdown"
			        style="height:34px;padding:0 12px;font-size:13px;
			               display:inline-flex;align-items:center;gap:5px;
			               border:1px solid var(--border-color,#d1d8dd);
			               background:var(--card-bg,#fff);color:var(--text-color,#333);
			               border-radius:6px;cursor:pointer;">
				<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
					<polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
				Export
			</button>
			<ul class="dropdown-menu dropdown-menu-right" style="min-width:180px;">
				<li><a class="wa-export-opt" data-type="summary"  style="padding:8px 16px;cursor:pointer;display:block;">📊 Summary</a></li>
				<li><a class="wa-export-opt" data-type="purchase" style="padding:8px 16px;cursor:pointer;display:block;">🔵 Purchase Details</a></li>
				<li><a class="wa-export-opt" data-type="sale"     style="padding:8px 16px;cursor:pointer;display:block;">🟢 Sale Details</a></li>
				<li role="separator" class="divider"></li>
				<li><a class="wa-export-opt" data-type="all"      style="padding:8px 16px;cursor:pointer;display:block;font-weight:600;">📁 All (Combined Excel)</a></li>
			</ul>
		</div>
	`);

	const $compare_btn = $(`
		<button id="wa-compare-btn" class="btn btn-default"
		        style="margin-left:8px;height:34px;padding:0 12px;font-size:13px;
		               display:inline-flex;align-items:center;gap:5px;
		               border:1px solid var(--border-color,#d1d8dd);
		               background:var(--card-bg,#fff);color:var(--text-color,#333);
		               border-radius:6px;cursor:pointer;vertical-align:middle;">
			<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
				<line x1="6" y1="20" x2="6" y2="14"/>
			</svg>
			Compare Domains
		</button>
	`);

	const $overview_btn = $(`
		<button id="wa-overview-btn" class="btn btn-default"
		        style="margin-left:8px;height:34px;padding:0 12px;font-size:13px;
		               display:inline-flex;align-items:center;gap:5px;
		               border:1px solid var(--border-color,#d1d8dd);
		               background:var(--card-bg,#fff);color:var(--text-color,#333);
		               border-radius:6px;cursor:pointer;vertical-align:middle;">
			<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
				<line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
			</svg>
			Monthly Overview
		</button>
	`);

	$('.page-form').append($btn).append($export_btn).append($compare_btn).append($overview_btn);

	$btn.on('click', function () {
		$('.wa-select-display').html('<span style="color:var(--text-muted,#aaa)">Select domain...</span>');
		$('.wa-select-dropdown').removeClass('open');
		$(document).trigger('wa:clear-domain');

		const df = report.get_filter('domain');
		if (df) df.set_value('');

		frappe.call({
			method: "workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_filter_options",
			callback: function (r) {
				if (!r.message) return;
				const { months } = r.message;
				const ff = report.get_filter('from_month');
				const tf = report.get_filter('to_month');
				if (ff && months.length) { ff.set_value(months[0]); }
				if (tf && months.length) { tf.set_value(months[months.length - 1]); }

				$('.page-form [data-fieldname="from_month"] .wa-month-val').text(months[0] || '');
				$('.page-form [data-fieldname="to_month"] .wa-month-val').text(months[months.length - 1] || '');

				$('#wa-val-purchase, #wa-val-sale, #wa-val-margin').css('color', 'var(--text-color,#111)').text('—');
				wa_refresh_cards(report);
				frappe.query_report.refresh();
			}
		});
	});
}


// ═══════════════════════════════════════════════════════════════════
// Shared helpers
// ═══════════════════════════════════════════════════════════════════
function wa_fmt(n) {
	return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

// ── Date format helper — YYYY-MM-DD → DD-MM-YYYY ─────────────────
function wa_fmt_date(d) {
	if (!d) return '';
	const parts = String(d).split('-');
	if (parts.length !== 3) return d;
	return parts[2] + '-' + parts[1] + '-' + parts[0];
}

function wa_entries_table(child_rows, doc_name, url_prefix) {
	if (!child_rows || !child_rows.length) return '<p style="color:#9ca3af;font-size:12px;padding:6px 0;">No entries</p>';

	var open_btn = '';
	if (doc_name && url_prefix) {
		open_btn = '<div style="display:flex;justify-content:flex-end;margin-top:8px;">'
			+ '<a href="/app/' + url_prefix + '/' + doc_name + '#domain_details" target="_blank"'
			+ ' style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:#1e40af;'
			+ 'border:1px solid #bfdbfe;border-radius:5px;padding:4px 10px;background:#eff6ff;text-decoration:none;">'
			+ '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">'
			+ '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>'
			+ '<polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'
			+ '</svg>Open Invoice: ' + doc_name + '</a></div>';
	}

	var rows_html = child_rows.map(function(r, i) {
		var bg = i % 2 === 0 ? 'var(--card-bg,#fff)' : 'var(--bg-color,#f9fafb)';
		return '<tr style="background:' + bg + '">'
			+ '<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">' + wa_fmt_date(r.start_date) + '</td>'
			+ '<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">' + wa_fmt_date(r.end_date) + '</td>'
			+ '<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">' + (r.description || '') + '</td>'
			+ '<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">' + (r.order_name  || '') + '</td>'
			+ '<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">' + (r.po_number   || '') + '</td>'
			+ '<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;">' + r.quantity + '</td>'
			+ '<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;font-family:monospace;">' + wa_fmt(r.amount) + '</td>'
			+ '</tr>';
	}).join('');

	return '<table style="width:100%;border-collapse:collapse;font-size:11px;background:var(--bg-color,#f9fafb);">'
		+ '<thead><tr style="background:var(--border-color,#e5e7eb);">'
		+ '<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Start Date</th>'
		+ '<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">End Date</th>'
		+ '<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Description</th>'
		+ '<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">Order Name</th>'
		+ '<th style="padding:5px 10px;text-align:left;color:var(--text-muted,#6b7280);">PO Number</th>'
		+ '<th style="padding:5px 10px;text-align:right;color:var(--text-muted,#6b7280);">Qty</th>'
		+ '<th style="padding:5px 10px;text-align:right;color:var(--text-muted,#6b7280);">Amount</th>'
		+ '</tr></thead><tbody>' + rows_html + '</tbody></table>' + open_btn;
}

function wa_child_table_html(child_rows, doc_name, url_prefix) {
	if (!child_rows || !child_rows.length) return '<p style="color:#9ca3af;font-size:12px;padding:6px 0;">No entries</p>';

	const open_btn = doc_name && url_prefix ? `
		<div style="display:flex;justify-content:flex-end;margin-top:8px;">
			<a href="/app/${url_prefix}/${doc_name}#domain_details" target="_blank"
			   style="display:inline-flex;align-items:center;gap:5px;
			          font-size:11px;font-weight:600;color:#1e40af;
			          border:1px solid #bfdbfe;border-radius:5px;
			          padding:4px 10px;background:#eff6ff;text-decoration:none;"
			   onmouseover="this.style.background='#dbeafe'"
			   onmouseout="this.style.background='#eff6ff'">
				<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
					<polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
				</svg>
				Open Invoice: ${doc_name}
			</a>
		</div>` : '';

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
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${wa_fmt_date(r.start_date)}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${wa_fmt_date(r.end_date)}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.description || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.order_name || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);">${r.po_number || ''}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;">${r.quantity}</td>
				<td style="padding:5px 10px;border-bottom:1px solid var(--border-color,#e5e7eb);text-align:right;font-family:monospace;">${wa_fmt(r.amount)}</td>
			</tr>`).join('')}
		</tbody>
	</table>
	${open_btn}`;
}

function wa_invoice_table_html(invoices, color, url_prefix, id_prefix) {
	if (!invoices || !invoices.length) return '<p style="color:#9ca3af;font-size:12px;padding:6px 0;">No data</p>';

	const table_id  = `tbl-${id_prefix}`;
	const light_bg  = '#f3f3f3';
	const light_bdr = '#e0e0e0';

	return `
	<table id="${table_id}" style="width:100%;border-collapse:collapse;font-size:12px;margin-top:6px;">
		<thead>
			<tr style="background:${light_bg};border-bottom:2px solid ${light_bdr};">
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
				<tr id="${row_id}" style="display:none;background:#fff;">
					<td colspan="5" style="padding:8px 16px;border-bottom:1px solid var(--border-color,#e2e8f0);">
						${wa_child_table_html(inv.child_rows, inv.doc_name, url_prefix)}
					</td>
				</tr>`;
			}).join('')}
		</tbody>
	</table>`;
}

function wa_bind_entries(d) {
	setTimeout(() => {
		d.$wrapper.find('.wa-entries-btn').on('click', function () {
			const $row = d.$wrapper.find('#' + $(this).data('target'));
			$row.toggle(!$row.is(':visible'));
		});

		d.$wrapper.find('.wa-popup-search').on('input', function () {
			const q      = this.value.toLowerCase().trim();
			const tbl_id = $(this).data('table');
			const $tbl   = d.$wrapper.find('#' + tbl_id);

			$tbl.find('.wa-inv-row').each(function () {
				const text    = $(this).text().toLowerCase();
				const matches = !q || text.includes(q);
				$(this).toggle(matches);
				const entries_id = $(this).next('tr').attr('id');
				if (entries_id) d.$wrapper.find('#' + entries_id).toggle(matches && false);
			});
		});
	}, 100);
}


// ═══════════════════════════════════════════════════════════════════
// Month detail popup
// ═══════════════════════════════════════════════════════════════════
window.wa_show_month_detail = function (month) {
	const domain_raw = frappe.query_report.get_filter_value('domain') || '';
	const domains    = domain_raw.split(',').map(d => d.trim()).filter(Boolean);

	if (!domains.length) {
		frappe.show_alert({ message: 'Please select a domain first', indicator: 'orange' }, 3);
		return;
	}

	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_month_detail',
		args:   { domain: domain_raw, month },
		callback: function (r) {
			if (!r.message || !r.message.length) {
				frappe.msgprint(`No data for ${domain_raw} — ${month}`);
				return;
			}

			const by_domain = {};
			r.message.forEach(row => {
				const d = row.domain || domains[0];
				if (!by_domain[d]) by_domain[d] = [];
				by_domain[d].push(row);
			});

			const domain_keys = Object.keys(by_domain);
			if (domain_keys.length === 1 && domain_keys[0] === domains[0]) {
				_render_month_popup(domains[0], month, r.message);
			} else {
				_render_multi_domain_popup(domains, month, by_domain, r.message);
			}
		}
	});
};

function _render_month_popup(domain, month, rows) {
	const purchase = rows.filter(x => x.type === 'Purchase');
	const sale     = rows.filter(x => x.type === 'Sale');
	const totalP   = purchase.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
	const totalS   = sale.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
	const balance  = totalS - totalP;
	const bColor   = balance >= 0 ? '#15803d' : '#dc2626';

	const html = `
	<div>
		<div style="display:grid;grid-template-columns:repeat(3,minmax(0,140px));gap:8px;margin-bottom:14px;">
			<div style="border:1px solid #e0e0e0;border-left:3px solid #3b82f6;border-radius:6px;padding:5px 8px;background:#fff;">
				<div style="font-size:10px;font-weight:600;color:#000;letter-spacing:.5px;margin-bottom:4px;">PURCHASE</div>
				<div style="font-size:12px;font-weight:700;color:#000;font-family:monospace;">${wa_fmt(totalP)}</div>
			</div>
			<div style="border:1px solid #e0e0e0;border-left:3px solid #22c55e;border-radius:6px;padding:5px 8px;background:#fff;">
				<div style="font-size:10px;font-weight:600;color:#000;letter-spacing:.5px;margin-bottom:4px;">SALE</div>
				<div style="font-size:12px;font-weight:700;color:#000;font-family:monospace;">${wa_fmt(totalS)}</div>
			</div>
			<div style="border:1px solid #e0e0e0;border-left:3px solid #a855f7;border-radius:6px;padding:5px 8px;background:#fff;">
				<div style="font-size:10px;font-weight:600;color:#6b21a8;letter-spacing:.5px;margin-bottom:4px;">BALANCE</div>
				<div style="font-size:12px;font-weight:700;color:${bColor};font-family:monospace;">${balance >= 0 ? '+' : '-'}${wa_fmt(balance)}</div>
			</div>
		</div>
		<div style="font-size:11px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;">Purchase Invoice</div>
		${wa_invoice_table_html(purchase, '#1e40af', 'purchase-invoice', 'mpd-p')}
		<div style="font-size:11px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:.6px;margin:16px 0 8px;">Sale Invoice</div>
		${wa_invoice_table_html(sale, '#15803d', 'sale-invoice', 'mpd-s')}
	</div>`;

	const d = new frappe.ui.Dialog({
		title:  `${domain} — ${month}`,
		fields: [{ fieldname: 'body', fieldtype: 'HTML', options: html }],
		size:   'extra-large'
	});
	d.show();
	wa_bind_entries(d);
}

function _render_multi_domain_popup(domains, month, by_domain, all_rows) {
	const all_p   = all_rows.filter(x => x.type === 'Purchase');
	const all_s   = all_rows.filter(x => x.type === 'Sale');
	const totalP  = all_p.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
	const totalS  = all_s.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
	const balance = totalS - totalP;
	const bColor  = balance >= 0 ? '#15803d' : '#dc2626';

	const domain_sections = domains.map(dom => {
		const rows     = by_domain[dom] || [];
		const purchase = rows.filter(x => x.type === 'Purchase');
		const sale     = rows.filter(x => x.type === 'Sale');
		const dp       = purchase.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
		const ds       = sale.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
		const db       = ds - dp;
		const dc       = db >= 0 ? '#15803d' : '#dc2626';

		if (!rows.length) return `
			<div data-domain="${dom}" style="margin-bottom:12px;border:1px solid var(--border-color,#e2e8f0);border-radius:8px;padding:10px 16px;">
				<div style="font-size:13px;font-weight:700;color:#374151;margin-bottom:4px;">${dom}</div>
				<p style="color:#9ca3af;font-size:12px;margin:0;">No data for this month</p>
			</div>`;

		const dom_key = dom.replace(/[\.\-]/g, '_');
		return `
		<div data-domain="${dom}" style="margin-bottom:12px;border:1px solid var(--border-color,#e2e8f0);border-radius:8px;padding:14px 16px;">
			<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
				<div style="font-size:13px;font-weight:700;color:#1e40af;">${dom}</div>
				<div style="display:flex;gap:16px;font-size:12px;font-family:monospace;">
					<span style="color:#1e40af;">P: ${wa_fmt(dp)}</span>
					<span style="color:#15803d;">S: ${wa_fmt(ds)}</span>
					<span style="color:${dc};font-weight:700;">${db >= 0 ? '+' : '-'}${wa_fmt(db)}</span>
				</div>
			</div>
			${purchase.length ? `
				<div style="font-size:10px;font-weight:600;color:#000;text-transform:uppercase;margin-bottom:6px;">Purchase</div>
				${wa_invoice_table_html(purchase, '#1e40af', 'purchase-invoice', `mpd-p-${dom_key}`)}
			` : ''}
			${sale.length ? `
				<div style="font-size:10px;font-weight:600;color:#000;text-transform:uppercase;margin:10px 0 6px;">Sale</div>
				${wa_invoice_table_html(sale, '#15803d', 'sale-invoice', `mpd-s-${dom_key}`)}
			` : ''}
		</div>`;
	}).join('');

	const html = `
	<div>
		<div style="display:grid;grid-template-columns:repeat(3,minmax(0,140px));gap:8px;margin-bottom:12px;">
			<div style="border:1px solid #e0e0e0;border-left:3px solid #3b82f6;border-radius:6px;padding:5px 8px;background:#fff;">
				<div style="font-size:10px;font-weight:600;color:#000;margin-bottom:4px;">TOTAL PURCHASE</div>
				<div style="font-size:12px;font-weight:700;color:#000;font-family:monospace;">${wa_fmt(totalP)}</div>
			</div>
			<div style="border:1px solid #e0e0e0;border-left:3px solid #22c55e;border-radius:6px;padding:5px 8px;background:#fff;">
				<div style="font-size:10px;font-weight:600;color:#000;margin-bottom:4px;">TOTAL SALE</div>
				<div style="font-size:12px;font-weight:700;color:#000;font-family:monospace;">${wa_fmt(totalS)}</div>
			</div>
			<div style="border:1px solid #e0e0e0;border-left:3px solid #a855f7;border-radius:6px;padding:5px 8px;background:#fff;">
				<div style="font-size:10px;font-weight:600;color:#000;margin-bottom:4px;">TOTAL BALANCE</div>
				<div style="font-size:12px;font-weight:700;color:${bColor};font-family:monospace;">${balance >= 0 ? '+' : '-'}${wa_fmt(balance)}</div>
			</div>
		</div>

		${domains.length > 2 ? `
		<div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
			<div style="display:flex;align-items:center;gap:6px;
			            border:1px solid var(--border-color,#d1d8dd);border-radius:6px;
			            padding:4px 10px;background:var(--card-bg,#fff);width:220px;">
				<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24">
					<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
				</svg>
				<input id="wa-multi-domain-search" type="text" placeholder="Search domain..."
				       style="border:none;outline:none;background:transparent;font-size:12px;width:100%;">
			</div>
		</div>` : ''}

		<div id="wa-domain-sections" style="max-height:420px;overflow-y:auto;padding-right:4px;">
			${domain_sections}
		</div>
	</div>`;

	const d = new frappe.ui.Dialog({
		title:  `${domains.length} Domains — ${month}`,
		fields: [{ fieldname: 'body', fieldtype: 'HTML', options: html }],
		size:   'extra-large'
	});
	d.show();
	wa_bind_entries(d);

	if (domains.length > 2) {
		setTimeout(() => {
			d.$wrapper.find('#wa-multi-domain-search').on('input', function () {
				const q = this.value.toLowerCase().trim();
				d.$wrapper.find('#wa-domain-sections > div[data-domain]').each(function () {
					$(this).toggle(!q || $(this).data('domain').includes(q));
				});
			});
		}, 150);
	}
}


// ═══════════════════════════════════════════════════════════════════
// Purchase / Sale card popup
// ═══════════════════════════════════════════════════════════════════
function wa_open_invoice_popup(report, domain_raw, inv_type) {
	const domains    = domain_raw.split(',').map(d => d.trim()).filter(Boolean);
	const from_month = frappe.query_report.get_filter_value('from_month') || '';
	const to_month   = frappe.query_report.get_filter_value('to_month')   || '';
	const color      = inv_type === 'purchase' ? '#1e40af' : '#15803d';
	const label      = inv_type === 'purchase' ? 'Purchase' : 'Sale';
	const url_prefix = inv_type === 'purchase' ? 'purchase-invoice' : 'sale-invoice';

	const promises = domains.map(dom => new Promise(resolve => {
		frappe.call({
			method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_domain_all_months',
			args:   { domain: dom, from_month, to_month, inv_type },
			callback: r => resolve({ domain: dom, months: r.message || [] })
		});
	}));

	Promise.all(promises).then(results => {
		const grand_total = results.reduce((s, r) => s + r.months.reduce((ms, m) => ms + m.total_amount, 0), 0);

		if (domains.length === 1) {
			const months_data = results[0].months;
			if (!months_data.length) { frappe.msgprint(`No ${label} data`); return; }

			let all_rows = [];
			months_data.forEach(m => {
				(m.invoices || []).forEach((inv, i) => {
					all_rows.push({ ...inv, month: m.month, row_id: `inv-${inv_type}-${m.month.replace(' ','-')}-${i}` });
				});
			});

			const rows_html = all_rows.map((inv, i) => `
				<tr class="wa-inv-row" style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);white-space:nowrap;color:${color};font-weight:600;">${inv.month}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.invoice_number}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.subscription}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#000;">${wa_fmt(inv.amount)}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;">${inv.quantity}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:center;white-space:nowrap;display:flex;gap:4px;justify-content:center;">
						${inv_type === 'sale'
							? `<button class="btn btn-xs btn-default wa-entries-btn"
							           data-target="sale-entry-${i}" style="font-size:10px;">Entries</button>`
							: ''
						}
						<a href="/app/${url_prefix}/${inv.doc_name}${inv_type === 'sale' ? '#subscription=' + encodeURIComponent(inv.subscription) : ''}" target="_blank"
						   class="btn btn-xs btn-primary"
						   style="font-size:10px;text-decoration:none;">Open</a>
					</td>
				</tr>
				${inv_type === 'sale' ? `
				<tr id="sale-entry-${i}" style="display:none;">
					<td colspan="6" style="padding:8px 16px;background:#fff;border-bottom:1px solid var(--border-color,#e2e8f0);">
						${wa_entries_table(inv.child_rows || [], inv.doc_name || '', url_prefix)}
					</td>
				</tr>` : ''}
			`).join('');

			const html = `
			<div style="display:flex;justify-content:space-between;align-items:center;
			            padding:10px 14px;background:var(--bg-color,#f8fafc);border-radius:6px;margin-bottom:12px;">
				<span style="font-size:12px;color:var(--text-muted,#6b7280);">Domain: <strong>${domains[0]}</strong></span>
				<span style="font-size:14px;font-weight:700;color:${color};font-family:monospace;">Total: ${wa_fmt(grand_total)}</span>
			</div>
			<div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
				<div style="display:flex;align-items:center;gap:6px;border:1px solid var(--border-color,#d1d8dd);
				            border-radius:6px;padding:4px 10px;background:var(--card-bg,#fff);width:220px;">
					<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
					</svg>
					<input id="wa-inv-search" type="text" placeholder="Search..."
					       style="border:none;outline:none;background:transparent;font-size:12px;width:100%;">
				</div>
			</div>
			<table id="wa-inv-table" style="width:100%;border-collapse:collapse;font-size:12px;">
				<thead>
					<tr style="background:#f3f3f3;border-bottom:2px solid #e0e0e0;">
						<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;">Month</th>
						<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;">Invoice No</th>
						<th style="padding:8px 12px;text-align:left;color:#000;font-size:11px;">Subscription</th>
						<th style="padding:8px 12px;text-align:right;color:#000;font-size:11px;">Amount</th>
						<th style="padding:8px 12px;text-align:right;color:#000;font-size:11px;">Qty</th>
						<th style="padding:8px 12px;text-align:center;color:#000;font-size:11px;width:70px;"></th>
					</tr>
				</thead>
				<tbody>${rows_html}</tbody>
			</table>`;

			const d = new frappe.ui.Dialog({
				title:  `${domains[0]} — ${label} Invoice (All Months)`,
				fields: [{ fieldname: 'body', fieldtype: 'HTML', options: html }],
				size:   'extra-large'
			});
			d.show();

			d.$wrapper.on('click', '.wa-entries-btn', function () {
				const target = $(this).data('target');
				const $row   = d.$wrapper.find('#' + target);
				if ($row.length) $row.toggle();
			});

			d.$wrapper.on('input', '#wa-inv-search', function () {
				const q = this.value.toLowerCase().trim();
				d.$wrapper.find('.wa-inv-row').each(function () {
					$(this).toggle(!q || $(this).text().toLowerCase().includes(q));
				});
			});

		} else {
			const sections_html = results.map(({ domain: dom, months }) => {
				const dom_total = months.reduce((s, m) => s + m.total_amount, 0);
				const dom_key   = dom.replace(/[\.\-]/g, '_');
				if (!months.length) return `
					<div data-domain="${dom}" style="margin-bottom:10px;border:1px solid var(--border-color,#e2e8f0);border-radius:8px;padding:10px 16px;">
						<div style="font-size:13px;font-weight:700;color:${color};">${dom}</div>
						<p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">No data</p>
					</div>`;

				let inv_rows = [];
				months.forEach(m => {
					(m.invoices || []).forEach((inv, i) => {
						inv_rows.push({ ...inv, month: m.month, row_id: `inv-${dom_key}-${m.month.replace(' ','-')}-${i}` });
					});
				});

				const rows_html = inv_rows.map((inv, i) => `
					<tr class="wa-inv-row" style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
						<td style="padding:6px 10px;border-bottom:1px solid var(--border-color,#f1f5f9);white-space:nowrap;color:${color};font-weight:600;">${inv.month}</td>
						<td style="padding:6px 10px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.invoice_number}</td>
						<td style="padding:6px 10px;border-bottom:1px solid var(--border-color,#f1f5f9);">${inv.subscription}</td>
						<td style="padding:6px 10px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#000;">${wa_fmt(inv.amount)}</td>
						<td style="padding:6px 10px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;">${inv.quantity}</td>
						<td style="padding:6px 10px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:center;">
							<a href="/app/${url_prefix}/${inv.doc_name}" target="_blank"
							   class="btn btn-xs btn-primary"
							   style="font-size:10px;text-decoration:none;">Open</a>
						</td>
					</tr>
				`).join('');

				return `
				<div data-domain="${dom}" style="margin-bottom:10px;border:1px solid var(--border-color,#e2e8f0);border-radius:8px;padding:12px 16px;">
					<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
						<div style="font-size:13px;font-weight:700;color:${color};">${dom}</div>
						<span style="font-family:monospace;font-size:13px;font-weight:700;color:${color};">Total: ${wa_fmt(dom_total)}</span>
					</div>
					<table style="width:100%;border-collapse:collapse;font-size:12px;">
						<thead>
							<tr style="background:#f3f3f3;border-bottom:2px solid #e0e0e0;">
								<th style="padding:6px 10px;text-align:left;color:#000;font-size:11px;">Month</th>
								<th style="padding:6px 10px;text-align:left;color:#000;font-size:11px;">Invoice No</th>
								<th style="padding:6px 10px;text-align:left;color:#000;font-size:11px;">Subscription</th>
								<th style="padding:6px 10px;text-align:right;color:#000;font-size:11px;">Amount</th>
								<th style="padding:6px 10px;text-align:right;color:#000;font-size:11px;">Qty</th>
								<th style="padding:6px 10px;color:#000;font-size:11px;width:70px;"></th>
							</tr>
						</thead>
						<tbody>${rows_html}</tbody>
					</table>
				</div>`;
			}).join('');

			const html = `
			<div style="display:flex;justify-content:space-between;align-items:center;
			            padding:10px 14px;background:var(--bg-color,#f8fafc);border-radius:6px;margin-bottom:10px;">
				<span style="font-size:12px;color:var(--text-muted,#6b7280);">${domains.length} domains selected</span>
				<span style="font-size:14px;font-weight:700;color:${color};font-family:monospace;">Grand Total: ${wa_fmt(grand_total)}</span>
			</div>
			${domains.length > 2 ? `
			<div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
				<div style="display:flex;align-items:center;gap:6px;
				            border:1px solid var(--border-color,#d1d8dd);border-radius:6px;
				            padding:4px 10px;background:var(--card-bg,#fff);width:220px;">
					<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
					</svg>
					<input id="wa-card-domain-search" type="text" placeholder="Search domain..."
					       style="border:none;outline:none;background:transparent;font-size:12px;width:100%;">
				</div>
			</div>` : ''}
			<div id="wa-card-sections" style="max-height:460px;overflow-y:auto;padding-right:4px;">
				${sections_html}
			</div>`;

			const d = new frappe.ui.Dialog({
				title:  `${label} Invoice — ${domains.length} Domains (All Months)`,
				fields: [{ fieldname: 'body', fieldtype: 'HTML', options: html }],
				size:   'extra-large'
			});
			d.show();
			wa_bind_entries(d);
			if (domains.length > 2) {
				setTimeout(() => {
					d.$wrapper.find('#wa-card-domain-search').on('input', function () {
						const q = this.value.toLowerCase().trim();
						d.$wrapper.find('#wa-card-sections > div[data-domain]').each(function () {
							$(this).toggle(!q || $(this).data('domain').includes(q));
						});
					});
				}, 150);
			}
		}
	});
}


// ═══════════════════════════════════════════════════════════════════
// Margin popup
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
			<div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
				<div style="display:flex;align-items:center;gap:6px;
				            border:1px solid var(--border-color,#d1d8dd);border-radius:6px;
				            padding:4px 10px;background:var(--card-bg,#fff);width:220px;">
					<svg width="13" height="13" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
					</svg>
					<input type="text" id="wa-margin-search" placeholder="Search domain..."
					       style="border:none;outline:none;background:transparent;font-size:12px;width:100%;">
				</div>
			</div>
			<div style="max-height:460px;overflow-y:auto;padding-right:4px;">
			<table id="wa-margin-tbl" style="width:100%;border-collapse:collapse;font-size:12px;">
				<thead>
					<tr style="background:#f3f3f3;border-bottom:2px solid #e0e0e0;">
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
							<td style="padding:8px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#000;">${wa_fmt(d.purchase)}</td>
							<td style="padding:8px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;color:#000;">${wa_fmt(d.sale)}</td>
							<td style="padding:8px 14px;border-bottom:1px solid var(--border-color,#f1f5f9);text-align:right;font-family:monospace;font-weight:700;color:${mc};">${sign}${wa_fmt(d.margin)}</td>
						</tr>`;
					}).join('')}
				</tbody>
			</table>
			</div>`;

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


// ═══════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════
$(document).on('click', '.wa-export-opt', function () {
	const type       = $(this).data('type');
	const domain_raw = frappe.query_report.get_filter_value('domain') || '';
	const from_month = frappe.query_report.get_filter_value('from_month') || '';
	const to_month   = frappe.query_report.get_filter_value('to_month') || '';
	const domains    = domain_raw.split(',').map(d => d.trim()).filter(Boolean);

	if (type !== 'all' && !domains.length) {
		frappe.show_alert({ message: 'Please select a domain first, then export', indicator: 'orange' }, 4);
		return;
	}

	const export_domain = type === 'all' ? '' : domain_raw;
	const all_count = frappe.query_report._all_domain_count || 999;
	const heading   = type === 'all' ? 'All Domain Data' :
	                  domains.length === 1        ? domains[0]        :
	                  domains.length >= all_count ? 'All Domain Data' :
	                  domains.join(', ');

	const label_map = { summary: 'Summary', purchase: 'Purchase', sale: 'Sale', all: 'All' };
	frappe.show_alert({ message: `Generating ${label_map[type] || ''} Excel...`, indicator: 'blue' }, 3);

	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.generate_excel_export',
		args:   { domain: export_domain, from_month, to_month, heading, export_type: type },
		callback: function (r) {
			if (!r.message) { frappe.show_alert({ message: 'Export failed', indicator: 'red' }, 3); return; }
			const bytes = atob(r.message.content);
			const arr   = new Uint8Array(bytes.length);
			for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
			const blob = new Blob([arr], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			});
			const a   = document.createElement('a');
			a.href     = URL.createObjectURL(blob);
			a.download = r.message.filename;
			a.click();
			frappe.show_alert({ message: `✅ ${r.message.filename} downloaded!`, indicator: 'green' }, 4);
		}
	});
});


// ═══════════════════════════════════════════════════════════════════
// Compare Domains
// ═══════════════════════════════════════════════════════════════════
$(document).on('click', '#wa-compare-btn', function () {
	const domain1    = frappe.query_report.get_filter_value('domain') || '';
	const from_month = frappe.query_report.get_filter_value('from_month') || '';
	const to_month   = frappe.query_report.get_filter_value('to_month') || '';

	if (domain1) {
		frappe.show_alert({ message: 'Please clear domain selection before comparing', indicator: 'orange' }, 4);
		return;
	}

	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_filter_options',
		callback: function(r) {
			const all_domains = (r.message && r.message.domains) || [];
			const has_domain1 = !!domain1;

			const fields = [];
			if (!has_domain1) {
				fields.push({
					fieldname:   'domain1',
					fieldtype:   'Data',
					label:       'First Domain',
					reqd:        1,
					description: 'Type to search...'
				});
			}
			fields.push({
				fieldname:   'domain2',
				fieldtype:   'Data',
				label:       'Second Domain',
				reqd:        1,
				description: has_domain1 ? 'Compare against: ' + domain1 : 'Type to search...'
			});

			const d = new frappe.ui.Dialog({
				title: 'Compare Domains',
				fields: fields,
				primary_action_label: 'Compare',
				primary_action: function (values) {
					const d1 = has_domain1 ? domain1 : (values.domain1 || '').trim();
					const d2 = (values.domain2 || '').trim();
					if (!d1 || !d2) {
						frappe.show_alert({ message: 'Please enter both domains', indicator: 'orange' }, 3);
						return;
					}
					d.hide();
					wa_open_comparison_popup(d1, d2, from_month, to_month);
				}
			});
			d.show();

			function attach_autocomplete(fieldname, exclude) {
				setTimeout(function() {
					const $input = d.$wrapper.find('[data-fieldname="' + fieldname + '"] input');
					if (!$input.length) return;

					const $dropdown = $('<div style="'
						+ 'position:absolute;top:100%;left:0;width:100%;'
						+ 'background:#fff;border:1px solid #d1d5db;border-radius:6px;'
						+ 'box-shadow:0 4px 16px rgba(0,0,0,0.12);z-index:99999;'
						+ 'max-height:200px;overflow-y:auto;display:none;"></div>');
					$input.closest('.frappe-control').css('position', 'relative').append($dropdown);

					function show_suggestions(query) {
						const q    = (query || '').toLowerCase().trim();
						const excl = (exclude || '').toLowerCase();
						const matches = all_domains.filter(function(dom) {
							return (!q || dom.toLowerCase().includes(q)) && dom.toLowerCase() !== excl;
						});
						$dropdown.empty();
						if (!matches.length) { $dropdown.hide(); return; }
						matches.slice(0, 15).forEach(function(dom) {
							const $opt = $('<div style="padding:8px 12px;cursor:pointer;font-size:13px;'
								+ 'color:#111827;border-bottom:1px solid #f3f4f6;">' + dom + '</div>');
							$opt.on('mouseenter', function() { $(this).css('background','#eff6ff'); });
							$opt.on('mouseleave', function() { $(this).css('background',''); });
							$opt.on('mousedown', function(e) {
								e.preventDefault();
								$input.val(dom);
								d.set_value(fieldname, dom);
								$dropdown.hide();
							});
							$dropdown.append($opt);
						});
						$dropdown.show();
					}

					$input.on('input', function() { show_suggestions(this.value); });
					$input.on('focus', function() { show_suggestions(this.value); });
					$input.on('blur',  function() { setTimeout(function() { $dropdown.hide(); }, 200); });
				}, 300);
			}

			if (!has_domain1) attach_autocomplete('domain1', '');
			attach_autocomplete('domain2', domain1);

			d.onhide = function() {
				$(document).off('click.wa-compare-dd');
			};
		}
	});
});

function wa_open_comparison_popup(domain1, domain2, from_month, to_month) {
	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_comparison_data',
		args:   { domain1, domain2, from_month, to_month },
		callback: function (r) {
			if (!r.message || !r.message.length) {
				frappe.msgprint('No comparison data found');
				return;
			}

			const rows_html = r.message.map((row, i) => {
				const d1_color = row.d1_balance >= 0 ? '#15803d' : '#dc2626';
				const d2_color = row.d2_balance >= 0 ? '#15803d' : '#dc2626';
				return `
				<tr style="background:${i%2===0?'var(--card-bg,#fff)':'var(--bg-color,#f9fafb)'}">
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);font-weight:600;">${row.month}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);font-family:monospace;color:#1e40af;">${wa_fmt(row.d1_purchase)}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);font-family:monospace;color:#15803d;">${wa_fmt(row.d1_sale)}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);font-family:monospace;font-weight:700;color:${d1_color};">${row.d1_balance >= 0 ? '' : '-'}${wa_fmt(row.d1_balance)}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);background:var(--border-color,#e5e7eb);"></td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);font-family:monospace;color:#1e40af;">${wa_fmt(row.d2_purchase)}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);font-family:monospace;color:#15803d;">${wa_fmt(row.d2_sale)}</td>
					<td style="padding:7px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);font-family:monospace;font-weight:700;color:${d2_color};">${row.d2_balance >= 0 ? '' : '-'}${wa_fmt(row.d2_balance)}</td>
				</tr>`;
			}).join('');

			const thead_html = '<table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;">'
				+ '<colgroup><col style="width:110px"><col style="width:130px"><col style="width:130px"><col style="width:130px"><col style="width:8px"><col style="width:130px"><col style="width:130px"><col style="width:130px"></colgroup>'
				+ '<thead>'
				+ '<tr style="background:#1e40af;"><th style="padding:8px 12px;text-align:left;color:#fff;">Month</th>'
				+ '<th colspan="3" style="padding:8px 12px;text-align:center;color:#fff;border-right:2px solid #93c5fd;">' + domain1 + '</th>'
				+ '<th style="padding:4px;background:#93c5fd;"></th>'
				+ '<th colspan="3" style="padding:8px 12px;text-align:center;color:#fff;">' + domain2 + '</th></tr>'
				+ '<tr style="background:#eff6ff;"><th style="padding:6px 12px;text-align:left;color:#1e40af;"></th>'
				+ '<th style="padding:6px 12px;text-align:left;color:#1e40af;font-size:11px;">Purchase</th>'
				+ '<th style="padding:6px 12px;text-align:left;color:#15803d;font-size:11px;">Sale</th>'
				+ '<th style="padding:6px 12px;text-align:left;color:#6b21a8;font-size:11px;border-right:2px solid #ddd;">Balance</th>'
				+ '<th style="background:var(--border-color,#e5e7eb);"></th>'
				+ '<th style="padding:6px 12px;text-align:left;color:#1e40af;font-size:11px;">Purchase</th>'
				+ '<th style="padding:6px 12px;text-align:left;color:#15803d;font-size:11px;">Sale</th>'
				+ '<th style="padding:6px 12px;text-align:left;color:#6b21a8;font-size:11px;">Balance</th></tr>'
				+ '</thead></table>';

			const tbody_html = '<div style="max-height:420px;overflow-y:auto;">'
				+ '<table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;">'
				+ '<colgroup><col style="width:110px"><col style="width:130px"><col style="width:130px"><col style="width:130px"><col style="width:8px"><col style="width:130px"><col style="width:130px"><col style="width:130px"></colgroup>'
				+ '<tbody>' + rows_html + '</tbody></table></div>';

			new frappe.ui.Dialog({
				title:  'Comparison: ' + domain1 + ' vs ' + domain2,
				fields: [{ fieldname: 'body', fieldtype: 'HTML', options: thead_html + tbody_html }],
				size:   'extra-large'
			}).show();
		}
	});
}


// ═══════════════════════════════════════════════════════════════════
// Monthly Overview
// ═══════════════════════════════════════════════════════════════════
$(document).on('click', '#wa-overview-btn', function () {
	const domain_raw = frappe.query_report.get_filter_value('domain') || '';
	const from_month = frappe.query_report.get_filter_value('from_month') || '';
	const to_month   = frappe.query_report.get_filter_value('to_month')   || '';

	if (domain_raw) {
		wa_open_overview_popup(domain_raw, from_month, to_month);
		return;
	}

	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_filter_options',
		callback: function(r) {
			const all_domains = (r.message && r.message.domains) || [];

			const d = new frappe.ui.Dialog({
				title: 'Monthly Overview',
				fields: [{
					fieldname:   'domain',
					fieldtype:   'Data',
					label:       'Select Domain',
					reqd:        1,
					description: 'Type to search domain...'
				}],
				primary_action_label: 'View',
				primary_action: function(values) {
					const dom = (values.domain || '').trim();
					if (!dom) return;
					d.hide();
					wa_open_overview_popup(dom, from_month, to_month);
				}
			});
			d.show();

			setTimeout(function() {
				const $input = d.$wrapper.find('[data-fieldname="domain"] input');
				if (!$input.length) return;

				const $dd = $('<div style="position:absolute;top:100%;left:0;width:100%;'
					+ 'background:#fff;border:1px solid #d1d5db;border-radius:6px;'
					+ 'box-shadow:0 4px 16px rgba(0,0,0,0.12);z-index:99999;'
					+ 'max-height:200px;overflow-y:auto;display:none;"></div>');
				$input.closest('.frappe-control').css('position','relative').append($dd);

				function show_dd(q) {
					const query = (q || '').toLowerCase().trim();
					const hits  = all_domains.filter(function(dom) {
						return !query || dom.toLowerCase().includes(query);
					});
					$dd.empty();
					if (!hits.length) { $dd.hide(); return; }
					hits.slice(0, 15).forEach(function(dom) {
						var $opt = $('<div style="padding:8px 12px;cursor:pointer;font-size:13px;'
							+ 'color:#111827;border-bottom:1px solid #f3f4f6;">' + dom + '</div>');
						$opt.on('mouseenter', function() { $(this).css('background','#eff6ff'); });
						$opt.on('mouseleave', function() { $(this).css('background',''); });
						$opt.on('mousedown', function(e) {
							e.preventDefault();
							$input.val(dom);
							d.set_value('domain', dom);
							$dd.hide();
						});
						$dd.append($opt);
					});
					$dd.show();
				}

				$input.on('input', function() { show_dd(this.value); });
				$input.on('focus', function() { show_dd(this.value); });
				$input.on('blur',  function() { setTimeout(function() { $dd.hide(); }, 200); });
			}, 300);
		}
	});
});

function wa_open_overview_popup(domain, from_month, to_month) {
	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_comparison_data',
		args: { domain1: domain, domain2: domain, from_month, to_month },
		callback: function(r) {
			if (!r.message || !r.message.length) {
				frappe.msgprint('No data found for: ' + domain);
				return;
			}

			var rows_html = r.message.map(function(row, i) {
				var bal_color = row.d1_balance >= 0 ? '#15803d' : '#dc2626';
				var bal_sign  = row.d1_balance >= 0 ? '+' : '-';
				var bg        = i % 2 === 0 ? 'var(--card-bg,#fff)' : 'var(--bg-color,#f9fafb)';
				return '<tr style="background:' + bg + '">'
					+ '<td style="padding:8px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);font-weight:600;">' + row.month + '</td>'
					+ '<td style="padding:8px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);font-family:monospace;color:#1e40af;">' + wa_fmt(row.d1_purchase) + '</td>'
					+ '<td style="padding:8px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);font-family:monospace;color:#15803d;">' + wa_fmt(row.d1_sale) + '</td>'
					+ '<td style="padding:8px 12px;border-bottom:1px solid var(--border-color,#f1f5f9);font-family:monospace;font-weight:700;color:' + bal_color + ';">' + bal_sign + wa_fmt(row.d1_balance) + '</td>'
					+ '</tr>';
			}).join('');

			var thead = '<table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;">'
				+ '<colgroup><col style="width:130px"><col style="width:160px"><col style="width:160px"><col style="width:160px"></colgroup>'
				+ '<thead><tr style="background:#1e40af;">'
				+ '<th style="padding:8px 12px;text-align:left;color:#fff;">Month</th>'
				+ '<th style="padding:8px 12px;text-align:left;color:#fff;">Purchase</th>'
				+ '<th style="padding:8px 12px;text-align:left;color:#fff;">Sale</th>'
				+ '<th style="padding:8px 12px;text-align:left;color:#fff;">Balance</th>'
				+ '</tr></thead></table>';

			var tbody = '<div style="max-height:420px;overflow-y:auto;">'
				+ '<table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;">'
				+ '<colgroup><col style="width:130px"><col style="width:160px"><col style="width:160px"><col style="width:160px"></colgroup>'
				+ '<tbody>' + rows_html + '</tbody></table></div>';

			new frappe.ui.Dialog({
				title:  'Monthly Overview — ' + domain,
				fields: [{ fieldname: 'body', fieldtype: 'HTML', options: thead + tbody }],
				size:   'large'
			}).show();
		}
	});
}


// ═══════════════════════════════════════════════════════════════════
// Trend Chart
// ═══════════════════════════════════════════════════════════════════
function wa_inject_chart(report) {
	$('#wa-chart-wrap').remove();

	const domain_val = frappe.query_report.get_filter_value('domain') || '';
	if (!domain_val) return;
	const columns = frappe.query_report.columns || [];
	const data    = frappe.query_report.data    || [];
	if (!data.length) return;

	const rows   = data.filter(r => r.month && r.month !== 'TOTAL');
	const labels = rows.map(r => r.month);

	const p_cols = columns.filter(c => c.fieldname && c.fieldname.startsWith('p_') && c.fieldname.endsWith('_amt'));
	const s_cols = columns.filter(c => c.fieldname && c.fieldname.startsWith('s_') && c.fieldname.endsWith('_amt'));

	const flt    = (v, p) => parseFloat(parseFloat(v || 0).toFixed(p || 2));
	const p_vals = rows.map(r => flt(p_cols.reduce((s, c) => s + flt(r[c.fieldname]), 0), 2));
	const s_vals = rows.map(r => flt(s_cols.reduce((s, c) => s + flt(r[c.fieldname]), 0), 2));

	if (!p_vals.some(v => v > 0) && !s_vals.some(v => v > 0)) return;

	const $wrap = $(`
		<div id="wa-chart-wrap" style="
			margin-bottom:12px;
			background:var(--card-bg,#fff);
			border:1px solid var(--border-color,#e2e8f0);
			border-radius:8px;
			padding:14px 18px;
		">
			<div style="font-size:11px;font-weight:600;color:var(--text-muted,#8d99a6);
			            text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">
				Purchase vs Sale — Monthly Trend
			</div>
			<div id="wa-chart-container"></div>
		</div>
	`);

	if ($('#wa-cards-wrap').length) {
		$('#wa-cards-wrap').after($wrap);
	} else {
		$('.page-form').before($wrap);
	}

	try {
		new frappe.Chart('#wa-chart-container', {
			type:   'axis-mixed',
			height: 180,
			data: {
				labels:   labels,
				datasets: [
					{ name: 'Purchase', values: p_vals, chartType: 'bar', color: '#3b82f6' },
					{ name: 'Sale',     values: s_vals, chartType: 'bar', color: '#22c55e' }
				]
			},
			barOptions: { spaceRatio: 0.4 },
			tooltipOptions: {
				formatTooltipY: v => '₹' + parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })
			},
			axisOptions: { xIsSeries: true }
		});
	} catch(e) {
		$('#wa-chart-wrap').remove();
	}
}

















