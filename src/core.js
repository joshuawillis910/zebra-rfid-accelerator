// ── STATE ──
let state = {
  selectedIds: new Set(['RET-01','RET-02','RET-03','RET-04','RET-05','RET-06','RET-07','RET-08']),
  inputs: {},
  benefits: {totAnnual:0, totY1:0, totY2:0, totY3:0, rows:[]},
  costs: {yr0:0, yr1:0, yr2:0},
};

// init inputs
SCENARIOS.forEach(sc => {
  state.inputs[sc.id] = {};
  Object.entries(sc.inputs).forEach(([k,v]) => { state.inputs[sc.id][k] = v.value; });
});

// ── NAV ──
function go(n) {
  document.querySelectorAll('.panel').forEach((p,i) => p.classList.toggle('active', i===n));
  document.querySelectorAll('.sb-item').forEach((el,i) => {
    el.classList.remove('active','done');
    if(i===n) el.classList.add('active');
    else if(i<n && n<=5) el.classList.add('done');  // only mark done within workflow (steps 0-5)
    else if((n===6||n===7) && i<5) el.classList.add('done'); // Library pages: keep steps 0-4 as done
  });
  document.getElementById('prog-fill').style.width = Math.min(100, Math.round((Math.min(n,5)/5)*100))+'%';
  if(n===2) renderDisc();
  if(n===3) { syncCost(); }                   // Cost — rebuild from sliders
  if(n===4) { ensureCosts(); renderROI(); }   // ROI
  if(n===5) { ensureCosts(); if(!state.benefits || !state.benefits.totAnnual) renderROI(); renderExec(); }  // Full Analysis
  if(n===6) renderEvidence();
  document.querySelector('.main').scrollTop = 0;
  syncNav();
}

function syncNav() {} // no-op — nav banner is static

// ── FILTERS ──
function sliderVal(id) { return document.getElementById(id)?.value ?? 0; }

// Active industries — Set of verticalKey strings (multi-select)
const activeIndustries = new Set(['retail']);

// Match scenarios: union of all selected industries
function matchScenarios() {
  if(activeIndustries.size === 0) return [];
  return SCENARIOS.filter(sc => activeIndustries.has(sc.verticalKey));
}

// Toggle an industry button on/off — always keep at least one active
function toggleIndustry(btn) {
  const v = btn.dataset.v;
  if(activeIndustries.has(v) && activeIndustries.size === 1) {
    btn.style.opacity = '0.4';
    setTimeout(() => btn.style.opacity = '', 300);
    return;
  }
  const wasActive = activeIndustries.has(v);
  btn.classList.toggle('active');
  if(wasActive) activeIndustries.delete(v);
  else {
    activeIndustries.add(v);
    // Auto-select newly added vertical's scenarios
    SCENARIOS.filter(s => s.verticalKey === v).forEach(s => state.selectedIds.add(s.id));
    // Update slider defaults to reflect new primary vertical
    if(activeIndustries.size === 1) {
      setSliderDefaults(v);
      costRowsEdited = false; // reset edit flag so sliders recalc cleanly
    }
  }
  renderLeverGrid();
}

// Set all lever checkboxes on or off
function setAllLevers(on) {
  if(on) {
    // Select all: check all scenarios for all active industries
    matchScenarios().forEach(s => state.selectedIds.add(s.id));
  } else {
    // Clear all: deactivate all industry tiles except the first one,
    // clear all scenario selections, reset to single-industry clean state
    const allVBtns = document.querySelectorAll('.vbtn');
    const first = [...allVBtns].find(b => b.classList.contains('active'));
    allVBtns.forEach(b => b.classList.remove('active'));
    activeIndustries.clear();
    // Keep the first active industry so the page isn't blank
    if(first) {
      first.classList.add('active');
      activeIndustries.add(first.dataset.v);
    } else {
      // Fallback: reactivate retail
      const retail = document.querySelector('.vbtn[data-v="retail"]');
      if(retail) retail.classList.add('active');
      activeIndustries.add('retail');
    }
    // Clear all scenario selections
    state.selectedIds.clear();
  }
  renderLeverGrid();
  // If user is on ROI page, re-render immediately
  const roi = document.getElementById('panel-4');
  if(roi && roi.classList.contains('active')) { ensureCosts(); renderROI(); }
}

// Render the lever list — grouped by industry, user can toggle each row
const rampColors = {
  hard_labor: {bg:'#E2FFB6', fg:'#000000'},
  hard_cost:  {bg:'#E6E6E6', fg:'#000000'},
  revenue:    {bg:'rgba(242,153,74,.15)', fg:'#7a3e00'},
  soft:       {bg:'#F2F2F2', fg:'#565656'},
  working_cap:{bg:'rgba(0,100,180,.08)', fg:'#00497A'},
  strategic:  {bg:'#F2F2F2', fg:'#757575'},
};
const evDots = {
  'Strong':        '●●●',
  'Medium-Strong': '●●○',
  'Medium':        '●○○',
  'Emerging':      '●○○',
};
const evLabel = {
  'Strong':        'Strong',
  'Medium-Strong': 'Medium-Strong',
  'Medium':        'Medium',
  'Emerging':      'Emerging',
};

function renderLeverGrid() {
  const grid = document.getElementById('lever-grid');
  const label = document.getElementById('lever-count-label');
  if(!grid) return;

  const matched = matchScenarios();
  // Sync selectedIds: remove any stale ids that no longer match active industries
  [...state.selectedIds].forEach(id => { if(!matched.find(s=>s.id===id)) state.selectedIds.delete(id); });

  if(label) label.textContent = '— ' + matched.length + ' levers, ' + state.selectedIds.size + ' selected';

  // Group by verticalKey
  const groups = {};
  matched.forEach(sc => {
    if(!groups[sc.verticalKey]) groups[sc.verticalKey] = [];
    groups[sc.verticalKey].push(sc);
  });

  const vLabels = {retail:'Retail',warehouse:'Warehouse / 3PL',manufacturing:'Manufacturing & MRO',
    healthcare:'Healthcare',government:'Government / Federal',carriers:'Carriers & Logistics',
    aviation:'Aviation / MRO',hospitality:'Hospitality & Venues',datacenter:'Data Center / IT',
    energy:'Energy & Industrial',foodservice:'Food Service / CPG'};

  grid.innerHTML = Object.entries(groups).map(([vk, scs]) => `
    <div style="margin-bottom:10px">
      <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--gray-500);text-transform:uppercase;letter-spacing:.8px;padding:6px 0 4px;border-bottom:1px solid var(--gray-100);margin-bottom:4px">${vLabels[vk]||vk}</div>
      ${scs.map(sc => `
        <div class="lever-row ${state.selectedIds.has(sc.id)?'on':''}" onclick="toggleLever('${sc.id}',this)">
          <div class="lever-check">✓</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:var(--brand-black)">${sc.name}</div>
            <div style="font-size:11px;color:var(--gray-500);margin-top:1px">${sc.theme}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0">
            <span style="font-family:var(--mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:2px 6px;border-radius:3px;background:${RAMP[sc.rampType]?rampColors[sc.rampType].bg:'#f0f0f0'};color:${RAMP[sc.rampType]?rampColors[sc.rampType].fg:'#555'}">${RAMP[sc.rampType]?.label||sc.rampType}</span>
            <span style="font-family:var(--mono);font-size:9px;color:var(--gray-500)">${evDots[sc.evidence]||'●○○'} ${evLabel[sc.evidence]||'Emerging'}</span>
          </div>
        </div>`).join('')}
    </div>`).join('');

  // Update badge on step 3 if visible
  const scBadge = document.getElementById('sc-match-badge');
  if(scBadge) scBadge.textContent = state.selectedIds.size + ' SELECTED';
  selCount(); // always sync warning banner after any grid render
}

// Toggle a single lever on/off
function toggleLever(id, el) {
  el.classList.toggle('on');
  if(state.selectedIds.has(id)) state.selectedIds.delete(id);
  else state.selectedIds.add(id);
  const label = document.getElementById('lever-count-label');
  const total = matchScenarios().length;
  if(label) label.textContent = '— ' + total + ' levers, ' + state.selectedIds.size + ' selected';
  const scBadge = document.getElementById('sc-match-badge');
  if(scBadge) scBadge.textContent = state.selectedIds.size + ' SELECTED';
  selCount(); // update warning banner
}

// ── STEP 3: SCENARIO GRID ──
function renderScGrid() {
  const matched = SCENARIOS.filter(s => state.selectedIds.has(s.id));
  const total = matched.reduce((a,s) => a + s.annualBenefit, 0);
  const selCount2 = matched.length;
  document.getElementById('sc-grid-title').childNodes[0].textContent = 'Selected Value Levers ';
  document.getElementById('sc-match-badge').textContent = selCount2 + ' SELECTED';
  const grid = document.getElementById('sc-grid');
  if(!matched.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;padding:28px;text-align:center;color:var(--muted)">No scenarios match. Broaden filters in Step 2.</div>';
    selCount(); return;
  }
  grid.innerHTML = matched.map(sc => {
    const pct = total > 0 ? Math.round((sc.annualBenefit / total) * 100) : 0;
    const on = state.selectedIds.has(sc.id);
    return `<div class="sc-card ${on?'on':''}" onclick="toggleSc('${sc.id}',this)">
      <div class="sc-check">✓</div>
      <div class="sc-id">${sc.id}</div>
      <div class="sc-name">${sc.name}</div>
      <div class="sc-theme">${sc.theme}</div>
      <div class="sc-pct">
        <span style="color:var(--blue);font-weight:600">${pct}%</span>
        <span style="color:var(--muted)"> of opportunity</span>
        <div class="sc-pct-bar"><div class="sc-pct-fill" style="width:${pct}%"></div></div>
      </div>
    </div>`;
  }).join('');
  selCount();
}

function toggleSc(id, el) {
  el.classList.toggle('on');
  if(state.selectedIds.has(id)) state.selectedIds.delete(id); else state.selectedIds.add(id);
  selCount();
  // Recalc % of pool
  const active = SCENARIOS.filter(s=>state.selectedIds.has(s.id));
  const total = active.reduce((a,s)=>a+s.annualBenefit,0);
  document.querySelectorAll('.sc-card').forEach(card => {
    const cid = card.querySelector('.sc-id')?.textContent;
    const sc = SCENARIOS.find(s=>s.id===cid);
    if(!sc) return;
    const pct = total>0 ? Math.round((sc.annualBenefit/total)*100) : 0;
    const pctEl = card.querySelector('.sc-pct');
    if(pctEl) { pctEl.innerHTML = `<span style="color:var(--blue);font-weight:600">${pct}%</span><span style="color:var(--muted)"> of opportunity</span><div class="sc-pct-bar"><div class="sc-pct-fill" style="width:${pct}%"></div></div>`; }
  });
}

