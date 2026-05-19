// Copyright (c) 2026, sk and contributors
// For license information, please see license.txt

frappe.listview_settings['Sale Invoice'] = {
	onload: function (listview) {
		// Add Import button after Frappe renders standard buttons
		setTimeout(() => {
			listview.page.add_button(__('📂 Import'), function () {
				show_import_dialog(listview);
			}, { btn_class: 'btn-default' });
		}, 300);
	}
};


function show_import_dialog(listview) {

	// ── Inject CSS once ───────────────────────────────────────────
	if (!document.getElementById('si-imp-style')) {
		const st = document.createElement('style');
		st.id = 'si-imp-style';
		st.textContent = `
		.si-imp * { box-sizing: border-box; font-family: var(--font-stack); }
		.si-drop-zone {
			border: 2px dashed #d1d5db; border-radius: 10px;
			padding: 32px 20px; text-align: center;
			background: #f9fafb; margin-bottom: 14px; transition: all .2s;
		}
		.si-drop-zone.dragover { border-color: #059669; background: #ecfdf5; }
		.si-drop-icon {
			width: 48px; height: 48px; background: #d1fae5; border-radius: 50%;
			display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;
		}
		.si-drop-icon svg { width: 24px; height: 24px; stroke: #059669; fill: none; stroke-width: 2; }
		.si-drop-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 4px; }
		.si-drop-sub   { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
		.si-choose-label {
			display: inline-block; position: relative;
			border: 1.5px solid #059669; border-radius: 6px;
			padding: 8px 20px; font-size: 13px; font-weight: 600;
			color: #059669; background: #fff; cursor: pointer; transition: all .15s;
		}
		.si-choose-label:hover { background: #059669; color: #fff; }
		.si-choose-label input[type=file] {
			position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
		}
		.si-files-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
		.si-file-item {
			display: flex; align-items: center; gap: 10px;
			background: #f0fdf4; border: 1.5px solid #86efac;
			border-radius: 8px; padding: 10px 14px;
		}
		.si-file-ico { width: 32px; height: 32px; border-radius: 6px; background: #dcfce7;
			flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
		.si-file-ico svg { width: 16px; height: 16px; stroke: #16a34a; fill: none; stroke-width: 2; }
		.si-file-nm  { font-size: 13px; font-weight: 600; color: #15803d; }
		.si-file-sz  { font-size: 11px; color: #6b7280; margin-top: 1px; }
		.si-file-del { margin-left: auto; cursor: pointer; color: #9ca3af; font-size: 20px; }
		.si-file-del:hover { color: #ef4444; }
		.si-add-more {
			border: 1.5px dashed #6ee7b7; border-radius: 8px; padding: 10px;
			text-align: center; color: #059669; font-size: 13px; font-weight: 600;
			background: #f0fdf4; transition: all .15s; cursor: pointer; position: relative;
		}
		.si-add-more:hover { background: #dcfce7; }
		.si-add-more input[type=file] {
			position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
		}
		.si-prog-wrap { display: none; margin-bottom: 12px; }
		.si-prog-wrap.show { display: block; }
		.si-prog-lbl { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
		.si-prog-bg  { background: #e5e7eb; border-radius: 99px; height: 6px; overflow: hidden; }
		.si-prog-bar { height: 6px; background: #059669; border-radius: 99px; width: 0%; transition: width .4s; }
		.si-note {
			background: #ecfdf5; border: 1px solid #a7f3d0;
			border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #065f46;
		}
		`;
		document.head.appendChild(st);
	}

	const ACCEPTED_EXT = ['.csv', '.xlsx', '.xls'];
	const is_valid     = f => ACCEPTED_EXT.some(ext => f.name.toLowerCase().endsWith(ext));
	let   sel_files    = [];
	let   d_wrapper    = null;

	const d = new frappe.ui.Dialog({
		title: 'Import Sale Invoice',
		fields: [{
			fieldname: 'html', fieldtype: 'HTML',
			options: `
			<div class="si-imp" id="si-wrap">
				<div class="si-drop-zone" id="si-dz">
					<div class="si-drop-icon">
						<svg viewBox="0 0 24 24">
							<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
							<polyline points="17 8 12 3 7 8"/>
							<line x1="12" y1="3" x2="12" y2="15"/>
						</svg>
					</div>
					<div class="si-drop-title">Upload Invoice File(s)</div>
					<div class="si-drop-sub">
						Drag & drop here, or click below<br>
						<small style="color:#9ca3af">Supported: .csv and .xlsx</small>
					</div>
					<label class="si-choose-label">
						Choose Files
						<input type="file" accept=".csv,.xlsx,.xls" multiple id="si-fi-main">
					</label>
				</div>
				<div class="si-files-list" id="si-flist"></div>
				<div class="si-prog-wrap" id="si-prog">
					<div class="si-prog-lbl" id="si-prog-lbl">Importing...</div>
					<div class="si-prog-bg"><div class="si-prog-bar" id="si-prog-bar"></div></div>
				</div>
				<div class="si-note">
					<b>Required columns:</b> invoice_number, invoice_date, domain, subscription, quantity, amount<br>
					<b>Optional:</b> description, start_date, end_date, order_name, po_number, licenses, bill_to<br>
					Rows with unregistered domain or subscription are skipped with a message.
				</div>
			</div>`
		}],
		primary_action_label: 'Import',
		primary_action: function () {
			if (!sel_files.length) {
				frappe.show_alert({ message: 'Please select a file first', indicator: 'orange' }, 4);
				return;
			}
			run_import();
		},
		secondary_action_label: 'Cancel',
		secondary_action: function () { d.hide(); }
	});

	d.onhide = function () {
		sel_files = [];
		if (d._attach_timer) { clearTimeout(d._attach_timer); d._attach_timer = null; }
	};
	d.show();
	d_wrapper = d.$wrapper;

	// Use setTimeout (not setInterval) to avoid stale-timer bug
	d._attach_timer = setTimeout(() => {
		const mainInput = d_wrapper.find('#si-fi-main')[0];
		const dz        = d_wrapper.find('#si-dz')[0];
		if (!mainInput || !dz) return;

		mainInput.addEventListener('change', function () {
			add_files(Array.from(this.files || []));
		});
		dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('dragover'); });
		dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
		dz.addEventListener('dragend',   () => dz.classList.remove('dragover'));
		dz.addEventListener('drop', e => {
			e.preventDefault(); dz.classList.remove('dragover');
			const files = Array.from(e.dataTransfer.files).filter(is_valid);
			if (files.length) add_files(files);
			else frappe.show_alert({ message: 'Only .csv or .xlsx files allowed', indicator: 'red' }, 3);
		});
	}, 150);

	function add_files(new_files) {
		let added = 0;
		for (const f of new_files) {
			if (!is_valid(f)) { frappe.show_alert({ message: `"${f.name}" not supported`, indicator: 'orange' }, 3); continue; }
			if (!sel_files.find(x => x.name === f.name)) { sel_files.push(f); added++; }
			else frappe.show_alert({ message: `"${f.name}" already added`, indicator: 'orange' }, 3);
		}
		if (added > 0) render();
	}

	function render() {
		const flist = d_wrapper.find('#si-flist')[0];
		const dz    = d_wrapper.find('#si-dz')[0];
		if (!sel_files.length) { if (flist) flist.innerHTML = ''; if (dz) dz.style.display = ''; return; }
		if (dz) dz.style.display = 'none';
		if (flist) {
			flist.innerHTML = sel_files.map((f, i) => `
				<div class="si-file-item">
					<div class="si-file-ico">
						<svg viewBox="0 0 24 24">
							<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
							<polyline points="14 2 14 8 20 8"/>
						</svg>
					</div>
					<div>
						<div class="si-file-nm">${f.name}</div>
						<div class="si-file-sz">${fmt_size(f.size)}</div>
					</div>
					<span class="si-file-del" data-i="${i}">×</span>
				</div>`).join('') +
				`<div class="si-add-more">+ Add More Files
					<input type="file" accept=".csv,.xlsx,.xls" multiple class="si-fi-more">
				</div>`;

			flist.querySelectorAll('.si-file-del').forEach(btn => {
				btn.addEventListener('click', () => { sel_files.splice(parseInt(btn.dataset.i), 1); render(); });
			});
			flist.querySelectorAll('.si-fi-more').forEach(inp => {
				inp.addEventListener('change', function () { add_files(Array.from(this.files || [])); });
			});
		}
	}

	async function run_import() {
		const prog    = d_wrapper.find('#si-prog')[0];
		const progBar = d_wrapper.find('#si-prog-bar')[0];
		const progLbl = d_wrapper.find('#si-prog-lbl')[0];
		if (prog) prog.classList.add('show');

		const results = [];

		for (let i = 0; i < sel_files.length; i++) {
			const file = sel_files[i];
			if (progLbl) progLbl.textContent = `Processing ${i + 1} of ${sel_files.length}: ${file.name}`;
			if (progBar) progBar.style.width  = `${Math.round((i / sel_files.length) * 85)}%`;

			try {
				const { content, file_type } = await read_file_content(file);
				const r = await new Promise(resolve => {
					frappe.call({
						method:   'workspace_insights.workspace_insights.doctype.sale_invoice.sale_invoice.import_sale_invoice_csv',
						args:     { csv_content: content, file_type },
						callback: resolve,
						error:    resolve
					});
				});
				results.push({ file: file.name, msg: r && r.message });
			} catch (e) {
				results.push({ file: file.name, msg: { success: false, error: String(e) } });
			}
		}

		if (progBar) progBar.style.width  = '100%';
		if (progLbl) progLbl.textContent   = 'Done!';
		setTimeout(() => { d.hide(); show_results(results, listview); }, 400);
	}
}


