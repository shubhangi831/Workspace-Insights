// frappe.listview_settings['Purchase Invoice'] = {
// 	onload: function(listview) {
// 		listview.page.add_inner_button(__('Import'), function() {
// 			show_import_dialog(listview);
// 		});
// 	}
// };

// function show_import_dialog(listview) {

// 	if (!document.getElementById('ws-imp-style')) {
// 		const st = document.createElement('style');
// 		st.id = 'ws-imp-style';
// 		st.textContent = `
// 		.ws-imp * { box-sizing: border-box; font-family: var(--font-stack); }
// 		.ws-drop-zone {
// 			border: 2px dashed #d1d5db; border-radius: 10px;
// 			padding: 36px 20px; text-align: center;
// 			background: #f9fafb; margin-bottom: 14px; transition: all .2s;
// 		}
// 		.ws-drop-zone.dragover { border-color: #1a56db; background: #eef2ff; }
// 		.ws-drop-icon {
// 			width: 52px; height: 52px; background: #e0e7ff; border-radius: 50%;
// 			display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;
// 		}
// 		.ws-drop-icon svg { width: 26px; height: 26px; stroke: #1a56db; fill: none; stroke-width: 2; }
// 		.ws-drop-title { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 5px; }
// 		.ws-drop-sub   { font-size: 13px; color: #6b7280; margin-bottom: 14px; }
// 		.ws-choose-label {
// 			display: inline-block; position: relative;
// 			border: 1.5px solid #1a56db; border-radius: 6px;
// 			padding: 9px 24px; font-size: 13px; font-weight: 600;
// 			color: #1a56db; background: #fff; cursor: pointer;
// 			transition: all .15s;
// 		}
// 		.ws-choose-label:hover { background: #1a56db; color: #fff; }
// 		.ws-choose-label input[type=file] {
// 			position: absolute; top: 0; left: 0;
// 			width: 100%; height: 100%;
// 			opacity: 0; cursor: pointer;
// 		}
// 		.ws-files-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
// 		.ws-file-item {
// 			display: flex; align-items: center; gap: 10px;
// 			background: #f0fdf4; border: 1.5px solid #86efac;
// 			border-radius: 8px; padding: 10px 14px;
// 		}
// 		.ws-file-ico {
// 			width: 34px; height: 34px; border-radius: 7px; background: #dcfce7;
// 			flex-shrink: 0; display: flex; align-items: center; justify-content: center;
// 		}
// 		.ws-file-ico svg { width: 18px; height: 18px; stroke: #16a34a; fill: none; stroke-width: 2; }
// 		.ws-file-nm  { font-size: 13px; font-weight: 600; color: #15803d; }
// 		.ws-file-sz  { font-size: 11px; color: #6b7280; margin-top: 1px; }
// 		.ws-file-del { margin-left: auto; cursor: pointer; color: #9ca3af; font-size: 22px; line-height: 1; }
// 		.ws-file-del:hover { color: #ef4444; }
// 		.ws-add-more {
// 			border: 1.5px dashed #93c5fd; border-radius: 8px; padding: 10px;
// 			text-align: center; color: #1a56db; font-size: 13px; font-weight: 600;
// 			background: #eff6ff; transition: all .15s; cursor: pointer;
// 			position: relative;
// 		}
// 		.ws-add-more:hover { background: #dbeafe; }
// 		.ws-add-more input[type=file] {
// 			position: absolute; top: 0; left: 0;
// 			width: 100%; height: 100%;
// 			opacity: 0; cursor: pointer;
// 		}
// 		.ws-prog-wrap { display: none; margin-bottom: 12px; }
// 		.ws-prog-wrap.show { display: block; }
// 		.ws-prog-lbl { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
// 		.ws-prog-bg  { background: #e5e7eb; border-radius: 99px; height: 7px; overflow: hidden; }
// 		.ws-prog-bar { height: 7px; background: #1a56db; border-radius: 99px; width: 0%; transition: width .4s; }
// 		.ws-note {
// 			background: #eff6ff; border: 1px solid #bfdbfe;
// 			border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #1e40af;
// 		}
// 		`;
// 		document.head.appendChild(st);
// 	}