function selCount() {
  const n = state.selectedIds.size;
  const el = document.getElementById('sel-count');
  if(el) el.textContent = n + ' selected';
  const warn = document.getElementById('lever-count-warn');
  if(warn) warn.style.display = n > 6 ? 'block' : 'none';
}

// ── STEP 4: DISCOVERY ──
function renderDisc() {
  const active = SCENARIOS.filter(s=>state.selectedIds.has(s.id));
  const el = document.getElementById('disc-accordion');
  el.innerHTML = active.map((sc, idx) => `
    <div class="acc-item open" id="acc-${sc.id}">
      <div class="acc-head" onclick="toggleAcc('${sc.id}')">
        <span>${sc.id} — ${sc.name}</span>
        <span class="acc-arrow">▼</span>
      </div>
      <div class="acc-body">
        <div class="challenge-box"><strong>Customer Challenge</strong>${sc.challenge}</div>
        ${sc.discoveryQuestions.map(q=>`<div class="dq">${q}</div>`).join('')}
        <div class="divider"></div>
        <div class="itbl-wrap">
        <table class="itbl">
          <thead><tr><th>Variable</th><th>Label</th><th>Benchmark Default</th><th>Your Value</th></tr></thead>
          <tbody>${Object.entries(sc.inputs).map(([k,v])=>`
            <tr>
              <td><div class="ikey">${k}</div></td>
              <td><div class="ilabel">${v.label}</div><div class="isource">${v.hint}</div></td>
              <td><span class="mono" style="font-size:11px">${fmtVal(v.value,v.unit)}</span></td>
              <td><input class="iinput" type="number" step="any" value="${state.inputs[sc.id][k]}"
                oninput="updateInput('${sc.id}','${k}',this)"></td>
            </tr>`).join('')}
          </tbody>
        </table>
        </div>
      </div>
    </div>`).join('');
}

function toggleAcc(id) {
  const item = document.getElementById('acc-'+id);
  item.classList.toggle('open');
}

function toggleScExpand(id) {
  const row = document.getElementById('scexp-'+id);
  const dataRow = row?.previousElementSibling;
  if(!row) return;
  row.classList.toggle('open');
  dataRow?.classList.toggle('expanded');
}

function buildDonut(pct, rampType) {
  const R = 52, cx = 72, cy = 72, stroke = 14;
  const circ = 2 * Math.PI * R;
  const filled = (pct / 100) * circ;
  // Color by ramp type — Zebra brand tokens
  const colors = {
    hard_labor: '#000000', hard_cost: '#303030',
    revenue: '#565656', soft: '#BDBDBD',
    working_cap: '#757575', strategic: '#BDBDBD'
  };
  const arcColor = colors[rampType] || '#000000';
  return `<svg viewBox="0 0 144 144" width="120" height="120">
    <!-- Track -->
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#E6E6E6" stroke-width="${stroke}"/>
    <!-- Arc — starts at top (−90°) -->
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none"
      stroke="${arcColor}" stroke-width="${stroke}"
      stroke-dasharray="${filled.toFixed(1)} ${(circ-filled).toFixed(1)}"
      stroke-linecap="butt"
      transform="rotate(-90 ${cx} ${cy})"/>
    <!-- Green accent tick at arc end -->
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none"
      stroke="#A8F931" stroke-width="${stroke+2}"
      stroke-dasharray="3 ${(circ-3).toFixed(1)}"
      stroke-dashoffset="${-(filled-1.5).toFixed(1)}"
      transform="rotate(-90 ${cx} ${cy})"/>
    <!-- Center text -->
    <text x="${cx}" y="${cy-8}" text-anchor="middle" font-family="'ZebraSans',Arial,sans-serif" font-size="22" font-weight="700" fill="#000">${pct}%</text>
    <text x="${cx}" y="${cy+10}" text-anchor="middle" font-family="Courier New,monospace" font-size="9" fill="#757575" text-transform="uppercase">OF POOL</text>
  </svg>`;
}

function updateInput(scId, key, el) {
  const v = parseFloat(el.value)||0;
  state.inputs[scId][key] = v;
  el.classList.add('changed');
  const item = document.getElementById('acc-'+scId);
  if(item) item.classList.add('has-values');
}

// ── STEP 5: COST MODEL ──
function syncCostFromProfile() {
  const sites = +document.getElementById('i-sites')?.value || 50;
  const slSites = document.getElementById('sl-sites');
  if(slSites) { slSites.value = sites; syncCost(); }
}

let costRowsEdited = false; // track if user has manually edited rows

function syncCost() {
  const s = +sliderVal('sl-sites'), items = +sliderVal('sl-items');
  const replen = +sliderVal('sl-replen'), saas = +sliderVal('sl-saas');
  const tagUnit = +sliderVal('sl-tag'), readers = +sliderVal('sl-readers');
  setSv('sv-sites', s);
  setSv('sv-items', s>0?items.toLocaleString():'—');
  setSv('sv-replen', Math.round(replen*100)+'%');
  setSv('sv-saas', '$'+saas.toLocaleString());
  setSv('sv-tag', '$'+parseFloat(tagUnit).toFixed(2));
  setSv('sv-readers', readers);
  // If user has manually edited rows, only update the auto-calc rows (first 8)
  // rather than wiping all edits
  if(costRowsEdited && costRows && costRows.length > 0) {
    // Rebuild just the auto rows in-place by label matching
    const fresh = defaultCostRows();
    const autoLabels = fresh.map(r=>r.label);
    costRows = costRows.map(r => {
      const auto = fresh.find(f=>f.label===r.label);
      return auto && !r._userEdited ? auto : r;
    });
    // Add any new auto rows that don't exist yet
    fresh.forEach(f=>{ if(!costRows.find(r=>r.label===f.label)) costRows.push(f); });
  } else {
    costRows = defaultCostRows();
    costRowsEdited = false;
  }
  costRows.forEach((r,i)=>{ if(!r.contingency) applyBuckets(r); });
  rebuildCostState();
  renderCost();
}

function setSv(id,v) { const el=document.getElementById(id); if(el) el.textContent=v; }

function resetCost() {
  setSliderDefaults([...activeIndustries][0] || 'retail');
  syncCost();
}

function renderCost() {
  // Show/hide the slider-sync warning
  const editHint = document.getElementById('cost-edit-hint');
  if(editHint) editHint.style.display = costRowsEdited ? 'flex' : 'none';

  let yr0Sub=0, yr1Sub=0, yr2Sub=0;
  costRows.forEach(r=>{ if(!r.contingency){ yr0Sub+=r.yr0||0; yr1Sub+=r.yr1||0; yr2Sub+=r.yr2||0; }});
  const cont = Math.round(yr0Sub*0.07);
  costRows.forEach(r=>{ if(r.contingency){ r.yr0=cont; }});
  const yr0t = yr0Sub+cont, yr1t = yr1Sub, yr2t = yr2Sub;
  state.costs = {yr0:yr0t, yr1:yr1t, yr2:yr2t};

  const cadenceOpts = ['one-time','monthly','annual','per-site/yr','other'];

  const tbody = document.getElementById('cost-tbody');
  tbody.innerHTML = costRows.map((r,i) => {
    // Compute display total for this row
    const rowTotal = computeRowTotal(r);
    const cadenceLabels = {'one-time':'ONE-TIME','monthly':'MONTHLY','annual':'ANNUAL','per-site/yr':'PER SITE/YR','other':'OTHER'};
    if(r.contingency) return `
      <tr style="background:var(--gray-50)">
        <td colspan="3" style="color:var(--muted);font-size:11px;font-style:italic">Contingency (7% of Yr 0 subtotal)</td>
        <td></td>
        <td class="r" style="color:var(--muted);font-family:var(--mono)">${fmt(cont)}</td>
        <td></td>
      </tr>`;
    return `<tr>
      <td><input class="editable-input" style="width:100%;text-align:left;font-size:12px" value="${r.label}" oninput="costRows[${i}].label=this.value"></td>
      <td>
        <select class="editable-input cadence-sel" onchange="costRows[${i}].cadence=this.value;recalcCostRow(${i})">
          ${['one-time','monthly','annual','per-site/yr','other'].map(o=>`<option value="${o}"${r.cadence===o?' selected':''}>${o}</option>`).join('')}
        </select>
      </td>
      <td class="r"><input class="editable-input num-input" value="${r.qty!==''?r.qty:''}" style="width:55px" placeholder="qty" oninput="costRows[${i}].qty=parseFloat(this.value)||0;recalcCostRow(${i})"></td>
      <td class="r"><input class="editable-input num-input" value="${r.unitCost!==''?r.unitCost:''}" style="width:70px" placeholder="$" oninput="costRows[${i}].unitCost=parseFloat(this.value.replace(/[$,]/g,''))||0;recalcCostRow(${i})"></td>
      <td class="r" style="font-family:var(--mono);font-weight:600;font-size:12px">${fmt(rowTotal)}</td>
      <td><span style="cursor:pointer;color:var(--muted);font-size:12px;padding:0 6px" onclick="removeCostRow(${i})" title="Remove">✕</span></td>
    </tr>`;
  }).join('');

  // Summary footer — split NRC vs Annual clearly
  document.getElementById('cost-tfoot').innerHTML = `
    <tr class="total-row">
      <td colspan="2"><strong>TOTALS</strong></td>
      <td class="r" colspan="2" style="font-family:var(--mono);font-size:10px;color:var(--muted)">Yr 0 One-Time · Yr 1+ Annual</td>
      <td></td><td></td>
    </tr>
    <tr style="background:var(--gray-50)">
      <td colspan="2" style="font-size:12px;color:var(--muted)">Non-Recurring (Yr 0)</td>
      <td colspan="2" style="font-size:11px;color:var(--muted);font-family:var(--mono);text-align:right">Hardware · Tags · Services · Impl.</td>
      <td class="r" style="font-size:14px;font-weight:700;font-family:var(--mono)">${fmt(yr0t)}</td>
      <td></td>
    </tr>
    <tr style="background:var(--gray-50)">
      <td colspan="2" style="font-size:12px;color:var(--muted)">Recurring (Yr 1+)</td>
      <td colspan="2" style="font-size:11px;color:var(--muted);font-family:var(--mono);text-align:right">SaaS · Tags · Support</td>
      <td class="r" style="font-size:14px;font-weight:700;font-family:var(--mono)">${fmt(yr1t)}<span style="font-size:9px;font-weight:400">/yr</span></td>
      <td></td>
    </tr>
    <tr style="border-top:2px solid var(--brand-black)">
      <td colspan="2"><strong>3-Year Total Cost</strong></td>
      <td colspan="2" style="font-size:10px;color:var(--muted);font-family:var(--mono);text-align:right">Yr0 + Yr1 + (Yr2 × 2)</td>
      <td class="r" style="font-size:16px;font-weight:700;font-family:var(--mono)">${fmt(yr0t + yr1t + yr2t*2)}</td>
      <td></td>
    </tr>`;
}