// ── Read CSV as text / XLSX as base64 ─────────────────────────────
function read_file_content(file) {
	const is_xlsx = /\.(xlsx|xls)$/i.test(file.name);
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		if (is_xlsx) {
			reader.onload = e => {
				const bytes  = new Uint8Array(e.target.result);
				let   binary = '';
				for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
				resolve({ content: btoa(binary), file_type: 'xlsx' });
			};
			reader.onerror = reject;
			reader.readAsArrayBuffer(file);
		} else {
			reader.onload  = e => resolve({ content: e.target.result, file_type: 'csv' });
			reader.onerror = reject;
			reader.readAsText(file, 'utf-8');
		}
	});
}

function fmt_size(b) {
	if (b < 1024)        return b + ' B';
	if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
	return (b / (1024 * 1024)).toFixed(1) + ' MB';
}


// ── Results dialog ────────────────────────────────────────────────
function show_results(results, listview) {
	let html   = '<div style="font-size:13px;line-height:1.8;">';
	let has_ok = false;

	results.forEach(({ file, msg }) => {
		if (!msg) {
			html += err_block(file, 'No response from server');
			return;
		}

		// ── Server error (not a structured response) ──────────────
		if (!msg.success && !msg.created) {
			html += err_block(file, msg.error || 'Unknown error');
			return;
		}

		const created    = msg.created    || [];
		const duplicates = msg.duplicates || [];
		const failed     = msg.failed     || [];
		const miss_d     = msg.missing_domains        || [];
		const miss_s     = msg.missing_subscriptions  || [];

		// ── Created invoices ──────────────────────────────────────
		created.forEach(r => {
			has_ok = true;
			const has_warn = r.missing_domains?.length || r.missing_subscriptions?.length;
			html += `
			<div style="background:${has_warn?'#fffbeb':'#f0fdf4'};
			            border:1px solid ${has_warn?'#fcd34d':'#86efac'};
			            border-radius:6px;padding:8px 12px;margin-bottom:6px;">
				📄 <b>${file}</b> → <b>${r.doc}</b>
				&nbsp;|&nbsp; Invoice: <b>${r.invoice_number}</b>
				&nbsp;|&nbsp; ${r.total_rows} rows imported
				${r.missing_domains?.length ? `<br><span style="color:#b45309;">⚠ Skipped domains: ${r.missing_domains.join(', ')}</span>` : ''}
				${r.missing_subscriptions?.length ? `<br><span style="color:#b45309;">⚠ Skipped subscriptions: ${r.missing_subscriptions.join(', ')}</span>` : ''}
			</div>`;
		});

		// ── Duplicates ────────────────────────────────────────────
		duplicates.forEach(r => {
			html += `
			<div style="background:#f9fafb;border:1px solid #d1d5db;border-radius:6px;padding:8px 12px;margin-bottom:6px;">
				🔁 <b>${file}</b> — Invoice <b>${r.invoice_number}</b> already imported as
				<a href="/app/sale-invoice/${r.existing_doc}" target="_blank">${r.existing_doc}</a>
			</div>`;
		});

		// ── Failed ────────────────────────────────────────────────
		failed.forEach(r => {
			html += err_block(`${file} (${r.invoice_number})`,
				r.error +
				(r.missing_domains?.length        ? `<br>Missing domains: ${r.missing_domains.join(', ')}`               : '') +
				(r.missing_subscriptions?.length  ? `<br>Missing subscriptions: ${r.missing_subscriptions.join(', ')}`   : '')
			);
		});

		// ── Global skips summary ──────────────────────────────────
		if (miss_d.length || miss_s.length) {
			html += `
			<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;
			            padding:8px 12px;margin-bottom:6px;font-size:12px;">
				<b>Register these in Domains / Subscription Plan to import skipped rows:</b>
				${miss_d.length ? `<br>Domains: ${miss_d.join(', ')}` : ''}
				${miss_s.length ? `<br>Subscriptions: ${miss_s.join(', ')}` : ''}
			</div>`;
		}
	});

	html += '</div>';

	frappe.msgprint({
		title:     `Import Results — ${results.length} file(s)`,
		message:   html,
		indicator: has_ok ? 'green' : 'red'
	});

	listview.refresh();
}

function err_block(label, error) {
	return `<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:8px 12px;margin-bottom:6px;">
		❌ <b>${label}</b><br><span style="color:#6b7280;">${error}</span>
	</div>`;
}