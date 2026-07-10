// Copyright (c) 2026, sk and contributors
// For license information, please see license.txt


// frappe.listview_settings['Sale Invoice'] = {
// 	onload: function (listview) {
// 		setTimeout(() => {
// 			listview.page.add_button(__('📂 Import'), function () {
// 				show_import_dialog(listview);
// 			}, { btn_class: 'btn-default' });
// 		}, 300);
// 	}
// };


// function show_import_dialog(listview) {

// 	if (!document.getElementById('si-imp-style')) {
// 		const st = document.createElement('style');
// 		st.id = 'si-imp-style';
// 		st.textContent = `
// 		.si-imp * { box-sizing: border-box; font-family: var(--font-stack); }
// 		.si-section-title {
// 			font-size: 12px; font-weight: 700; color: #374151;
// 			margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
// 		}
// 		.si-drop-zone {
// 			border: 2px dashed #d1d5db; border-radius: 10px;
// 			padding: 28px 20px; text-align: center;
// 			background: #f9fafb; margin-bottom: 10px; transition: all .2s;
// 		}
// 		.si-drop-zone.dragover { border-color: #059669; background: #ecfdf5; }
// 		.si-drop-icon {
// 			width: 44px; height: 44px; background: #d1fae5; border-radius: 50%;
// 			display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;
// 		}
// 		.si-drop-icon svg { width: 22px; height: 22px; stroke: #059669; fill: none; stroke-width: 2; }
// 		.si-drop-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 3px; }
// 		.si-drop-sub   { font-size: 11px; color: #6b7280; margin-bottom: 10px; }
// 		.si-choose-label {
// 			display: inline-block; position: relative;
// 			border: 1.5px solid #059669; border-radius: 6px;
// 			padding: 7px 18px; font-size: 12px; font-weight: 600;
// 			color: #059669; background: #fff; cursor: pointer; transition: all .15s;
// 		}
// 		.si-choose-label:hover { background: #059669; color: #fff; }
// 		.si-choose-label input[type=file] {
// 			position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
// 		}
// 		.si-pdf-zone {
// 			border: 2px dashed #c4b5fd; border-radius: 10px;
// 			padding: 16px; text-align: center;
// 			background: #faf5ff; margin-bottom: 10px; transition: all .2s;
// 		}
// 		.si-pdf-zone.dragover { border-color: #7c3aed; background: #ede9fe; }
// 		.si-pdf-choose {
// 			display: inline-block; position: relative;
// 			border: 1.5px solid #7c3aed; border-radius: 6px;
// 			padding: 7px 18px; font-size: 12px; font-weight: 600;
// 			color: #7c3aed; background: #fff; cursor: pointer; transition: all .15s;
// 		}
// 		.si-pdf-choose:hover { background: #7c3aed; color: #fff; }
// 		.si-pdf-choose input[type=file] {
// 			position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
// 		}
// 		.si-files-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
// 		.si-file-item {
// 			display: flex; align-items: center; gap: 10px;
// 			background: #f0fdf4; border: 1.5px solid #86efac;
// 			border-radius: 8px; padding: 8px 12px;
// 		}
// 		.si-pdf-item {
// 			display: flex; align-items: center; gap: 10px;
// 			background: #faf5ff; border: 1.5px solid #c4b5fd;
// 			border-radius: 8px; padding: 8px 12px;
// 		}
// 		.si-file-ico { width: 28px; height: 28px; border-radius: 5px; background: #dcfce7;
// 			flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
// 		.si-pdf-ico  { width: 28px; height: 28px; border-radius: 5px; background: #ede9fe;
// 			flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
// 		.si-file-ico svg, .si-pdf-ico svg { width: 14px; height: 14px; fill: none; stroke-width: 2; }
// 		.si-file-ico svg { stroke: #16a34a; }
// 		.si-pdf-ico  svg { stroke: #7c3aed; }
// 		.si-file-nm  { font-size: 12px; font-weight: 600; color: #15803d; }
// 		.si-pdf-nm   { font-size: 12px; font-weight: 600; color: #6d28d9; }
// 		.si-file-sz  { font-size: 10px; color: #6b7280; margin-top: 1px; }
// 		.si-file-del { margin-left: auto; cursor: pointer; color: #9ca3af; font-size: 18px; line-height:1; }
// 		.si-file-del:hover { color: #ef4444; }
// 		.si-add-more {
// 			border: 1.5px dashed #6ee7b7; border-radius: 8px; padding: 8px;
// 			text-align: center; color: #059669; font-size: 12px; font-weight: 600;
// 			background: #f0fdf4; cursor: pointer; position: relative;
// 		}
// 		.si-add-more:hover { background: #dcfce7; }
// 		.si-add-more input[type=file] {
// 			position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
// 		}
// 		.si-pdf-more {
// 			border: 1.5px dashed #c4b5fd; border-radius: 8px; padding: 8px;
// 			text-align: center; color: #7c3aed; font-size: 12px; font-weight: 600;
// 			background: #faf5ff; cursor: pointer; position: relative; margin-top: 6px;
// 		}
// 		.si-pdf-more:hover { background: #ede9fe; }
// 		.si-pdf-more input[type=file] {
// 			position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
// 		}
// 		.si-prog-wrap { display: none; margin-bottom: 12px; }
// 		.si-prog-wrap.show { display: block; }
// 		.si-prog-lbl { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
// 		.si-prog-bg  { background: #e5e7eb; border-radius: 99px; height: 6px; overflow: hidden; }
// 		.si-prog-bar { height: 6px; background: #059669; border-radius: 99px; width: 0%; transition: width .4s; }
// 		.si-divider  { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
// 		.si-note {
// 			background: #ecfdf5; border: 1px solid #a7f3d0;
// 			border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #065f46;
// 		}
// 		`;
// 		document.head.appendChild(st);
// 	}