// Compute a single row's total based on cadence
function computeRowTotal(r) {
  const base = (r.qty||1) * (r.unitCost||0);
  if(r.cadence==='monthly')      return base * 12;  // annualized
  if(r.cadence==='per-site/yr')  return base;       // already per-site, qty = sites
  return base; // one-time, annual, other
}

// Distribute row total into yr0/yr1/yr2 buckets based on cadence
function applyBuckets(r) {
  const total = computeRowTotal(r);
  if(r.cadence==='one-time')     { r.yr0=total; r.yr1=0; r.yr2=0; }
  else if(r.cadence==='monthly' || r.cadence==='annual' || r.cadence==='per-site/yr') {
    r.yr0=0; r.yr1=total; r.yr2=total;
  } else { r.yr0=total; r.yr1=0; r.yr2=0; } // other → one-time
}

// Recalc a single row then re-render
function recalcCostRow(i) {
  costRows[i]._userEdited = true;
  costRowsEdited = true;
  applyBuckets(costRows[i]);
  rebuildCostState();
  renderCost();
}

// Rebuild state.costs from all rows
function rebuildCostState() {
  let yr0Sub=0, yr1Sub=0, yr2Sub=0;
  costRows.forEach(r=>{ if(!r.contingency){ yr0Sub+=r.yr0||0; yr1Sub+=r.yr1||0; yr2Sub+=r.yr2||0; }});
  const cont = Math.round(yr0Sub*0.07);
  costRows.forEach(r=>{ if(r.contingency) r.yr0=cont; });
  state.costs = {yr0: yr0Sub+cont, yr1: yr1Sub, yr2: yr2Sub};
}

function updateCostRow(i, field, val) {
  const n = parseFloat(val.replace(/[$,]/g,''))||0;
  costRows[i][field] = n;
  applyBuckets(costRows[i]);
  rebuildCostState();
  renderCost();
}

function applyAutoFill(i) { recalcCostRow(i); }

function removeCostRow(i) {
  costRows.splice(i,1);
  renderCost();
}

function addCostRow() {
  const contIdx = costRows.findIndex(r=>r.contingency);
  const newRow = {label:"New line item", cadence:"one-time", qty:1, unitCost:0, yr0:0, yr1:0, yr2:0, _userEdited:true};
  if(contIdx>=0) costRows.splice(contIdx,0,newRow);
  else costRows.push(newRow);
  costRowsEdited = true;
  renderCost();
}

// ── SCENARIO CALC ──
function calcSc(sc) {
  const p = state.inputs[sc.id];
  try {
    switch(sc.id) {
      // ── RETAIL ──────────────────────────────────────────────────────────────
      case"RET-01": return p.annual_count_cycles*p.total_sku_locations*(p.hours_per_sku_manual-p.hours_per_sku_rfid)*p.loaded_rate;
      case"RET-02": return p.annual_store_revenue*p.out_of_stock_baseline_pct*p.osa_improvement_pct*p.gross_margin_pct;
      case"RET-03": return p.annual_store_revenue*p.shrink_pct_baseline*p.shrink_reduction_pct;
      case"RET-04": return p.annual_markdown_spend*p.markdown_reduction_pct*p.gm_recovery_pct;
      case"RET-05": return (p.annual_receiving_labor_hours*p.labor_reduction_pct*p.loaded_rate)+(p.annual_vendor_disputes*0.6*p.avg_dispute_resolution_cost);
      case"RET-06": return p.num_stores*p.associates_per_store*p.hours_recovered_per_week*p.weeks_per_year*p.loaded_rate;
      case"RET-07": return p.annual_omni_orders*p.cancellation_rate_baseline*p.cancellation_reduction_pct*p.avg_order_value*p.gm_pct;
      case"RET-08": return p.total_inventory_value*p.safety_stock_reduction_pct*p.carrying_cost_pct;
      case"RET-09": return p.annual_analytics_budget*p.data_quality_uplift_pct;

      // ── WAREHOUSE / DC ───────────────────────────────────────────────────────
      case"WH-01":  return p.count_cycles_per_year*p.total_pallet_positions*((p.time_per_position_manual_min/60)-(p.time_per_position_rfid_sec/3600))*p.loaded_rate;
      case"WH-02":  return p.annual_inbound_pallets*(p.hours_per_pallet_manual-p.hours_per_pallet_rfid)*p.loaded_rate;
      case"WH-03":  return p.annual_orders_picked*p.error_rate_baseline_pct*p.error_reduction_pct*p.cost_per_error;
      case"WH-04":  return p.annual_contracted_revenue*p.chargeback_rate_pct*p.chargeback_reduction_pct;
      case"WH-05":  return p.total_inventory_value*p.safety_stock_pct*p.safety_stock_reduction_pct*p.carrying_cost_rate;
      case"WH-06":  return p.outbound_labor_hours*p.labor_reduction_pct*p.loaded_rate;
      case"WH-07":  return p.annual_automation_spend*p.rfid_uplift_pct;

      // ── HEALTHCARE ──────────────────────────────────────────────────────────
      case"HC-01":  return (p.annual_rental_spend*p.rental_reduction_pct)+(p.num_nursing_staff*p.nursing_search_hours_per_shift*p.shifts_per_year*p.loaded_nursing_rate*0.5);
      case"HC-02":  return p.annual_or_cases*p.instrument_delay_rate_pct*p.delay_reduction_pct*p.avg_delay_duration_hr*p.or_delay_cost_per_hour;
      case"HC-03":  return p.annual_ed_visits*p.avg_los_hrs*p.los_reduction_pct*p.net_revenue_per_visit/24;
      case"HC-04":  return p.annual_admissions*p.error_rate_pct*p.avg_cost_per_error*p.error_reduction_pct;
      case"HC-05":  return p.annual_audit_prep_hours*p.labor_reduction_pct*p.loaded_rate;
      case"HC-06":  return (p.annual_expired_writeoffs*p.expiry_reduction_pct)+(p.annual_stockout_cost*p.stockout_reduction_pct);
      case"HC-07":  return (p.annual_cs_writeoffs*p.loss_reduction_pct)+p.annual_investigation_cost;
      case"HC-08":  return p.annual_ai_investment*p.rfid_uplift_pct;

      // ── GOVERNMENT / DEFENSE ────────────────────────────────────────────────
      case"GOV-01": return (p.annual_nfrs_property_related*p.avg_remediation_hours_per_nfr*p.loaded_rate)+(p.annual_cap_consulting_spend*p.nfr_reduction_pct);
      case"GOV-02": return (p.total_accountable_items/1000)*(p.manual_hours_per_1000-p.rfid_hours_per_1000)*p.audit_cycles_per_year*p.loaded_rate;
      case"GOV-03": return p.annual_equipment_budget*p.ghost_asset_pct*p.reutilization_recovery_pct;
      case"GOV-04": return p.property_ftes*p.pct_time_manual_recon*p.reduction_from_rfid*2080*p.loaded_rate;
      case"GOV-05": return (p.annual_flipl_count*p.avg_flipl_cost*p.flipl_reduction_pct)+(p.annual_sensitive_item_losses*0.30);
      case"GOV-06": return p.annual_procurement_budget*p.duplicate_procurement_pct*p.avoidance_from_rfid;

      // ── MANUFACTURING ───────────────────────────────────────────────────────
      case"MTL-01": return p.total_tool_value*p.annual_loss_rate*p.tool_loss_reduction_pct;
      case"MTL-02": return p.total_wip_value*p.wip_reduction_pct*p.carrying_cost_rate;
      case"MTL-03": return p.compliance_labor_hours*p.labor_reduction_pct*p.loaded_rate;
      case"MTL-04": return p.expected_annual_recall_cost*p.scope_reduction_pct*p.cost_reduction_pct;
      case"MTL-05": return (p.total_mro_value*p.excess_reduction_pct*p.carrying_cost_rate)+(p.annual_emergency_procurement*p.emergency_reduction_pct);
      case"MTL-06": return p.annual_revenue*p.error_rate_pct*p.avg_error_cost*p.error_reduction_pct;
      case"MTL-07": return p.total_asset_value*p.annual_replacement_rate*p.reduction_from_rfid;
      case"MTL-08": return p.annual_industry40_investment*p.rfid_uplift_pct;

      // ── CARRIERS (PARCEL / COURIER) ─────────────────────────────────────────
      case"CAR-01":  return p.total_trailers*p.utilization_improvement_pct*p.revenue_per_trailer_per_day*p.operating_days;
      case"CAR-02":  return p.annual_shipments*p.osd_rate_pct*p.avg_claim_cost*p.claim_reduction_pct;
      case"CAR-03":  return p.manual_divert_ftes*p.efficiency_improvement_pct*p.shifts_per_year*p.hours_per_shift*p.loaded_rate;
      case"CAR-04":  return p.annual_package_volume*p.misroute_rate_pct*p.cost_per_misroute*p.misroute_reduction_pct;
      case"CAR-05":  return p.yard_jockeys*p.pct_time_searching*p.search_reduction_pct*p.annual_hours_per_fte*p.loaded_rate;
      case"CAR-06": return p.annual_wismo_contacts*p.cost_per_contact*p.wismo_reduction_pct;
      case"CAR-07":  return p.compliance_labor_hours*p.labor_reduction_pct*p.loaded_rate;
      case"CAR-08":  return p.annual_network_opt_investment*p.rfid_uplift_pct;

      // ── TRUCKLOAD / FREIGHT ─────────────────────────────────────────────────
      case"TL-01":  return p.annual_loads*p.detention_rate_pct*p.avg_excess_dwell_hrs*p.detention_rate_per_hour*p.dwell_reduction_pct;
      case"TL-02":  return (p.annual_routing_chargebacks*p.chargeback_reduction_pct)+(p.compliance_labor_hours*p.labor_reduction_pct*p.loaded_rate);
      case"TL-03":  return p.annual_logistics_tech_investment*p.rfid_uplift_pct;

      // ── AVIATION / MRO ──────────────────────────────────────────────────────
      case"AVN-01": return p.annual_passengers*(p.mishandle_rate_per_1k/1000)*p.avg_cost_per_incident*p.mishandle_reduction_pct;
      case"AVN-02": return p.monthly_tool_search_events*12*p.avg_search_duration_hrs*p.technician_rate*p.search_reduction_pct;
      case"AVN-03": return p.annual_aircraft_through*p.avg_tat_days*p.tat_reduction_pct*p.daily_aog_cost;
      case"AVN-04": return (p.annual_compliance_hours*p.labor_reduction_pct*p.loaded_rate)+(p.annual_grounding_events*p.avg_grounding_cost*p.labor_reduction_pct);
      case"AVN-05": return p.fleet_size*(p.inspection_hours_manual-p.inspection_hours_rfid)*p.inspections_per_year*p.loaded_rate;
      case"AVN-06": return p.annual_rebooking_spend*p.reduction_pct;

      // ── HOSPITALITY / VENUES ─────────────────────────────────────────────────
      case"HOS-01": return (p.annual_linen_spend*p.loss_reduction_pct)+(p.laundry_cost_annual*p.laundry_efficiency_gain);
      case"HOS-02": return (p.annual_fb_shrink*p.shrink_reduction_pct)+(p.counting_labor_hours*p.labor_reduction_pct*p.loaded_rate);
      case"HOS-03": return p.annual_visitors*p.current_ancillary_per_cap*p.spend_uplift_pct;
      case"HOS-04": return (p.annual_asset_replacement*p.loss_reduction_pct)+(p.annual_setup_overtime*p.overtime_reduction_pct);
      case"HOS-05": return (p.annual_gate_revenue*p.unauthorized_entry_rate*p.reduction_from_rfid)+(p.security_labor_annual*p.security_efficiency_gain);
      case"HOS-06": return p.annual_guest_tech_investment*p.rfid_uplift_pct;

      // ── DATA CENTER / IT ASSETS ──────────────────────────────────────────────
      case"DC-01":  return (p.total_assets/1000)*(p.manual_hours_per_1000-p.rfid_hours_per_1000)*p.audit_cycles_per_year*p.loaded_rate;
      case"DC-02":  return p.annual_it_capex*p.stranded_pct*p.reutilization_pct;
      case"DC-03":  return p.annual_it_capex*p.stranded_pct*p.reutilization_pct;
      case"DC-04":  return (p.annual_audit_prep_hours*p.labor_reduction_pct*p.loaded_rate)+(p.annual_assessor_fees*p.assessor_fee_reduction);
      case"DC-05":  return (p.annual_device_loss_events*p.avg_cost_per_loss*p.loss_reduction_pct)+p.annual_investigation_labor;
      case"DC-06":  return p.annual_hardware_incidents*p.avg_locate_time_hrs*p.locate_reduction_pct*p.cost_per_incident_hr;
      case"DC-07":  return p.annual_dcim_investment*p.rfid_uplift_pct;

      // ── INDUSTRIAL / ENERGY ──────────────────────────────────────────────────
      case"IE-01":  return (p.total_tool_value*p.annual_loss_rate*p.loss_reduction_pct)+(p.annual_rental_overage*p.rental_reduction_pct);
      case"IE-02":  return (p.annual_osha_fines*p.fine_reduction_pct)+(p.annual_hse_labor_hours*p.labor_reduction_pct*p.loaded_rate);
      case"IE-03":  return (p.total_mro_value*p.excess_reduction_pct*p.carrying_cost_rate)+(p.annual_npt_events*p.avg_npt_cost);
      case"IE-04":  return (p.field_material_value*p.shrink_rate_pct*p.shrink_reduction_pct)+(p.annual_npt_events*p.npt_cost_per_hr*p.avg_npt_duration*0.20);
      case"IE-05":  return (p.annual_inspection_labor_hours*p.labor_reduction_pct*p.loaded_rate)+(p.annual_compliance_exceptions*p.avg_exception_cost*0.50);
      case"IE-06":  return (p.annual_rental_spend*p.overage_pct*p.overage_reduction_pct)+(p.annual_billing_disputes*p.avg_dispute_cost*0.60);
      case"IE-07":  return p.annual_digital_ops_investment*p.rfid_uplift_pct;

      // ── FOODSERVICE ─────────────────────────────────────────────────────────
      case"FS-01":  return p.annual_food_spend*p.waste_rate_pct*p.waste_reduction_pct;
      case"FS-02":  return p.expected_recall_cost*p.scope_reduction_pct*p.cost_reduction_pct;
      case"FS-03":  return (p.annual_spoilage_cost*p.spoilage_reduction_pct)+(p.annual_haccp_labor_hours*p.labor_reduction_pct*p.loaded_rate);
      case"FS-04":  return p.expected_recall_cost*p.scope_reduction_pct*p.cost_reduction_pct;
      case"FS-05":  return p.annual_hv_shrink*p.shrink_reduction_pct;
      case"FS-06":  return p.annual_food_spend*p.overprep_waste_pct*p.forecast_improvement_pct;
      case"FS-07":  return p.annual_refunds_credits*p.completeness_error_pct*p.reduction_from_rfid;
      case"FS-08":  return (p.annual_esg_labor_hours*p.labor_reduction_pct*p.loaded_rate)+(p.annual_esg_audit_fees*p.audit_fee_reduction);

      default: return sc.annualBenefit;
    }
  } catch(e) { return sc.annualBenefit; }
}


