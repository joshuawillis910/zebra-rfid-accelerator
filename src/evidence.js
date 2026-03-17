const EVIDENCE = [
  {id:"EV-RET-LABOR-01",tier:"Tier 3",title:"Retail Labor Productivity with RFID Cycle Counting",publisher:"GS1 US Retail Team",year:2023,claim:"RFID cycle counting reduces labor per count cycle by 75–90% vs. barcode. Manual: 2–5 min/item; RFID: 10–15 sec/item."},
  {id:"EV-RET-ACC-01",tier:"Tier 1",title:"RFID: The Right Time for Retail",publisher:"Auburn University RFID Lab",year:2022,claim:"Retailers using RFID achieve 93–99% inventory accuracy vs. 65–75% without. Consistent across 50+ deployments."},
  {id:"EV-RET-SHRINK-01",tier:"Tier 2",title:"National Retail Security Survey",publisher:"National Retail Federation",year:2023,claim:"Average retail shrink 1.4–1.6% of sales. RFID-enabled item visibility reduces shrink 20–40%."},
  {id:"EV-RET-OSA-01",tier:"Tier 2",title:"On-Shelf Availability Impact of RFID",publisher:"ECR Community / GS1",year:2021,claim:"Out-of-stocks cost 4–8% of sales globally. RFID reduces OOS events 50–80% via automated replenishment alerts."},
  {id:"EV-RET-MARKDOWN-01",tier:"Tier 2",title:"RFID and Markdown Reduction in Apparel",publisher:"Accenture Retail Practice",year:2022,claim:"RFID reduces markdowns 10–20% in apparel by improving size/color replenishment. Study across 8 retailers."},
  {id:"EV-RET-RECV-01",tier:"Tier 3",title:"Receiving Accuracy Improvement with RFID",publisher:"GS1 US",year:2022,claim:"RFID receiving verification: accuracy from 85–92% to 99%+. Receiving labor reduced 40–60%."},
  {id:"EV-WH-LABOR-01",tier:"Tier 2",title:"RFID Labor Productivity in DC Operations",publisher:"Zebra Technologies / VDC Research",year:2023,claim:"RFID reduces DC cycle-count labor 75–85%. Pick verification improves accuracy by 20–35%."},
  {id:"EV-WH-RECV-01",tier:"Tier 3",title:"Receiving Throughput with RFID",publisher:"GS1 US Warehousing Team",year:2022,claim:"RFID receiving: inbound throughput +30–50%, dock-to-stock time -40–60%."},
  {id:"EV-WH-PICK-01",tier:"Tier 3",title:"Pick Accuracy and Returns Reduction with RFID",publisher:"Zebra Technologies / Motorola DC Research",year:2022,claim:"Manual pick 0.5–1% error rate. RFID verification: 99.9%+ accuracy. Cost per error: $20–80."},
  {id:"EV-HC-ASSET-01",tier:"Tier 2",title:"RFID Asset Tracking in Hospital Operations",publisher:"GE Healthcare / ECRI Institute",year:2022,claim:"15–25% rental reduction; 40–70% nursing search time reduction; 15–20% utilization improvement."},
  {id:"EV-HC-SURG-01",tier:"Tier 1",title:"RFID for Surgical Instrument Tracking",publisher:"Auburn University RFID Lab / AORN",year:2022,claim:"25–35% lost/late instrument reduction. Tray readiness improved 40–60%. Study: 12 hospital perioperative departments."},
  {id:"EV-FED-AUDIT-01",tier:"Tier 1",title:"DoD Financial Audit — GAO Report",publisher:"GAO-25-107427 + CRS IF12627",year:2025,claim:"DoD: 7th consecutive audit disclaimer. 28 material weaknesses. Asset accountability primary driver. NDAA 2028 clean-audit mandate."},
  {id:"EV-MTL-TOOL-01",tier:"Tier 2",title:"Tool Tracking and Loss Reduction in Manufacturing",publisher:"Aberdeen Group / Invengo",year:2022,claim:"Plants lose 15–20% of tool value annually. RFID tracking cuts loss 60–80%. Typical ROI: 6–12 months."},
  {id:"EV-TL-ASSET-01",tier:"Tier 2",title:"Trailer Utilization with RFID Yard Management",publisher:"American Trucking Associations / Fleet Advantage",year:2023,claim:"RFID yard management improves trailer utilization 10–20%, reduces search time 80–90%."},
  {id:"EV-TL-DWELL-01",tier:"Tier 2",title:"Detention and Dwell Reduction with RFID",publisher:"Gartner Supply Chain Research / DAT",year:2022,claim:"Carriers experience detention on 20–35% of loads at $50–85/hr. RFID dock visibility reduces excess dwell 30–50%."},
];