// 	const EXCEL_EXT = ['.csv', '.xlsx', '.xls'];
// 	const is_excel  = f => EXCEL_EXT.some(ext => f.name.toLowerCase().endsWith(ext));
// 	const is_pdf    = f => f.name.toLowerCase().endsWith('.pdf');

// 	let sel_files = [];
// 	let sel_pdfs  = [];
// 	let d_wrapper = null;

// 	const d = new frappe.ui.Dialog({
// 		title: 'Import Sale Invoice',
// 		fields: [{
// 			fieldname: 'html', fieldtype: 'HTML',
// 			options: `
// 			<div class="si-imp" id="si-wrap">
// 				<div class="si-section-title">
// 					<svg width="14" height="14" fill="none" stroke="#059669" stroke-width="2" viewBox="0 0 24 24">
// 						<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
// 						<polyline points="14 2 14 8 20 8"/>
// 					</svg>
// 					Excel / CSV File
// 				</div>
// 				<div class="si-drop-zone" id="si-dz">
// 					<div class="si-drop-icon">
// 						<svg viewBox="0 0 24 24">
// 							<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
// 							<polyline points="17 8 12 3 7 8"/>
// 							<line x1="12" y1="3" x2="12" y2="15"/>
// 						</svg>
// 					</div>
// 					<div class="si-drop-title">Upload Invoice Data File</div>
// 					<div class="si-drop-sub">Drag & drop or click below<br><small style="color:#9ca3af">Supported: .csv, .xlsx</small></div>
// 					<label class="si-choose-label">
// 						Choose Excel/CSV
// 						<input type="file" accept=".csv,.xlsx,.xls" multiple id="si-fi-main">
// 					</label>
// 				</div>
// 				<div class="si-files-list" id="si-flist"></div>

// 				<hr class="si-divider">

// 				<div class="si-section-title">
// 					<svg width="14" height="14" fill="none" stroke="#7c3aed" stroke-width="2" viewBox="0 0 24 24">
// 						<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
// 						<polyline points="14 2 14 8 20 8"/>
// 						<line x1="9" y1="13" x2="15" y2="13"/>
// 					</svg>
// 					PDF Files (Optional — for Invoice Attachment)
// 				</div>
// 				<div class="si-pdf-zone" id="si-pdz">
// 					<div style="font-size:11px;color:#6b7280;margin-bottom:8px;">
// 						Excel mein <b>pdf_file</b> column mein PDF ka naam likho (e.g. INV-001.pdf)<br>
// 						Aur usi naam ki PDF yahan upload karo — automatically attach ho jayegi
// 					</div>
// 					<label class="si-pdf-choose">
// 						Choose PDF Files
// 						<input type="file" accept=".pdf" multiple id="si-fi-pdf">
// 					</label>
// 				</div>
// 				<div class="si-files-list" id="si-plist"></div>

// 				<hr class="si-divider">

// 				<div class="si-prog-wrap" id="si-prog">
// 					<div class="si-prog-lbl" id="si-prog-lbl">Importing...</div>
// 					<div class="si-prog-bg"><div class="si-prog-bar" id="si-prog-bar"></div></div>
// 				</div>

// 				<div class="si-note">
// 					<b>Required:</b> invoice_number, invoice_date, domain, subscription, quantity, amount<br>
// 					<b>Optional:</b> bill_to, due_date, start_date, end_date, description, order_name, po_number, licenses, <b>pdf_file</b>
// 				</div>
// 			</div>`
// 		}],
// 		primary_action_label: 'Import',
// 		primary_action: function () {
// 			if (!sel_files.length) {
// 				frappe.show_alert({ message: 'Please select an Excel/CSV file first', indicator: 'orange' }, 4);
// 				return;
// 			}
// 			run_import();
// 		},
// 		secondary_action_label: 'Cancel',
// 		secondary_action: function () { d.hide(); }
// 	});

// 	d.onhide = function () {
// 		sel_files = []; sel_pdfs = [];
// 		if (d._attach_timer) { clearTimeout(d._attach_timer); d._attach_timer = null; }
// 	};
// 	d.show();
// 	d_wrapper = d.$wrapper;

// 	d._attach_timer = setTimeout(() => {
// 		const mainInput = d_wrapper.find('#si-fi-main')[0];
// 		const pdfInput  = d_wrapper.find('#si-fi-pdf')[0];
// 		const dz        = d_wrapper.find('#si-dz')[0];
// 		const pdz       = d_wrapper.find('#si-pdz')[0];

