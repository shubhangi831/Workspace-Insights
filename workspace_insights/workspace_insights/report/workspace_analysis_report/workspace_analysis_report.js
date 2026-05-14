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
// 				/* Filter gap */
// 				.page-form .frappe-control { margin-right: 20px !important; }

// 				/* Domain dropdown */
// 				.wa-select-wrap { position: relative; display: inline-block; width: 100%; }
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
// 				.wa-search-box svg { flex-shrink:0; color: var(--text-muted,#8d99a6); }
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

// 				/* TOTAL sticky footer */
// 				.dt-scrollable .dt-row:last-child .dt-cell {
// 					position: sticky !important;
// 					bottom: 0 !important;
// 					z-index: 10 !important;
// 					background: #f3f3f3 !important;
// 					font-weight: 700 !important;
// 					border-top: 2px solid #f3f3f3 !important;
// 				}
// 				.dt-scrollable .dt-row:last-child .dt-cell .dt-cell__content,
// 				.dt-scrollable .dt-row:last-child .dt-cell span {
// 					color: #000 !important;
// 				}
				

// 				/* Column header color by prefix */
// 				.wa-hdr-p .dt-cell__content { color: #1e40af !important; font-weight: 700 !important; }
// 				.wa-hdr-s .dt-cell__content { color: #065f46 !important; font-weight: 700 !important; }
// 				.wa-hdr-b .dt-cell__content { color: #5b21b6 !important; font-weight: 700 !important; }
// 			`;
// 			document.head.appendChild(style);
// 		}

// 		// ── Custom domain dropdown ────────────────────────────────
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
// 			}
// 		});
// 	},

// 	// ── Column header color after render ─────────────────────────
// 	after_datatable_render: function (datatable) {
// 		setTimeout(() => {
// 			$(datatable.wrapper).find('.dt-cell--header').each(function () {
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
// 		}, 300);
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
// 				return `<strong style="color:#000;letter-spacing:.5px;">TOTAL</strong>`;
// 			}
// 			return `<a style="color:#1a56db;text-decoration:none;font-weight:600;cursor:pointer;"
// 				onclick="event.preventDefault();wa_show_month_detail('${data.month}')"
// 				href="#">${data.month}</a>`;
// 		}

// 		// ── Purchase AMT — blue ───────────────────────────────────
// 		if (fn.startsWith('p_') && fn.endsWith('_amt') && value) {
// 			const formatted = '₹' + num.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
// 			return `<span style="color:#000;font-weight:400;font-family:monospace;">${formatted}</span>`;
// 		}

// 		// ── Sale AMT — green ─────────────────────────────────────
// 		if (fn.startsWith('s_') && fn.endsWith('_amt') && value) {
// 			const formatted = '₹' + num.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
// 			return `<span style="color:#059669;font-weight:600;font-family:monospace;">${formatted}</span>`;
// 		}

// 		// ── Balance column ───────────────────────────────────────
// 		if (fn === 'balance' && value !== null && value !== undefined) {
// 			const formatted = '₹' + Math.abs(num).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
// 			if (num >= 0) {
// 				return `<span style="color:#059669;font-weight:700;font-family:monospace;"> ${formatted}</span>`;
// 			} else {
// 				return `<span style="color:#000;font-weight:400;font-family:monospace;"> ${formatted}</span>`;
// 			}
// 		}

// 		return default_formatter(value, row, column, data);
// 	},

// 	filters: [
// 		{ fieldname: "domain",     label: __("Domain"),     fieldtype: "Data",   reqd: 1, default: "" },
// 		{ fieldname: "from_month", label: __("From Month"), fieldtype: "Select", options: "", reqd: 0 },
// 		{ fieldname: "to_month",   label: __("To Month"),   fieldtype: "Select", options: "", reqd: 0 }
// 	]
// };

// // ── Month detail popup ───────────────────────────────────────────
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