// 	let sel_files = [];
// 	let importing = false; // import chal raha hai ya nahi

// 	const d = new frappe.ui.Dialog({
// 		title: 'Import Workspace Invoice',
// 		fields: [{
// 			fieldname: 'html',
// 			fieldtype: 'HTML',
// 			options: `
// 			<div class="ws-imp" id="ws-wrap">
// 				<div class="ws-drop-zone" id="ws-dz">
// 					<div class="ws-drop-icon">
// 						<svg viewBox="0 0 24 24">
// 							<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
// 							<polyline points="17 8 12 3 7 8"/>
// 							<line x1="12" y1="3" x2="12" y2="15"/>
// 						</svg>
// 					</div>
// 					<div class="ws-drop-title">Upload CSV File(s)</div>
// 					<div class="ws-drop-sub">
// 						Drag &amp; drop files here, or click below<br>
// 						<small style="color:#9ca3af">Ek ya ek se zyada .csv files select kar sakte hain</small>
// 					</div>
// 					<label class="ws-choose-label">
// 						📂 Choose Files
// 						<input type="file" accept=".csv" multiple id="ws-fi-main">
// 					</label>
// 				</div>
// 				<div class="ws-files-list" id="ws-flist"></div>
// 				<div class="ws-prog-wrap" id="ws-prog">
// 					<div class="ws-prog-lbl" id="ws-prog-lbl">Importing...</div>
// 					<div class="ws-prog-bg"><div class="ws-prog-bar" id="ws-prog-bar"></div></div>
// 				</div>
// 				<div class="ws-note">
// 					<b>Note:</b> Sirf Google Workspace invoice CSV supported hai &nbsp;·&nbsp;
// 					Duplicate invoice automatically skip ho jayegi
// 				</div>
// 			</div>
// 			`
// 		}],
// 		primary_action_label: 'Import',
// 		primary_action: function() {
// 			if (!sel_files.length) {
// 				frappe.show_alert({ message: 'Pehle CSV file(s) select karo!', indicator: 'orange' }, 4);
// 				return;
// 			}
// 			run_import();
// 		},
// 		secondary_action_label: 'Cancel',
// 		secondary_action: function() { d.hide(); }
// 	});

// 	// ── onhide: sirf tab clear karo jab import nahi chal raha ──
// 	d.onhide = function() {
// 		if (!importing) {
// 			sel_files = [];
// 		}
// 	};

// 	d.show();

// 	const wait = setInterval(() => {
// 		const mainInput = document.getElementById('ws-fi-main');
// 		const dz        = document.getElementById('ws-dz');
// 		if (!mainInput || !dz) return;
// 		clearInterval(wait);

// 		mainInput.addEventListener('change', function() {
// 			const files = Array.from(this.files || []);
// 			if (files.length) add_files(files);
// 			this.value = '';
// 		});

// 		dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('dragover'); });
// 		dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
// 		dz.addEventListener('dragend',   () => dz.classList.remove('dragover'));
// 		dz.addEventListener('drop', e => {
// 			e.preventDefault();
// 			dz.classList.remove('dragover');
// 			const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
// 			if (files.length) add_files(files);
// 			else frappe.show_alert({ message: 'Sirf .csv files allowed hain', indicator: 'red' }, 3);
// 		});
// 	}, 100);

// 	function add_files(new_files) {
// 		let added = 0;
// 		for (const f of new_files) {
// 			if (!sel_files.find(x => x.name === f.name)) {
// 				sel_files.push(f);
// 				added++;
// 			} else {
// 				frappe.show_alert({ message: `"${f.name}" already added hai`, indicator: 'orange' }, 3);
// 			}
// 		}
// 		if (added > 0) render();
// 	}