// 		if (mainInput) mainInput.addEventListener('change', function () { add_excel(Array.from(this.files || [])); });
// 		if (pdfInput)  pdfInput.addEventListener('change',  function () { add_pdfs(Array.from(this.files || [])); });

// 		if (dz) {
// 			dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('dragover'); });
// 			dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
// 			dz.addEventListener('drop', e => {
// 				e.preventDefault(); dz.classList.remove('dragover');
// 				const files = Array.from(e.dataTransfer.files).filter(is_excel);
// 				if (files.length) add_excel(files);
// 				else frappe.show_alert({ message: 'Only .csv or .xlsx files are allowed', indicator: 'red' }, 3);
// 			});
// 		}

// 		if (pdz) {
// 			pdz.addEventListener('dragover',  e => { e.preventDefault(); pdz.classList.add('dragover'); });
// 			pdz.addEventListener('dragleave', () => pdz.classList.remove('dragover'));
// 			pdz.addEventListener('drop', e => {
// 				e.preventDefault(); pdz.classList.remove('dragover');
// 				const files = Array.from(e.dataTransfer.files).filter(is_pdf);
// 				if (files.length) add_pdfs(files);
// 				else frappe.show_alert({ message: 'Only .pdf files are allowed', indicator: 'red' }, 3);
// 			});
// 		}
// 	}, 150);

// 	function add_excel(new_files) {
// 		let added = 0;
// 		for (const f of new_files) {
// 			if (!is_excel(f)) { frappe.show_alert({ message: `"${f.name}" is not supported`, indicator: 'orange' }, 3); continue; }
// 			if (!sel_files.find(x => x.name === f.name)) { sel_files.push(f); added++; }
// 			else frappe.show_alert({ message: `"${f.name}" is already added`, indicator: 'orange' }, 3);
// 		}
// 		if (added > 0) render_excel();
// 	}

// 	function render_excel() {
// 		const flist = d_wrapper.find('#si-flist')[0];
// 		const dz    = d_wrapper.find('#si-dz')[0];
// 		if (!sel_files.length) { if (flist) flist.innerHTML = ''; if (dz) dz.style.display = ''; return; }
// 		if (dz) dz.style.display = 'none';
// 		if (flist) {
// 			flist.innerHTML = sel_files.map((f, i) => `
// 				<div class="si-file-item">
// 					<div class="si-file-ico">
// 						<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
// 					</div>
// 					<div>
// 						<div class="si-file-nm">${f.name}</div>
// 						<div class="si-file-sz">${fmt_size(f.size)}</div>
// 					</div>
// 					<span class="si-file-del" data-i="${i}" data-type="excel">×</span>
// 				</div>`).join('') +
// 				`<div class="si-add-more">+ Add More Excel/CSV
// 					<input type="file" accept=".csv,.xlsx,.xls" multiple class="si-fi-more">
// 				</div>`;
// 			flist.querySelectorAll('.si-file-del[data-type="excel"]').forEach(btn => {
// 				btn.addEventListener('click', () => { sel_files.splice(parseInt(btn.dataset.i), 1); render_excel(); });
// 			});
// 			flist.querySelectorAll('.si-fi-more').forEach(inp => {
// 				inp.addEventListener('change', function () { add_excel(Array.from(this.files || [])); });
// 			});
// 		}
// 	}

// 	function add_pdfs(new_files) {
// 		let added = 0;
// 		for (const f of new_files) {
// 			if (!is_pdf(f)) { frappe.show_alert({ message: `"${f.name}" is not a PDF file`, indicator: 'orange' }, 3); continue; }
// 			if (!sel_pdfs.find(x => x.name === f.name)) { sel_pdfs.push(f); added++; }
// 			else frappe.show_alert({ message: `"${f.name}" is already added`, indicator: 'orange' }, 3);
// 		}
// 		if (added > 0) render_pdfs();
// 	}

// 	function render_pdfs() {
// 		const plist = d_wrapper.find('#si-plist')[0];
// 		const pdz   = d_wrapper.find('#si-pdz')[0];
// 		if (!sel_pdfs.length) { if (plist) plist.innerHTML = ''; if (pdz) pdz.style.display = ''; return; }
// 		if (pdz) pdz.style.display = 'none';
// 		if (plist) {
// 			plist.innerHTML = sel_pdfs.map((f, i) => `
// 				<div class="si-pdf-item">
// 					<div class="si-pdf-ico">
// 						<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
// 					</div>
// 					<div>
// 						<div class="si-pdf-nm">${f.name}</div>
// 						<div class="si-file-sz">${fmt_size(f.size)}</div>
// 					</div>
// 					<span class="si-file-del" data-i="${i}" data-type="pdf">×</span>
// 				</div>`).join('') +
// 				`<div class="si-pdf-more">+ Add More PDFs
// 					<input type="file" accept=".pdf" multiple class="si-fi-pdf-more">
// 				</div>`;
// 			plist.querySelectorAll('.si-file-del[data-type="pdf"]').forEach(btn => {
// 				btn.addEventListener('click', () => { sel_pdfs.splice(parseInt(btn.dataset.i), 1); render_pdfs(); });
// 			});
// 			plist.querySelectorAll('.si-fi-pdf-more').forEach(inp => {
// 				inp.addEventListener('change', function () { add_pdfs(Array.from(this.files || [])); });
// 			});
// 		}
// 	}

