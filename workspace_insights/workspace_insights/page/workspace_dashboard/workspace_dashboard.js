// frappe.pages['workspace-dashboard'].on_page_load = function (wrapper) {

//     frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Workspace Dashboard',
//         single_column: true
//     });

//     // ── CSS ──────────────────────────────────────────────────────
//     if (!document.getElementById('ws-style')) {
//         const s = document.createElement('style');
//         s.id = 'ws-style';
//         s.textContent = `
//         .ws { padding: 20px 28px; font-family: var(--font-stack); }
//         .ws * { box-sizing: border-box; }

//         /* CARDS */
//         .ws-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 20px; }
//         .ws-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px 18px; }
//         .ws-card-lbl { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 6px; }
//         .ws-card-val { font-size: 26px; font-weight: 800; color: var(--text-color); }
//         .ws-card-sub { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
//         .ws-card.blue   .ws-card-val { color: #1a56db; }
//         .ws-card.green  .ws-card-val { color: #059669; }
//         .ws-card.purple .ws-card-val { color: #7c3aed; }

//         /* IMPORT BOX */
//         .ws-import {
//             background: var(--card-bg);
//             border: 1.5px dashed var(--border-color);
//             border-radius: 8px; padding: 16px 20px;
//             margin-bottom: 20px;
//             display: flex; align-items: flex-start; gap: 16px;
//         }
//         .ws-import.drag { border-color: #1a56db; background: #eef2ff; }
//         .ws-import-btn {
//             background: #1a56db; color: #fff; border: none;
//             border-radius: 6px; padding: 9px 18px; font-size: 13px;
//             font-weight: 600; cursor: pointer; white-space: nowrap;
//             display: flex; align-items: center; gap: 6px; flex-shrink: 0;
//         }
//         .ws-import-btn:hover { background: #1648c9; }
//         .ws-import-btn svg { width:15px; height:15px; fill:none; stroke:#fff; stroke-width:2; }
//         .ws-fstatus { font-size: 13px; font-weight: 600; color: var(--text-color); }
//         .ws-fstatus.ok { color: #059669; }
//         .ws-fsub { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

//         /* BILLING PILLS */
//         .ws-bill-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
//         .ws-bill-pill {
//             background: #eef2ff; color: #1a56db;
//             border: 1px solid #c7d7fc; border-radius: 20px;
//             padding: 3px 10px; font-size: 11px; font-weight: 700;
//             cursor: pointer; transition: all .15s;
//         }
//         .ws-bill-pill:hover  { background: #1a56db; color: #fff; }
//         .ws-bill-pill.active { background: #1a56db; color: #fff; }

//         /* FILTERS */
//         .ws-filters {
//             background: var(--card-bg);
//             border: 1px solid var(--border-color);
//             border-radius: 8px; padding: 14px 18px;
//             margin-bottom: 20px;
//             display: flex; align-items: flex-end; flex-wrap: wrap; gap: 16px;
//         }
//         .ws-filter-group { display: flex; flex-direction: column; gap: 5px; }
//         .ws-filter-group label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; }

//         /* SEARCH */
//         .ws-search-wrap { position: relative; }
//         .ws-search-wrap input {
//             border: 1.5px solid var(--border-color); border-radius: 6px;
//             padding: 7px 12px 7px 32px; font-size: 13px; width: 260px;
//             background: var(--control-bg); color: var(--text-color); outline: none;
//         }
//         .ws-search-wrap input:focus { border-color: #1a56db; }
//         .ws-search-icon {
//             position: absolute; left: 9px; top: 50%; transform: translateY(-50%);
//             width: 15px; height: 15px; stroke: var(--text-muted);
//             fill: none; stroke-width: 2; pointer-events: none;
//         }
//         .ws-dropdown {
//             position: absolute; top: calc(100% + 4px); left: 0;
//             background: var(--card-bg); border: 1px solid var(--border-color);
//             border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,.12);
//             max-height: 220px; overflow-y: auto; width: 260px; z-index: 999;
//             display: none;
//         }
//         .ws-dropdown.show { display: block; }
//         .ws-dd-item {
//             padding: 9px 12px; font-size: 13px; cursor: pointer;
//             color: var(--text-color); border-bottom: 1px solid var(--border-color);
//         }
//         .ws-dd-item:last-child { border-bottom: none; }
//         .ws-dd-item:hover    { background: #eef2ff; color: #1a56db; }
//         .ws-dd-item.selected { background: #1a56db; color: #fff; }
//         .ws-dd-empty { padding: 10px 12px; font-size: 12px; color: var(--text-muted); }

//         /* MONTH SELECT */
//         .ws-month-sel {
//             border: 1.5px solid var(--border-color); border-radius: 6px;
//             padding: 7px 10px; font-size: 13px;
//             background: var(--control-bg); color: var(--text-color);
//             outline: none; cursor: pointer;
//         }
//         .ws-month-sel:focus { border-color: #1a56db; }

//         /* CLEAR BTN */
//         .ws-clear-btn {
//             background: none; border: 1px solid var(--border-color);
//             border-radius: 6px; padding: 7px 14px; font-size: 12px;
//             color: var(--text-muted); cursor: pointer;
//         }
//         .ws-clear-btn:hover { border-color: #e53e3e; color: #e53e3e; }

//         /* TABLE PANEL */
//         .ws-panel { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
//         .ws-panel-hdr { padding: 14px 18px; border-bottom: 1px solid var(--border-color); }
//         .ws-panel-hdr h3 { font-size: 15px; font-weight: 700; color: var(--text-color); margin: 0; }
//         .ws-panel-sub { font-size: 12px; color: var(--text-muted); margin-top: 3px; }
//         .ws-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
//         .ws-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }

//         /* HEADER ROW 1 — product group names */
//         .ws-table thead tr:first-child th {
//             background: #1e40af; color: #ffffff;
//             padding: 11px 13px; font-size: 11px; font-weight: 700;
//             letter-spacing: .7px; text-align: center; white-space: nowrap;
//             border-right: 1px solid rgba(255,255,255,.15);
//         }
//         .ws-table thead tr:first-child th.tl { text-align: left; }
//         .ws-table thead tr:first-child th.sub-hdr { color: #bfdbfe; }

//         /* HEADER ROW 2 — AMT / LIC */
//         .ws-table thead tr:last-child th {
//             background: #dbeafe; padding: 7px 13px; font-size: 10px;
//             font-weight: 700; color: #1e40af; text-align: center;
//             border-bottom: 2px solid #93c5fd; white-space: nowrap;
//         }