// 			const totalP  = purchase.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
// 			const totalS  = sale.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
// 			const balance = totalS - totalP;

// 			function fmt(n) {
// 				const abs = Math.abs(n).toLocaleString('en-IN', {minimumFractionDigits:2});
// 				return (n < 0 ? '-' : '') + '₹' + abs;
// 			}

// 			function makeTable(data, color, urlPrefix) {
// 				if (!data.length) return `<p style="color:#9ca3af;font-size:12px;padding:8px;">No data</p>`;
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

// 			const bColor = balance >= 0 ? '#059669' : '#dc2626';
// 			const bArrow = balance >= 0 ? '▲' : '▼';

// 			const html = `<div style="font-size:13px;">
// 				<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;">
// 					<div style="background:#dbeafe;border-radius:8px;padding:12px;">
// 						<div style="font-size:10px;color:#1e40af;font-weight:700;margin-bottom:4px;">PURCHASE</div>
// 						<div style="font-size:17px;font-weight:700;color:#1e40af;font-family:monospace;">${fmt(totalP)}</div>
// 					</div>
// 					<div style="background:#d1fae5;border-radius:8px;padding:12px;">
// 						<div style="font-size:10px;color:#065f46;font-weight:700;margin-bottom:4px;">SALE</div>
// 						<div style="font-size:17px;font-weight:700;color:#065f46;font-family:monospace;">${fmt(totalS)}</div>
// 					</div>
// 					<div style="background:#f5f3ff;border-radius:8px;padding:12px;">
// 						<div style="font-size:10px;color:#5b21b6;font-weight:700;margin-bottom:4px;">BALANCE</div>
// 						<div style="font-size:17px;font-weight:700;color:${bColor};font-family:monospace;">${bArrow} ${fmt(balance)}</div>
// 					</div>
// 				</div>

// 				<div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;
// 				     letter-spacing:.6px;margin-bottom:6px;">🔵 Purchase Invoice</div>
// 				${makeTable(purchase, '#1e40af', 'purchase-invoice')}

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







// Copyright (c) 2026, sk and contributors
// For license information, please see license.txt