// 	async function run_import() {
// 		const prog    = d_wrapper.find('#si-prog')[0];
// 		const progBar = d_wrapper.find('#si-prog-bar')[0];
// 		const progLbl = d_wrapper.find('#si-prog-lbl')[0];
// 		if (prog) prog.classList.add('show');

// 		// Read all PDFs as base64 — { filename: base64_string }
// 		const pdf_map = {};
// 		for (const pdf of sel_pdfs) {
// 			try { pdf_map[pdf.name] = await read_as_base64(pdf); }
// 			catch(e) { console.error('PDF read error:', pdf.name, e); }
// 		}

// 		const results = [];

// 		for (let i = 0; i < sel_files.length; i++) {
// 			const file = sel_files[i];
// 			if (progLbl) progLbl.textContent = `Processing ${i + 1} of ${sel_files.length}: ${file.name}`;
// 			if (progBar) progBar.style.width  = `${Math.round((i / sel_files.length) * 85)}%`;

// 			try {
// 				const { content, file_type } = await read_file_content(file);
// 				const r = await new Promise(resolve => {
// 					frappe.call({
// 						method:   'workspace_insights.workspace_insights.doctype.sale_invoice.sale_invoice.import_sale_invoice_csv',
// 						args:     { csv_content: content, file_type, pdf_files: pdf_map },
// 						callback: resolve,
// 						error:    resolve
// 					});
// 				});
// 				results.push({ file: file.name, msg: r && r.message });
// 			} catch (e) {
// 				results.push({ file: file.name, msg: { success: false, error: String(e) } });
// 			}
// 		}

// 		if (progBar) progBar.style.width  = '100%';
// 		if (progLbl) progLbl.textContent   = 'Done!';
// 		setTimeout(() => { d.hide(); show_results(results, listview); }, 400);
// 	}
// }



// function read_file_content(file) {
// 	const is_xlsx = /\.(xlsx|xls)$/i.test(file.name);
// 	return new Promise((resolve, reject) => {
// 		const reader = new FileReader();
// 		if (is_xlsx) {
// 			reader.onload = e => {
// 				const bytes  = new Uint8Array(e.target.result);
// 				let   binary = '';
// 				for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
// 				resolve({ content: btoa(binary), file_type: 'xlsx' });
// 			};
// 			reader.onerror = reject;
// 			reader.readAsArrayBuffer(file);
// 		} else {
// 			reader.onload  = e => resolve({ content: e.target.result, file_type: 'csv' });
// 			reader.onerror = reject;
// 			reader.readAsText(file, 'utf-8');
// 		}
// 	});
// }

// function read_as_base64(file) {
// 	return new Promise((resolve, reject) => {
// 		const reader = new FileReader();
// 		reader.onload = e => {
// 			const bytes  = new Uint8Array(e.target.result);
// 			let   binary = '';
// 			for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
// 			resolve(btoa(binary));
// 		};
// 		reader.onerror = reject;
// 		reader.readAsArrayBuffer(file);
// 	});
// }

// function fmt_size(b) {
// 	if (b < 1024)        return b + ' B';
// 	if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
// 	return (b / (1024 * 1024)).toFixed(1) + ' MB';
// }



// function show_results(results, listview) {
// 	let html   = '<div style="font-size:13px;line-height:1.8;">';
// 	let has_ok = false;

// 	results.forEach(({ file, msg }) => {
// 		if (!msg) { html += err_block(file, 'No response from server'); return; }
// 		if (!msg.success && !msg.created) { html += err_block(file, msg.error || 'Unknown error'); return; }

// 		const created    = msg.created    || [];
// 		const duplicates = msg.duplicates || [];
// 		const failed     = msg.failed     || [];
// 		const miss_d     = msg.missing_domains        || [];
// 		const miss_s     = msg.missing_subscriptions  || [];

// 		created.forEach(r => {
// 			has_ok = true;
// 			const has_warn = r.missing_domains?.length || r.missing_subscriptions?.length;
// 			html += `
// 			<div style="background:${has_warn?'#fffbeb':'#f0fdf4'};
// 			            border:1px solid ${has_warn?'#fcd34d':'#86efac'};
// 			            border-radius:6px;padding:8px 12px;margin-bottom:6px;">
// 				📄 <b>${file}</b> → <b>${r.doc}</b>
// 				&nbsp;|&nbsp; Invoice: <b>${r.invoice_number}</b>
// 				&nbsp;|&nbsp; ${r.total_rows} rows
// 				${r.pdf_attached ? `&nbsp;|&nbsp; <span style="color:#7c3aed;">📎 PDF attached</span>` : ''}
// 				${r.missing_domains?.length ? `<br><span style="color:#b45309;">⚠ Skipped domains: ${r.missing_domains.join(', ')}</span>` : ''}
// 				${r.missing_subscriptions?.length ? `<br><span style="color:#b45309;">⚠ Skipped subscriptions: ${r.missing_subscriptions.join(', ')}</span>` : ''}
// 			</div>`;
// 		});