// Ensure cost model is populated before ROI renders
function ensureCosts() {
  if(!costRows || costRows.length===0) costRows = defaultCostRows();
  if(!state.costs || state.costs.yr0===undefined) rebuildCostState();
  if(state.costs.yr0===0 && state.costs.yr1===0) {
    costRows.forEach(r=>{ if(!r.contingency) applyBuckets(r); });
    rebuildCostState();
  }
}
// ── STEP 5: ROI & VALUE CASE ──
function renderROI() {
  const active = SCENARIOS.filter(s=>state.selectedIds.has(s.id));
  if(!active.length) { document.getElementById('kpi-grid').innerHTML='<div class="muted">No scenarios selected.</div>'; return; }

  let totAnnual=0, totY1=0, totY2=0, totY3=0;
  const rows = active.map(sc => {
    const ann = Math.max(0, calcSc(sc));
    const r = RAMP[sc.rampType];
    const y1=ann*r.y1, y2=ann*r.y2, y3=ann*r.y3;
    totAnnual+=ann; totY1+=y1; totY2+=y2; totY3+=y3;
    return {sc, ann, y1, y2, y3};
  });
  state.benefits = {totAnnual, totY1, totY2, totY3, rows};

  const c = state.costs;
  const yr0net = -(c.yr0||0);
  const yr1net = totY1-(c.yr1||0);
  const yr2net = totY2-(c.yr2||0);
  const yr3net = totY3-(c.yr2||0);
  const payback = totAnnual>0 ? Math.round((c.yr0/(totAnnual/12))*10)/10 : 99;
  const npv5 = Math.round((yr1net/1.1)+(yr2net/1.21)+(yr3net/1.331)+(yr3net/1.464)+(yr3net/1.611));
  const irr = estimateIRR([yr0net, yr1net, yr2net, yr3net, yr3net]);
  const roi3 = c.yr0>0 ? Math.round(((totY1+totY2+totY3-(c.yr0+c.yr1+c.yr2+c.yr2))/(c.yr0+c.yr1+c.yr2+c.yr2))*100) : 0;

  // KPIs — 4 primary heroes + 4 secondary supporting
  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi kgreen hero-kpi"><div class="kpi-label">Full Annual Benefit</div><div class="kpi-val">${fmt(totAnnual)}</div><div class="kpi-sub">Year 3 steady state</div></div>
    <div class="kpi kblue hero-kpi"><div class="kpi-label">Payback Period</div><div class="kpi-val">${payback}<span style="font-size:15px;font-weight:400"> mo</span></div><div class="kpi-sub">months to recover investment</div></div>
    <div class="kpi kamber hero-kpi"><div class="kpi-label">5-Year NPV</div><div class="kpi-val">${fmt(npv5)}</div><div class="kpi-sub">discounted at 10%</div></div>
    <div class="kpi kgold hero-kpi"><div class="kpi-label">3-Year Net ROI</div><div class="kpi-val">${roi3}<span style="font-size:15px">%</span></div><div class="kpi-sub">benefit less total cost · conservative ramps</div></div>`;
  document.getElementById('kpi-secondary').innerHTML = `
    <div class="kpi-sec"><div class="ks-label">Year 1 Ramped Value</div><div class="ks-val">${fmt(totY1)}</div></div>
    <div class="kpi-sec"><div class="ks-label">Year 2 Ramped Value</div><div class="ks-val">${fmt(totY2)}</div></div>
    <div class="kpi-sec"><div class="ks-label">Benefit : Cost (Yr 3)</div><div class="ks-val">${(c.yr2>0&&isFinite(totY3/c.yr2))?(totY3/c.yr2).toFixed(1)+'x':'—'}</div></div>
    <div class="kpi-sec"><div class="ks-label">Monthly at Full Run</div><div class="ks-val">${fmt(Math.round(totAnnual/12))}</div></div>`;

  // Delay slider
  syncDelay();

  // Missed value — rendered by syncDelay so delay slider drives both cards
  // (syncDelay is called below)

  // ── SVG Horizontal Bar Chart — absolute scale, grouped, proper axis ──
  (function(){
    const typeOrder = ['hard_labor','hard_cost','revenue','soft','working_cap','strategic'];
    const typeLabels = {hard_labor:'Hard Labor',hard_cost:'Hard Cost',revenue:'Revenue Uplift',soft:'Soft Productivity',working_cap:'Working Capital',strategic:'Strategic'};
    const typeColors = {hard_labor:'#000000',hard_cost:'#303030',revenue:'#565656',soft:'#BDBDBD',working_cap:'#757575',strategic:'#C8C8C8'};
    const typeBg    = {hard_labor:'#F8F8F8',hard_cost:'#F8F8F8',revenue:'#FAFAFA',soft:'#FAFAFA',working_cap:'#FAFAFA',strategic:'#FAFAFA'};

    const grouped = typeOrder
      .map(t=>({type:t,items:rows.filter(r=>r.sc.rampType===t).sort((a,b)=>b.ann-a.ann)}))
      .filter(g=>g.items.length);

    const allRows = grouped.flatMap(g=>g.items);
    const maxVal  = Math.max(...allRows.map(r=>r.ann), 1);

    // Dimensions
    const LABEL_W = 172; // left label column
    const BAR_H   = 22;  // bar height
    const BAR_GAP = 6;   // gap between bars
    const GRP_PAD = 18;  // extra space before each group header
    const HDR_H   = 20;  // group header height
    const CHART_W = 560; // total svg width
    const AXIS_W  = CHART_W - LABEL_W - 64; // bar area width (leave 64 for value label)
    const PT = 8, PB = 28; // top/bottom padding

    // Nice round axis max
    const niceMax = (v) => {
      if(!v || v <= 0) return 1;
      const mag = Math.pow(10, Math.floor(Math.log10(v)));
      const norm = v / mag;
      const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
      return nice * mag;
    };
    const axisMax = niceMax(maxVal);

    // X-axis ticks — 4 evenly spaced
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => axisMax * f);
    const fmtAx = v => v === 0 ? '$0' : v >= 1e6 ? '$'+(v/1e6).toFixed(1)+'M' : '$'+(v/1e3).toFixed(0)+'K';
    const toBarW = v => Math.max(2, Math.round((v / axisMax) * AXIS_W));

    // Calculate total height
    let totalH = PT;
    grouped.forEach(g => { totalH += GRP_PAD + HDR_H + g.items.length * (BAR_H + BAR_GAP); });
    totalH += PB + 20; // axis labels

    // Build SVG rows
    let svgRows = '';
    let y = PT;

    grouped.forEach(g => {
      y += GRP_PAD;
      const groupTotal = g.items.reduce((a,r)=>a+r.ann,0);
      const color = typeColors[g.type];

      // Group header row
      svgRows += `
        <rect x="0" y="${y}" width="${CHART_W}" height="${HDR_H}" fill="${typeBg[g.type]}"/>
        <rect x="0" y="${y}" width="3" height="${HDR_H}" fill="${color}"/>
        <text x="8" y="${y+13}" font-family="Courier New" font-size="9" font-weight="700"
          text-transform="uppercase" letter-spacing="0.8" fill="#757575">${typeLabels[g.type].toUpperCase()}</text>
        <text x="${CHART_W-4}" y="${y+13}" font-family="Courier New" font-size="10" font-weight="700"
          text-anchor="end" fill="${color}">${fmt(groupTotal)}</text>`;
      y += HDR_H;

      g.items.forEach(r => {
        const bw = toBarW(r.ann);
        const nameStr = r.sc.name.length>26 ? r.sc.name.substring(0,24)+'…' : r.sc.name;
        const barX = LABEL_W;
        const barY = y + (BAR_GAP/2);

        svgRows += `
          <text x="${LABEL_W - 6}" y="${barY + 14}" text-anchor="end"
            font-family="'ZebraSans',Arial,sans-serif" font-size="11" fill="#303030">${nameStr}</text>
          <text x="${LABEL_W - 6}" y="${barY + 14 + 10}" text-anchor="end"
            font-family="Courier New" font-size="8" fill="#BDBDBD">${r.sc.id}</text>
          <rect x="${barX}" y="${barY}" width="${AXIS_W}" height="${BAR_H}"
            fill="#F2F2F2" rx="2"/>
          <rect x="${barX}" y="${barY}" width="${bw}" height="${BAR_H}"
            fill="${color}" rx="2"/>
          <text x="${barX + bw + 6}" y="${barY + 15}"
            font-family="Courier New" font-size="11" font-weight="700" fill="#303030">${fmt(r.ann)}</text>`;
        y += BAR_H + BAR_GAP;
      });
    });

    // X axis line + tick labels
    const axisY = totalH - PB;
    svgRows += `<line x1="${LABEL_W}" y1="${axisY}" x2="${LABEL_W+AXIS_W}" y2="${axisY}" stroke="#BDBDBD" stroke-width="1"/>`;
    ticks.forEach(t => {
      const tx = LABEL_W + toBarW(t);
      svgRows += `
        <line x1="${tx}" y1="${PT}" x2="${tx}" y2="${axisY}" stroke="#E6E6E6" stroke-width="1" stroke-dasharray="3,3"/>
        <text x="${tx}" y="${axisY+14}" text-anchor="middle" font-family="Courier New" font-size="9" fill="#999">${fmtAx(t)}</text>`;
    });

    document.getElementById('benefit-bars').innerHTML =
      `<svg viewBox="0 0 ${CHART_W} ${totalH}" width="100%" style="display:block;overflow:visible">${svgRows}</svg>`;
  })();

  // ── SVG Line Chart: Cumulative Net Cash Position ──
  (function() {
    const W=540, H=200, PL=70, PR=20, PT=16, PB=40;
    const iW=W-PL-PR, iH=H-PT-PB;
    // Cumulative cash: year 0 = -invest, then accumulate
    const cumPoints = [
      {yr:0,  cum: yr0net},
      {yr:1,  cum: yr0net + yr1net},
      {yr:2,  cum: yr0net + yr1net + yr2net},
      {yr:3,  cum: yr0net + yr1net + yr2net + yr3net},
      {yr:4,  cum: yr0net + yr1net + yr2net + yr3net + yr3net},
      {yr:5,  cum: yr0net + yr1net + yr2net + yr3net + yr3net + yr3net},
    ];
    const allVals = cumPoints.map(p=>p.cum);
    const minV = Math.min(...allVals), maxV = Math.max(...allVals);
    const range = maxV - minV || 1;
    const toX = yr => PL + (yr/5)*iW;
    const toY = v => PT + iH - ((v-minV)/range)*iH;
    const zeroY = toY(0);

    // Find payback crossing (between which years)
    let pbX = null;
    for(let i=1;i<cumPoints.length;i++) {
      if(cumPoints[i-1].cum<0 && cumPoints[i].cum>=0) {
        const frac = -cumPoints[i-1].cum / (cumPoints[i].cum - cumPoints[i-1].cum);
        pbX = toX(i-1+frac);
        break;
      }
    }

    const pts = cumPoints.map(p => toX(p.yr)+','+toY(p.cum)).join(' ');
    const areaBottom = PT+iH;
    const areaPath = `M${toX(0)},${toY(cumPoints[0].cum)} ` + 
      cumPoints.slice(1).map(p=>`L${toX(p.yr)},${toY(p.cum)}`).join(' ') +
      ` L${toX(5)},${areaBottom} L${toX(0)},${areaBottom} Z`;

    // Y-axis ticks
    const ticks = [minV, 0, maxV/2, maxV].filter((v,i,a)=>a.findIndex(x=>Math.abs(x-v)<range*.05)===i);

    const fmtAxis = v => {
      const abs=Math.abs(v),s=v<0?'-':'';
      if(abs>=1e6) return s+'$'+(abs/1e6).toFixed(1)+'M';
      if(abs>=1e3) return s+'$'+(abs/1e3).toFixed(0)+'K';
      return s+'$0';
    };

    document.getElementById('cf-chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="overflow:visible;display:block">
      <defs>
        <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#A8F931" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#A8F931" stop-opacity="0.02"/>
        </linearGradient>
        <linearGradient id="cfGradNeg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#EB5757" stop-opacity="0.04"/>
          <stop offset="100%" stop-color="#EB5757" stop-opacity="0.18"/>
        </linearGradient>
      </defs>
      <!-- Grid lines -->
      ${ticks.map(v=>`
        <line x1="${PL}" y1="${toY(v)}" x2="${W-PR}" y2="${toY(v)}" stroke="#E6E6E6" stroke-width="1" stroke-dasharray="${v===0?'none':'3,3'}"/>
        <text x="${PL-6}" y="${toY(v)+4}" text-anchor="end" font-size="9" font-family="Courier New" fill="${v===0?'#303030':'#999'}" font-weight="${v===0?'700':'400'}">${fmtAxis(v)}</text>
      `).join('')}
      <!-- Zero line bold -->
      <line x1="${PL}" y1="${zeroY}" x2="${W-PR}" y2="${zeroY}" stroke="#303030" stroke-width="1.5"/>
      <!-- Area fill (positive above zero) -->
      <path d="${areaPath}" fill="url(#cfGrad)" opacity="0.8"/>
      <!-- Line -->
      <polyline points="${pts}" fill="none" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      <!-- Data points -->
      ${cumPoints.map(p=>`<circle cx="${toX(p.yr)}" cy="${toY(p.cum)}" r="4" fill="${p.cum>=0?'#A8F931':'#EB5757'}" stroke="#000" stroke-width="1.5"/>`).join('')}
      <!-- X-axis labels -->
      ${['Yr 0','Yr 1','Yr 2','Yr 3','Yr 4','Yr 5'].map((l,i)=>`<text x="${toX(i)}" y="${H-8}" text-anchor="middle" font-size="9" font-family="Courier New" fill="#757575" text-transform="uppercase">${l}</text>`).join('')}
      <!-- Payback annotation — label flips right/left to stay inside chart bounds -->
      ${(pbX && isFinite(pbX)) ? (()=>{
        const pbMo = Math.round(typeof payback==='number'?payback:parseFloat(payback)||0);
        const pbLabel = 'PAYBACK  ' + pbMo + ' MO';
        const labelW = 96, labelH = 22, labelY = PT + 5;
        const flipLeft = pbX > (PL + iW * 0.55);
        const rectX = flipLeft ? pbX - labelW - 8 : pbX + 8;
        const textX = rectX + labelW / 2;
        return `<line x1="${pbX}" y1="${PT}" x2="${pbX}" y2="${PT+iH}" stroke="#A8F931" stroke-width="1.5" stroke-dasharray="4,3"/>
        <rect x="${rectX}" y="${labelY}" width="${labelW}" height="${labelH}" rx="3" fill="#000"/>
        <text x="${textX}" y="${labelY+14}" text-anchor="middle" font-size="11" font-family="Courier New" fill="#A8F931" font-weight="700" letter-spacing="0.5">${pbLabel}</text>`;
      })() : ''}
    </svg>`;
  })();

  // ── SVG Ramp Chart: Cumulative Benefits vs Costs ──
  (function() {
    const W=540, H=200, PL=70, PR=20, PT=16, PB=40;
    const iW=W-PL-PR, iH=H-PT-PB;
    // Benefits curve (cumulative)
    const bYears = [
      {yr:0, b:0,        cost: c.yr0||0},
      {yr:1, b:totY1,    cost: (c.yr0||0)+(c.yr1||0)},
      {yr:2, b:totY1+totY2, cost:(c.yr0||0)+(c.yr1||0)+(c.yr2||0)},
      {yr:3, b:totY1+totY2+totY3, cost:(c.yr0||0)+(c.yr1||0)+(c.yr2||0)*2},
      {yr:4, b:totY1+totY2+totY3*2, cost:(c.yr0||0)+(c.yr1||0)+(c.yr2||0)*3},
      {yr:5, b:totY1+totY2+totY3*3, cost:(c.yr0||0)+(c.yr1||0)+(c.yr2||0)*4},
    ];
    const maxV = Math.max(...bYears.map(p=>Math.max(p.b,p.cost))) || 1;
    const toX = yr => PL + (yr/5)*iW;
    const toY = v => PT + iH*(1 - v/maxV);
    const fmtAx = v => { const a=Math.abs(v); return a>=1e6?'$'+(a/1e6).toFixed(1)+'M':a>=1e3?'$'+(a/1e3).toFixed(0)+'K':'$0'; };
    const bPts = bYears.map(p=>toX(p.yr)+','+toY(p.b)).join(' ');
    const cPts = bYears.map(p=>toX(p.yr)+','+toY(p.cost)).join(' ');
    // Y ticks
    const yticks = [0, maxV*.25, maxV*.5, maxV*.75, maxV];

    const _rampEl = document.getElementById('ramp-chart'); if(_rampEl) _rampEl.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="overflow:visible;display:block">
      <defs>
        <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#A8F931" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#A8F931" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      ${yticks.map(v=>`
        <line x1="${PL}" y1="${toY(v)}" x2="${W-PR}" y2="${toY(v)}" stroke="#E6E6E6" stroke-width="1" stroke-dasharray="3,3"/>
        <text x="${PL-6}" y="${toY(v)+4}" text-anchor="end" font-size="9" font-family="Courier New" fill="#999">${fmtAx(v)}</text>
      `).join('')}
      <!-- Cost area (flat-ish after yr0) -->
      <polyline points="${cPts}" fill="none" stroke="#BDBDBD" stroke-width="2" stroke-dasharray="5,3" stroke-linejoin="round"/>
      <!-- Benefit area -->
      <polyline points="${bPts} ${toX(5)},${PT+iH} ${toX(0)},${PT+iH}" fill="url(#bGrad)" stroke="none"/>
      <polyline points="${bPts}" fill="none" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Points -->
      ${bYears.map(p=>`<circle cx="${toX(p.yr)}" cy="${toY(p.b)}" r="3.5" fill="#A8F931" stroke="#000" stroke-width="1.5"/>`).join('')}
      <!-- X labels -->
      ${['Yr 0','Yr 1','Yr 2','Yr 3','Yr 4','Yr 5'].map((l,i)=>`<text x="${toX(i)}" y="${H-8}" text-anchor="middle" font-size="9" font-family="Courier New" fill="#757575">${l}</text>`).join('')}
      <!-- Legend -->
      <line x1="${PL}" y1="${PT-2}" x2="${PL+20}" y2="${PT-2}" stroke="#000" stroke-width="2.5"/>
      <text x="${PL+24}" y="${PT+2}" font-size="9" font-family="Courier New" fill="#303030">Cumulative Benefits</text>
      <line x1="${PL+130}" y1="${PT-2}" x2="${PL+150}" y2="${PT-2}" stroke="#BDBDBD" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="${PL+154}" y="${PT+2}" font-size="9" font-family="Courier New" fill="#757575">Cumulative Costs</text>
    </svg>`;
  })();

  // Financial metrics grid
  document.getElementById('fin-grid').innerHTML = `
    <div class="fin-card accent-green"><div class="fin-label">NPV (5-Year @ 10%)</div><div class="fin-val">${fmt(npv5)}</div><div class="fin-sub">Net present value of cash flows</div></div>
    <div class="fin-card accent-blue"><div class="fin-label">IRR</div><div class="fin-val">${irr}%</div><div class="fin-sub">Modeled unlevered IRR (illustrative, pre-tax)</div></div>
    <div class="fin-card accent-amber"><div class="fin-label">Benefit-to-Cost (Yr 3)</div><div class="fin-val">${(c.yr2>0&&isFinite(totY3/c.yr2))?(totY3/c.yr2).toFixed(1)+'x':'—'}</div><div class="fin-sub">Full realization ÷ annual operating cost</div></div>
    <div class="fin-card" style="border-top:3px solid var(--red)"><div class="fin-label">Monthly Value at Risk</div><div class="fin-val" style="color:var(--red)">${fmt(Math.round(totY1/12))}</div><div class="fin-sub">Foregone per month of delay</div></div>`;

  // Detail table — expandable rows with mini analytics panel
  const _totAnnForPct = totAnnual || 1;
  document.getElementById('vtbl-body').innerHTML = rows.map(r=>{
    const rInfo = RAMP[r.sc.rampType];
    const pct = Math.round((r.ann / _totAnnForPct) * 100);
    const monthly = Math.round(r.ann / 12);
    const monthlyY1 = Math.round(r.y1 / 12);
    const shortName = r.sc.name.length>30 ? r.sc.name.substring(0,28)+'…' : r.sc.name;
    const barCls = ['hard_labor','hard_cost'].includes(r.sc.rampType)?'':(r.sc.rampType==='revenue'?'rev':'soft');
    // Ramp sparkline: 3 bars showing y1/y2/y3 as % of ann
    const sparkW1 = r.ann>0?Math.round((r.y1/r.ann)*100):0;
    const sparkW2 = r.ann>0?Math.round((r.y2/r.ann)*100):0;
    return `
    <tr class="sc-data-row" onclick="toggleScExpand('${r.sc.id}')">
      <td style="max-width:180px"><div style="font-size:12px;font-weight:600;color:var(--brand-black);line-height:1.4">${shortName}</div><div style="font-family:var(--mono);font-size:9px;color:var(--muted)">${r.sc.id}</div></td>
      <td class="r mono" style="font-weight:700;color:var(--brand-black)">${fmt(r.ann)}</td>
      <td class="r mono" style="color:var(--gray-700)">${fmt(r.y1)}</td>
      <td class="r mono" style="color:var(--gray-700)">${fmt(r.y2)}</td>
      <td class="r mono" style="color:var(--gray-700)">${fmt(r.y3)}</td>
      <td><span class="ramp-tag" style="background:${rampColors[r.sc.rampType]?.bg||'#f0f0f0'};color:${rampColors[r.sc.rampType]?.fg||'#555'}">${rInfo.label}</span></td>
    </tr>
    <tr class="sc-expand-panel" id="scexp-${r.sc.id}">
      <td colspan="6" style="padding:0!important;border-bottom:2px solid var(--gray-200)">
        <div class="sc-snapshot">
          <!-- LEFT: SVG donut arc -->
          <div class="sc-snapshot-donut">
            ${buildDonut(pct, r.sc.rampType)}
          </div>
          <!-- CENTER: 3 key stats + inputs used -->
          <div class="sc-snapshot-stats">
            <div class="sc-snapshot-title">${r.sc.name}</div>
            <div class="sc-snapshot-id">${r.sc.id} · ${rInfo.label}</div>
            <div class="sc-snapshot-grid">
              <div class="sc-snap-stat">
                <div class="sc-snap-val">${fmt(r.ann)}</div>
                <div class="sc-snap-lbl">Annual Value</div>
              </div>
              <div class="sc-snap-stat">
                <div class="sc-snap-val">${fmt(monthly)}</div>
                <div class="sc-snap-lbl">Per Month</div>
              </div>
              <div class="sc-snap-stat">
                <div class="sc-snap-val">${fmt(r.y1)}</div>
                <div class="sc-snap-lbl">Year 1 (Ramped)</div>
              </div>
            </div>
            <!-- Key inputs used in calculation -->
            <div class="sc-snap-inputs">
              ${Object.entries(r.sc.inputs).slice(0,4).map(([k,v])=>{
                const used = state.inputs[r.sc.id]?.[k];
                const val = used !== undefined ? used : v.value;
                return `<div class="sc-snap-input-row">
                  <span class="sc-snap-input-key">${v.label}</span>
                  <span class="sc-snap-input-val">${fmtVal(val, v.unit)}</span>
                </div>`;
              }).join('')}
            </div>
          </div>
          <!-- RIGHT: evidence + one-liner -->
          <div class="sc-snapshot-right">
            <div class="sc-snap-oneliner">${r.sc.oneLiner||''}</div>
            <div class="sc-snap-challenge">${r.sc.challenge||''}</div>
          </div>
        </div>
      </td>
    </tr>`;
  }).join('');
  document.getElementById('vtbl-foot').innerHTML=`<tr class="total-row"><td><strong>TOTAL</strong></td><td class="r mono"><strong>${fmt(totAnnual)}</strong></td><td class="r mono"><strong>${fmt(totY1)}</strong></td><td class="r mono"><strong>${fmt(totY2)}</strong></td><td class="r mono"><strong>${fmt(totY3)}</strong></td><td></td></tr>`;
}

