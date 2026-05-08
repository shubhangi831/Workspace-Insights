// frappe.query_reports["Workspace Analysis Report"] = {

// 	onload: function (report) {
// 		const MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// 		function mkey(m) {
// 			const [mon, yr] = (m || '').split(' ');
// 			return parseInt(yr) * 100 + MO.indexOf(mon) + 1;
// 		}

// 		const domainFilter = report.get_filter("domain");
// 		if (domainFilter) domainFilter.set_value('');

// 		// ── CSS ──────────────────────────────────────────────────
// 		if (!document.getElementById('wa-report-style')) {
// 			const style = document.createElement('style');
// 			style.id = 'wa-report-style';
// 			style.textContent = `

// 				/* ── Filter bar gap ── */
// 				.workspace-analysis-report .filters-area .filter-selector,
// 				.page-form .col.layout-col {
// 					margin-right: 16px !important;
// 				}
// 				.filters-area .form-group {
// 					margin-right: 20px !important;
// 				}

// 				/* ── Custom domain dropdown ── */
// 				.wa-select-wrap {
// 					position: relative; display: inline-block; width: 100%;
// 				}
// 				.wa-select-display {
// 					border: 1px solid var(--border-color, #d1d8dd);
// 					border-radius: 6px; padding: 6px 32px 6px 10px;
// 					font-size: 13px; color: var(--text-color, #333);
// 					background: var(--control-bg, #fff); cursor: pointer;
// 					user-select: none; white-space: nowrap; overflow: hidden;
// 					text-overflow: ellipsis; min-width: 220px; height: 32px;
// 					display: flex; align-items: center;
// 				}
// 				.wa-select-display:hover { border-color: #1a56db; }
// 				.wa-select-arrow {
// 					position: absolute; right: 10px; top: 50%;
// 					transform: translateY(-50%); pointer-events: none;
// 					color: var(--text-muted, #8d99a6); font-size: 10px;
// 				}
// 				.wa-select-dropdown {
// 					position: absolute; top: calc(100% + 4px); left: 0;
// 					min-width: 100%; width: max-content; max-width: 380px;
// 					background: var(--card-bg, #fff);
// 					border: 1px solid var(--border-color, #d1d8dd);
// 					border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.13);
// 					z-index: 9999; display: none; overflow: hidden;
// 				}
// 				.wa-select-dropdown.open { display: block; }
// 				.wa-search-box {
// 					padding: 8px 10px;
// 					border-bottom: 1px solid var(--border-color, #d1d8dd);
// 					display: flex; align-items: center; gap: 7px;
// 					background: var(--control-bg, #f9f9f9);
// 				}
// 				.wa-search-box svg { flex-shrink: 0; color: var(--text-muted,#8d99a6); }
// 				.wa-search-input {
// 					border: none; outline: none; background: transparent;
// 					font-size: 13px; width: 100%; color: var(--text-color,#333);
// 				}
// 				.wa-search-input::placeholder { color: var(--text-muted,#aaa); }
// 				.wa-options-list { max-height: 240px; overflow-y: auto; padding: 4px 0; }
// 				.wa-option {
// 					padding: 8px 12px; font-size: 13px; cursor: pointer;
// 					color: var(--text-color,#333); white-space: nowrap; transition: background 0.1s;
// 				}
// 				.wa-option:hover { background: #eef2ff; color: #1a56db; }
// 				.wa-option.selected { background: #1a56db; color: #fff; font-weight: 600; }
// 				.wa-no-result { padding: 12px; font-size: 13px; color:#aaa; text-align:center; }
// 				.wa-options-list::-webkit-scrollbar { width: 4px; }
// 				.wa-options-list::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