// 	function render() {
// 		const flist = document.getElementById('ws-flist');
// 		const dz    = document.getElementById('ws-dz');

// 		if (!sel_files.length) {
// 			if (flist) flist.innerHTML  = '';
// 			if (dz)    dz.style.display = '';
// 			return;
// 		}
// 		if (dz) dz.style.display = 'none';

// 		if (flist) {
// 			flist.innerHTML =
// 				sel_files.map((f, i) => `
// 					<div class="ws-file-item">
// 						<div class="ws-file-ico">
// 							<svg viewBox="0 0 24 24">
// 								<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
// 								<polyline points="14 2 14 8 20 8"/>
// 							</svg>
// 						</div>
// 						<div>
// 							<div class="ws-file-nm">${f.name}</div>
// 							<div class="ws-file-sz">${fmt_size(f.size)}</div>
// 						</div>
// 						<span class="ws-file-del" data-i="${i}">×</span>
// 					</div>
// 				`).join('') +
// 				`<div class="ws-add-more" id="ws-add-more">
// 					+ Add More Files
// 					<input type="file" accept=".csv" multiple id="ws-fi-more">
// 				</div>`;

// 			flist.querySelectorAll('.ws-file-del').forEach(btn => {
// 				btn.addEventListener('click', () => {
// 					sel_files.splice(parseInt(btn.dataset.i), 1);
// 					render();
// 				});
// 			});

// 			const moreInput = document.getElementById('ws-fi-more');
// 			if (moreInput) {
// 				moreInput.addEventListener('change', function() {
// 					const files = Array.from(this.files || []);
// 					if (files.length) add_files(files);
// 					this.value = '';
// 				});
// 			}
// 		}
// 	}

// 	async function run_import() {
// 		importing = true; // flag set karo — hide karne par clear nahi hoga

// 		const prog    = document.getElementById('ws-prog');
// 		const progBar = document.getElementById('ws-prog-bar');
// 		const progLbl = document.getElementById('ws-prog-lbl');

// 		if (prog) prog.classList.add('show');

// 		const total   = sel_files.length;
// 		const success = [];
// 		const failed  = [];
// 		const dupes   = [];

// 		for (let i = 0; i < total; i++) {
// 			const file = sel_files[i];
// 			if (progLbl) progLbl.textContent = `Processing ${i + 1} of ${total}: ${file.name}`;
// 			if (progBar) progBar.style.width = `${Math.round((i / total) * 85)}%`;

// 			try {
// 				const csv_content = await read_file(file);
// 				const r = await new Promise(resolve => {
// 					frappe.call({
// 						method: 'workspace_insights.workspace_insights.doctype.purchase_invoice.purchase_invoice.import_workspace_csv_content',
// 						args: { csv_content },
// 						callback: resolve,
// 						error:    resolve
// 					});
// 				});

// 				const msg = r && r.message;
// 				if (msg && msg.success) {
// 					success.push({ file: file.name, doc: msg.name, invoice: msg.invoice_number, rows: msg.total_rows });
// 				} else if (msg && msg.duplicate) {
// 					dupes.push({ file: file.name, invoice: msg.invoice_number, existing_doc: msg.existing_doc });
// 				} else {
// 					failed.push({ file: file.name, error: (msg && msg.error) || 'Unknown error' });
// 				}
// 			} catch(e) {
// 				failed.push({ file: file.name, error: String(e) });
// 			}
// 		}

// 		if (progBar) progBar.style.width = '100%';
// 		if (progLbl) progLbl.textContent = 'Done!';

// 		setTimeout(() => {
// 			importing = false; // flag reset
// 			d.hide();
// 			show_results(success, dupes, failed, listview);
// 		}, 400);
// 	}
// }