function syncDelay() {
  const months = +sliderVal('sl-delay');
  const svEl = document.getElementById('sv-delay');
  if(svEl) svEl.textContent = months+' mo';
  // Ensure benefits are calculated
  if(!state.benefits || !state.benefits.totAnnual) {
    ensureCosts();
    const active = SCENARIOS.filter(s=>state.selectedIds.has(s.id));
    let totAnnual=0, totY1=0, totY2=0, totY3=0;
    const rows = active.map(sc => {
      const ann = Math.max(0, calcSc(sc));
      const r = RAMP[sc.rampType];
      const y1=ann*r.y1, y2=ann*r.y2, y3=ann*r.y3;
      totAnnual+=ann; totY1+=y1; totY2+=y2; totY3+=y3;
      return {sc, ann, y1, y2, y3};
    });
    state.benefits = {totAnnual, totY1, totY2, totY3, rows};
  }
  const b = state.benefits;
  const monthly = b.totY1>0 ? Math.round(b.totY1/12) : Math.round((b.totAnnual||0)*0.50/12);
  const delayed = monthly*months;

  // Delay output card
  const el = document.getElementById('delay-output');
  if(el) el.innerHTML = `
    <div style="text-align:center;padding:12px;background:rgba(235,87,87,.07);border-radius:8px;border:1px solid rgba(235,87,87,.2)">
      <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:4px">VALUE FOREGONE — ${months} MONTH DELAY</div>
      <div style="font-family:var(--head);font-size:28px;font-weight:800;color:var(--red)">${fmt(delayed)}</div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px">${fmt(monthly)}/mo at Year 1 ramp</div>
    </div>`;

  // Cost of Doing Nothing — per-scenario leak at this delay milestone
  const missed = document.getElementById('missed-items');
  if(missed && b.rows) {
    missed.innerHTML = b.rows.map(r => {
      const monthlyLoss = Math.round(r.ann * (RAMP[r.sc.rampType]?.y1||0.5) / 12);
      const totalLoss = monthlyLoss * months;
      const pct = b.totAnnual>0 ? Math.round((r.ann/b.totAnnual)*100) : 0;
      return `<div class="missed-item" style="flex-direction:column;align-items:flex-start;gap:3px;padding:8px 12px">
        <div style="display:flex;justify-content:space-between;width:100%">
          <div class="mi-label" style="font-size:11px">${r.sc.id} — ${r.sc.name.length>24?r.sc.name.substring(0,22)+'…':r.sc.name}</div>
          <div class="mi-val" style="font-size:11px">-${fmt(totalLoss)}</div>
        </div>
        <div style="width:100%;height:3px;background:rgba(235,87,87,.15);border-radius:2px">
          <div style="width:${pct}%;height:100%;background:var(--red);border-radius:2px;opacity:.6"></div>
        </div>
      </div>`;
    }).join('');
  }
}

