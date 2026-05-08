// Copyright (c) 2026, sk and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Purchase Invoice", {
// 	refresh(frm) {

// 	},
// });

// Purchase Invoice — Client Script
// Frappe Desk mein Purchase Invoice form par Import CSV button add karta hai

frappe.ui.form.on('Purchase Invoice', {

	refresh: function(frm) {

		// ── Sirf New doc mein Import button dikhao ──
		if (frm.is_new()) {

			frm.add_custom_button(__('📂 Import CSV'), function() {
				import_csv_dialog(frm);
			}, __('Actions'));

		} else {
			// Already saved doc mein bhi re-import ka option do
			frm.add_custom_button(__('📂 Re-Import CSV'), function() {
				frappe.confirm(
					`Invoice <b>${frm.doc.invoice_number}</b> ke saare child rows replace ho jayenge. Continue?`,
					function() { import_csv_dialog(frm, true); }
				);
			}, __('Actions'));
		}
	}
});


function import_csv_dialog(frm, replace_mode) {

	// ── File picker dialog ──
	const d = new frappe.ui.Dialog({
		title: 'Google Workspace Invoice CSV Import',
		fields: [
			{
				fieldname: 'info',
				fieldtype: 'HTML',
				options: `
					<div style="
						background: #eef2ff;
						border: 1px solid #c7d7fc;
						border-radius: 6px;
						padding: 12px 14px;
						margin-bottom: 4px;
						font-size: 13px;
						color: #1e40af;
					">
						<b>CSV Format:</b> Google Workspace invoice CSV file select karo.<br>
						Header mein Invoice number, Billing ID, Invoice date hona chahiye.
					</div>
				`
			},
			{
				fieldname: 'csv_file',
				fieldtype: 'Attach',
				label: 'CSV File Upload karo',
				reqd: 1,
				options: { restrictions: { allowed_file_types: ['.csv'] } }
			}
		],
		primary_action_label: 'Import',
		primary_action: function(values) {

			if (!values.csv_file) {
				frappe.msgprint('Pehle CSV file select karo!');
				return;
			}

			d.hide();

			// Loading indicator
			frappe.show_progress('Importing...', 30, 100, 'CSV parse ho raha hai...');

			frappe.call({
				method: 'workspace_insights.workspace_insights.doctype.workspace_analysis.workspace_analysis_import.import_workspace_csv',
				args: { file_url: values.csv_file },
				callback: function(r) {
					frappe.hide_progress();

					if (r.exc) {
						frappe.msgprint({
							title: 'Import Failed',
							message: r.exc,
							indicator: 'red'
						});
						return;
					}

					if (r.message && r.message.success) {
						const res = r.message;

						frappe.show_alert({
							message: `✓ ${res.message}`,
							indicator: 'green'
						}, 6);

						// Form reload karo naya data dekhne ke liye
						if (frm.is_new()) {
							frappe.set_route('Form', 'Purchase Invoice', res.name);
						} else {
							frm.reload_doc();
						}
					}
				},
				error: function(err) {
					frappe.hide_progress();
					frappe.msgprint({
						title: 'Error',
						message: 'Import mein error aaya: ' + (err.message || 'Unknown error'),
						indicator: 'red'
					});
				}
			});
		}
	});

	d.show();
}