// // ── Format size ─────────────────────────────────────────────────
// function fmt_size(b) {
// 	if (b < 1024)         return b + ' B';
// 	if (b < 1024 * 1024)  return (b / 1024).toFixed(1) + ' KB';
// 	return (b / (1024 * 1024)).toFixed(1) + ' MB';
// }

// // ── Show Results ────────────────────────────────────────────────
// function show_results(success, dupes, failed, listview) {
// 	let html = '<div style="font-size:13px;line-height:1.8;">';

// 	if (success.length) {
// 		html += `<div style="margin-bottom:12px;"><div style="font-weight:700;color:#15803d;margin-bottom:6px;">✅ ${success.length} file(s) successfully imported:</div>`;
// 		success.forEach(r => {
// 			html += `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:8px 12px;margin-bottom:4px;">
// 				📄 <b>${r.file}</b><br>
// 				<span style="color:#6b7280;">Invoice: ${r.invoice} &nbsp;|&nbsp; ${r.rows} rows &nbsp;|&nbsp; Doc: ${r.doc}</span>
// 			</div>`;
// 		});
// 		html += '</div>';
// 	}
// 	if (dupes.length) {
// 		html += `<div style="margin-bottom:12px;"><div style="font-weight:700;color:#b45309;margin-bottom:6px;">⚠️ ${dupes.length} file(s) skip (Duplicate):</div>`;
// 		dupes.forEach(r => {
// 			html += `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:8px 12px;margin-bottom:4px;">
// 				📄 <b>${r.file}</b><br>
// 				<span style="color:#6b7280;">Invoice <b>${r.invoice}</b> already exist → <b>${r.existing_doc}</b></span>
// 			</div>`;
// 		});
// 		html += '</div>';
// 	}
// 	if (failed.length) {
// 		html += `<div style="margin-bottom:12px;"><div style="font-weight:700;color:#dc2626;margin-bottom:6px;">❌ ${failed.length} file(s) failed:</div>`;
// 		failed.forEach(r => {
// 			html += `<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:8px 12px;margin-bottom:4px;">
// 				📄 <b>${r.file}</b><br><span style="color:#6b7280;">${r.error}</span>
// 			</div>`;
// 		});
// 		html += '</div>';
// 	}

// 	html += '</div>';
// 	frappe.msgprint({
// 		title: `Import Results (${success.length + dupes.length + failed.length} files)`,
// 		message: html,
// 		indicator: success.length ? 'green' : (dupes.length ? 'orange' : 'red')
// 	});
// 	listview.refresh();
// }

// // ── Read file ───────────────────────────────────────────────────
// function read_file(file) {
// 	return new Promise((resolve, reject) => {
// 		const r = new FileReader();
// 		r.onload  = e => resolve(e.target.result);
// 		r.onerror = reject;
// 		r.readAsText(file, 'utf-8');
// 	});
// }

frappe.listview_settings['Purchase Invoice'] = {
	onload: function(listview) {
		listview.page.add_inner_button(__('Import'), function() {
			show_import_dialog(listview);
		});
	}
};