function estimateIRR(cashflows) {
  if(!cashflows || cashflows[0]>=0) return 'N/A'; // no investment
  if(cashflows.slice(1).every(v=>v<=0)) return 'N/A'; // no positive returns
  let r = 0.20;
  for(let i=0;i<100;i++) {
    let npv=0, dnpv=0;
    cashflows.forEach((cf,t)=>{ npv+=cf/Math.pow(1+r,t); dnpv-=t*cf/Math.pow(1+r,t+1); });
    if(Math.abs(dnpv)<1e-10) break;
    const r2=r-npv/dnpv;
    if(!isFinite(r2)) break;
    if(Math.abs(r2-r)<1e-6){r=r2;break;}
    r=r2;
  }
  return (r>0&&r<10&&isFinite(r))?Math.round(r*100):'N/A';
}

// ── STEP 7: EXEC ──
function renderExec() {
  const co = document.getElementById('i-customer')?.value||'Your Customer';
  const vendor = document.getElementById('i-company')?.value||'Zebra Technologies';
  const title = document.getElementById('i-title')?.value||'RFID Strategic Value Analysis';
  const seller = document.getElementById('i-seller')?.value||'—';
  const partners = document.getElementById('i-partners')?.value||'—';
  const b = state.benefits;
  const c = state.costs;
  // Recompute if needed
  if(!b.totAnnual) renderROI();
  const totAnnual = state.benefits.totAnnual||0;
  const totY1 = state.benefits.totY1||0;
  const totY2 = state.benefits.totY2||0;
  const totY3 = state.benefits.totY3||0;
  const payback = c.yr0>0&&totAnnual>0 ? Math.round(c.yr0/(totAnnual/12)) : '—';
  const yr1net = totY1-(c.yr1||0);
  const yr2net = totY2-(c.yr2||0);
  const yr3net = totY3-(c.yr2||0);
  const npv5 = Math.round((yr1net/1.1)+(yr2net/1.21)+(yr3net/1.331)+(yr3net/1.464)+(yr3net/1.611));

  document.getElementById('exec-heading').textContent = title + ' — ' + co;
  document.getElementById('exec-sub').textContent = `Prepared by ${seller} · Parties & Partners: ${partners} · Discovery KPIs: ${document.getElementById('i-pain')?.value||'—'}`;
  const dateDisplay = document.getElementById('exec-date-display');
  if(dateDisplay) dateDisplay.textContent = new Date().toLocaleDateString();
  const roi3pct = c.yr0>0 ? Math.round(((totY1+totY2+totY3-(c.yr0+c.yr1+c.yr2+c.yr2))/(c.yr0+c.yr1+c.yr2+c.yr2))*100) : 0;
  document.getElementById('exec-kpis').innerHTML=`
    <div class="ek"><div class="ek-val">${fmt(totAnnual)}</div><div class="ek-lab">FULL ANNUAL VALUE</div></div>
    <div class="ek"><div class="ek-val">${typeof payback==='number'?payback+' mo':payback}</div><div class="ek-lab">PAYBACK PERIOD</div></div>
    <div class="ek"><div class="ek-val">${fmt(npv5)}</div><div class="ek-lab">5-YEAR NPV</div></div>
    <div class="ek"><div class="ek-val">${roi3pct}%</div><div class="ek-lab">3-YEAR NET ROI</div></div>`;

  const active = SCENARIOS.filter(s=>state.selectedIds.has(s.id));
  const hardRows = (b.rows||[]).filter(r=>['hard_labor','hard_cost'].includes(r.sc?.rampType));
  const hardY1 = hardRows.reduce((a,r)=>a+(r.y1||0),0);

  // ── Dynamic narrative — built from live state ──
  const hardTypes  = ['hard_labor','hard_cost'];
  const revTypes   = ['revenue'];
  const softTypes  = ['soft','working_cap','strategic'];
  const hardRowsN  = (b.rows||[]).filter(r=>hardTypes.includes(r.sc?.rampType));
  const revRowsN   = (b.rows||[]).filter(r=>revTypes.includes(r.sc?.rampType));
  const softRowsN  = (b.rows||[]).filter(r=>softTypes.includes(r.sc?.rampType));
  const hardAnn    = hardRowsN.reduce((a,r)=>a+(r.ann||0),0);
  const revAnn     = revRowsN.reduce((a,r)=>a+(r.ann||0),0);
  const softAnn    = softRowsN.reduce((a,r)=>a+(r.ann||0),0);
  const hardY1N    = hardRowsN.reduce((a,r)=>a+(r.y1||0),0);
  const revY1N     = revRowsN.reduce((a,r)=>a+(r.y1||0),0);
  // Payback context
  const pbText = typeof payback==='number' ? `<strong>${payback} months</strong>` : '&#8212;';
  // Ramp methodology sentence — only list types actually present
  const rampLines = [];
  if(hardRowsN.length) rampLines.push(`Hard Labor &amp; Cost scenarios at <strong>50% Year 1 &#8594; 100% Year 3</strong>`);
  if(revRowsN.length)  rampLines.push(`Revenue Uplift at <strong>30% Year 1 &#8594; 100% Year 3</strong>`);
  if((b.rows||[]).some(r=>r.sc?.rampType==='working_cap')) rampLines.push(`Working Capital at <strong>20% Year 1 &#8594; 100% Year 3</strong>`);
  if((b.rows||[]).some(r=>r.sc?.rampType==='soft'))        rampLines.push(`Soft Productivity at <strong>25% Year 1 &#8594; 100% Year 3</strong>`);
  if((b.rows||[]).some(r=>r.sc?.rampType==='strategic'))   rampLines.push(`Strategic scenarios at <strong>0% Year 1 &#8594; 60% Year 3</strong> (back-weighted)`);
  const rampSentence = rampLines.length ? `Benefit realization is modeled using type-specific adoption ramps calibrated to operational change velocity: ${rampLines.join('; ')}. ` : '';
  // Hard case % of total
  const hardPct = totAnnual>0 ? Math.round((hardAnn/totAnnual)*100) : 0;
  document.getElementById('exec-narrative').innerHTML=`
    <p>Based on analysis of <strong>${co}</strong>'s operations, deploying Zebra RFID Technology delivers <strong>${fmt(totAnnual)} in full annual value</strong> across ${active.length} quantified scenarios. Payback period is ${pbText} with a 5-year net present value of <strong>${fmt(npv5)}</strong> and a 3-year net ROI of <strong>${roi3pct}%</strong>.</p>
    <p>${rampSentence}These curves are grounded in GS1 US deployment guidance and peer-reviewed adoption data from the Auburn RFID Lab, ensuring the model is conservative and defensible at the finance level.</p>
    <p>The Year 1 business case is anchored in Hard Labor and Hard Cost scenarios, which require no demand-side assumptions and are credited at 100% by finance teams. ${hardRowsN.length>0?`These ${hardRowsN.length} scenario${hardRowsN.length>1?'s':''} represent <strong>${hardPct}% of total annual value</strong> and deliver <strong>${fmt(hardY1N)} in Year 1</strong> &#8212; the floor of the financial case.`:''} ${revRowsN.length>0?`Revenue uplift scenarios contribute an additional <strong>${fmt(revAnn)}</strong> at full realization (Year 3), modeled conservatively at ${fmt(revY1N)} in Year 1 (30% ramp) and presented as validated upside, not the anchor.`:''}</p>
    <p>Total Yr 0 investment: <strong>${fmt(c.yr0)}</strong> one-time; <strong>${fmt(c.yr1)}</strong> Yr 1 ongoing; <strong>${fmt(c.yr2)}</strong>/yr from Yr 2. All quantified values reference Tier 1&#8211;3 evidence published by Auburn University RFID Lab, GS1 US, the National Retail Federation, ECR Retail Loss, and Zebra Technologies / VDC Research. Evidence identifiers are cited inline for each scenario.</p>`;

  // ── Ramp methodology grid ──
  const rampMethodGrid = document.getElementById('ramp-methodology-grid');
  if(rampMethodGrid) {
    const rampDefs = [
      {key:'hard_labor',  label:'Hard Labor',     rates:'50% &#8594; 85% &#8594; 100%', note:'Direct labor displacement'},
      {key:'hard_cost',   label:'Hard Cost',      rates:'50% &#8594; 85% &#8594; 100%', note:'Trackable spend reduction'},
      {key:'revenue',     label:'Revenue Uplift',  rates:'30% &#8594; 70% &#8594; 100%', note:'Accuracy-driven margin'},
      {key:'working_cap', label:'Working Capital', rates:'20% &#8594; 60% &#8594; 100%', note:'Phased inventory release'},
      {key:'soft',        label:'Soft Productivity',rates:'25% &#8594; 65% &#8594; 100%', note:'Reallocated associate time'},
      {key:'strategic',   label:'Strategic',       rates:'0% &#8594; 20% &#8594; 60%',  note:'Data &amp; automation ROI'},
    ];
    const activeTypes = new Set((b.rows||[]).map(r=>r.sc?.rampType).filter(Boolean));
    rampMethodGrid.innerHTML = rampDefs.filter(d=>activeTypes.has(d.key)).map(d=>`
      <div style="display:flex;flex-direction:column;gap:3px;padding:8px 10px;background:white;border:1px solid var(--gray-100);border-radius:3px">
        <span class="ramp-tag" style="background:${rampColors[d.key]?.bg||'#f0f0f0'};color:${rampColors[d.key]?.fg||'#555'};align-self:flex-start">${d.label}</span>
        <div style="font-family:var(--mono);font-size:11px;font-weight:700;color:var(--brand-black);margin-top:4px">${d.rates}</div>
        <div style="font-size:10px;color:var(--gray-500)">${d.note}</div>
      </div>`).join('');
  }
  // Render ramp chart directly in exec (cash flow stays on ROI page only)
  const execRamp = document.getElementById('exec-ramp-chart');
  if(execRamp) {
    // Re-render ramp SVG inline (same logic as renderROI ramp chart)
    (function(){
      const W=540,H=200,PL=70,PR=20,PT=16,PB=40,iW=W-PL-PR,iH=H-PT-PB;
      const bYears=[
        {yr:0,b:0,cost:c.yr0||0},
        {yr:1,b:totY1,cost:(c.yr0||0)+(c.yr1||0)},
        {yr:2,b:totY1+totY2,cost:(c.yr0||0)+(c.yr1||0)+(c.yr2||0)},
        {yr:3,b:totY1+totY2+totY3,cost:(c.yr0||0)+(c.yr1||0)+(c.yr2||0)*2},
        {yr:4,b:totY1+totY2+totY3*2,cost:(c.yr0||0)+(c.yr1||0)+(c.yr2||0)*3},
        {yr:5,b:totY1+totY2+totY3*3,cost:(c.yr0||0)+(c.yr1||0)+(c.yr2||0)*4},
      ];
      const maxV=Math.max(...bYears.map(p=>Math.max(p.b,p.cost)))||1;
      const toX=yr=>PL+(yr/5)*iW, toY=v=>PT+iH*(1-v/maxV);
      const fmtAx=v=>{const a=Math.abs(v);return a>=1e6?'$'+(a/1e6).toFixed(1)+'M':a>=1e3?'$'+(a/1e3).toFixed(0)+'K':'$0';};
      const bPts=bYears.map(p=>toX(p.yr)+','+toY(p.b)).join(' ');
      const cPts=bYears.map(p=>toX(p.yr)+','+toY(p.cost)).join(' ');
      const yticks=[0,maxV*.25,maxV*.5,maxV*.75,maxV];
      execRamp.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="overflow:visible;display:block">
        <defs><linearGradient id="bGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A8F931" stop-opacity="0.3"/><stop offset="100%" stop-color="#A8F931" stop-opacity="0.02"/></linearGradient></defs>
        ${yticks.map(v=>`<line x1="${PL}" y1="${toY(v)}" x2="${W-PR}" y2="${toY(v)}" stroke="#E6E6E6" stroke-width="1" stroke-dasharray="3,3"/>
          <text x="${PL-6}" y="${toY(v)+4}" text-anchor="end" font-size="9" font-family="Courier New" fill="#999">${fmtAx(v)}</text>`).join('')}
        <polyline points="${cPts}" fill="none" stroke="#BDBDBD" stroke-width="2" stroke-dasharray="5,3" stroke-linejoin="round"/>
        <polyline points="${bPts} ${toX(5)},${PT+iH} ${toX(0)},${PT+iH}" fill="url(#bGrad2)" stroke="none"/>
        <polyline points="${bPts}" fill="none" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
        ${bYears.map(p=>`<circle cx="${toX(p.yr)}" cy="${toY(p.b)}" r="3.5" fill="#A8F931" stroke="#000" stroke-width="1.5"/>`).join('')}
        ${['Yr 0','Yr 1','Yr 2','Yr 3','Yr 4','Yr 5'].map((l,i)=>`<text x="${toX(i)}" y="${H-8}" text-anchor="middle" font-size="9" font-family="Courier New" fill="#757575">${l}</text>`).join('')}
        <line x1="${PL}" y1="${PT-2}" x2="${PL+20}" y2="${PT-2}" stroke="#000" stroke-width="2.5"/>
        <text x="${PL+24}" y="${PT+2}" font-size="9" font-family="Courier New" fill="#303030">Cumulative Benefits</text>
        <line x1="${PL+130}" y1="${PT-2}" x2="${PL+150}" y2="${PT-2}" stroke="#BDBDBD" stroke-width="2" stroke-dasharray="5,3"/>
        <text x="${PL+154}" y="${PT+2}" font-size="9" font-family="Courier New" fill="#757575">Cumulative Costs</text>
      </svg>`;
    })();
  }

  document.getElementById('exec-sc-body').innerHTML = active.map(sc=>{
    const row  = b.rows?.find(r=>r.sc.id===sc.id);
    const ann  = row?.ann || sc.annualBenefit;
    const y1   = row?.y1  || 0;
    const rInfo = RAMP[sc.rampType];
    return `<tr>
      <td><strong>${sc.id}</strong><br><span style="font-size:11px;color:var(--muted)">${sc.name}</span></td>
      <td style="font-size:12px;color:var(--gray-700)">${sc.theme}</td>
      <td><span class="ramp-tag" style="background:${rampColors[sc.rampType]?.bg||'#f0f0f0'};color:${rampColors[sc.rampType]?.fg||'#555'}">${rInfo?.label||sc.rampType}</span></td>
      <td class="r" style="font-family:var(--mono);color:var(--gray-700)">${fmt(y1)}</td>
      <td class="r" style="font-family:var(--mono);font-weight:700">${fmt(ann)}</td>
      <td>${sc.evidenceIds.map(id=>`<span class="ev-inline" title="${EVIDENCE.find(e=>e.id===id)?.claim||id}">${id}</span>`).join(' ')}</td>
    </tr>`;
  }).join('');

  const usedEvIds = [...new Set(active.flatMap(s=>s.evidenceIds))];
  document.getElementById('exec-evidence').innerHTML = usedEvIds.map(id=>{
    const ev = EVIDENCE.find(e=>e.id===id);
    if(!ev) return '';
    const tierCls = ev.tier.includes('1')?'b-green':ev.tier.includes('2')?'b-blue':'b-amber';
    return `<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
      <span class="badge ${tierCls}" style="flex-shrink:0;margin-top:2px">${ev.tier}</span>
      <div>
        <div style="font-weight:600;font-size:12.5px">${ev.title} <span class="mono" style="font-size:10px;color:var(--blue)">${ev.id}</span></div>
        <div style="font-size:11px;color:var(--muted)">${ev.publisher} · ${ev.year}</div>
        <div style="font-size:12px;margin-top:3px">${ev.claim}</div>
      </div>
    </div>`;
  }).join('');
}


function copyToClip(text) {
  navigator.clipboard.writeText(text).then(()=>{ alert('Copied to clipboard'); }).catch(()=>{ alert(text); });
}

// ── REFERENCE: EVIDENCE ──
function renderEvidence() {
  document.getElementById('ev-list').innerHTML = EVIDENCE.map(e=>{
    const tierCls = e.tier.includes('1')?'b-green':e.tier.includes('2')?'b-blue':'b-amber';
    return `<div class="ev-card">
      <div class="flex-between">
        <div style="display:flex;gap:8px;align-items:center">
          <span class="badge ${tierCls}">${e.tier}</span>
          <span class="mono" style="font-size:10px;color:var(--blue)">${e.id}</span>
        </div>
        <span class="muted mono" style="font-size:11px">${e.year}</span>
      </div>
      <div style="font-weight:600;font-size:13.5px;margin:6px 0 2px">${e.title}</div>
      <div class="muted" style="font-size:11px">${e.publisher}</div>
      <div class="ev-claim">${e.claim}</div>
    </div>`;
  }).join('');
}

// ── FORMAT HELPERS ──
function fmt(n) {
  if(n===null||n===undefined||isNaN(n)||!isFinite(n)) return '—';
  const abs=Math.abs(n), sign=n<0?'-':'';
  if(abs>=1000000) return sign+'$'+(abs/1000000).toFixed(1)+'M';
  if(abs>=1000) return sign+'$'+Math.round(abs).toLocaleString();
  if(abs>0&&abs<1) return sign+'$'+abs.toFixed(2);
  return sign+'$'+Math.round(abs).toLocaleString();
}
function fmtVal(v,unit) {
  if(unit==='$') return '$'+(v>=1000?v.toLocaleString():v);
  if(unit==='%') return (v*100).toFixed(1)+'%';
  if(unit==='$/hr') return '$'+v+'/hr';
  if(unit==='hrs') return v+' hrs';
  return v.toLocaleString?v.toLocaleString():v;
}

// exportPPTX — replaced by real generator below
// (see async function exportPPTX)


// ── FULL INVESTMENT APPRAISAL PDF (browser print — no Python required) ────────
function exportExecSummary() {
  // Ensure exec is rendered
  ensureCosts();
  if(!state.benefits || !state.benefits.totAnnual) renderROI();
  renderExec();

  // Capture the rendered exec panel content
  const panel = document.getElementById('panel-5');
  if(!panel){ alert('Please navigate to the Full Analysis step first.'); return; }

  const co     = document.getElementById('i-customer')?.value || 'Your Customer';
  const vendor = document.getElementById('i-company')?.value  || 'Zebra Technologies';
  const title  = document.getElementById('i-title')?.value   || 'RFID Strategic Value Analysis';

  // Clone the exec panel inner HTML, strip action buttons
  const clone = panel.cloneNode(true);
  // Remove the button row and JSON button
  clone.querySelectorAll('.btn-row, button, .step-desc').forEach(el=>el.remove());

  // Grab computed styles for key classes we need in the popup
  const popCSS = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family: 'ZebraSans', Arial, sans-serif;font-size:10pt;color:#1a1a1a;background:#fff;padding:.5in .65in}
    @page{size:letter portrait;margin:.5in .65in}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    h1,h2,h3{font-family:Arial,sans-serif}
    .step-title{font-size:20pt;font-weight:700;margin-bottom:4px}
    .exec-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}
    .ek{background:#f8f8f8;border:1px solid #e0e0e0;border-radius:4px;padding:14px;text-align:center}
    .ek-val{font-size:20pt;font-weight:700;font-family:Arial;margin-bottom:2px}
    .ek-lab{font-size:7pt;text-transform:uppercase;letter-spacing:1px;color:#757575;font-family:Courier New}
    .exec-narrative{font-size:10pt;line-height:1.6;margin:12px 0}
    .exec-narrative p{margin-bottom:8px}
    table{width:100%;border-collapse:collapse;font-size:9pt;margin:10px 0}
    th{background:#1a1a1a;color:#fff;padding:6px 8px;text-align:left;font-size:8pt;text-transform:uppercase;letter-spacing:.5px}
    td{padding:5px 8px;border-bottom:1px solid #e6e6e6}
    tr:nth-child(even) td{background:#f8f8f8}
    .r{text-align:right}
    .ramp-tag{display:inline-block;padding:2px 6px;border-radius:3px;font-size:8pt;font-weight:700}
    .badge{display:inline-block;padding:2px 6px;border-radius:3px;font-size:8pt;font-weight:700}
    .b-green{background:#E8F5E9;color:#2E7D32}
    .b-blue{background:#E3F2FD;color:#1565C0}
    .b-amber{background:#FFF8E1;color:#E65100}
    .b-gray{background:#F5F5F5;color:#555}
    .ev-inline{display:inline-block;background:#f0f0f0;border:1px solid #ddd;border-radius:3px;padding:1px 5px;font-size:8pt;font-family:Courier New;margin:1px}
    svg{max-width:100%;display:block}
    section{margin-bottom:18px}
    .section-label{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#999;font-family:Courier New;margin-bottom:6px}
    hr{border:none;border-top:1px solid #e6e6e6;margin:10px 0}
    .cover-bar{height:4px;background:#A8F931;width:60px;margin-bottom:10px;margin-top:4px}
    [style*="display:none"],[style*="display: none"]{display:none!important}
  `;

  const win = window.open('','_blank');
  if(!win){ alert('Pop-up blocked. Please allow pop-ups for this page and try again.'); return; }

  win.document.write('<!DOCTYPE html><html lang="en"><head>'
    +'<meta charset="UTF-8">'
    +'<title>'+co+' — Executive Summary</title>'
    +'<style>'+popCSS+'</style>'
    +'</head><body>'
    +'<div class="cover-bar"></div>'
    +'<div style="font-size:8pt;color:#999;font-family:Courier New;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Executive Summary · Zebra RFID Value Accelerator</div>'
    +'<div style="font-size:20pt;font-weight:700;margin-bottom:2px">'+title+' — '+co+'</div>'
    +'<div style="font-size:9pt;color:#757575;margin-bottom:16px">'+new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})+'</div>'
    +'<hr>'
    +clone.innerHTML
    +'<script>window.onload=function(){window.print();}<\/script>'
    +'</body></html>');
  win.document.close();
}