// 				/* ── TOTAL row — sticky footer ── */
// 				.dt-scrollable .dt-row:last-child .dt-cell {
// 					position: sticky !important;
// 					bottom: 0 !important;
// 					z-index: 10 !important;
// 					background: #1e3a8a !important;
// 					font-weight: 700 !important;
// 					border-top: 2px solid #93c5fd !important;
// 					box-shadow: 0 -3px 10px rgba(0,0,0,0.2) !important;
// 				}

// 				/* ── TOTAL row text — SARE cells white ── */
// 				.dt-scrollable .dt-row:last-child .dt-cell .dt-cell__content,
// 				.dt-scrollable .dt-row:last-child .dt-cell span,
// 				.dt-scrollable .dt-row:last-child .dt-cell .wa-amt,
// 				.dt-scrollable .dt-row:last-child .dt-cell .wa-profit-pos,
// 				.dt-scrollable .dt-row:last-child .dt-cell .wa-profit-neg,
// 				.dt-scrollable .dt-row:last-child .dt-cell .wa-margin-pos,
// 				.dt-scrollable .dt-row:last-child .dt-cell .wa-margin-neg {
// 					color: #ffffff !important;
// 				}

// 				/* ── TOTAL month cell — yellow ── */
// 				.dt-scrollable .dt-row:last-child .dt-cell:first-child .dt-cell__content {
// 					color: #fde68a !important;
// 					letter-spacing: 0.5px !important;
// 				}

// 				/* ── Column header tints ── */
// 				.wa-header-purchase .dt-cell__content { color: #1e40af !important; font-weight: 700 !important; }
// 				.wa-header-sale     .dt-cell__content { color: #065f46 !important; font-weight: 700 !important; }
// 				.wa-header-profit   .dt-cell__content { color: #5b21b6 !important; font-weight: 700 !important; }
// 			`;
// 			document.head.appendChild(style);
// 		}

// 		// ── Custom searchable dropdown ────────────────────────────
// 		function buildCustomSelect(filter, allOptions, placeholder) {
// 			const $wrapper = filter.$wrapper;
// 			$wrapper.find('input, select').hide();

// 			const $wrap = $(`
// 				<div class="wa-select-wrap">
// 					<div class="wa-select-display">
// 						<span style="color:var(--text-muted,#aaa)">${placeholder}</span>
// 					</div>
// 					<span class="wa-select-arrow">▼</span>
// 					<div class="wa-select-dropdown">
// 						<div class="wa-search-box">
// 							<svg width="14" height="14" fill="none" stroke="currentColor"
// 							     stroke-width="2" viewBox="0 0 24 24">
// 								<circle cx="11" cy="11" r="8"/>
// 								<line x1="21" y1="21" x2="16.65" y2="16.65"/>
// 							</svg>
// 							<input class="wa-search-input" type="text" placeholder="Type to search..."/>
// 						</div>
// 						<div class="wa-options-list"></div>
// 					</div>
// 				</div>
// 			`);
// 			$wrapper.append($wrap);

// 			const $display  = $wrap.find('.wa-select-display');
// 			const $dropdown = $wrap.find('.wa-select-dropdown');
// 			const $search   = $wrap.find('.wa-search-input');
// 			const $list     = $wrap.find('.wa-options-list');
// 			let   selected  = '';

// 			function renderOptions(query) {
// 				const q = (query || '').toLowerCase().trim();
// 				const filtered = q ? allOptions.filter(o => o.toLowerCase().includes(q)) : allOptions;
// 				if (!filtered.length) {
// 					$list.html('<div class="wa-no-result">Koi domain nahi mila</div>');
// 					return;
// 				}
// 				$list.html(filtered.map(o =>
// 					`<div class="wa-option${o === selected ? ' selected' : ''}"
// 					      data-val="${o}">${o}</div>`
// 				).join(''));
// 				$list.find('.wa-option').on('click', function () {
// 					selected = $(this).data('val');
// 					$display.html(`<span style="color:var(--text-color,#333)">${selected}</span>`);
// 					$dropdown.removeClass('open');
// 					$search.val('');
// 					renderOptions('');
// 					filter.set_value(selected);
// 					setTimeout(() => report.refresh(), 100);
// 				});
// 			}