//         .ws-table tbody tr:hover td { background: #f0f9ff !important; }
//         .ws-table tbody tr:nth-child(odd)  td { background: var(--card-bg); }
//         .ws-table tbody tr:nth-child(even) td { background: #f8fafc; }
//         .ws-table td {
//             padding: 9px 13px; border-bottom: 1px solid var(--border-color);
//             text-align: right; color: var(--text-muted); white-space: nowrap;
//         }
//         .ws-table td.mn  { text-align: left; font-weight: 700; color: var(--text-color); }
//         .ws-table td.am  { color: #1a56db; font-family: monospace; }
//         .ws-table td.nd  { color: #cbd5e1; }

//         /* FOOTER */
//         .ws-table tfoot tr td {
//             background: #1e40af !important; color: #ffffff;
//             font-weight: 700; border-top: 2px solid #1e3a8a;
//             border-bottom: none; padding: 11px 13px; text-align: right;
//         }
//         .ws-table tfoot tr td.mn  { text-align: left; color: #fde68a; }
//         .ws-table tfoot tr td.am  { color: #bfdbfe; font-family: monospace; }
//         .ws-table tfoot tr td.lic { color: #ffffff; }

//         /* EMPTY */
//         .ws-empty { text-align: center; padding: 60px 20px; color: var(--text-muted); }
//         .ws-empty-icon { font-size: 44px; margin-bottom: 12px; }
//         .ws-empty p { font-size: 14px; }

//         /* NO RESULT */
//         .ws-no-result {
//             text-align: center; padding: 40px 20px;
//             color: var(--text-muted); font-size: 13px;
//             background: var(--card-bg); border: 1px solid var(--border-color);
//             border-radius: 8px;
//         }

//         @media(max-width:768px){ .ws-cards { grid-template-columns: repeat(2,1fr); } }
//         `;
//         document.head.appendChild(s);
//     }

//     // ── HTML ─────────────────────────────────────────────────────
//     $(wrapper).find('.layout-main-section').html(`
//     <div class="ws">

//         <div class="ws-cards">
//             <div class="ws-card">
//                 <div class="ws-card-lbl">Total Domains</div>
//                 <div class="ws-card-val" id="ws-domains">—</div>
//                 <div class="ws-card-sub">Active customers</div>
//             </div>
//             <div class="ws-card blue">
//                 <div class="ws-card-lbl">Total Revenue</div>
//                 <div class="ws-card-val" id="ws-revenue">—</div>
//                 <div class="ws-card-sub">Across all domains</div>
//             </div>
//             <div class="ws-card green">
//                 <div class="ws-card-lbl">Total Licenses</div>
//                 <div class="ws-card-val" id="ws-licenses">—</div>
//                 <div class="ws-card-sub">Active licenses</div>
//             </div>
//             <div class="ws-card purple">
//                 <div class="ws-card-lbl">Time Period</div>
//                 <div class="ws-card-val" id="ws-period">—</div>
//                 <div class="ws-card-sub">Months of data</div>
//             </div>
//         </div>

//         <div class="ws-import" id="ws-ibox">
//             <button class="ws-import-btn" id="ws-ibtn">
//                 <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
//                 Import CSV Files
//             </button>
//             <input type="file" id="ws-finput" accept=".csv" multiple style="display:none"/>
//             <div style="flex:1">
//                 <div class="ws-fstatus" id="ws-fstatus">Koi file import nahi hui abhi</div>
//                 <div class="ws-fsub">Google Workspace invoice CSV files import karo — drag &amp; drop bhi supported hai</div>
//                 <div class="ws-bill-pills" id="ws-bills"></div>
//             </div>
//         </div>

//         <div class="ws-filters" id="ws-filters" style="display:none">
//             <div class="ws-filter-group">
//                 <label>Domain Search</label>
//                 <div class="ws-search-wrap" id="ws-sw">
//                     <svg class="ws-search-icon" viewBox="0 0 24 24">
//                         <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
//                     </svg>
//                     <input type="text" id="ws-search" placeholder="Search domain..." autocomplete="off"/>
//                     <div class="ws-dropdown" id="ws-dd"></div>
//                 </div>
//             </div>
//             <div class="ws-filter-group">
//                 <label>From Month</label>
//                 <select class="ws-month-sel" id="ws-from"></select>
//             </div>
//             <div class="ws-filter-group">
//                 <label>To Month</label>
//                 <select class="ws-month-sel" id="ws-to"></select>
//             </div>
//             <div class="ws-filter-group">
//                 <label>&nbsp;</label>
//                 <button class="ws-clear-btn" id="ws-clear">Clear</button>
//             </div>
//         </div>

//         <div id="ws-result"></div>

//         <div class="ws-empty" id="ws-empty">
//             <div class="ws-empty-icon">📊</div>
//             <p>Google Workspace invoice CSV files import karo — dashboard yahan dikhega</p>
//         </div>

//     </div>
//     `);

//     // ── DATA ─────────────────────────────────────────────────────
//     const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     let invoices = [];
//     let selectedBid = null;
//     let selectedDom = null;
//     let allDomains = [];
//     let allMonths = [];

//     // ── HELPERS ──────────────────────────────────────────────────
//     function mkey(m) {
//         if (!m) return 0;
//         const [a, b] = m.split(' ');
//         return parseInt(b) * 100 + MO.indexOf(a) + 1;
//     }

//     function fmtAmt(n) {
//         return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//     }

//     // ── CSV PARSER ───────────────────────────────────────────────
//     function parseLine(ln) {
//         const r = []; let c = '', q = false;
//         for (const ch of ln) {
//             if (ch === '"') q = !q;
//             else if (ch === ',' && !q) { r.push(c.trim()); c = ''; }
//             else c += ch;
//         }
//         r.push(c.trim());
//         return r;
//     }

//     function parseCSV(txt) {
//         const lines = txt.replace(/\r/g, '').replace(/^\uFEFF/, '')
//             .split('\n').map(l => l.trim()).filter(Boolean);

//         let billingId = '', invoiceNumber = '', invoiceDate = '', dueDate = '';
//         let hidx = -1;

//         for (let i = 0; i < lines.length; i++) {
//             const c = parseLine(lines[i]);
//             if (c[0] === 'Invoice number') invoiceNumber = c[1];
//             if (c[0] === 'Invoice date') invoiceDate = c[1];
//             if (c[0] === 'Due Date') dueDate = c[1];
//             if (c[0] === 'Billing ID') billingId = c[1];
//             if (c[0] === 'Account') { hidx = i; break; }
//         }

//         if (!billingId || hidx < 0) return null;