frappe.query_reports["Workspace Analysis Report"] = {

	onload: function (report) {

		// Reset domain filter on fresh load
		const domainFilter = report.get_filter("domain");
		if (domainFilter) domainFilter.set_value('');

		// ── Inject CSS once ───────────────────────────────────────
		if (!document.getElementById('wa-report-style')) {
			const style = document.createElement('style');
			style.id = 'wa-report-style';
			style.textContent = `
				.page-form .frappe-control { margin-right: 20px !important; }

				/* Custom domain dropdown */
				.wa-select-wrap { position: relative; display: inline-block; width: 100%; }
				.wa-select-display {
					border: 1px solid var(--border-color, #d1d8dd);
					border-radius: 6px; padding: 6px 32px 6px 10px;
					font-size: 13px; color: var(--text-color, #333);
					background: var(--control-bg, #fff); cursor: pointer;
					user-select: none; white-space: nowrap; overflow: hidden;
					text-overflow: ellipsis; min-width: 220px; height: 34px;
					display: flex; align-items: center;
					transition: border-color 0.15s;
				}
				.wa-select-display:hover { border-color: #1a56db; }
				.wa-select-arrow {
					position: absolute; right: 10px; top: 50%;
					transform: translateY(-50%); pointer-events: none;
					color: var(--text-muted, #8d99a6); font-size: 10px;
				}
				.wa-select-dropdown {
					position: absolute; top: calc(100% + 4px); left: 0;
					min-width: 100%; width: max-content; max-width: 400px;
					background: var(--card-bg, #fff);
					border: 1px solid var(--border-color, #d1d8dd);
					border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
					z-index: 99999; display: none;
				}
				.wa-select-dropdown.open { display: block; }
				.wa-search-box {
					padding: 8px 10px;
					border-bottom: 1px solid var(--border-color, #d1d8dd);
					display: flex; align-items: center; gap: 7px;
					background: var(--control-bg, #f9f9f9);
					border-radius: 8px 8px 0 0;
				}
				.wa-search-box svg { flex-shrink: 0; color: var(--text-muted,#8d99a6); }
				.wa-search-input {
					border: none; outline: none; background: transparent;
					font-size: 13px; width: 100%; color: var(--text-color,#333);
					-webkit-appearance: none;
				}
				.wa-search-input::placeholder { color: var(--text-muted,#aaa); }
				.wa-options-list { max-height: 220px; overflow-y: auto; padding: 4px 0; }
				.wa-option {
					padding: 9px 14px; font-size: 13px; cursor: pointer;
					color: var(--text-color,#333); white-space: nowrap;
					transition: background 0.1s;
				}
				.wa-option:hover  { background: #eef2ff; color: #1a56db; }
				.wa-option.active { background: #1a56db; color: #fff; font-weight: 600; }
				.wa-no-result { padding: 14px; font-size: 13px; color: #aaa; text-align: center; }
				.wa-options-list::-webkit-scrollbar       { width: 4px; }
				.wa-options-list::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

				/* Column header colors */
				.wa-hdr-p .dt-cell__content { color: #1e40af !important; font-weight: 700 !important; }
				.wa-hdr-s .dt-cell__content { color: #065f46 !important; font-weight: 700 !important; }
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

				// Domain custom dropdown — wait for filter DOM reliably
				if (domains.length) {
					wa_build_domain_select(report, domains);
				}
			}
		});
	},

	// ── Color column headers after render ────────────────────────
	after_datatable_render: function (datatable) {
		setTimeout(() => {
			const $dt = $(datatable.wrapper);

			// Color column headers
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

			// ── FIX: Sticky TOTAL footer via JS (CSS :last-child unreliable) ──
			// Find the row whose first cell says "TOTAL" and pin it to the bottom.
			$dt.find('.dt-row').each(function () {
				const firstCellText = $(this).find('.dt-cell').first()
					.find('.dt-cell__content').text().trim();

				if (firstCellText === 'TOTAL') {
					$(this).css({
						'position':   'sticky',
						'bottom':     '0',
						'z-index':    '20',
						'box-shadow': '0 -4px 12px rgba(0,0,0,0.2)'
					});
					// Style every cell in the TOTAL row
					$(this).find('.dt-cell').css({
						'background':   '#1e3a8a',
						'font-weight':  '700',
						'border-top':   '2px solid #93c5fd'
					});
					$(this).find('.dt-cell__content, span').css({ 'color': '#ffffff' });
					// Month label in gold
					$(this).find('.dt-cell').first()
						.find('.dt-cell__content').css({ 'color': '#fde68a', 'letter-spacing': '0.5px' });
				}
			});

		}, 400);
	},

	// ── Cell formatter ───────────────────────────────────────────
	formatter: function (value, row, column, data, default_formatter) {
		if (!data) return default_formatter(value, row, column, data);

		const fn      = column.fieldname || '';
		const isTotal = data.month === 'TOTAL';
		const num     = parseFloat(value) || 0;

		// Month column
		if (fn === 'month') {
			if (isTotal) {
				return `<strong style="color:#000;font-weight:700;letter-spacing:.5px;">TOTAL</strong>`;
			}
			return `<a style="color:#1a56db;text-decoration:none;font-weight:600;cursor:pointer;"
				onclick="event.preventDefault();wa_show_month_detail('${data.month}')"
				href="#">${data.month}</a>`;
		}

		// Purchase AMT — blue
		if (fn.startsWith('p_') && fn.endsWith('_amt') && value !== null && value !== undefined) {
			const fmt = '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
			return `<span style="color:#000;font-weight:400;font-family:monospace;">${fmt}</span>`;
		}

		// Sale AMT — green
		if (fn.startsWith('s_') && fn.endsWith('_amt') && value !== null && value !== undefined) {
			const fmt = '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
			return `<span style="color:#059669;font-weight:600;font-family:monospace;">${fmt}</span>`;
		}

		// Balance — green arrow up / red arrow down
		if (fn === 'balance' && value !== null && value !== undefined) {
			const fmt = '₹' + Math.abs(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
			if (num >= 0) {
				return `<span style="color:#059669;font-weight:700;font-family:monospace;"> ${fmt}</span>`;
			} else {
				return `<span style="color:#000;font-weight:400;font-family:monospace;"> ${fmt}</span>`;
			}
		}

		return default_formatter(value, row, column, data);
	},

	filters: [
		{ fieldname: "domain",     label: __("Domain"),     fieldtype: "Data",   reqd: 1, default: "" },
		{ fieldname: "from_month", label: __("From Month"), fieldtype: "Select", options: "", reqd: 0 },
		{ fieldname: "to_month",   label: __("To Month"),   fieldtype: "Select", options: "", reqd: 0 }
	]
};


// ── Domain custom dropdown builder ───────────────────────────────
// FIX: Uses MutationObserver instead of unreliable setTimeout
// so the dropdown attaches even when page loads fast.
function wa_build_domain_select(report, allOptions) {
	const filter = report.get_filter("domain");
	if (!filter) return;

	function attach() {
		const $wrapper = filter.$wrapper;
		if (!$wrapper || !$wrapper.length) return false;
		if ($wrapper.find('.wa-select-wrap').length) return true; // already built

		// Hide the default Frappe input
		$wrapper.find('input, .link-btn').hide();

		const $wrap = $(`
			<div class="wa-select-wrap">
				<div class="wa-select-display">
					<span class="wa-placeholder" style="color:var(--text-muted,#aaa)">Select domain...</span>
				</div>
				<span class="wa-select-arrow">▼</span>
				<div class="wa-select-dropdown">
					<div class="wa-search-box">
						<svg width="14" height="14" fill="none" stroke="currentColor"
						     stroke-width="2" viewBox="0 0 24 24">
							<circle cx="11" cy="11" r="8"/>
							<line x1="21" y1="21" x2="16.65" y2="16.65"/>
						</svg>
						<input class="wa-search-input" type="text"
						       placeholder="Search domain..." autocomplete="off"/>
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
			const filtered = q
				? allOptions.filter(o => o.toLowerCase().includes(q))
				: allOptions;

			if (!filtered.length) {
				$list.html('<div class="wa-no-result">No domain found</div>');
				return;
			}

			$list.html(
				filtered.map(o =>
					`<div class="wa-option${o === selected ? ' active' : ''}" data-val="${o}">${o}</div>`
				).join('')
			);

			$list.find('.wa-option').on('click', function (e) {
				e.stopPropagation();
				selected = $(this).data('val');
				$ph.remove();
				$display.html(
					`<span style="color:var(--text-color,#333);font-weight:500;">${selected}</span>`
				);
				$dropdown.removeClass('open');
				$search.val('');
				renderOptions('');
				filter.set_value(selected);
				setTimeout(() => report.refresh(), 120);
			});
		}

		renderOptions('');

		// Toggle dropdown on display click
		$display.on('click', function (e) {
			e.stopPropagation();
			const wasOpen = $dropdown.hasClass('open');
			// Close all other dropdowns
			$('.wa-select-dropdown').removeClass('open');
			if (!wasOpen) {
				$dropdown.addClass('open');
				// FIX: focus search with a small tick so mobile keyboard opens
				requestAnimationFrame(() => $search[0] && $search[0].focus());
			}
		});

		// Live search — responsive on every keystroke
		$search.on('input', function () {
			renderOptions(this.value);
		});

		// Prevent dropdown close when clicking inside search
		$search.on('click mousedown touchstart', function (e) {
			e.stopPropagation();
		});

		// Close when clicking outside
		$(document).off('click.wa-domain-dd').on('click.wa-domain-dd', function () {
			$dropdown.removeClass('open');
			$search.val('');
			renderOptions('');
		});

		return true;
	}

	// Try immediately — if DOM not ready, observe for changes
	if (!attach()) {
		const observer = new MutationObserver(function (_, obs) {
			if (attach()) obs.disconnect();
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}
}


// ── Month detail popup ───────────────────────────────────────────
window.wa_show_month_detail = function (month) {
	const domain = frappe.query_report.get_filter_value('domain');
	if (!domain) {
		frappe.show_alert({ message: 'Please select a domain first', indicator: 'orange' }, 3);
		return;
	}

	frappe.call({
		method: 'workspace_insights.workspace_insights.report.workspace_analysis_report.workspace_analysis_report.get_month_detail',
		args: { domain, month },
		callback: function (r) {
			if (!r.message || !r.message.length) {
				frappe.msgprint(`No data found for ${domain} — ${month}`);
				return;
			}

			const rows     = r.message;
			const purchase = rows.filter(x => x.type === 'Purchase');
			const sale     = rows.filter(x => x.type === 'Sale');
			const totalP   = purchase.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
			const totalS   = sale.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
			const balance  = totalS - totalP;

			function fmt(n) {
				return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
			}

			// Child rows expanded detail
			function child_rows_html(rows) {
				if (!rows || !rows.length) return '';
				return `<table style="width:100%;border-collapse:collapse;margin-top:6px;background:#f8fafc;">
					<thead>
						<tr style="background:#e2e8f0;">
							<th style="padding:5px 10px;font-size:11px;color:#475569;text-align:left;">Start</th>
							<th style="padding:5px 10px;font-size:11px;color:#475569;text-align:left;">End</th>
							<th style="padding:5px 10px;font-size:11px;color:#475569;text-align:left;">Description</th>
							<th style="padding:5px 10px;font-size:11px;color:#475569;text-align:right;">Qty</th>
							<th style="padding:5px 10px;font-size:11px;color:#475569;text-align:right;">Amount</th>
						</tr>
					</thead>
					<tbody>
						${rows.map(r => `
							<tr>
								<td style="padding:5px 10px;font-size:11px;border-bottom:1px solid #e2e8f0;">${r.start_date}</td>
								<td style="padding:5px 10px;font-size:11px;border-bottom:1px solid #e2e8f0;">${r.end_date}</td>
								<td style="padding:5px 10px;font-size:11px;border-bottom:1px solid #e2e8f0;">${r.description || ''}</td>
								<td style="padding:5px 10px;font-size:11px;border-bottom:1px solid #e2e8f0;text-align:right;">${r.quantity}</td>
								<td style="padding:5px 10px;font-size:11px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;">${fmt(r.amount)}</td>
							</tr>
						`).join('')}
					</tbody>
				</table>`;
			}

			function make_table(data, color, url_prefix) {
				if (!data.length) return `<p style="color:#94a3b8;font-size:12px;padding:8px 0;">No data</p>`;

				const rows_html = data.map((x, i) => {
					const row_id     = `cr-${url_prefix}-${i}`;
					const has_detail = x.child_rows && x.child_rows.length > 1;
					return `
					<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'};">
						<td style="padding:7px 12px;border-bottom:1px solid #f1f5f9;font-size:12px;">${x.invoice_number}</td>
						<td style="padding:7px 12px;border-bottom:1px solid #f1f5f9;font-size:12px;">${x.subscription}</td>
						<td style="padding:7px 12px;border-bottom:1px solid #f1f5f9;font-size:12px;text-align:right;font-family:monospace;color:${color};">${fmt(x.amount)}</td>
						<td style="padding:7px 12px;border-bottom:1px solid #f1f5f9;font-size:12px;text-align:right;">${x.quantity}</td>
						<td style="padding:7px 12px;border-bottom:1px solid #f1f5f9;font-size:12px;">
							<a href="/app/${url_prefix}/${x.doc_name}" target="_blank"
							   style="color:${color};font-size:11px;">${x.doc_name}</a>
						</td>
						<td style="padding:7px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">
							${has_detail ? `<button class="btn btn-xs btn-default expand-btn"
								data-target="${row_id}"
								style="font-size:10px;padding:2px 8px;"> Entries</button>` : ''}
						</td>
					</tr>
					${has_detail ? `<tr id="${row_id}" style="display:none;background:#eef2ff;">
						<td colspan="6" style="padding:8px 16px;border-bottom:1px solid #e2e8f0;">
							${child_rows_html(x.child_rows)}
						</td>
					</tr>` : ''}`;
				}).join('');

				return `<table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;">
					<thead>
						<tr style="background:${color};">
							<th style="padding:8px 12px;text-align:left;color:#fff;font-size:12px;">Invoice No</th>
							<th style="padding:8px 12px;text-align:left;color:#fff;font-size:12px;">Subscription</th>
							<th style="padding:8px 12px;text-align:right;color:#fff;font-size:12px;">Amount</th>
							<th style="padding:8px 12px;text-align:right;color:#fff;font-size:12px;">Qty</th>
							<th style="padding:8px 12px;text-align:left;color:#fff;font-size:12px;">Doc</th>
							<th style="padding:8px 12px;text-align:center;color:#fff;font-size:12px;width:80px;">Detail</th>
						</tr>
					</thead>
					<tbody>${rows_html}</tbody>
				</table>`;
			}

			const bColor = balance >= 0 ? '#059669' : '#dc2626';
			const bArrow = balance >= 0 ? '' : '';

			const html = `<div style="font-size:13px;">
				<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
					<div style="background:var(--blue-50,#eff6ff);border:1px solid #dbeafe;border-radius:8px;padding:14px;">
						<div style="font-size:10px;color:#1e40af;font-weight:700;letter-spacing:.5px;margin-bottom:6px;">PURCHASE</div>
						<div style="font-size:18px;font-weight:700;color:#1e40af;font-family:monospace;">${fmt(totalP)}</div>
					</div>
					<div style="background:var(--green-50,#f0fdf4);border:1px solid #bbf7d0;border-radius:8px;padding:14px;">
						<div style="font-size:10px;color:#15803d;font-weight:700;letter-spacing:.5px;margin-bottom:6px;">SALE</div>
						<div style="font-size:18px;font-weight:700;color:#15803d;font-family:monospace;">${fmt(totalS)}</div>
					</div>
					<div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:14px;">
						<div style="font-size:10px;color:#6b21a8;font-weight:700;letter-spacing:.5px;margin-bottom:6px;">BALANCE</div>
						<div style="font-size:18px;font-weight:700;color:${bColor};font-family:monospace;">${bArrow} ${fmt(balance)}</div>
					</div>
				</div>
				<div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;">🔵 Purchase Invoice</div>
				${make_table(purchase, '#1e40af', 'purchase-invoice')}
				<div style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:.6px;margin:16px 0 8px;">🟢 Sale Invoice</div>
				${make_table(sale, '#15803d', 'sale-invoice')}
			</div>`;

			const d = new frappe.ui.Dialog({
				title: `${domain} — ${month}`,
				fields: [{ fieldname: 'body', fieldtype: 'HTML', options: html }],
				size: 'extra-large'
			});
			d.show();

			// Attach expand/collapse after dialog renders
			setTimeout(() => {
				d.$wrapper.find('.expand-btn').on('click', function() {
					const $row   = d.$wrapper.find('#' + $(this).data('target'));
					const isOpen = $row.is(':visible');
					$row.toggle(!isOpen);
					$(this).text(isOpen ? 'Entries' : 'Entries');
				});
			}, 100);
		}
	});
};