// 			renderOptions('');

// 			$display.on('click', function (e) {
// 				e.stopPropagation();
// 				const isOpen = $dropdown.hasClass('open');
// 				$('.wa-select-dropdown').removeClass('open');
// 				if (!isOpen) { $dropdown.addClass('open'); $search.focus(); }
// 			});
// 			$search.on('input',  () => renderOptions($search.val()));
// 			$search.on('click',  e => e.stopPropagation());
// 			$(document).off('click.wa-dd').on('click.wa-dd', () => {
// 				$dropdown.removeClass('open');
// 				$search.val('');
// 				renderOptions('');
// 			});
// 		}

// 		// ── Fetch filter options ──────────────────────────────────
// 		frappe.call({
// 			method: "workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_filter_options",
// 			callback: function (r) {
// 				if (!r.message) return;
// 				const { domains, months } = r.message;

// 				const df = report.get_filter("domain");
// 				if (df && domains.length) {
// 					setTimeout(() => buildCustomSelect(df, domains, "Select domain..."), 300);
// 				}

// 				if (months.length) {
// 					const opts = "\n" + months.join("\n");
// 					const ff   = report.get_filter("from_month");
// 					const tf   = report.get_filter("to_month");
// 					if (ff) { ff.df.options = opts; ff.refresh(); ff.set_value(months[0]); }
// 					if (tf) { tf.df.options = opts; tf.refresh(); tf.set_value(months[months.length - 1]); }
// 				}

// 				// ── Filter gap — inject margin after domain filter ──
// 				setTimeout(() => {
// 					const $filters = $('.page-form .frappe-control, .filters-area .frappe-control');
// 					$filters.first().css('margin-right', '24px');
// 				}, 500);
// 			}
// 		});
// 	},

// 	// ── Formatter ────────────────────────────────────────────────
// 	formatter: function (value, row, column, data, default_formatter) {
// 		if (!data) return default_formatter(value, row, column, data);

// 		const fn      = column.fieldname || '';
// 		const isTotal = data.month === 'TOTAL';
// 		const num     = parseFloat(value) || 0;

// 		// ── Month column ─────────────────────────────────────────
// 		if (fn === 'month') {
// 			if (isTotal) {
// 				return `<strong style="color:#fde68a;letter-spacing:.5px;">TOTAL</strong>`;
// 			}
// 			return `<a style="color:#1a56db;text-decoration:none;font-weight:600;cursor:pointer;"
// 				onclick="event.preventDefault();wa_show_month_detail('${data.month}')"
// 				href="#">${value}</a>`;
// 		}

// 		// ── AMT columns — format as ₹ ────────────────────────────
// 		if (fn.endsWith('_amt') && value !== null && value !== undefined) {
// 			const formatted = '₹' + Math.abs(num).toLocaleString('en-IN', {
// 				minimumFractionDigits: 2, maximumFractionDigits: 2
// 			});
// 			// Purchase = blue, Sale = green
// 			const color = fn.startsWith('p_') ? '#1e40af' : '#065f46';
// 			const cls   = fn.startsWith('p_') ? 'wa-amt-p' : 'wa-amt-s';
// 			return `<span class="${cls}" style="color:${color};font-family:monospace;font-weight:500;">${formatted}</span>`;
// 		}

// 		// ── Profit column ────────────────────────────────────────
// 		if (fn === 'profit' && value !== null && value !== undefined) {
// 			const formatted = '₹' + Math.abs(num).toLocaleString('en-IN', {
// 				minimumFractionDigits: 2, maximumFractionDigits: 2
// 			});
// 			// ✅ FIX: positive = green ▲, negative = red ▼
// 			if (num >= 0) {
// 				return `<span class="wa-profit-pos"
// 					style="color:#059669;font-weight:700;font-family:monospace;">
// 					▲ ${formatted}</span>`;
// 			} else {
// 				return `<span class="wa-profit-neg"
// 					style="color:#dc2626;font-weight:700;font-family:monospace;">
// 					▼ ${formatted}</span>`;
// 			}
// 		}