// ── VERTICAL MAP ──
const VMAP = {
  retail:        {facility:["Store / Branch"], themes:["Labor & Human Capacity","Operational Efficiency","Revenue / Margin","Direct Cost & Spend"]},
  warehouse:     {facility:["Warehouse / DC"], themes:["Labor & Human Capacity","Operational Efficiency","Direct Cost & Spend"]},
  manufacturing: {facility:["Plant / Factory","Depot / MRO","Warehouse / DC"], themes:["Direct Cost & Spend","Labor & Human Capacity","Operational Efficiency","Working Capital","Regulatory & Compliance"]},
  healthcare:    {facility:["Hospital / Clinic"], themes:["Direct Cost & Spend","Labor & Human Capacity","Regulatory & Compliance","Working Capital"]},
  government:    {facility:["Government Facility","Depot / MRO"], themes:["Regulatory & Compliance","Labor & Human Capacity","Direct Cost & Spend"]},
  carriers:      {facility:["Terminal / Port","Warehouse / DC"], themes:["Operational Efficiency","Direct Cost & Spend","Labor & Human Capacity"]},
  aviation:      {facility:["Terminal / Port","Depot / MRO"], themes:["Direct Cost & Spend","Labor & Human Capacity","Regulatory & Compliance","Revenue / Margin"]},
  hospitality:   {facility:["Store / Branch"], themes:["Direct Cost & Spend","Labor & Human Capacity","Operational Efficiency"]},
  datacenter:    {facility:["Warehouse / DC"], themes:["Operational Efficiency","Labor & Human Capacity","Direct Cost & Spend"]},
  energy:        {facility:["Plant / Factory","Depot / MRO"], themes:["Direct Cost & Spend","Regulatory & Compliance","Working Capital"]},
  foodservice:   {facility:["Warehouse / DC","Store / Branch"], themes:["Direct Cost & Spend","Regulatory & Compliance","Operational Efficiency"]},
};

// ── FILTER STATE ──
const F = {
  facility: new Set(["Store / Branch"]),
  themes: new Set(["Labor & Human Capacity","Operational Efficiency","Revenue / Margin","Direct Cost & Spend"]),
};

let verticalKey = "retail";

// ── COST ROWS STATE ──
let costRows = [];
// ── Vertical-aware slider defaults ────────────────────────────────────────
const VERTICAL_SLIDER_DEFAULTS = {
  retail:        { sites:50,  items:15000, replen:0.40, saas:4800,  tag:0.08, readers:4 },
  warehouse:     { sites:5,   items:50000, replen:0.25, saas:6000,  tag:0.07, readers:8 },
  manufacturing: { sites:3,   items:8000,  replen:0.20, saas:5500,  tag:0.09, readers:6 },
  healthcare:    { sites:10,  items:5000,  replen:0.30, saas:5000,  tag:0.12, readers:4 },
  government:    { sites:8,   items:10000, replen:0.20, saas:4000,  tag:0.10, readers:5 },
  carriers:      { sites:20,  items:20000, replen:0.35, saas:5500,  tag:0.08, readers:6 },
  aviation:      { sites:4,   items:12000, replen:0.25, saas:7000,  tag:0.15, readers:5 },
  hospitality:   { sites:15,  items:3000,  replen:0.30, saas:3600,  tag:0.10, readers:3 },
  datacenter:    { sites:6,   items:8000,  replen:0.20, saas:6000,  tag:0.20, readers:4 },
  energy:        { sites:5,   items:6000,  replen:0.15, saas:5000,  tag:0.15, readers:5 },
  foodservice:   { sites:30,  items:4000,  replen:0.50, saas:3000,  tag:0.06, readers:3 },
};

function setSliderDefaults(verticalKey) {
  // Pick first active vertical's defaults, fallback to retail
  const v = verticalKey || [...activeIndustries][0] || 'retail';
  const d = VERTICAL_SLIDER_DEFAULTS[v] || VERTICAL_SLIDER_DEFAULTS.retail;
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
  set('sl-sites',   d.sites);
  set('sl-items',   d.items);
  set('sl-replen',  d.replen);
  set('sl-saas',    d.saas);
  set('sl-tag',     d.tag);
  set('sl-readers', d.readers);
}

function defaultCostRows() {
  const s = +sliderVal('sl-sites'), items = +sliderVal('sl-items');
  const replen = +sliderVal('sl-replen'), saas = +sliderVal('sl-saas');
  const tagUnit = +sliderVal('sl-tag'), readers = +sliderVal('sl-readers');
  const rdrUnit = 1200, mountUnit = 650, psUnit = 8500, trainUnit = 1200;
  return [
    {label:"Fixed readers / handheld units",   qty:s*readers,                          unitCost:rdrUnit,    yr0:s*readers*rdrUnit,             yr1:0,                              yr2:0,                              cadence:"one-time"},
    {label:"Mounting / installation fixtures",  qty:s,                                 unitCost:mountUnit,  yr0:s*mountUnit,                   yr1:0,                              yr2:0,                              cadence:"one-time"},
    {label:"Initial tag deployment",            qty:s*items,                           unitCost:tagUnit,    yr0:s*items*tagUnit,               yr1:0,                              yr2:0,                              cadence:"one-time"},
    {label:"Annual tag replenishment",          qty:Math.round(s*items*replen),        unitCost:tagUnit,    yr0:0,                             yr1:Math.round(s*items*replen*tagUnit), yr2:Math.round(s*items*replen*tagUnit), cadence:"annual"},
    {label:"SaaS / platform license",           qty:s,                                 unitCost:saas,       yr0:0,                             yr1:s*saas,                         yr2:s*saas,                         cadence:"annual"},
    {label:"Professional services / impl.",     qty:s,                                 unitCost:psUnit,     yr0:s*psUnit,                      yr1:0,                              yr2:0,                              cadence:"one-time"},
    {label:"Training & enablement",             qty:s,                                 unitCost:trainUnit,  yr0:s*trainUnit,                   yr1:0,                              yr2:0,                              cadence:"one-time"},
    {label:"Internal FTE time (project)",       qty:480,                               unitCost:55,         yr0:480*55,                        yr1:0,                              yr2:0,                              cadence:"one-time"},
    {label:"Contingency (7%)",                  qty:"",                                unitCost:"",         yr0:0,                             yr1:0,                              yr2:0,                              cadence:"one-time", contingency:true},
  ];
}
