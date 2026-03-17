function exportLLMPrompt() {
  const btn = document.querySelector('[onclick="exportLLMPrompt()"]');
  if(btn){ btn.textContent = '⏳ Building…'; btn.disabled = true; }

  try {
    ensureCosts();
    if(!state.benefits || !state.benefits.totAnnual) renderROI();

    const b = state.benefits;
    const c = state.costs;
    const active = SCENARIOS.filter(s => state.selectedIds.has(s.id));
    const co      = document.getElementById('i-customer')?.value  || 'Your Customer';
    const vendor  = document.getElementById('i-company')?.value   || 'Zebra Technologies';
    const titleS  = document.getElementById('i-title')?.value     || 'RFID Strategic Value Analysis';
    const pain    = document.getElementById('i-pain')?.value      || '';
    const dateStr = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});

    const fmt  = v => v == null ? '—' : '$' + Math.round(v).toLocaleString();
    const pct  = v => Math.round((v||0)*100) + '%';
    const moAvg = (b.totAnnual||0)/12;
    const paybackMo = moAvg>0 && (c.yr0||0)>0 ? Math.round((c.yr0||0)/moAvg) : null;
    const npv5 = Math.round(
      ((b.totY1-(c.yr1||0))/1.1) + ((b.totY2-(c.yr2||0))/1.21) +
      ((b.totY3-(c.yr2||0))/1.331) + ((b.totY3-(c.yr2||0))/1.464) +
      ((b.totY3-(c.yr2||0))/1.611)
    );
    const roi3 = (c.yr0||0)>0
      ? Math.round(((b.totY1+b.totY2+b.totY3 - (c.yr0+c.yr1+(c.yr2||0)*2)) / (c.yr0+c.yr1+(c.yr2||0)*2))*100)
      : 0;

    // Evidence used across active scenarios
    const usedEvidenceIds = [...new Set(active.flatMap(s => s.evidenceIds||[]))];
    const usedEvidence = usedEvidenceIds.map(id => EVIDENCE.find(e => e.id===id)).filter(Boolean);

    // Build scenario detail blocks
    const scenarioBlocks = active.map(sc => {
      const row = (b.rows||[]).find(r => r.sc.id === sc.id);
      const inp = state.inputs[sc.id] || {};
      const inputLines = Object.entries(sc.inputs||{}).map(([k,v]) => {
        const val = inp[k] !== undefined ? inp[k] : v.value;
        return `    • ${v.label}: ${val} (hint: ${v.hint||'—'})`;
      }).join('\n');
      const y1 = row ? fmt(row.y1) : '—';
      const y2 = row ? fmt(row.y2) : '—';
      const y3 = row ? fmt(row.y3) : '—';
      const ann = row ? fmt(row.ann) : fmt(sc.annualBenefit);
      const evIds = (sc.evidenceIds||[]).join(', ');
      return `## ${sc.name} [${sc.id}]
Theme: ${sc.theme}  |  Evidence Tier: ${sc.evidence}  |  Ramp Type: ${sc.rampType}
Summary: ${sc.oneLiner||''}
Annual Benefit (steady-state): ${ann}
  Year 1: ${y1} | Year 2: ${y2} | Year 3: ${y3}
Input Parameters Used:
${inputLines}
Discovery Questions:
${(sc.discoveryQuestions||[]).map(q=>`    • ${q}`).join('\n')}
Objection Handler:
    ${sc.challenge||'—'}
Evidence IDs: ${evIds||'—'}`;
    }).join('\n\n---\n\n');

    // Evidence registry block
    const evidenceBlock = usedEvidence.map(ev =>
      `[${ev.id}] ${ev.title} — ${ev.publisher||''} (${ev.year||'?'}) [${ev.tier}]\n    Claim: ${ev.claim||'—'}`
    ).join('\n\n');

    // Cost breakdown
    const costLines = (costRows||[]).map(r => {
      const total = typeof r.total === 'number' ? r.total : (r.qty||0)*(r.unit||0);
      return `  • ${r.label}: ${fmt(total)} (${r.cadence||'One-time'})`;
    }).join('\n');

    // Modeling methodology note
    const methodNote = `MODELING METHODOLOGY
────────────────────
• Ramp Types:
    hard_labor    — Year 1: 50%, Year 2: 85%, Year 3: 100%
    hard_cost     — Year 1: 50%, Year 2: 85%, Year 3: 100%
    revenue       — Year 1: 30%, Year 2: 65%, Year 3: 100%
    working_cap   — Year 1: 40%, Year 2: 75%, Year 3: 100%
    soft          — Year 1: 20%, Year 2: 55%, Year 3: 85%

• Financial model assumptions:
    – Cost of capital (discount rate): 10% per annum
    – NPV calculated over 5 years (Years 1–5); Years 4–5 carry Year 3 steady-state benefits
    – Yr0 investment is fully expensed in period 0 (not discounted)
    – Recurring OpEx (yr1, yr2) deducted from benefits before discounting
    – Payback = Yr0 investment ÷ (Annual steady-state benefit ÷ 12), expressed in months
    – ROI (3-year) = ((Total 3-yr benefits − Total 3-yr cost) ÷ Total 3-yr cost) × 100%
    – Only quantified direct benefits are included; strategic/soft benefits are noted but excluded from totals

• Input defaults are conservative end-of-range benchmarks from:
    GS1 US RFID Implementation Guidelines (2022)
    Auburn University RFID Lab Item-Level RFID Initiative benchmarks
    NRF National Retail Security Survey (2023)
    ECR Community Retail Out-of-Stock Study`;

    const prompt = `SUGGESTED CHAT TITLE: ${co} — RFID Value Analysis (${dateStr})
─────────────────────────────────────────────────────────────────────
Copy the title above to name this chat, then paste everything below.
─────────────────────────────────────────────────────────────────────

You are a strategic value engineering advisor specializing in enterprise RFID deployments. You have deep knowledge of operational ROI modeling, CFO-level financial framing, and RFID use cases across retail, warehouse, healthcare, manufacturing, T&L, government, and other verticals.

The seller has used the Zebra RFID Value Accelerator to build an initial business case. Your job is NOT to summarize what they've entered — they already know that. Your job is to be a thinking partner: help them see what they might be missing, stress-test the framing, and deepen the value story.

Start by doing three things in order:

1. READ BACK & CONFIRM
   Briefly reflect back the project as you understand it — customer, vertical, pain signal, and the value themes they've selected. One short paragraph. Then ask them to fill in what's missing:
   "Tell me more about this project — what does the environment look like, how many locations, what's driving this conversation right now, and is there anything specific about this customer that would help me give you better analysis?"

2. SURFACE POTENTIAL GAPS (soft, not pushy)
   After they respond, look at the scenarios they've selected vs. the full library below. Identify 2–4 scenarios they haven't selected that seem plausible given their vertical and pain signal. Present them as questions, not recommendations:
   "Given what you've described, a few areas that sometimes come up in similar deployments — worth a quick sanity check on whether any apply here." List them as bullets with one-line rationale each. Do any of these resonate?

3. OPEN THE FLOOR
   After that exchange, offer to go deeper on any of: financial stress-testing, objection prep, CFO narrative, discovery gaps, or scenario sensitivity analysis. Let them drive.

TONE: Conversational, expert, curious. You're a senior colleague, not a chatbot. Don't lecture. Don't bullet everything. Ask one question at a time. Flag anything off in the numbers directly but constructively.

════════════════════════════════════════════════════════════════════
ENGAGEMENT DATA
════════════════════════════════════════════════════════════════════
Customer:           ${co}
Vendor Presenting:  ${vendor}
Analysis Title:     ${titleS}
Date:               ${dateStr}
Pain Signal:        ${pain || '(not entered)'}

════════════════════════════════════════════════════════════════════
KEY FINANCIAL KPIs
════════════════════════════════════════════════════════════════════
Annual Benefit (steady-state):   ${fmt(b.totAnnual)}
  Year 1:                        ${fmt(b.totY1)}
  Year 2:                        ${fmt(b.totY2)}
  Year 3+:                       ${fmt(b.totAnnual)}
Initial Investment (Yr0):        ${fmt(c.yr0)}
Payback Period:                  ${paybackMo ? paybackMo + ' months' : '—'}
3-Year ROI:                      ${roi3}%
5-Year NPV (10% discount rate):  ${fmt(npv5)}
B:C Ratio (3-yr):                ${(c.yr2||0)>0 ? (((b.totY1+b.totY2+b.totAnnual)/(c.yr0+c.yr1+(c.yr2||0)*2)).toFixed(1)+'x') : '—'}

════════════════════════════════════════════════════════════════════
SCENARIOS SELECTED (${active.length})
════════════════════════════════════════════════════════════════════
${scenarioBlocks}

════════════════════════════════════════════════════════════════════
FULL SCENARIO LIBRARY (83 scenarios — for gap analysis)
════════════════════════════════════════════════════════════════════
These are ALL available value scenarios. Compare against selected above for gap analysis.

RETAIL
  RET-01: Inventory Accuracy — Cycle Count Labor — Cut cycle-count labor 75–90% — from 3 min/item to 12 sec with handheld RFID
  RET-02: On-Shelf Availability — Stockout Recovery — Recover 50% of stockout losses through RFID-triggered automated replenishment alerts
  RET-03: Shrink Reduction — Loss Prevention — Item-level visibility deters internal theft and sharpens LP exception reporting — 20–40% shrink reduction
  RET-04: Markdown Reduction — Better Sell-Through — Accurate inventory eliminates phantom overstock — 10% markdown reduction in apparel
  RET-05: Receiving Accuracy & Vendor Compliance — Inbound accuracy 85% → 99%+ — eliminate manual scan-each and cut receiving labor 40%
  RET-06: Associate Productivity — Recovered Hours — Recover 2–5 hrs/week per associate — redirect from inventory search to customer-facing work
  RET-07: Omnichannel Fulfillment — BOPIS Accuracy — Reduce BOPIS cancellations 60% and improve pick accuracy to 99%+ — protect omnichannel margin
  RET-08: Safety Stock Reduction — Carrying Cost — 5–15% safety stock reduction without stockout risk — enabled by perpetual accurate inventory
  RET-09: RFID Data Foundation for Retail AI & Analytics — Item-level RFID data enables demand forecasting, automated replenishment, planogram compliance, and customer analytics

WAREHOUSE
  WH-01: Cycle Count Labor — Perpetual DC Accuracy — DC cycle-count labor down 75–85% — 3 min/position to 20 sec per pallet position
  WH-02: Receiving Throughput & Dock-to-Stock — Inbound throughput up 30–50% — eliminate manual scan-each confirmation at dock doors
  WH-03: Pick Accuracy & Returns Reduction — Pick errors from 0.5% to under 0.1% — prevent thousands of costly re-picks and returns annually
  WH-04: SLA Compliance — 3PL Chargeback Reduction — 3PLs average 2–5% SLA miss rate — RFID reduces chargebacks 60–80% through real-time load verification
  WH-05: Safety Stock Reduction — Carrying Cost Savings — RFID accuracy enables 10–20% safety stock reduction without increasing stockout risk
  WH-06: Cross-Dock & Outbound Verification Labor — Eliminate manual scan-each at outbound — 30–50% dock labor reduction with RFID tunnel/gate reads
  WH-07: RFID Data Foundation for Warehouse AI & Automation — Real-time location data enables AMR navigation, dynamic slotting, predictive labor scheduling, and AI-driven demand flow

HEALTHCARE
  HC-01: Equipment Rental Reduction & Asset Utilization — 15–25% equipment rental reduction + 40–70% nursing search time elimination
  HC-02: Surgical Instrument Tracking — OR Throughput — 25–35% reduction in lost/late instruments — protect OR throughput at $100–180/minute of delay
  HC-03: Patient Flow — ED Length of Stay Reduction — RTLS bed tracking reduces ED LOS 10–20% — each hour recovered has direct margin and capacity value
  HC-04: Medication Tracking — Dispensing Error Reduction — Medication errors affect 1–3% of admissions — RFID chain-of-custody reduces dispensing errors 20–30%
  HC-05: Joint Commission Audit — Compliance Labor Reduction — Manual Joint Commission prep is 8–15% of clinical support labor — RFID reduces audit prep 40–65%
  HC-06: Supply Stockout & Expiry Reduction — Supply stockouts at 2–5% of PAR locations weekly — RFID reduces stockouts 20–30% and expired write-offs 15–20%
  HC-07: Controlled Substance Diversion Prevention — Controlled substance diversion drives write-offs and DEA investigations — RFID chain-of-custody reduces loss 15–30%
  HC-08: RFID Data Foundation for Healthcare AI & Predictive Ops — Real-time asset, patient, and supply data creates the sensor layer for LOS prediction, demand forecasting, and automated compliance

MANUFACTURING
  MTL-01: Tool & Asset Loss Reduction — Manufacturing plants lose 15–20% of tool value annually — RFID cuts that loss 60–80% within the first year
  MTL-02: WIP Inventory — Cycle Time & Carrying Cost Reduction — RFID eliminates lost work orders between stations — 10–25% cycle time reduction, 15–30% WIP reduction
  MTL-03: Compliance & Traceability Documentation Labor — FDA, ITAR, AS9100 compliance costs 3–8% of revenue — RFID automated traceability cuts documentation labor 40–70%
  MTL-04: Recall Scope Reduction — Targeted Traceability — Without RFID, recall scope is the full lot — serialization limits exposure to specific units, reducing recall cost 60–90%
  MTL-05: MRO Inventory Optimization — Carrying Cost Reduction — MRO carrying costs 20–30% of value — RFID reduces excess MRO 10–25% and emergency procurement 30–50%
  MTL-06: Finished Goods Shipment Accuracy — Chargeback Reduction — Manual finished goods tracking yields 0.5–2% shipment errors — RFID reduces to under 0.1%
  MTL-07: Asset & Fixture Tracking — Utilization & Procurement Avoidance — Reusable fixtures and production assets are over-procured when unlocatable — RFID prevents phantom replacements
  MTL-08: RFID Data Foundation for Manufacturing AI & Digital Twin — Real-time item, WIP, and asset location data enables digital twin modeling, AI-driven scheduling, and predictive quality

CARRIERS / T&L
  CAR-01: Trailer Utilization & Yard Visibility — 10–20% trailer utilization improvement — eliminate manual yard checks and convert idle assets into revenue capacity
  TL-01: Detention & Dwell Cost Reduction — Carriers experience detention on 20–35% of loads — RFID dock visibility cuts excess dwell 30–50%
  CAR-02: OS&D Claim Reduction — Load Verification Accuracy — Manual load verification yields 0.3–0.8% OS&D rate — RFID reduces to under 0.05% before shipment departs
  CAR-03: Hub Sortation Labor — Barcode to RFID Throughput — RFID read-while-moving eliminates manual divert lanes — hub labor efficiency improves 20–35%
  CAR-04: Misroute Reduction — Package Recovery Cost Avoidance — Misroute rate 0.5–1.5% at $8–25 per incident — RFID real-time location enables recovery before departure
  CAR-05: Trailer Search Time & Yard Labor Elimination — Without RFID, yard jockeys spend 15–30% of shift time locating trailers — RFID reduces search time 80–90%
  CAR-06: Last-Mile Visibility — WISMO Contact Deflection — RFID real-time last-mile location reduces WISMO contacts 15–30% — at $3–8 per deflected contact
  CAR-07: Regulated Mail & High-Value Parcel Compliance — RFID reduces compliance documentation labor 40–60% for regulated mail and responds to regulatory inquiries in minutes vs. days
  CAR-08: RFID Data Foundation for Carrier AI & Network Optimization — Real-time package location enables AI-driven sortation sequencing, predictive misroute detection, and dynamic route optimization
  TL-02: Routing Guide Compliance — Shipper-Side Visibility — RFID improves routing guide compliance 10–20% and reduces carrier chargebacks 20–40% through better load tendering
  TL-03: RFID Data Foundation for Logistics AI & Network Optimization — Real-time trailer and shipment location data enables predictive ETAs, AI-driven load matching, and dynamic lane pricing

GOVERNMENT
  GOV-01: Audit Readiness — Property NFR & CAP Reduction — 7 consecutive audit disclaimers. RFID closes the asset existence-and-completeness gap — NDAA 2028 mandate.
  GOV-02: Annual Physical Inventory Labor Reduction — Federal agencies must certify annual physical inventories by Sep 30 — RFID reduces count time 75–85% vs. manual
  GOV-03: Ghost Asset Elimination — Procurement Avoidance — Ghost assets and unrecorded inventory cause agencies to procure items they already own — RFID closes the gap
  GOV-04: Property Accountability Staff Overhead Reduction — PBOs and ECOs spend significant time on manual reconciliation and APSR data entry — RFID automates location capture
  GOV-05: Sensitive Item Loss Prevention — Loss of controlled items triggers FLIPL and security investigations — RFID provides continuous custody chain
  GOV-06: Excess & Redundant Procurement Reduction — Without asset visibility, agencies procure items already in inventory — DoD GAO-05-277 documented $400M+ in duplicate procurement

AVIATION
  AVN-01: Baggage Mishandling Reduction — Claims & Re-delivery — IATA: 4.35 mishandled bags per 1K passengers — RFID 99%+ read rate reduces mishandling 20–25%
  AVN-02: MRO Tool Control — Search Time & FOD Risk Reduction — Missing tools halt maintenance and create FOD risk — Airbus reports 90% reduction in missing tool incidents
  AVN-03: MRO Turnaround Time — Aircraft Utilization Improvement — RFID part and tool visibility reduces MRO turnaround 10–15% — each hour of AOG reduction has direct revenue impact
  AVN-04: Component Traceability — Compliance Labor & Grounding Risk — FAA/EASA require full lifecycle traceability — manual documentation is 40–60% of maintenance admin labor
  AVN-05: Safety Equipment Inspection Labor Reduction — Manual safety equipment checks take 4–8 hrs per aircraft — RFID reduces to under 30 min
  AVN-06: Boarding Time Reduction — Passenger Throughput — Airport RFID pilots show 20% boarding time reduction — fewer missed connections, reduced voucher spend

HOSPITALITY
  HOS-01: Linen Lifecycle — Loss Reduction & Laundry Efficiency — Hotels lose 10–25% of linen annually — RFID tracking reduces linen loss 15–20% and over-processing 10–15%
  HOS-02: F&B Inventory — Counting Labor & Shrink Control — F&B shrink 4–8% in high-value categories — RFID reduces counting labor 40–70% and shrink 15–25%
  HOS-03: Guest Experience & Cashless Revenue — RFID Wristbands — RFID/NFC wristbands increase per-capita ancillary spend 10–20% and improve entry throughput 20–30%
  HOS-04: Event & Venue Asset Management — Loss & Overtime — AV and event assets experience 20–35% annual loss — RFID kit tracking cuts loss 25–35% and setup overtime 20–30%
  HOS-05: Security & Access Control — Unauthorized Entry Reduction — 2–5% unauthorized entry rates — RFID anti-passback reduces violations 20–30% and improves security labor efficiency
  HOS-06: Hospitality AI & Guest Personalization Data Foundation — Real-time linen, F&B, and guest journey data enables predictive demand, personalized offers, and automated inventory management

DATA CENTER
  DC-01: Physical Audit Acceleration — CMDB Accuracy — Manual data center audits: 2–5 days per 1,000 assets at 85–95% match — RFID cuts audit time 75–85%
  DC-02: Stranded Asset Recovery — Capital Deferral — 5–15% of data center assets are stranded — RFID sweeps identify orphaned assets for redeployment before new procurement
  DC-03: Stranded Asset Recovery — Capital Deferral & Capacity — 5–15% of data center assets are stranded — RFID sweeps identify orphaned assets for redeployment before new procurement
  DC-04: Compliance Audit Burden — SOC2, PCI, ISO 27001 — Audit evidence prep takes 40–120 hrs per cycle — RFID digital chain-of-custody cuts prep labor 30–60%
  DC-05: Asset Loss & Data Security Risk Reduction — Missing storage devices are the #2 source of physical data breach — RFID chain-of-custody reduces loss 20–40%
  DC-06: Incident Response — Asset Locate Time & MTTR Reduction — Locating hardware during incidents extends MTTR — RFID last-seen zone data reduces locate time 20–40%
  DC-07: RFID Data Foundation for DCIM & Capacity Planning — Real-time asset location and utilization data enables accurate capacity heatmaps, automated CMDB sync, and procurement deferral analytics

ENERGY / INDUSTRIAL
  IE-01: Tool, Vehicle & Equipment Tracking — Search & Loss — Energy/construction projects lose 20–30% of tool value annually — RFID cuts loss 30–50% and search time 65–80%
  IE-02: PPE Compliance & Safety Audit Automation — OSHA PPE violations average $5K–$15K per citation — RFID automated zone access validation reduces fines 20–50%
  IE-03: MRO Spare Parts — Carrying Cost & NPT Reduction — Critical spare stockouts cause NPT at $50K–$500K/hr offshore — RFID reduces excess inventory and emergency buys
  IE-04: Oil & Gas Field Materials Management — Shrink & NPT — Field material shrink 8–15% of value — RFID reduces material loss 10–12% and NPT from unavailability 5–12%
  IE-05: Asset Integrity Inspection — Documentation & Compliance — Inspection programs spend 30–50% of budget on documentation — RFID reduces documentation labor 35–45% and compliance exceptions 25–35%
  IE-06: Rental & High-Value Equipment — Billing Dispute Reduction — Subsea and rental asset billing disputes reduced ~80% with RFID custody transfer records — rental overages down 10–25%
  IE-07: RFID Data Foundation for Energy & Construction AI — Real-time asset, material, and compliance data enables predictive failure analytics, automated inspection reporting, and AI-driven procurement optimization

FOOD SERVICE
  FS-01: Food Waste Reduction — FEFO Management — Food service operators lose 4–10% of food purchased to pre-consumer waste — RFID FEFO reduces this 20–30%
  FS-02: Food Recall Traceability — Scope & Response Time — Average food recall costs $10–30M — RFID lot-level traceability reduces scope 60–85% and response time 80–90%
  FS-03: Cold Chain Compliance — Spoilage & HACCP Documentation — Manual temp logs: 60–75% HACCP compliance — RFID automated logging reaches 99%+ with real-time excursion alerts
  FS-04: Food Recall Traceability — Scope & Response Time — Average food recall costs $10–30M — RFID lot traceability reduces scope 60–85% and response time 80–90%. FSMA 204 deadline: Jan 2026.
  FS-05: High-Value Inventory Shrink — Proteins, Alcohol, Premiums — Food service shrink 4–8% in high-value categories — RFID chain-of-custody in high-risk zones reduces shrink 15–25%
  FS-06: Demand Planning & Forecast Accuracy — Prep Waste Reduction — RFID consumption signals improve forecast accuracy 10–15%, reducing over-prep waste and stockout events
  FS-07: Order Accuracy & Customer Refund Reduction — QSR RFID order validation reduces refund and credit events 15–30% through kit completeness checks at the pass
  FS-08: ESG & Sustainability Reporting Automation — RFID-automated waste, donation, and cold chain logs reduce ESG audit labor 20–40% and create verifiable sustainability data

════════════════════════════════════════════════════════════════════
EVIDENCE BACKING SELECTED SCENARIOS
════════════════════════════════════════════════════════════════════
${evidenceBlock || '— No evidence records attached —'}

════════════════════════════════════════════════════════════════════
MODELING METHODOLOGY
════════════════════════════════════════════════════════════════════
${methodNote}

════════════════════════════════════════════════════════════════════
COST STRUCTURE
════════════════════════════════════════════════════════════════════
${costLines || '— No cost detail entered —'}

════════════════════════════════════════════════════════════════════
NOW — begin with step 1: read back and ask the open question.
Keep it conversational. One paragraph, then the question.
`;
    // Copy to clipboard
    navigator.clipboard.writeText(prompt).then(() => {
      if(btn){ btn.textContent = '✅ Copied!'; btn.disabled = false; }
      setTimeout(() => { if(btn) btn.textContent = '🤖 Copy AI Prompt'; }, 2500);
    }).catch(() => {
      // Fallback: open in new window for manual copy
      const win = window.open('','_blank');
      if(win){
        win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>AI Prompt — ${co}</title>
          <style>body{font-family:monospace;font-size:13px;padding:24px;white-space:pre-wrap;background:#f8f8f8;color:#1a1a1a}
          button{position:fixed;top:12px;right:12px;padding:8px 16px;background:#A8F931;border:none;border-radius:4px;cursor:pointer;font-weight:700}






</style></head><body><button onclick="document.execCommand('selectAll');document.execCommand('copy');this.textContent='Copied!'">Copy All</button>${prompt.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</body></html>`);
        win.document.close();
      }
      if(btn){ btn.textContent = '🤖 Copy AI Prompt'; btn.disabled = false; }
    });

  } catch(e) {
    console.error('LLM prompt export error:', e);
    alert('Export error: ' + e.message);
    if(btn){ btn.textContent = '🤖 Copy AI Prompt'; btn.disabled = false; }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderLeverGrid();
  selCount(); // fire on load so warning shows if defaults exceed 6
  // Init cost state from slider defaults (sliders have value= attrs so this works)
  costRows = defaultCostRows();
  rebuildCostState();
  syncNav();
});
</script>
</body>
</html>