// 		duplicates.forEach(r => {
// 			html += `
// 			<div style="background:#f9fafb;border:1px solid #d1d5db;border-radius:6px;padding:8px 12px;margin-bottom:6px;">
// 				🔁 <b>${file}</b> — Invoice <b>${r.invoice_number}</b> already exists:
// 				<a href="/app/sale-invoice/${r.existing_doc}" target="_blank">${r.existing_doc}</a>
// 			</div>`;
// 		});

// 		failed.forEach(r => { html += err_block(`${file} (${r.invoice_number})`, r.error || 'Failed'); });

// 		if (miss_d.length || miss_s.length) {
// 			html += `
// 			<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;
// 			            padding:8px 12px;margin-bottom:6px;font-size:12px;">
// 				<b>Please register these before importing:</b>
// 				${miss_d.length ? `<br>Domains: ${miss_d.join(', ')}` : ''}
// 				${miss_s.length ? `<br>Subscriptions: ${miss_s.join(', ')}` : ''}
// 			</div>`;
// 		}
// 	});

// 	html += '</div>';
// 	frappe.msgprint({ title: `Import Results — ${results.length} file(s)`, message: html, indicator: has_ok ? 'green' : 'red' });
// 	listview.refresh();
// }

// function err_block(label, error) {
// 	return `<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:8px 12px;margin-bottom:6px;">
// 		❌ <b>${label}</b><br><span style="color:#6b7280;">${error}</span>
// 	</div>`;
// apps/workspace_insights/workspace_insights/workspace_insights/doctype/sale_invoice/__pycache__}








frappe.listview_settings['Sale Invoice'] = {
	onload: function (listview) {
		setTimeout(() => {
			listview.page.add_button(__('📂 Import'), function () {
				show_import_dialog(listview);
			}, { btn_class: 'btn-default' });
		}, 300);
	}
};