//         const pts = invoiceDate.trim().split(/\s+/);
//         const month = pts.length >= 3 ? pts[1] + ' ' + pts[2] : invoiceDate;
//         // function parseMonth(dateStr) {
//         //     dateStr = dateStr.trim();
//         //     // Format: "31-Mar-26" or "31-Mar-2026"
//         //     if (dateStr.includes('-')) {
//         //         const p = dateStr.split('-');           // ["31","Mar","26"]
//         //         const mon = p[1];                       // "Mar"
//         //         const yr = p[2].length === 2
//         //             ? '20' + p[2]               // "26" → "2026"
//         //             : p[2];                     // "2026" as-is
//         //         return mon + ' ' + yr;                  // "Mar 2026" ✓
//         //     }
//         //     // Format: "31 Mar 2026" (space separated)
//         //     const p = dateStr.split(/\s+/);
//         //     return p.length >= 3 ? p[1] + ' ' + p[2] : dateStr;
//         // }
//         // const month = parseMonth(invoiceDate);

//         const records = [];
//         for (let i = hidx + 1; i < lines.length; i++) {
//             const c = parseLine(lines[i]);
//             const dom = (c[0] || '').replace(/^\uFEFF/, '').toLowerCase().trim();
//             if (!dom || !dom.includes('.')) continue;
//             const sub = (c[1] || '').trim();
//             if (!sub) continue;
//             const amt = parseFloat((c[8] || '').replace(/,/g, '')) || 0;
//             const qty = parseInt(c[6]) || 0;
//             const subClean = sub
//                 .replace(/^Google Workspace\s+/, '')
//                 .replace(/^G Suite\s+/, 'G Suite ');
//             records.push({ dom, sub: subClean, qty, amt });
//         }

//         return { billingId, invoiceNumber, invoiceDate, dueDate, month, records };
//     }

//     // ── REBUILD INDEX ────────────────────────────────────────────
//     function rebuildIndex() {
//         const invs = selectedBid
//             ? invoices.filter(i => i.billingId === selectedBid)
//             : invoices;

//         const ds = new Set();
//         const ms = new Set();
//         for (const inv of invs) {
//             ms.add(inv.month);
//             for (const r of inv.records) ds.add(r.dom);
//         }
//         allDomains = Array.from(ds).sort();
//         allMonths = Array.from(ms).sort((a, b) => mkey(a) - mkey(b));
//     }

//     // ── CARDS ────────────────────────────────────────────────────
//     function refreshCards() {
//         const invs = selectedBid
//             ? invoices.filter(i => i.billingId === selectedBid)
//             : invoices;
//         const ds = new Set();
//         let rev = 0, lic = 0;
//         for (const inv of invs) {
//             for (const r of inv.records) {
//                 ds.add(r.dom); rev += r.amt; lic += r.qty;
//             }
//         }
//         document.getElementById('ws-domains').textContent = ds.size;
//         document.getElementById('ws-revenue').textContent = fmtAmt(rev);
//         document.getElementById('ws-licenses').textContent = lic.toLocaleString('en-IN');
//         document.getElementById('ws-period').textContent = new Set(invs.map(i => i.month)).size;
//     }

//     // ── BILLING PILLS ────────────────────────────────────────────
//     function refreshBills() {
//         const bids = [...new Set(invoices.map(i => i.billingId))];

//         const allPill = `<span class="ws-bill-pill${!selectedBid ? ' active' : ''}" data-bid="">All</span>`;
//         const clearBtn = `<span class="ws-bill-pill" id="ws-clear-bid" style="background:none;border:1px solid #e53e3e;color:#e53e3e;margin-left:4px;">✕ Clear</span>`;

//         document.getElementById('ws-bills').innerHTML =
//             allPill +
//             bids.map(b => `<span class="ws-bill-pill${b === selectedBid ? ' active' : ''}" data-bid="${b}">${b}</span>`).join('') +
//             clearBtn;

//         document.querySelectorAll('.ws-bill-pill').forEach(p => {
//             p.onclick = function () {

//                 // ── CLEAR ALL DATA ──
//                 if (this.id === 'ws-clear-bid') {
//                     invoices = [];
//                     selectedBid = null;
//                     selectedDom = null;
//                     allDomains = [];
//                     allMonths = [];

//                     document.getElementById('ws-search').value = '';
//                     document.getElementById('ws-result').innerHTML = '';
//                     document.getElementById('ws-bills').innerHTML = '';
//                     document.getElementById('ws-filters').style.display = 'none';
//                     document.getElementById('ws-empty').style.display = 'block';

//                     document.getElementById('ws-domains').textContent = '—';
//                     document.getElementById('ws-revenue').textContent = '—';
//                     document.getElementById('ws-licenses').textContent = '—';
//                     document.getElementById('ws-period').textContent = '—';

//                     document.getElementById('ws-from').innerHTML = '';
//                     document.getElementById('ws-to').innerHTML = '';

//                     const st = document.getElementById('ws-fstatus');
//                     st.textContent = 'Koi file import nahi hui abhi';
//                     st.className = 'ws-fstatus';
//                     return;
//                 }

//                 // ── BILLING ID SELECT ──
//                 selectedBid = this.dataset.bid || null;
//                 selectedDom = null;
//                 document.getElementById('ws-search').value = '';
//                 document.getElementById('ws-result').innerHTML = '';
//                 refreshBills();
//                 refreshCards();
//                 rebuildIndex();
//                 refreshMonthSelectors();
//             };
//         });

//         const st = document.getElementById('ws-fstatus');
//         st.textContent = `✓ ${invoices.length} invoice file(s) load ho gai`;
//         st.className = 'ws-fstatus ok';
//     }

//     // ── MONTH SELECTORS ──────────────────────────────────────────
//     function refreshMonthSelectors() {
//         const opts = allMonths.map(m => `<option value="${m}">${m}</option>`).join('');
//         document.getElementById('ws-from').innerHTML = opts;
//         document.getElementById('ws-to').innerHTML = opts;

//         if (allMonths.length > 0) {
//             document.getElementById('ws-from').value = allMonths[0];
//             document.getElementById('ws-to').value = allMonths[allMonths.length - 1];
//         }
//     }

//     // ── DOMAIN SEARCH DROPDOWN ───────────────────────────────────
//     function setupSearch() {
//         const input = document.getElementById('ws-search');
//         const dd = document.getElementById('ws-dd');

//         function showDrop(query) {
//             const q = query.toLowerCase().trim();
//             const matched = q ? allDomains.filter(d => d.includes(q)) : allDomains;

//             if (!matched.length) {
//                 dd.innerHTML = `<div class="ws-dd-empty">No domain found</div>`;
//                 dd.classList.add('show');
//                 return;
//             }