// 		// ── Margin % column ──────────────────────────────────────
// 		if (fn === 'margin_pct' && value !== null && value !== undefined) {
// 			const abs = Math.abs(num).toFixed(2);
// 			// ✅ FIX: positive = green ▲, negative = red ▼
// 			if (num >= 0) {
// 				return `<span class="wa-margin-pos"
// 					style="color:#059669;font-weight:600;">
// 					▲ ${abs}%</span>`;
// 			} else {
// 				return `<span class="wa-margin-neg"
// 					style="color:#dc2626;font-weight:600;">
// 					▼ ${abs}%</span>`;
// 			}
// 		}

// 		return default_formatter(value, row, column, data);
// 	},

// 	filters: [
// 		{
// 			fieldname: "domain",
// 			label:     __("Domain"),
// 			fieldtype: "Data",
// 			reqd:      1,
// 			default:   ""
// 		},
// 		{
// 			fieldname: "from_month",
// 			label:     __("From Month"),
// 			fieldtype: "Select",
// 			options:   "",
// 			reqd:      0
// 		},
// 		{
// 			fieldname: "to_month",
// 			label:     __("To Month"),
// 			fieldtype: "Select",
// 			options:   "",
// 			reqd:      0
// 		}
// 	]
// };

// // ── Month detail popup ────────────────────────────────────────────
// window.wa_show_month_detail = function (month) {
// 	const domain = frappe.query_report.get_filter_value('domain');
// 	if (!domain) {
// 		frappe.show_alert({ message: 'Domain select karo pehle', indicator: 'orange' }, 3);
// 		return;
// 	}