function show_import_dialog(listview) {

	if (!document.getElementById('si-imp-style')) {
		const st = document.createElement('style');
		st.id = 'si-imp-style';
		st.textContent = `
		.si-imp * { box-sizing: border-box; font-family: var(--font-stack); }
		.si-section-title {
			font-size: 12px; font-weight: 700; color: #374151;
			margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
		}
		.si-drop-zone {
			border: 2px dashed #d1d5db; border-radius: 10px;
			padding: 28px 20px; text-align: center;
			background: #f9fafb; margin-bottom: 10px; transition: all .2s;
		}
		.si-drop-zone.dragover { border-color: #059669; background: #ecfdf5; }
		.si-drop-icon {
			width: 44px; height: 44px; background: #d1fae5; border-radius: 50%;
			display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;
		}
		.si-drop-icon svg { width: 22px; height: 22px; stroke: #059669; fill: none; stroke-width: 2; }
		.si-drop-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 3px; }
		.si-drop-sub   { font-size: 11px; color: #6b7280; margin-bottom: 10px; }
		.si-choose-label {
			display: inline-block; position: relative;
			border: 1.5px solid #059669; border-radius: 6px;
			padding: 7px 18px; font-size: 12px; font-weight: 600;
			color: #059669; background: #fff; cursor: pointer; transition: all .15s;
		}
		.si-choose-label:hover { background: #059669; color: #fff; }
		.si-choose-label input[type=file] {
			position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
		}
		.si-pdf-zone {
			border: 2px dashed #c4b5fd; border-radius: 10px;
			padding: 16px; text-align: center;
			background: #faf5ff; margin-bottom: 10px; transition: all .2s;
		}
		.si-pdf-zone.dragover { border-color: #7c3aed; background: #ede9fe; }
		.si-pdf-choose {
			display: inline-block; position: relative;
			border: 1.5px solid #7c3aed; border-radius: 6px;
			padding: 7px 18px; font-size: 12px; font-weight: 600;
			color: #7c3aed; background: #fff; cursor: pointer; transition: all .15s;
		}
		.si-pdf-choose:hover { background: #7c3aed; color: #fff; }
		.si-pdf-choose input[type=file] {
			position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
		}
		.si-files-list {
			display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px;
			max-height: 200px; overflow-y: auto; padding-right: 4px;
		}
		.si-files-list::-webkit-scrollbar { width: 4px; }
		.si-files-list::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
		.si-file-item {
			display: flex; align-items: center; gap: 10px;
			background: #f0fdf4; border: 1.5px solid #86efac;
			border-radius: 8px; padding: 8px 12px; flex-shrink: 0;
		}
		.si-pdf-item {
			display: flex; align-items: center; gap: 10px;
			background: #faf5ff; border: 1.5px solid #c4b5fd;
			border-radius: 8px; padding: 8px 12px; flex-shrink: 0;
		}
		.si-file-ico { width: 28px; height: 28px; border-radius: 5px; background: #dcfce7;
			flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
		.si-pdf-ico  { width: 28px; height: 28px; border-radius: 5px; background: #ede9fe;
			flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
		.si-file-ico svg, .si-pdf-ico svg { width: 14px; height: 14px; fill: none; stroke-width: 2; }
		.si-file-ico svg { stroke: #16a34a; }
		.si-pdf-ico  svg { stroke: #7c3aed; }
		.si-file-nm  { font-size: 12px; font-weight: 600; color: #15803d; }
		.si-pdf-nm   { font-size: 12px; font-weight: 600; color: #6d28d9; }
		.si-file-sz  { font-size: 10px; color: #6b7280; margin-top: 1px; }
		.si-file-del { margin-left: auto; cursor: pointer; color: #9ca3af; font-size: 18px; line-height:1; flex-shrink: 0; }
		.si-file-del:hover { color: #ef4444; }
		.si-add-more {
			border: 1.5px dashed #6ee7b7; border-radius: 8px; padding: 8px;
			text-align: center; color: #059669; font-size: 12px; font-weight: 600;
			background: #f0fdf4; cursor: pointer; position: relative; flex-shrink: 0;
		}
		.si-add-more:hover { background: #dcfce7; }
		.si-add-more input[type=file] {
			position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
		}
		.si-pdf-more {
			border: 1.5px dashed #c4b5fd; border-radius: 8px; padding: 8px;
			text-align: center; color: #7c3aed; font-size: 12px; font-weight: 600;
			background: #faf5ff; cursor: pointer; position: relative; margin-top: 6px; flex-shrink: 0;
		}
		.si-pdf-more:hover { background: #ede9fe; }
		.si-pdf-more input[type=file] {
			position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
		}
		.si-prog-wrap { display: none; margin-bottom: 12px; }
		.si-prog-wrap.show { display: block; }
		.si-prog-lbl { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
		.si-prog-bg  { background: #e5e7eb; border-radius: 99px; height: 6px; overflow: hidden; }
		.si-prog-bar { height: 6px; background: #059669; border-radius: 99px; width: 0%; transition: width .4s; }
		.si-divider  { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
		.si-note {
			background: #ecfdf5; border: 1px solid #a7f3d0;
			border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #065f46;
		}
		`;
		document.head.appendChild(st);
	}

	const EXCEL_EXT = ['.csv', '.xlsx', '.xls'];
	const is_excel  = f => EXCEL_EXT.some(ext => f.name.toLowerCase().endsWith(ext));
	const is_pdf    = f => f.name.toLowerCase().endsWith('.pdf');

	let sel_files = [];
	let sel_pdfs  = [];
	let d_wrapper = null;

	const d = new frappe.ui.Dialog({
		title: 'Import Sale Invoice',
		fields: [{
			fieldname: 'html', fieldtype: 'HTML',
			options: `
			<div class="si-imp" id="si-wrap">
				<div class="si-section-title">
					<svg width="14" height="14" fill="none" stroke="#059669" stroke-width="2" viewBox="0 0 24 24">
						<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
						<polyline points="14 2 14 8 20 8"/>
					</svg>
					Excel / CSV File
				</div>
				<div class="si-drop-zone" id="si-dz">
					<div class="si-drop-icon">
						<svg viewBox="0 0 24 24">
							<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
							<polyline points="17 8 12 3 7 8"/>
							<line x1="12" y1="3" x2="12" y2="15"/>
						</svg>
					</div>
					<div class="si-drop-title">Upload Invoice Data File</div>
					<div class="si-drop-sub">Drag & drop or click below<br><small style="color:#9ca3af">Supported: .csv, .xlsx</small></div>
					<label class="si-choose-label">
						Choose Excel/CSV
						<input type="file" accept=".csv,.xlsx,.xls" multiple id="si-fi-main">
					</label>
				</div>
				<div class="si-files-list" id="si-flist"></div>

				<hr class="si-divider">

				<div class="si-section-title">
					<svg width="14" height="14" fill="none" stroke="#7c3aed" stroke-width="2" viewBox="0 0 24 24">
						<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
						<polyline points="14 2 14 8 20 8"/>
						<line x1="9" y1="13" x2="15" y2="13"/>
					</svg>
					PDF Files (Optional — for Invoice Attachment)
				</div>
				<div class="si-pdf-zone" id="si-pdz">
					<div style="font-size:11px;color:#6b7280;margin-bottom:8px;">
						Excel mein <b>pdf_file</b> column mein PDF ka naam likho (e.g. INV-001.pdf)<br>
						Aur usi naam ki PDF yahan upload karo — automatically attach ho jayegi
					</div>
					<label class="si-pdf-choose">
						Choose PDF Files
						<input type="file" accept=".pdf" multiple id="si-fi-pdf">
					</label>
				</div>
				<div class="si-files-list" id="si-plist"></div>

				<hr class="si-divider">

				<div class="si-prog-wrap" id="si-prog">
					<div class="si-prog-lbl" id="si-prog-lbl">Importing...</div>
					<div class="si-prog-bg"><div class="si-prog-bar" id="si-prog-bar"></div></div>
				</div>

				<div class="si-note">
					<b>Required:</b> invoice_number, invoice_date, domain, subscription, quantity, amount<br>
					<b>Optional:</b> bill_to, due_date, start_date, end_date, description, order_name, po_number, licenses, <b>pdf_file</b>
				</div>
			</div>`
		}],
		primary_action_label: 'Import',
		primary_action: function () {
			if (!sel_files.length) {
				frappe.show_alert({ message: 'Please select an Excel/CSV file first', indicator: 'orange' }, 4);
				return;
			}
			run_import();
		},
		secondary_action_label: 'Cancel',
		secondary_action: function () { d.hide(); }
	});

	d.onhide = function () {
		sel_files = []; sel_pdfs = [];
		if (d._attach_timer) { clearTimeout(d._attach_timer); d._attach_timer = null; }
	};
	d.show();
	d_wrapper = d.$wrapper;

	d._attach_timer = setTimeout(() => {
		const mainInput = d_wrapper.find('#si-fi-main')[0];
		const pdfInput  = d_wrapper.find('#si-fi-pdf')[0];
		const dz        = d_wrapper.find('#si-dz')[0];
		const pdz       = d_wrapper.find('#si-pdz')[0];

		if (mainInput) mainInput.addEventListener('change', function () { add_excel(Array.from(this.files || [])); });
		if (pdfInput)  pdfInput.addEventListener('change',  function () { add_pdfs(Array.from(this.files || [])); });

		if (dz) {
			dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('dragover'); });
			dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
			dz.addEventListener('drop', e => {
				e.preventDefault(); dz.classList.remove('dragover');
				const files = Array.from(e.dataTransfer.files).filter(is_excel);
				if (files.length) add_excel(files);
				else frappe.show_alert({ message: 'Only .csv or .xlsx files are allowed', indicator: 'red' }, 3);
			});
		}

		if (pdz) {
			pdz.addEventListener('dragover',  e => { e.preventDefault(); pdz.classList.add('dragover'); });
			pdz.addEventListener('dragleave', () => pdz.classList.remove('dragover'));
			pdz.addEventListener('drop', e => {
				e.preventDefault(); pdz.classList.remove('dragover');
				const files = Array.from(e.dataTransfer.files).filter(is_pdf);
				if (files.length) add_pdfs(files);
				else frappe.show_alert({ message: 'Only .pdf files are allowed', indicator: 'red' }, 3);
			});
		}
	}, 150);

	function add_excel(new_files) {
		let added = 0;
		for (const f of new_files) {
			if (!is_excel(f)) { frappe.show_alert({ message: `"${f.name}" is not supported`, indicator: 'orange' }, 3); continue; }
			if (!sel_files.find(x => x.name === f.name)) { sel_files.push(f); added++; }
			else frappe.show_alert({ message: `"${f.name}" is already added`, indicator: 'orange' }, 3);
		}
		if (added > 0) render_excel();
	}

	function render_excel() {
		const flist = d_wrapper.find('#si-flist')[0];
		const dz    = d_wrapper.find('#si-dz')[0];
		if (!sel_files.length) { if (flist) flist.innerHTML = ''; if (dz) dz.style.display = ''; return; }
		if (dz) dz.style.display = 'none';
		if (flist) {
			flist.innerHTML = sel_files.map((f, i) => `
				<div class="si-file-item">
					<div class="si-file-ico">
						<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
					</div>
					<div>
						<div class="si-file-nm">${f.name}</div>
						<div class="si-file-sz">${fmt_size(f.size)}</div>
					</div>
					<span class="si-file-del" data-i="${i}" data-type="excel">×</span>
				</div>`).join('') +
				`<div class="si-add-more">+ Add More Excel/CSV
					<input type="file" accept=".csv,.xlsx,.xls" multiple class="si-fi-more">
				</div>`;
			flist.querySelectorAll('.si-file-del[data-type="excel"]').forEach(btn => {
				btn.addEventListener('click', () => { sel_files.splice(parseInt(btn.dataset.i), 1); render_excel(); });
			});
			flist.querySelectorAll('.si-fi-more').forEach(inp => {
				inp.addEventListener('change', function () { add_excel(Array.from(this.files || [])); });
			});
		}
	}

	function add_pdfs(new_files) {
		let added = 0;
		for (const f of new_files) {
			if (!is_pdf(f)) { frappe.show_alert({ message: `"${f.name}" is not a PDF file`, indicator: 'orange' }, 3); continue; }
			if (!sel_pdfs.find(x => x.name === f.name)) { sel_pdfs.push(f); added++; }
			else frappe.show_alert({ message: `"${f.name}" is already added`, indicator: 'orange' }, 3);
		}
		if (added > 0) render_pdfs();
	}

	function render_pdfs() {
		const plist = d_wrapper.find('#si-plist')[0];
		const pdz   = d_wrapper.find('#si-pdz')[0];
		if (!sel_pdfs.length) { if (plist) plist.innerHTML = ''; if (pdz) pdz.style.display = ''; return; }
		if (pdz) pdz.style.display = 'none';
		if (plist) {
			plist.innerHTML = sel_pdfs.map((f, i) => `
				<div class="si-pdf-item">
					<div class="si-pdf-ico">
						<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
					</div>
					<div>
						<div class="si-pdf-nm">${f.name}</div>
						<div class="si-file-sz">${fmt_size(f.size)}</div>
					</div>
					<span class="si-file-del" data-i="${i}" data-type="pdf">×</span>
				</div>`).join('') +
				`<div class="si-pdf-more">+ Add More PDFs
					<input type="file" accept=".pdf" multiple class="si-fi-pdf-more">
				</div>`;
			plist.querySelectorAll('.si-file-del[data-type="pdf"]').forEach(btn => {
				btn.addEventListener('click', () => { sel_pdfs.splice(parseInt(btn.dataset.i), 1); render_pdfs(); });
			});
			plist.querySelectorAll('.si-fi-pdf-more').forEach(inp => {
				inp.addEventListener('change', function () { add_pdfs(Array.from(this.files || [])); });
			});
		}
	}

	async function run_import() {
		const prog    = d_wrapper.find('#si-prog')[0];
		const progBar = d_wrapper.find('#si-prog-bar')[0];
		const progLbl = d_wrapper.find('#si-prog-lbl')[0];
		if (prog) prog.classList.add('show');

		const pdf_map = {};
		for (const pdf of sel_pdfs) {
			try { pdf_map[pdf.name] = await read_as_base64(pdf); }
			catch(e) { console.error('PDF read error:', pdf.name, e); }
		}

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
						args:     { csv_content: content, file_type, pdf_files: pdf_map },
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

function read_as_base64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = e => {
			const bytes  = new Uint8Array(e.target.result);
			let   binary = '';
			for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
			resolve(btoa(binary));
		};
		reader.onerror = reject;
		reader.readAsArrayBuffer(file);
	});
}