//             dd.innerHTML = matched.map(d =>
//                 `<div class="ws-dd-item${d === selectedDom ? ' selected' : ''}" data-dom="${d}">${d}</div>`
//             ).join('');
//             dd.classList.add('show');

//             dd.querySelectorAll('.ws-dd-item').forEach(item => {
//                 item.onclick = function () {
//                     selectedDom = this.dataset.dom;
//                     input.value = selectedDom;
//                     dd.classList.remove('show');
//                     renderTable();
//                 };
//             });
//         }

//         input.addEventListener('input', () => showDrop(input.value));
//         input.addEventListener('focus', () => showDrop(input.value));
//         input.addEventListener('keydown', e => {
//             if (e.key === 'Escape') dd.classList.remove('show');
//             if (e.key === 'Enter' && selectedDom) { dd.classList.remove('show'); renderTable(); }
//         });

//         document.addEventListener('click', e => {
//             if (!document.getElementById('ws-sw').contains(e.target))
//                 dd.classList.remove('show');
//         });
//     }

//     // ── RENDER TABLE ─────────────────────────────────────────────
//     function renderTable() {
//         const resultEl = document.getElementById('ws-result');
//         const dom = selectedDom;

//         if (!dom) { resultEl.innerHTML = ''; return; }

//         const fromM = document.getElementById('ws-from').value;
//         const toM = document.getElementById('ws-to').value;

//         let invs = selectedBid
//             ? invoices.filter(i => i.billingId === selectedBid)
//             : invoices;

//         invs = invs.filter(i => mkey(i.month) >= mkey(fromM) && mkey(i.month) <= mkey(toM));

//         const pivot = {};
//         const prods = new Set();
//         const months = [...new Set(invs.map(i => i.month))].sort((a, b) => mkey(a) - mkey(b));

//         for (const inv of invs) {
//             for (const r of inv.records) {
//                 if (r.dom !== dom) continue;
//                 if (!pivot[inv.month]) pivot[inv.month] = {};
//                 if (!pivot[inv.month][r.sub]) pivot[inv.month][r.sub] = { amt: 0, qty: 0 };
//                 pivot[inv.month][r.sub].amt += r.amt;
//                 pivot[inv.month][r.sub].qty += r.qty;
//                 prods.add(r.sub);
//             }
//         }

//         const prodList = Array.from(prods).sort();

//         if (!prodList.length) {
//             resultEl.innerHTML = `<div class="ws-no-result">
//                 "${dom}" ka data selected range mein nahi mila.<br>
//                 Koi doosra domain search karo ya month range change karo.
//             </div>`;
//             return;
//         }

//         // ── HEADER ──
//         // Row 1: MONTH (rowspan=2) + product group names
//         let thead = `<thead><tr>`;
//         thead += `<th class="tl" rowspan="2" style="background:#1e40af;color:#fff;padding:11px 13px;text-align:left;font-size:11px;font-weight:700;letter-spacing:.7px;white-space:nowrap;">MONTH</th>`;
//         for (const p of prodList)
//             thead += `<th class="sub-hdr" colspan="2">${p.toUpperCase()}</th>`;
//         thead += `</tr>`;
//         // Row 2: AMT / LIC for each product
//         thead += `<tr>`;
//         for (const p of prodList) thead += `<th>AMT</th><th>LIC</th>`;
//         thead += `</tr></thead>`;

//         // ── BODY ──
//         const gt = {}; prodList.forEach(p => gt[p] = { amt: 0, qty: 0 });
//         let tbody = '<tbody>';

//         for (const m of months) {
//             const md = pivot[m] || {};
//             let row = `<tr><td class="mn">${m}</td>`;
//             for (const p of prodList) {
//                 const cl = md[p] || { amt: 0, qty: 0 };
//                 gt[p].amt += cl.amt; gt[p].qty += cl.qty;
//                 row += `<td class="${cl.amt > 0 ? 'am' : 'nd'}">${cl.amt > 0 ? fmtAmt(cl.amt) : '—'}</td>`;
//                 row += `<td class="${cl.qty > 0 ? '' : 'nd'}">${cl.qty > 0 ? cl.qty : '—'}</td>`;
//             }
//             const lastMonth = months[months.length - 1];
//             for (const p of prodList) {
//                 const lastData = pivot[lastMonth]?.[p] || { qty: 0 };
//                 gt[p].qty = lastData.qty;  
//             }
//             row += `</tr>`;
//             tbody += row;
//         }
//         tbody += '</tbody>';

//         // ── FOOTER ──
//         let tfoot = `<tfoot><tr><td class="mn">TOTAL</td>`;
//         for (const p of prodList)
//             tfoot += `<td class="am">${fmtAmt(gt[p].amt)}</td><td class="lic">${gt[p].qty}</td>`;
//         tfoot += `</tr></tfoot>`;

//         resultEl.innerHTML = `
//             <div class="ws-panel">
//                 <div class="ws-panel-hdr">
//                     <h3>${dom}</h3>
//                     <div class="ws-panel-sub">${fromM} → ${toM} &nbsp;|&nbsp; Billing ID: ${selectedBid || 'All'} &nbsp;|&nbsp; Invoice: ${invs.map(i => i.invoiceNumber).join(', ')}</div>
//                 </div>
//                 <div class="ws-table-wrap">
//                     <table class="ws-table">${thead}${tbody}${tfoot}</table>
//                 </div>
//             </div>`;
//     }

//     // ── FILE HANDLER ─────────────────────────────────────────────
//     async function handleFiles(files) {
//         let cnt = 0;
//         for (const f of Array.from(files)) {
//             const txt = await f.text();
//             const inv = parseCSV(txt);
//             if (inv) {
//                 const dup = invoices.find(i => i.invoiceNumber === inv.invoiceNumber);
//                 if (!dup) { invoices.push(inv); cnt++; }
//             }
//         }
//         if (!cnt) {
//             frappe.msgprint('Koi valid CSV nahi mili ya duplicate file hai.');
//             return;
//         }

//         rebuildIndex();
//         refreshBills();
//         refreshCards();
//         refreshMonthSelectors();
//         setupSearch();

//         document.getElementById('ws-empty').style.display = 'none';
//         document.getElementById('ws-filters').style.display = 'flex';

//         document.getElementById('ws-from').onchange = renderTable;
//         document.getElementById('ws-to').onchange = renderTable;
//     }

//     // ── DOMAIN CLEAR BUTTON ──────────────────────────────────────
//     document.getElementById('ws-clear').onclick = function () {
//         selectedDom = null;
//         document.getElementById('ws-search').value = '';
//         document.getElementById('ws-result').innerHTML = '';
//     };