function show_import_dialog(listview) {

	if (!document.getElementById('ws-imp-style')) {
		const st = document.createElement('style');
		st.id = 'ws-imp-style';
		st.textContent = `
		.ws-imp * { box-sizing: border-box; font-family: var(--font-stack); }
		.ws-drop-zone {
			border: 2px dashed #d1d5db; border-radius: 10px;
			padding: 36px 20px; text-align: center;
			background: #f9fafb; margin-bottom: 14px; transition: all .2s;
		}
		.ws-drop-zone.dragover { border-color: #1a56db; background: #eef2ff; }
		.ws-drop-icon {
			width: 52px; height: 52px; background: #e0e7ff; border-radius: 50%;
			display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;
		}
		.ws-drop-icon svg { width: 26px; height: 26px; stroke: #1a56db; fill: none; stroke-width: 2; }
		.ws-drop-title { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 5px; }
		.ws-drop-sub   { font-size: 13px; color: #6b7280; margin-bottom: 14px; }
		.ws-choose-label {
			display: inline-block; position: relative;
			border: 1.5px solid #1a56db; border-radius: 6px;
			padding: 9px 24px; font-size: 13px; font-weight: 600;
			color: #1a56db; background: #fff; cursor: pointer;
			transition: all .15s;
		}
		.ws-choose-label:hover { background: #1a56db; color: #fff; }
		.ws-choose-label input[type=file] {
			position: absolute; top: 0; left: 0;
			width: 100%; height: 100%;
			opacity: 0; cursor: pointer;
		}
		.ws-files-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
		.ws-file-item {
			display: flex; align-items: center; gap: 10px;
			background: #f0fdf4; border: 1.5px solid #86efac;
			border-radius: 8px; padding: 10px 14px;
		}
		.ws-file-ico {
			width: 34px; height: 34px; border-radius: 7px; background: #dcfce7;
			flex-shrink: 0; display: flex; align-items: center; justify-content: center;
		}
		.ws-file-ico svg { width: 18px; height: 18px; stroke: #16a34a; fill: none; stroke-width: 2; }
		.ws-file-nm  { font-size: 13px; font-weight: 600; color: #15803d; }
		.ws-file-sz  { font-size: 11px; color: #6b7280; margin-top: 1px; }
		.ws-file-del { margin-left: auto; cursor: pointer; color: #9ca3af; font-size: 22px; line-height: 1; }
		.ws-file-del:hover { color: #ef4444; }
		.ws-add-more {
			border: 1.5px dashed #93c5fd; border-radius: 8px; padding: 10px;
			text-align: center; color: #1a56db; font-size: 13px; font-weight: 600;
			background: #eff6ff; transition: all .15s; cursor: pointer;
			position: relative;
		}
		.ws-add-more:hover { background: #dbeafe; }
		.ws-add-more input[type=file] {
			position: absolute; top: 0; left: 0;
			width: 100%; height: 100%;
			opacity: 0; cursor: pointer;
		}
		.ws-prog-wrap { display: none; margin-bottom: 12px; }
		.ws-prog-wrap.show { display: block; }
		.ws-prog-lbl { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
		.ws-prog-bg  { background: #e5e7eb; border-radius: 99px; height: 7px; overflow: hidden; }
		.ws-prog-bar { height: 7px; background: #1a56db; border-radius: 99px; width: 0%; transition: width .4s; }
		.ws-note {
			background: #eff6ff; border: 1px solid #bfdbfe;
			border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #1e40af;
		}
		`;
		document.head.appendChild(st);
	}

	let sel_files = [];
	let d_wrapper  = null; // dialog wrapper reference

	const d = new frappe.ui.Dialog({
		title: 'Import Workspace Invoice',
		fields: [{
			fieldname: 'html',
			fieldtype: 'HTML',
			options: `
			<div class="ws-imp" id="ws-wrap">
				<div class="ws-drop-zone" id="ws-dz">
					<div class="ws-drop-icon">
						<svg viewBox="0 0 24 24">
							<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
							<polyline points="17 8 12 3 7 8"/>
							<line x1="12" y1="3" x2="12" y2="15"/>
						</svg>
					</div>
					<div class="ws-drop-title">Upload CSV File(s)</div>
					<div class="ws-drop-sub">
						Drag &amp; drop files here, or click below<br>
						<small style="color:#9ca3af">Ek ya ek se zyada .csv files select kar sakte hain</small>
					</div>
					<label class="ws-choose-label">
						📂 Choose Files
						<input type="file" accept=".csv" multiple id="ws-fi-main">
					</label>
				</div>
				<div class="ws-files-list" id="ws-flist"></div>
				<div class="ws-prog-wrap" id="ws-prog">
					<div class="ws-prog-lbl" id="ws-prog-lbl">Importing...</div>
					<div class="ws-prog-bg"><div class="ws-prog-bar" id="ws-prog-bar"></div></div>
				</div>
				<div class="ws-note">
					<b>Note:</b> Sirf Google Workspace invoice CSV supported hai &nbsp;·&nbsp;
					Duplicate invoice automatically skip ho jayegi
				</div>
			</div>
			`
		}],
		primary_action_label: 'Import',
		primary_action: function() {
			if (!sel_files.length) {
				frappe.show_alert({ message: 'Pehle CSV file(s) select karo!', indicator: 'orange' }, 4);
				return;
			}
			run_import();
		},
		secondary_action_label: 'Cancel',
		secondary_action: function() { d.hide(); }
	});

	d.onhide = function() { sel_files = []; };

	d.show();

	// ── d.$wrapper save karo — render mein use hoga ──
	d_wrapper = d.$wrapper;

	// ── DOM ready hone par events attach karo ──
	const wait = setInterval(() => {
		const mainInput = d_wrapper.find('#ws-fi-main')[0];
		const dz        = d_wrapper.find('#ws-dz')[0];
		if (!mainInput || !dz) return;
		clearInterval(wait);

		// ✅ FIX 1: this.value = '' hataया — change event hamesha fire karega
		mainInput.addEventListener('change', function() {
			const files = Array.from(this.files || []);
			if (files.length) add_files(files);
		});

		dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('dragover'); });
		dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
		dz.addEventListener('dragend',   () => dz.classList.remove('dragover'));
		dz.addEventListener('drop', e => {
			e.preventDefault();
			dz.classList.remove('dragover');
			const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
			if (files.length) add_files(files);
			else frappe.show_alert({ message: 'Sirf .csv files allowed hain', indicator: 'red' }, 3);
		});
	}, 100);

	function add_files(new_files) {
		let added = 0;
		for (const f of new_files) {
			if (!sel_files.find(x => x.name === f.name)) {
				sel_files.push(f);
				added++;
			} else {
				frappe.show_alert({ message: `"${f.name}" already added hai`, indicator: 'orange' }, 3);
			}
		}
		if (added > 0) render();
	}

	function render() {
		// ✅ FIX 2: d.$wrapper.find() use karo — getElementById nahi
		const flist = d_wrapper.find('#ws-flist')[0];
		const dz    = d_wrapper.find('#ws-dz')[0];

		if (!sel_files.length) {
			if (flist) flist.innerHTML  = '';
			if (dz)    dz.style.display = '';
			return;
		}

		if (dz) dz.style.display = 'none';

		if (flist) {
			flist.innerHTML =
				sel_files.map((f, i) => `
					<div class="ws-file-item">
						<div class="ws-file-ico">
							<svg viewBox="0 0 24 24">
								<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
								<polyline points="14 2 14 8 20 8"/>
							</svg>
						</div>
						<div>
							<div class="ws-file-nm">${f.name}</div>
							<div class="ws-file-sz">${fmt_size(f.size)}</div>
						</div>
						<span class="ws-file-del" data-i="${i}">×</span>
					</div>
				`).join('') +
				`<div class="ws-add-more">
					+ Add More Files
					<input type="file" accept=".csv" multiple class="ws-fi-more">
				</div>`;

			// Delete buttons
			flist.querySelectorAll('.ws-file-del').forEach(btn => {
				btn.addEventListener('click', () => {
					sel_files.splice(parseInt(btn.dataset.i), 1);
					render();
				});
			});

			// ✅ FIX 3: Add More input — bhi value reset nahi
			flist.querySelectorAll('.ws-fi-more').forEach(inp => {
				inp.addEventListener('change', function() {
					const files = Array.from(this.files || []);
					if (files.length) add_files(files);
				});
			});
		}
	}

	async function run_import() {
		const prog    = d_wrapper.find('#ws-prog')[0];
		const progBar = d_wrapper.find('#ws-prog-bar')[0];
		const progLbl = d_wrapper.find('#ws-prog-lbl')[0];

		if (prog) prog.classList.add('show');

		const total   = sel_files.length;
		const success = [];
		const failed  = [];
		const dupes   = [];

		for (let i = 0; i < total; i++) {
			const file = sel_files[i];
			if (progLbl) progLbl.textContent = `Processing ${i + 1} of ${total}: ${file.name}`;
			if (progBar) progBar.style.width = `${Math.round((i / total) * 85)}%`;

			try {
				const csv_content = await read_file(file);
				const r = await new Promise(resolve => {
					frappe.call({
						method: 'workspace_insights.workspace_insights.doctype.purchase_invoice.purchase_invoice.import_workspace_csv_content',
						args: { csv_content },
						callback: resolve,
						error:    resolve
					});
				});

				const msg = r && r.message;
				if (msg && msg.success) {
					success.push({ file: file.name, doc: msg.name, invoice: msg.invoice_number, rows: msg.total_rows });
				} else if (msg && msg.duplicate) {
					dupes.push({ file: file.name, invoice: msg.invoice_number, existing_doc: msg.existing_doc });
				} else {
					failed.push({ file: file.name, error: (msg && msg.error) || 'Unknown error' });
				}
			} catch(e) {
				failed.push({ file: file.name, error: String(e) });
			}
		}

		if (progBar) progBar.style.width = '100%';
		if (progLbl) progLbl.textContent = 'Done!';

		setTimeout(() => {
			d.hide();
			show_results(success, dupes, failed, listview);
		}, 400);
	}
}