function fmt_size(b) {
	if (b < 1024)        return b + ' B';
	if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
	return (b / (1024 * 1024)).toFixed(1) + ' MB';
}


function show_results(results, listview) {
	let html   = '<div style="font-size:13px;line-height:1.8;">';
	let has_ok = false;

	results.forEach(({ file, msg }) => {
		if (!msg) { html += err_block(file, 'No response from server'); return; }
		if (!msg.success && !msg.created) { html += err_block(file, msg.error || 'Unknown error'); return; }

		const created    = msg.created    || [];
		const duplicates = msg.duplicates || [];
		const failed     = msg.failed     || [];
		const miss_d     = msg.missing_domains        || [];
		const miss_s     = msg.missing_subscriptions  || [];

		created.forEach(r => {
			has_ok = true;
			const has_warn = r.missing_domains?.length || r.missing_subscriptions?.length;
			html += `
			<div style="background:${has_warn?'#fffbeb':'#f0fdf4'};
			            border:1px solid ${has_warn?'#fcd34d':'#86efac'};
			            border-radius:6px;padding:8px 12px;margin-bottom:6px;">
				📄 <b>${file}</b> → <b>${r.doc}</b>
				&nbsp;|&nbsp; Invoice: <b>${r.invoice_number}</b>
				&nbsp;|&nbsp; ${r.total_rows} rows
				${r.pdf_attached ? `&nbsp;|&nbsp; <span style="color:#7c3aed;">📎 PDF attached</span>` : ''}
				${r.missing_domains?.length ? `<br><span style="color:#b45309;">⚠ Skipped domains: ${r.missing_domains.join(', ')}</span>` : ''}
				${r.missing_subscriptions?.length ? `<br><span style="color:#b45309;">⚠ Skipped subscriptions: ${r.missing_subscriptions.join(', ')}</span>` : ''}
			</div>`;
		});

		duplicates.forEach(r => {
			html += `
			<div style="background:#f9fafb;border:1px solid #d1d5db;border-radius:6px;padding:8px 12px;margin-bottom:6px;">
				🔁 <b>${file}</b> — Invoice <b>${r.invoice_number}</b> already exists:
				<a href="/app/sale-invoice/${r.existing_doc}" target="_blank">${r.existing_doc}</a>
			</div>`;
		});

		failed.forEach(r => { html += err_block(`${file} (${r.invoice_number})`, r.error || 'Failed'); });

		if (miss_d.length || miss_s.length) {
			html += `
			<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;
			            padding:8px 12px;margin-bottom:6px;font-size:12px;">
				<b>Please register these before importing:</b>
				${miss_d.length ? `<br>Domains: ${miss_d.join(', ')}` : ''}
				${miss_s.length ? `<br>Subscriptions: ${miss_s.join(', ')}` : ''}
			</div>`;
		}
	});

	html += '</div>';

	const result_dialog = new frappe.ui.Dialog({
		title:  `Import Results — ${results.length} file(s)`,
		fields: [{ fieldname: 'body', fieldtype: 'HTML',
		           options: `<div style="max-height:460px;overflow-y:auto;padding-right:6px;">${html}</div>` }],
		size:   'large'
	});
	result_dialog.show();
	listview.refresh();
}

function err_block(label, error) {
	return `<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:8px 12px;margin-bottom:6px;">
		❌ <b>${label}</b><br><span style="color:#6b7280;">${error}</span>
	</div>`;
}