//     // ── EVENTS ───────────────────────────────────────────────────
//     document.getElementById('ws-ibtn').onclick = () =>
//         document.getElementById('ws-finput').click();

//     document.getElementById('ws-finput').addEventListener('change', function (e) {
//         handleFiles(e.target.files);
//         this.value = '';
//     });

//     const ibox = document.getElementById('ws-ibox');
//     ibox.addEventListener('dragover', e => { e.preventDefault(); ibox.classList.add('drag'); });
//     ibox.addEventListener('dragleave', () => ibox.classList.remove('drag'));
//     ibox.addEventListener('drop', e => {
//         e.preventDefault();
//         ibox.classList.remove('drag');
//         handleFiles(e.dataTransfer.files);
//     });
// };



frappe.pages['workspace-dashboard'].on_page_load = function (wrapper) {

    frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Workspace Dashboard',
        single_column: true
    });

    // ── CSS ──────────────────────────────────────────────────────
    if (!document.getElementById('ws-style')) {
        const s = document.createElement('style');
        s.id = 'ws-style';
        s.textContent = `
        .ws { padding: 20px 28px; font-family: var(--font-stack); }
        .ws * { box-sizing: border-box; }

        /* CARDS */
        .ws-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 20px; }
        .ws-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px 18px; }
        .ws-card-lbl { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 6px; }
        .ws-card-val { font-size: 26px; font-weight: 800; color: var(--text-color); }
        .ws-card-sub { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
        .ws-card.blue   .ws-card-val { color: #1a56db; }
        .ws-card.green  .ws-card-val { color: #059669; }
        .ws-card.purple .ws-card-val { color: #7c3aed; }

        /* IMPORT BOX */
        .ws-import {
            background: var(--card-bg);
            border: 1.5px dashed var(--border-color);
            border-radius: 8px; padding: 16px 20px;
            margin-bottom: 20px;
            display: flex; align-items: flex-start; gap: 16px;
        }
        .ws-import.drag { border-color: #1a56db; background: #eef2ff; }
        .ws-import-btn {
            background: #1a56db; color: #fff; border: none;
            border-radius: 6px; padding: 9px 18px; font-size: 13px;
            font-weight: 600; cursor: pointer; white-space: nowrap;
            display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        .ws-import-btn:hover { background: #1648c9; }
        .ws-import-btn svg { width:15px; height:15px; fill:none; stroke:#fff; stroke-width:2; }
        .ws-fstatus { font-size: 13px; font-weight: 600; color: var(--text-color); }
        .ws-fstatus.ok { color: #059669; }
        .ws-fsub { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

        /* BILLING PILLS */
        .ws-bill-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .ws-bill-pill {
            background: #eef2ff; color: #1a56db;
            border: 1px solid #c7d7fc; border-radius: 20px;
            padding: 3px 10px; font-size: 11px; font-weight: 700;
            cursor: pointer; transition: all .15s;
        }
        .ws-bill-pill:hover  { background: #1a56db; color: #fff; }
        .ws-bill-pill.active { background: #1a56db; color: #fff; }

        /* FILTERS */
        .ws-filters {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px; padding: 14px 18px;
            margin-bottom: 20px;
            display: flex; align-items: flex-end; flex-wrap: wrap; gap: 16px;
        }
        .ws-filter-group { display: flex; flex-direction: column; gap: 5px; }
        .ws-filter-group label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; }

        /* SEARCH */
        .ws-search-wrap { position: relative; }
        .ws-search-wrap input {
            border: 1.5px solid var(--border-color); border-radius: 6px;
            padding: 7px 12px 7px 32px; font-size: 13px; width: 260px;
            background: var(--control-bg); color: var(--text-color); outline: none;
        }
        .ws-search-wrap input:focus { border-color: #1a56db; }
        .ws-search-icon {
            position: absolute; left: 9px; top: 50%; transform: translateY(-50%);
            width: 15px; height: 15px; stroke: var(--text-muted);
            fill: none; stroke-width: 2; pointer-events: none;
        }
        .ws-dropdown {
            position: absolute; top: calc(100% + 4px); left: 0;
            background: var(--card-bg); border: 1px solid var(--border-color);
            border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,.12);
            max-height: 220px; overflow-y: auto; width: 260px; z-index: 999;
            display: none;
        }
        .ws-dropdown.show { display: block; }
        .ws-dd-item {
            padding: 9px 12px; font-size: 13px; cursor: pointer;
            color: var(--text-color); border-bottom: 1px solid var(--border-color);
        }
        .ws-dd-item:last-child { border-bottom: none; }
        .ws-dd-item:hover    { background: #eef2ff; color: #1a56db; }
        .ws-dd-item.selected { background: #1a56db; color: #fff; }
        .ws-dd-empty { padding: 10px 12px; font-size: 12px; color: var(--text-muted); }

        /* MONTH SELECT */
        .ws-month-sel {
            border: 1.5px solid var(--border-color); border-radius: 6px;
            padding: 7px 10px; font-size: 13px;
            background: var(--control-bg); color: var(--text-color);
            outline: none; cursor: pointer;
        }
        .ws-month-sel:focus { border-color: #1a56db; }

        /* CLEAR BTN */
        .ws-clear-btn {
            background: none; border: 1px solid var(--border-color);
            border-radius: 6px; padding: 7px 14px; font-size: 12px;
            color: var(--text-muted); cursor: pointer;
        }
        .ws-clear-btn:hover { border-color: #e53e3e; color: #e53e3e; }

        /* TABLE PANEL */
        .ws-panel { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
        .ws-panel-hdr { padding: 14px 18px; border-bottom: 1px solid var(--border-color); }
        .ws-panel-hdr h3 { font-size: 15px; font-weight: 700; color: var(--text-color); margin: 0; }
        .ws-panel-sub { font-size: 12px; color: var(--text-muted); margin-top: 3px; }
        .ws-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .ws-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }

        /* HEADER ROW 1 */
        .ws-table thead tr:first-child th {
            background: #1e40af; color: #ffffff;
            padding: 11px 13px; font-size: 11px; font-weight: 700;
            letter-spacing: .7px; text-align: center; white-space: nowrap;
            border-right: 1px solid rgba(255,255,255,.15);
        }
        .ws-table thead tr:first-child th.tl { text-align: left; }
        .ws-table thead tr:first-child th.sub-hdr { color: #bfdbfe; }

        /* HEADER ROW 2 */
        .ws-table thead tr:last-child th {
            background: #dbeafe; padding: 7px 13px; font-size: 10px;
            font-weight: 700; color: #1e40af; text-align: center;
            border-bottom: 2px solid #93c5fd; white-space: nowrap;
        }

        .ws-table tbody tr:hover td { background: #f0f9ff !important; }
        .ws-table tbody tr:nth-child(odd)  td { background: var(--card-bg); }
        .ws-table tbody tr:nth-child(even) td { background: #f8fafc; }
        .ws-table td {
            padding: 9px 13px; border-bottom: 1px solid var(--border-color);
            text-align: right; color: var(--text-muted); white-space: nowrap;
        }
        .ws-table td.mn  { text-align: left; font-weight: 700; color: var(--text-color); }
        .ws-table td.am  { color: #1a56db; font-family: monospace; }
        .ws-table td.nd  { color: #cbd5e1; }

        /* FOOTER */
        .ws-table tfoot tr td {
            background: #1e40af !important; color: #ffffff;
            font-weight: 700; border-top: 2px solid #1e3a8a;
            border-bottom: none; padding: 11px 13px; text-align: right;
        }
        .ws-table tfoot tr td.mn  { text-align: left; color: #fde68a; }
        .ws-table tfoot tr td.am  { color: #bfdbfe; font-family: monospace; }
        .ws-table tfoot tr td.lic { color: #ffffff; }

        /* EMPTY */
        .ws-empty { text-align: center; padding: 60px 20px; color: var(--text-muted); }
        .ws-empty-icon { font-size: 44px; margin-bottom: 12px; }
        .ws-empty p { font-size: 14px; }

        /* NO RESULT */
        .ws-no-result {
            text-align: center; padding: 40px 20px;
            color: var(--text-muted); font-size: 13px;
            background: var(--card-bg); border: 1px solid var(--border-color);
            border-radius: 8px;
        }

        @media(max-width:768px){ .ws-cards { grid-template-columns: repeat(2,1fr); } }
        `;
        document.head.appendChild(s);
    }

    // ── HTML ─────────────────────────────────────────────────────
    $(wrapper).find('.layout-main-section').html(`
    <div class="ws">

        <div class="ws-cards">
            <div class="ws-card">
                <div class="ws-card-lbl">Total Domains</div>
                <div class="ws-card-val" id="ws-domains">—</div>
                <div class="ws-card-sub">Active customers</div>
            </div>
            <div class="ws-card blue">
                <div class="ws-card-lbl">Total Revenue</div>
                <div class="ws-card-val" id="ws-revenue">—</div>
                <div class="ws-card-sub">Across all domains</div>
            </div>
            <div class="ws-card green">
                <div class="ws-card-lbl">Total Licenses</div>
                <div class="ws-card-val" id="ws-licenses">—</div>
                <div class="ws-card-sub">Active licenses</div>
            </div>
            <div class="ws-card purple">
                <div class="ws-card-lbl">Time Period</div>
                <div class="ws-card-val" id="ws-period">—</div>
                <div class="ws-card-sub">Months of data</div>
            </div>
        </div>

        <div class="ws-import" id="ws-ibox">
            <button class="ws-import-btn" id="ws-ibtn">
                <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Import CSV Files
            </button>
            <input type="file" id="ws-finput" accept=".csv" multiple style="display:none"/>
            <div style="flex:1">
                <div class="ws-fstatus" id="ws-fstatus">Koi file import nahi hui abhi</div>
                <div class="ws-fsub">Google Workspace invoice CSV files import karo — drag &amp; drop bhi supported hai</div>
                <div class="ws-bill-pills" id="ws-bills"></div>
            </div>
        </div>

        <div class="ws-filters" id="ws-filters" style="display:none">
            <div class="ws-filter-group">
                <label>Domain Search</label>
                <div class="ws-search-wrap" id="ws-sw">
                    <svg class="ws-search-icon" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text" id="ws-search" placeholder="Search domain..." autocomplete="off"/>
                    <div class="ws-dropdown" id="ws-dd"></div>
                </div>
            </div>
            <div class="ws-filter-group">
                <label>From Month</label>
                <select class="ws-month-sel" id="ws-from"></select>
            </div>
            <div class="ws-filter-group">
                <label>To Month</label>
                <select class="ws-month-sel" id="ws-to"></select>
            </div>
            <div class="ws-filter-group">
                <label>&nbsp;</label>
                <button class="ws-clear-btn" id="ws-clear">Clear</button>
            </div>
        </div>

        <div id="ws-result"></div>

        <div class="ws-empty" id="ws-empty">
            <div class="ws-empty-icon">📊</div>
            <p>Google Workspace invoice CSV files import karo — dashboard yahan dikhega</p>
        </div>

    </div>
    `);

    // ── DATA ─────────────────────────────────────────────────────
    const MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let invoices    = [];
    let selectedBid = null;
    let selectedDom = null;
    let allDomains  = [];
    let allMonths   = [];

    // ── HELPERS ──────────────────────────────────────────────────
    function mkey(m) {
        if (!m) return 0;
        const [a, b] = m.split(' ');
        const mi = MO.indexOf(a);
        const yr = parseInt(b);
        if (mi === -1 || isNaN(yr)) return 0;
        return yr * 100 + mi + 1;
    }

    function fmtAmt(n) {
        return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // ── FIX 1: DATE PARSER ───────────────────────────────────────
    // Handles both "31 Jan 2025" and "31-Mar-26" formats
    function parseMonth(dateStr) {
        dateStr = (dateStr || '').trim();

        // Format: "31-Mar-26" or "31-Mar-2026"
        if (dateStr.includes('-')) {
            const p   = dateStr.split('-');          // ["31","Mar","26"]
            const mon = p[1];                        // "Mar"
            const yr  = p[2].length === 2
                ? '20' + p[2]                        // "26" → "2026"
                : p[2];                              // "2026" already full
            return mon + ' ' + yr;                   // "Mar 2026" ✓
        }

        // Format: "31 Jan 2025" (space separated)
        const p = dateStr.split(/\s+/);
        return p.length >= 3 ? p[1] + ' ' + p[2] : dateStr;
    }

    // ── CSV PARSER ───────────────────────────────────────────────
    function parseLine(ln) {
        const r = []; let c = '', q = false;
        for (const ch of ln) {
            if (ch === '"') q = !q;
            else if (ch === ',' && !q) { r.push(c.trim()); c = ''; }
            else c += ch;
        }
        r.push(c.trim());
        return r;
    }

    function parseCSV(txt) {
        const lines = txt.replace(/\r/g, '').replace(/^\uFEFF/, '')
            .split('\n').map(l => l.trim()).filter(Boolean);

        let billingId = '', invoiceNumber = '', invoiceDate = '', dueDate = '';
        let hidx = -1;

        for (let i = 0; i < lines.length; i++) {
            const c = parseLine(lines[i]);
            if (c[0] === 'Invoice number') invoiceNumber = c[1];
            if (c[0] === 'Invoice date')   invoiceDate   = c[1];
            if (c[0] === 'Due Date')        dueDate       = c[1];
            if (c[0] === 'Billing ID')      billingId     = c[1];
            if (c[0] === 'Account')         { hidx = i; break; }
        }

        if (!billingId || hidx < 0) return null;

        // ── FIX 1 APPLIED HERE ──
        const month = parseMonth(invoiceDate);

        const records = [];
        for (let i = hidx + 1; i < lines.length; i++) {
            const c   = parseLine(lines[i]);
            const dom = (c[0] || '').replace(/^\uFEFF/, '').toLowerCase().trim();
            if (!dom || !dom.includes('.')) continue;
            const sub = (c[1] || '').trim();
            if (!sub) continue;
            const amt      = parseFloat((c[8] || '').replace(/,/g, '')) || 0;
            const qty      = parseInt(c[6]) || 0;
            const subClean = sub
                .replace(/^Google Workspace\s+/, '')
                .replace(/^G Suite\s+/, 'G Suite ');
            records.push({ dom, sub: subClean, qty, amt });
        }

        return { billingId, invoiceNumber, invoiceDate, dueDate, month, records };
    }

    // ── REBUILD INDEX ────────────────────────────────────────────
    function rebuildIndex() {
        const invs = selectedBid
            ? invoices.filter(i => i.billingId === selectedBid)
            : invoices;

        const ds = new Set();
        const ms = new Set();
        for (const inv of invs) {
            ms.add(inv.month);
            for (const r of inv.records) ds.add(r.dom);
        }
        allDomains = Array.from(ds).sort();
        allMonths  = Array.from(ms).sort((a, b) => mkey(a) - mkey(b));
    }

    // ── CARDS ────────────────────────────────────────────────────
    function refreshCards() {
        const invs = selectedBid
            ? invoices.filter(i => i.billingId === selectedBid)
            : invoices;

        const ds  = new Set();
        let   rev = 0;

        // Domain set aur revenue sum
        for (const inv of invs) {
            for (const r of inv.records) {
                ds.add(r.dom);
                rev += r.amt;
            }
        }

        // ── FIX 2: LIC = latest month ki total licenses ──
        const sortedInvs = [...invs].sort((a, b) => mkey(a.month) - mkey(b.month));
        const lastInv    = sortedInvs[sortedInvs.length - 1];
        let   lastLic    = 0;
        if (lastInv) {
            for (const r of lastInv.records) lastLic += r.qty;
        }

        document.getElementById('ws-domains').textContent  = ds.size;
        document.getElementById('ws-revenue').textContent  = fmtAmt(rev);
        document.getElementById('ws-licenses').textContent = lastLic.toLocaleString('en-IN');
        document.getElementById('ws-period').textContent   = new Set(invs.map(i => i.month)).size;
    }

    // ── BILLING PILLS ────────────────────────────────────────────
    function refreshBills() {
        const bids = [...new Set(invoices.map(i => i.billingId))];

        const allPill  = `<span class="ws-bill-pill${!selectedBid ? ' active' : ''}" data-bid="">All</span>`;
        const clearBtn = `<span class="ws-bill-pill" id="ws-clear-bid" style="background:none;border:1px solid #e53e3e;color:#e53e3e;margin-left:4px;">✕ Clear</span>`;

        document.getElementById('ws-bills').innerHTML =
            allPill +
            bids.map(b => `<span class="ws-bill-pill${b === selectedBid ? ' active' : ''}" data-bid="${b}">${b}</span>`).join('') +
            clearBtn;

        document.querySelectorAll('.ws-bill-pill').forEach(p => {
            p.onclick = function () {

                // ── CLEAR ALL DATA ──
                if (this.id === 'ws-clear-bid') {
                    invoices    = [];
                    selectedBid = null;
                    selectedDom = null;
                    allDomains  = [];
                    allMonths   = [];

                    document.getElementById('ws-search').value     = '';
                    document.getElementById('ws-result').innerHTML  = '';
                    document.getElementById('ws-bills').innerHTML   = '';
                    document.getElementById('ws-filters').style.display = 'none';
                    document.getElementById('ws-empty').style.display   = 'block';

                    document.getElementById('ws-domains').textContent  = '—';
                    document.getElementById('ws-revenue').textContent  = '—';
                    document.getElementById('ws-licenses').textContent = '—';
                    document.getElementById('ws-period').textContent   = '—';

                    document.getElementById('ws-from').innerHTML = '';
                    document.getElementById('ws-to').innerHTML   = '';

                    const st = document.getElementById('ws-fstatus');
                    st.textContent = 'Koi file import nahi hui abhi';
                    st.className   = 'ws-fstatus';
                    return;
                }

                // ── BILLING ID SELECT ──
                selectedBid = this.dataset.bid || null;
                selectedDom = null;
                document.getElementById('ws-search').value     = '';
                document.getElementById('ws-result').innerHTML  = '';
                refreshBills();
                refreshCards();
                rebuildIndex();
                refreshMonthSelectors();
            };
        });

        const st = document.getElementById('ws-fstatus');
        st.textContent = `✓ ${invoices.length} invoice file(s) load ho gai`;
        st.className   = 'ws-fstatus ok';
    }

    // ── MONTH SELECTORS ──────────────────────────────────────────
    function refreshMonthSelectors() {
        const opts = allMonths.map(m => `<option value="${m}">${m}</option>`).join('');
        document.getElementById('ws-from').innerHTML = opts;
        document.getElementById('ws-to').innerHTML   = opts;

        if (allMonths.length > 0) {
            document.getElementById('ws-from').value = allMonths[0];
            document.getElementById('ws-to').value   = allMonths[allMonths.length - 1];
        }
    }

    // ── DOMAIN SEARCH DROPDOWN ───────────────────────────────────
    function setupSearch() {
        const input = document.getElementById('ws-search');
        const dd    = document.getElementById('ws-dd');

        function showDrop(query) {
            const q       = query.toLowerCase().trim();
            const matched = q ? allDomains.filter(d => d.includes(q)) : allDomains;

            if (!matched.length) {
                dd.innerHTML = `<div class="ws-dd-empty">No domain found</div>`;
                dd.classList.add('show');
                return;
            }

            dd.innerHTML = matched.map(d =>
                `<div class="ws-dd-item${d === selectedDom ? ' selected' : ''}" data-dom="${d}">${d}</div>`
            ).join('');
            dd.classList.add('show');

            dd.querySelectorAll('.ws-dd-item').forEach(item => {
                item.onclick = function () {
                    selectedDom = this.dataset.dom;
                    input.value = selectedDom;
                    dd.classList.remove('show');
                    renderTable();
                };
            });
        }

        input.addEventListener('input',   () => showDrop(input.value));
        input.addEventListener('focus',   () => showDrop(input.value));
        input.addEventListener('keydown', e => {
            if (e.key === 'Escape') dd.classList.remove('show');
            if (e.key === 'Enter' && selectedDom) { dd.classList.remove('show'); renderTable(); }
        });

        document.addEventListener('click', e => {
            if (!document.getElementById('ws-sw').contains(e.target))
                dd.classList.remove('show');
        });
    }

    // ── RENDER TABLE ─────────────────────────────────────────────
    function renderTable() {
        const resultEl = document.getElementById('ws-result');
        const dom      = selectedDom;

        if (!dom) { resultEl.innerHTML = ''; return; }

        const fromM = document.getElementById('ws-from').value;
        const toM   = document.getElementById('ws-to').value;

        let invs = selectedBid
            ? invoices.filter(i => i.billingId === selectedBid)
            : invoices;

        invs = invs.filter(i => mkey(i.month) >= mkey(fromM) && mkey(i.month) <= mkey(toM));

        const pivot  = {};
        const prods  = new Set();
        const months = [...new Set(invs.map(i => i.month))].sort((a, b) => mkey(a) - mkey(b));

        for (const inv of invs) {
            for (const r of inv.records) {
                if (r.dom !== dom) continue;
                if (!pivot[inv.month])        pivot[inv.month]        = {};
                if (!pivot[inv.month][r.sub]) pivot[inv.month][r.sub] = { amt: 0, qty: 0 };
                pivot[inv.month][r.sub].amt += r.amt;
                pivot[inv.month][r.sub].qty += r.qty;
                prods.add(r.sub);
            }
        }

        const prodList = Array.from(prods).sort();

        if (!prodList.length) {
            resultEl.innerHTML = `<div class="ws-no-result">
                "${dom}" ka data selected range mein nahi mila.<br>
                Koi doosra domain search karo ya month range change karo.
            </div>`;
            return;
        }

        // ── HEADER ──
        let thead = `<thead><tr>`;
        thead += `<th class="tl" rowspan="2" style="background:#1e40af;color:#fff;padding:11px 13px;text-align:left;font-size:11px;font-weight:700;letter-spacing:.7px;white-space:nowrap;">MONTH</th>`;
        for (const p of prodList)
            thead += `<th class="sub-hdr" colspan="2">${p.toUpperCase()}</th>`;
        thead += `</tr><tr>`;
        for (const p of prodList) thead += `<th>AMT</th><th>LIC</th>`;
        thead += `</tr></thead>`;

        // ── BODY ──
        // FIX 2: AMT ka sum, LIC ka last month value
        const gt = {};
        prodList.forEach(p => gt[p] = { amt: 0, qty: 0 });

        let tbody = '<tbody>';
        for (const m of months) {
            const md  = pivot[m] || {};
            let row   = `<tr><td class="mn">${m}</td>`;
            for (const p of prodList) {
                const cl = md[p] || { amt: 0, qty: 0 };
                gt[p].amt += cl.amt;         // AMT: sum karo ✓
                gt[p].qty  = cl.qty;         // LIC: overwrite karo (last month ki value) ✓
                row += `<td class="${cl.amt > 0 ? 'am' : 'nd'}">${cl.amt > 0 ? fmtAmt(cl.amt) : '—'}</td>`;
                row += `<td class="${cl.qty > 0 ? '' : 'nd'}">${cl.qty > 0 ? cl.qty : '—'}</td>`;
            }
            row   += `</tr>`;
            tbody += row;
        }
        tbody += '</tbody>';

        // ── FOOTER ──
        // gt[p].amt = total revenue, gt[p].qty = last month ki licenses
        let tfoot = `<tfoot><tr><td class="mn">TOTAL</td>`;
        for (const p of prodList)
            tfoot += `<td class="am">${fmtAmt(gt[p].amt)}</td><td class="lic">${gt[p].qty}</td>`;
        tfoot += `</tr></tfoot>`;

        resultEl.innerHTML = `
            <div class="ws-panel">
                <div class="ws-panel-hdr">
                    <h3>${dom}</h3>
                    <div class="ws-panel-sub">
                        ${fromM} → ${toM} &nbsp;|&nbsp;
                        Billing ID: ${selectedBid || 'All'} &nbsp;|&nbsp;
                        Invoice: ${invs.map(i => i.invoiceNumber).join(', ')}
                    </div>
                </div>
                <div class="ws-table-wrap">
                    <table class="ws-table">${thead}${tbody}${tfoot}</table>
                </div>
            </div>`;
    }

    // ── FILE HANDLER ─────────────────────────────────────────────
    async function handleFiles(files) {
        let cnt = 0;
        for (const f of Array.from(files)) {
            const txt = await f.text();
            const inv = parseCSV(txt);
            if (inv) {
                const dup = invoices.find(i => i.invoiceNumber === inv.invoiceNumber);
                if (!dup) { invoices.push(inv); cnt++; }
            }
        }
        if (!cnt) {
            frappe.msgprint('Koi valid CSV nahi mili ya duplicate file hai.');
            return;
        }

        rebuildIndex();
        refreshBills();
        refreshCards();
        refreshMonthSelectors();
        setupSearch();

        document.getElementById('ws-empty').style.display   = 'none';
        document.getElementById('ws-filters').style.display = 'flex';

        document.getElementById('ws-from').onchange = renderTable;
        document.getElementById('ws-to').onchange   = renderTable;
    }

    // ── DOMAIN CLEAR BUTTON ──────────────────────────────────────
    document.getElementById('ws-clear').onclick = function () {
        selectedDom = null;
        document.getElementById('ws-search').value     = '';
        document.getElementById('ws-result').innerHTML  = '';
    };

    // ── EVENTS ───────────────────────────────────────────────────
    document.getElementById('ws-ibtn').onclick = () =>
        document.getElementById('ws-finput').click();

    document.getElementById('ws-finput').addEventListener('change', function (e) {
        handleFiles(e.target.files);
        this.value = '';
    });

    const ibox = document.getElementById('ws-ibox');
    ibox.addEventListener('dragover',  e => { e.preventDefault(); ibox.classList.add('drag'); });
    ibox.addEventListener('dragleave', () => ibox.classList.remove('drag'));
    ibox.addEventListener('drop', e => {
        e.preventDefault();
        ibox.classList.remove('drag');
        handleFiles(e.dataTransfer.files);
    });
};