function fmt_size(b) {
	if (b < 1024)        return b + ' B';
	if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
	return (b / (1024 * 1024)).toFixed(1) + ' MB';
}

function show_results(success, dupes, failed, listview) {
	let html = '<div style="font-size:13px;line-height:1.8;">';
	if (success.length) {
		html += `<div style="margin-bottom:12px;"><div style="font-weight:700;color:#15803d;margin-bottom:6px;">✅ ${success.length} file(s) successfully imported:</div>`;
		success.forEach(r => {
			html += `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:8px 12px;margin-bottom:4px;">
				📄 <b>${r.file}</b><br>
				<span style="color:#6b7280;">Invoice: ${r.invoice} &nbsp;|&nbsp; ${r.rows} rows &nbsp;|&nbsp; Doc: ${r.doc}</span>
			</div>`;
		});
		html += '</div>';
	}
	if (dupes.length) {
		html += `<div style="margin-bottom:12px;"><div style="font-weight:700;color:#b45309;margin-bottom:6px;">⚠️ ${dupes.length} file(s) skip (Duplicate):</div>`;
		dupes.forEach(r => {
			html += `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:8px 12px;margin-bottom:4px;">
				📄 <b>${r.file}</b><br>
				<span style="color:#6b7280;">Invoice <b>${r.invoice}</b> already exist → <b>${r.existing_doc}</b></span>
			</div>`;
		});
		html += '</div>';
	}
	if (failed.length) {
		html += `<div style="margin-bottom:12px;"><div style="font-weight:700;color:#dc2626;margin-bottom:6px;">❌ ${failed.length} file(s) failed:</div>`;
		failed.forEach(r => {
			html += `<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:8px 12px;margin-bottom:4px;">
				📄 <b>${r.file}</b><br><span style="color:#6b7280;">${r.error}</span>
			</div>`;
		});
		html += '</div>';
	}
	html += '</div>';
	frappe.msgprint({
		title: `Import Results (${success.length + dupes.length + failed.length} files)`,
		message: html,
		indicator: success.length ? 'green' : (dupes.length ? 'orange' : 'red')
	});
	listview.refresh();
}

function read_file(file) {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload  = e => resolve(e.target.result);
		r.onerror = reject;
		r.readAsText(file, 'utf-8');
	});
}