// 	frappe.call({
// 		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_month_detail',
// 		args: { domain, month },
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) {
// 				frappe.msgprint(`${domain} — ${month} mein koi data nahi mila`);
// 				return;
// 			}

// 			const rows     = r.message;
// 			const purchase = rows.filter(x => x.type === 'Purchase');
// 			const sale     = rows.filter(x => x.type === 'Sale');

// 			const totalP = purchase.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
// 			const totalS = sale.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
// 			const profit = totalS - totalP;
// 			const margin = totalS ? ((profit / totalS) * 100).toFixed(2) : '0.00';

// 			function fmt(n) {
// 				const abs = Math.abs(n).toLocaleString('en-IN', {minimumFractionDigits:2});
// 				return (n < 0 ? '-' : '') + '₹' + abs;
// 			}

// 			function makeTable(data, color, urlPrefix) {
// 				if (!data.length) return `<p style="color:#9ca3af;font-size:12px;padding:8px;">No data found</p>`;
// 				return `
// 				<table style="width:100%;border-collapse:collapse;font-size:12px;">
// 					<thead>
// 						<tr style="background:${color};color:#fff;">
// 							<th style="padding:8px 10px;text-align:left;">Invoice No</th>
// 							<th style="padding:8px 10px;text-align:left;">Subscription</th>
// 							<th style="padding:8px 10px;text-align:right;">Amount</th>
// 							<th style="padding:8px 10px;text-align:right;">Qty</th>
// 							<th style="padding:8px 10px;text-align:left;">Doc</th>
// 						</tr>
// 					</thead>
// 					<tbody>
// 						${data.map((x, i) => `
// 							<tr style="background:${i%2===0?'#fff':'#f8fafc'}">
// 								<td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;">${x.invoice_number}</td>
// 								<td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;">${x.subscription}</td>
// 								<td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right;
// 								    color:${color};font-family:monospace;">${fmt(x.amount)}</td>
// 								<td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right;">${x.quantity}</td>
// 								<td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;">
// 									<a href="/app/${urlPrefix}/${x.doc_name}" target="_blank"
// 									   style="color:${color};text-decoration:underline;">${x.doc_name}</a>
// 								</td>
// 							</tr>
// 						`).join('')}
// 					</tbody>
// 				</table>`;
// 			}

// 			const pColor = profit >= 0 ? '#059669' : '#dc2626';
// 			const pArrow = profit >= 0 ? '▲' : '▼';

// 			const html = `<div style="font-size:13px;">
// 				<!-- Summary cards -->
// 				<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;">
// 					<div style="background:#dbeafe;border-radius:8px;padding:12px;">
// 						<div style="font-size:10px;color:#1e40af;font-weight:700;margin-bottom:4px;text-transform:uppercase;">Purchase</div>
// 						<div style="font-size:17px;font-weight:700;color:#1e40af;font-family:monospace;">${fmt(totalP)}</div>
// 					</div>
// 					<div style="background:#d1fae5;border-radius:8px;padding:12px;">
// 						<div style="font-size:10px;color:#065f46;font-weight:700;margin-bottom:4px;text-transform:uppercase;">Sale</div>
// 						<div style="font-size:17px;font-weight:700;color:#065f46;font-family:monospace;">${fmt(totalS)}</div>
// 					</div>
// 					<div style="background:#f5f3ff;border-radius:8px;padding:12px;">
// 						<div style="font-size:10px;color:#5b21b6;font-weight:700;margin-bottom:4px;text-transform:uppercase;">Profit</div>
// 						<div style="font-size:17px;font-weight:700;color:${pColor};font-family:monospace;">${pArrow} ${fmt(profit)}</div>
// 					</div>
// 					<div style="background:#fef3c7;border-radius:8px;padding:12px;">
// 						<div style="font-size:10px;color:#92400e;font-weight:700;margin-bottom:4px;text-transform:uppercase;">Margin %</div>
// 						<div style="font-size:17px;font-weight:700;color:${pColor};">${pArrow} ${margin}%</div>
// 					</div>
// 				</div>

// 				<!-- Purchase table -->
// 				<div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;
// 				     letter-spacing:.6px;margin-bottom:6px;">🔵 Purchase Invoice</div>
// 				${makeTable(purchase, '#1e40af', 'purchase-invoice')}

// 				<!-- Sale table -->
// 				<div style="font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;
// 				     letter-spacing:.6px;margin:14px 0 6px;">🟢 Sale Invoice</div>
// 				${makeTable(sale, '#065f46', 'sale-invoice')}
// 			</div>`;

// 			new frappe.ui.Dialog({
// 				title: `📋 ${domain} — ${month}`,
// 				fields: [{ fieldname: 'html', fieldtype: 'HTML', options: html }],
// 				size: 'extra-large'
// 			}).show();
// 		}
// 	});
// };










frappe.query_reports["Workspace Analysis Report"] = {

	onload: function (report) {
		const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

		function mkey(m) {
			const [mon, yr] = (m || '').split(' ');
			return parseInt(yr) * 100 + MO.indexOf(mon) + 1;
		}

		const domainFilter = report.get_filter("domain");
		if (domainFilter) domainFilter.set_value('');

		// ── CSS ──────────────────────────────────────────────────
		if (!document.getElementById('wa-report-style')) {
			const style = document.createElement('style');
			style.id = 'wa-report-style';
			style.textContent = `
				/* ── Filter gap fix ── */
				/* ── Filter gap fix ── */
				.page-form .frappe-control {
					margin-right: 20px !important;
				}

				/* ── Custom domain dropdown ── */
				.wa-select-wrap { position: relative; display: inline-block; width: 100%; }
				.wa-select-display {
					border: 1px solid var(--border-color, #d1d8dd);
					border-radius: 6px; padding: 6px 32px 6px 10px;
					font-size: 13px; color: var(--text-color, #333);
					background: var(--control-bg, #fff); cursor: pointer;
					user-select: none; white-space: nowrap; overflow: hidden;
					text-overflow: ellipsis; min-width: 220px; height: 32px;
					display: flex; align-items: center;
				}
				.wa-select-display:hover { border-color: #1a56db; }
				.wa-select-arrow {
					position: absolute; right: 10px; top: 50%;
					transform: translateY(-50%); pointer-events: none;
					color: var(--text-muted, #8d99a6); font-size: 10px;
				}
				.wa-select-dropdown {
					position: absolute; top: calc(100% + 4px); left: 0;
					min-width: 100%; width: max-content; max-width: 380px;
					background: var(--card-bg, #fff);
					border: 1px solid var(--border-color, #d1d8dd);
					border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.13);
					z-index: 9999; display: none; overflow: hidden;
				}
				.wa-select-dropdown.open { display: block; }
				.wa-search-box {
					padding: 8px 10px;
					border-bottom: 1px solid var(--border-color, #d1d8dd);
					display: flex; align-items: center; gap: 7px;
					background: var(--control-bg, #f9f9f9);
				}
				.wa-search-box svg { flex-shrink: 0; color: var(--text-muted,#8d99a6); }
				.wa-search-input {
					border: none; outline: none; background: transparent;
					font-size: 13px; width: 100%; color: var(--text-color,#333);
				}
				.wa-search-input::placeholder { color: var(--text-muted,#aaa); }
				.wa-options-list { max-height: 240px; overflow-y: auto; padding: 4px 0; }
				.wa-option {
					padding: 8px 12px; font-size: 13px; cursor: pointer;
					color: var(--text-color,#333); white-space: nowrap; transition: background 0.1s;
				}
				.wa-option:hover { background: #eef2ff; color: #1a56db; }
				.wa-option.selected { background: #1a56db; color: #fff; font-weight: 600; }
				.wa-no-result { padding: 12px; font-size: 13px; color:#aaa; text-align:center; }
				.wa-options-list::-webkit-scrollbar { width: 4px; }
				.wa-options-list::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

				/* ── TOTAL row sticky footer ── */
				.dt-scrollable .dt-row:last-child .dt-cell {
					position: sticky !important;
					bottom: 0 !important;
					z-index: 10 !important;
					background: #1e3a8a !important;
					font-weight: 700 !important;
					border-top: 2px solid #93c5fd !important;
					box-shadow: 0 -3px 10px rgba(0,0,0,0.2) !important;
				}
				.dt-scrollable .dt-row:last-child .dt-cell .dt-cell__content,
				.dt-scrollable .dt-row:last-child .dt-cell span {
					color: #ffffff !important;
				}
				.dt-scrollable .dt-row:last-child .dt-cell:first-child .dt-cell__content {
					color: #fde68a !important;
					letter-spacing: 0.5px !important;
				}
			`;
			document.head.appendChild(style);
		}

		// ── Custom searchable dropdown ────────────────────────────
		function buildCustomSelect(filter, allOptions, placeholder) {
			const $wrapper = filter.$wrapper;
			$wrapper.find('input, select').hide();

			const $wrap = $(`
				<div class="wa-select-wrap">
					<div class="wa-select-display">
						<span style="color:var(--text-muted,#aaa)">${placeholder}</span>
					</div>
					<span class="wa-select-arrow">▼</span>
					<div class="wa-select-dropdown">
						<div class="wa-search-box">
							<svg width="14" height="14" fill="none" stroke="currentColor"
							     stroke-width="2" viewBox="0 0 24 24">
								<circle cx="11" cy="11" r="8"/>
								<line x1="21" y1="21" x2="16.65" y2="16.65"/>
							</svg>
							<input class="wa-search-input" type="text" placeholder="Type to search..."/>
						</div>
						<div class="wa-options-list"></div>
					</div>
				</div>
			`);
			$wrapper.append($wrap);

			const $display = $wrap.find('.wa-select-display');
			const $dropdown = $wrap.find('.wa-select-dropdown');
			const $search = $wrap.find('.wa-search-input');
			const $list = $wrap.find('.wa-options-list');
			let selected = '';

			function renderOptions(query) {
				const q = (query || '').toLowerCase().trim();
				const filtered = q ? allOptions.filter(o => o.toLowerCase().includes(q)) : allOptions;
				if (!filtered.length) {
					$list.html('<div class="wa-no-result">Koi domain nahi mila</div>');
					return;
				}
				$list.html(filtered.map(o =>
					`<div class="wa-option${o === selected ? ' selected' : ''}"
					      data-val="${o}">${o}</div>`
				).join(''));
				$list.find('.wa-option').on('click', function () {
					selected = $(this).data('val');
					$display.html(`<span style="color:var(--text-color,#333)">${selected}</span>`);
					$dropdown.removeClass('open');
					$search.val('');
					renderOptions('');
					filter.set_value(selected);
					setTimeout(() => report.refresh(), 100);
				});
			}

			renderOptions('');

			$display.on('click', function (e) {
				e.stopPropagation();
				const isOpen = $dropdown.hasClass('open');
				$('.wa-select-dropdown').removeClass('open');
				if (!isOpen) { $dropdown.addClass('open'); $search.focus(); }
			});
			$search.on('input', () => renderOptions($search.val()));
			$search.on('click', e => e.stopPropagation());
			$(document).off('click.wa-dd').on('click.wa-dd', () => {
				$dropdown.removeClass('open');
				$search.val('');
				renderOptions('');
			});
		}

		// ── Fetch filter options ──────────────────────────────────
		frappe.call({
			method: "workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_filter_options",
			callback: function (r) {
				if (!r.message) return;
				const { domains, months } = r.message;

				const df = report.get_filter("domain");
				if (df && domains.length) {
					setTimeout(() => buildCustomSelect(df, domains, "Select domain..."), 300);
				}

				if (months.length) {
					const opts = "\n" + months.join("\n");
					const ff = report.get_filter("from_month");
					const tf = report.get_filter("to_month");
					if (ff) { ff.df.options = opts; ff.refresh(); ff.set_value(months[0]); }
					if (tf) { tf.df.options = opts; tf.refresh(); tf.set_value(months[months.length - 1]); }
				}
			}
		});
	},

	// ── Formatter ────────────────────────────────────────────────
	formatter: function (value, row, column, data, default_formatter) {
		if (!data) return default_formatter(value, row, column, data);

		const fn = column.fieldname || '';
		const isTotal = data.month === 'TOTAL';

		// ── Month column — sirf yahan color ──────────────────────
		if (fn === 'month') {
			if (isTotal) {
				return `<strong style="color:#fde68a;letter-spacing:.5px;">TOTAL</strong>`;
			}
			return `<a style="color:#1a56db;text-decoration:none;font-weight:600;cursor:pointer;"
				onclick="event.preventDefault();wa_show_month_detail('${data.month}')"
				href="#">${value}</a>`;
		}

		// ── Baaki sab columns — default formatter, koi color nahi ──
		return default_formatter(value, row, column, data);
	},

	filters: [
		{
			fieldname: "domain",
			label: __("Domain"),
			fieldtype: "Data",
			reqd: 1,
			default: ""
		},
		{
			fieldname: "from_month",
			label: __("From Month"),
			fieldtype: "Select",
			options: "",
			reqd: 0
		},
		{
			fieldname: "to_month",
			label: __("To Month"),
			fieldtype: "Select",
			options: "",
			reqd: 0
		}
	]
};

// ── Month detail popup ────────────────────────────────────────────
window.wa_show_month_detail = function (month) {
	const domain = frappe.query_report.get_filter_value('domain');
	if (!domain) {
		frappe.show_alert({ message: 'Domain select karo pehle', indicator: 'orange' }, 3);
		return;
	}

	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_month_detail',
		args: { domain, month },
		callback: function (r) {
			if (!r.message || !r.message.length) {
				frappe.msgprint(`${domain} — ${month} mein koi data nahi mila`);
				return;
			}

			const rows = r.message;
			const purchase = rows.filter(x => x.type === 'Purchase');
			const sale = rows.filter(x => x.type === 'Sale');

			const totalP = purchase.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
			const totalS = sale.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
			const balance = totalP - totalS;

			function fmt(n) {
				const abs = Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
				return (n < 0 ? '-' : '') + '₹' + abs;
			}

			function makeTable(data, color, urlPrefix) {
				if (!data.length) return `<p style="color:#9ca3af;font-size:12px;padding:8px;">No data found</p>`;
				return `
				<table style="width:100%;border-collapse:collapse;font-size:12px;">
					<thead>
						<tr style="background:${color};color:#fff;">
							<th style="padding:8px 10px;text-align:left;">Invoice No</th>
							<th style="padding:8px 10px;text-align:left;">Subscription</th>
							<th style="padding:8px 10px;text-align:right;">Amount</th>
							<th style="padding:8px 10px;text-align:right;">Qty</th>
							<th style="padding:8px 10px;text-align:left;">Doc</th>
						</tr>
					</thead>
					<tbody>
						${data.map((x, i) => `
							<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
								<td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;">${x.invoice_number}</td>
								<td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;">${x.subscription}</td>
								<td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;">${fmt(x.amount)}</td>
								<td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;text-align:right;">${x.quantity}</td>
								<td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;">
									<a href="/app/${urlPrefix}/${x.doc_name}" target="_blank"
									   style="color:${color};text-decoration:underline;">${x.doc_name}</a>
								</td>
							</tr>
						`).join('')}
					</tbody>
				</table>`;
			}

			const bColor = balance > 0 ? '#dc2626' : '#059669';
			const bArrow = balance > 0 ? '▲' : '▼';

			const html = `<div style="font-size:13px;">
				<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;">
					<div style="background:#dbeafe;border-radius:8px;padding:12px;">
						<div style="font-size:10px;color:#1e40af;font-weight:700;margin-bottom:4px;text-transform:uppercase;">Purchase</div>
						<div style="font-size:17px;font-weight:700;color:#1e40af;font-family:monospace;">${fmt(totalP)}</div>
					</div>
					<div style="background:#d1fae5;border-radius:8px;padding:12px;">
						<div style="font-size:10px;color:#065f46;font-weight:700;margin-bottom:4px;text-transform:uppercase;">Sale</div>
						<div style="font-size:17px;font-weight:700;color:#065f46;font-family:monospace;">${fmt(totalS)}</div>
					</div>
					<div style="background:#fef2f2;border-radius:8px;padding:12px;">
						<div style="font-size:10px;color:#991b1b;font-weight:700;margin-bottom:4px;text-transform:uppercase;">Balance (P - S)</div>
						<div style="font-size:17px;font-weight:700;color:${bColor};font-family:monospace;">${bArrow} ${fmt(balance)}</div>
					</div>
				</div>

				<div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;
				     letter-spacing:.6px;margin-bottom:6px;">🔵 Purchase Invoice</div>
				${makeTable(purchase, '#1e40af', 'purchase-invoice')}

				<div style="font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;
				     letter-spacing:.6px;margin:14px 0 6px;">🟢 Sale Invoice</div>
				${makeTable(sale, '#065f46', 'sale-invoice')}
			</div>`;

			new frappe.ui.Dialog({
				title: `📋 ${domain} — ${month}`,
				fields: [{ fieldname: 'html', fieldtype: 'HTML', options: html }],
				size: 'extra-large'
			}).show();
		}
	});
};





