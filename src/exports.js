function exportFullPDF() {
  ensureCosts();
  if(!state.benefits || !state.benefits.totAnnual) renderROI();

  const co       = document.getElementById('i-customer')?.value  || 'Your Customer';
  const vendor   = document.getElementById('i-company')?.value   || 'Zebra Technologies';
  const titleS   = document.getElementById('i-title')?.value     || 'RFID Strategic Value Analysis';
  const seller   = document.getElementById('i-seller')?.value    || '';
  const partners = document.getElementById('i-partners')?.value  || 'Zebra Technologies';
  const pain     = document.getElementById('i-pain')?.value     || '';
  const dateStr  = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});

  const b  = state.benefits;
  const c  = state.costs;
  const active = SCENARIOS.filter(s=>state.selectedIds.has(s.id));
  const evidence = EVIDENCE.filter(ev => active.some(sc => (sc.evidenceIds||[]).includes(ev.id)));

  const totAnnual = b.totAnnual||0, totY1=b.totY1||0, totY2=b.totY2||0, totY3=b.totY3||0;
  const yr0=c.yr0||0, yr1=c.yr1||0, yr2=c.yr2||0;
  const moAvg = totAnnual/12;
  const paybackMo = moAvg>0 && yr0>0 ? yr0/moAvg : null;
  const ben3yr = totY1+totY2+totY3;
  const investTot = yr0+yr1+yr2*2;
  const roi3 = investTot>0 ? Math.round(((ben3yr-investTot)/investTot)*100) : 0;
  const invRatio = yr0>0 ? (ben3yr/yr0).toFixed(2) : '—';
  const yr0net=-(yr0), yr1net=totY1-yr1, yr2net=totY2-yr2, yr3net=totY3-yr2;
  const npv5 = Math.round((yr1net/1.1)+(yr2net/1.21)+(yr3net/1.331)+(yr3net/1.464)+(yr3net/1.611));
  const irrVal = estimateIRR([yr0net,yr1net,yr2net,yr3net,yr3net]);

  // Monthly DCF table (60 months, 5 years)
  const discRateMo = Math.pow(1.10,1/12)-1;
  const moBen = mo => { const yr=Math.ceil(mo/12)||0; return yr<=0?0: ({1:totY1,2:totY2}[yr]||totY3)/12; };
  const moCost= mo => mo<=12 ? yr1/12 : yr2/12;
  let dcfRows=[]; // [month, y1, y2, y3, y4, y5] discounted
  let cumNPV=-yr0, cumCash=-yr0;
  const cfPts=[{mo:0,npv:-yr0,cash:-yr0}];
  const yrBuckets={1:[],2:[],3:[],4:[],5:[]};
  for(let mo=1;mo<=60;mo++){
    const disc=1/Math.pow(1+discRateMo,mo);
    const dcf=(moBen(mo)-moCost(mo))*disc;
    cumNPV+=dcf; cumCash+=(moBen(mo)-moCost(mo));
    cfPts.push({mo,npv:cumNPV,cash:cumCash});
    const yr=Math.ceil(mo/12);
    if(yr>=1&&yr<=5) yrBuckets[yr].push(dcf);
    dcfRows.push({mo,yr,dcf,cumNPV,cumCash});
  }

  // Cost rows split
  const costRowsAll = costRows||[];
  const oneTime  = costRowsAll.filter(r=>!r.contingency && r.cadence&&r.cadence.includes('one'));
  const recurring= costRowsAll.filter(r=>!r.contingency && r.cadence&&!r.cadence.includes('one'));
  const contingency = costRowsAll.find(r=>r.contingency);

  // Grouped scenarios
  const groups = {};
  active.forEach(sc=>{ const g=sc.theme||sc.verticalKey||'General'; (groups[g]=groups[g]||[]).push(sc); });

  // ── Helpers ─────────────────────────────────────────────────────────────
  const F = v => {
    if(v===null||v===undefined) return '—';
    const n=parseFloat(v); if(isNaN(n)) return String(v);
    const a=Math.abs(n),s=n<0?'-':'';
    if(a>=1e6) return s+'$'+(a/1e6).toFixed(2)+'M';
    if(a>=1e3) return s+'$'+Math.round(a).toLocaleString();
    return s+'$'+Math.round(a);
  };
  const pct = v => Math.round(v*100)+'%';
  const pb  = paybackMo ? paybackMo.toFixed(1)+' months' : '—';

  // ── SVG Charts ───────────────────────────────────────────────────────────
  function makePaybackSVG(pts, pbMo) {
    const W=680,H=220,PL=80,PR=20,PT=20,PB=44,iW=W-PL-PR,iH=H-PT-PB;
    const vals=pts.map(p=>p.cash); const mn=Math.min(...vals), mx=Math.max(...vals);
    const range=mx-mn||1; const maxMo=60;
    const toX=mo=>PL+(mo/maxMo)*iW, toY=v=>PT+iH*(1-(v-mn)/range);
    const zY=toY(0);
    const fmtAx=v=>{const a=Math.abs(v);return (v<0?'-':'')+(a>=1e6?'$'+(a/1e6).toFixed(1)+'M':a>=1e3?'$'+(a/1e3).toFixed(0)+'K':'$0');};
    const ticks=[mn,mn/2,0,mx/2,mx].filter((v,i,a)=>a.findIndex(x=>Math.abs(x-v)<range*.04)===i);
    const polyPts=pts.map(p=>toX(p.mo)+','+toY(p.cash)).join(' ');
    let pbLine='';
    if(pbMo&&pbMo<=60){const px=toX(pbMo);pbLine=`<line x1="${px}" y1="${PT}" x2="${px}" y2="${PT+iH}" stroke="#A8F931" stroke-width="2" stroke-dasharray="5,3"/>
      <rect x="${px+4}" y="${PT+2}" width="100" height="18" rx="3" fill="#000"/>
      <text x="${px+54}" y="${PT+14}" text-anchor="middle" font-family="Courier New" font-size="10" fill="#A8F931" font-weight="700">PAYBACK ${Math.round(pbMo)} MO</text>`;}
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">
      ${ticks.map(v=>`<line x1="${PL}" y1="${toY(v)}" x2="${PL+iW}" y2="${toY(v)}" stroke="${v===0?'#303030':'#E6E6E6'}" stroke-width="${v===0?1.5:.5}" stroke-dasharray="${v===0?'none':'4,3'}"/>
        <text x="${PL-6}" y="${toY(v)+4}" text-anchor="end" font-family="Courier New" font-size="10" fill="#757575">${fmtAx(v)}</text>`).join('')}
      ${pbLine}
      <polyline points="${polyPts}" fill="none" stroke="#1565C0" stroke-width="2.5" stroke-linejoin="round"/>
      ${pts.filter(p=>p.mo%12===0).map(p=>`<circle cx="${toX(p.mo)}" cy="${toY(p.cash)}" r="4" fill="${p.cash>=0?'#A8F931':'#EB5757'}" stroke="#000" stroke-width="1.5"/>`).join('')}
      <line x1="${PL}" y1="${PT+iH}" x2="${PL+iW}" y2="${PT+iH}" stroke="#BDBDBD" stroke-width="1"/>
      ${[0,12,24,36,48,60].map(mo=>`<text x="${toX(mo)}" y="${PT+iH+16}" text-anchor="middle" font-family="Courier New" font-size="10" fill="#757575">${mo}</text>`).join('')}
      <text x="${PL+iW/2}" y="${H-2}" text-anchor="middle" font-family="Courier New" font-size="10" fill="#999">Months</text>
      <line x1="${PL}" y1="${PT-4}" x2="${PL+24}" y2="${PT-4}" stroke="#1565C0" stroke-width="2.5"/>
      <text x="${PL+28}" y="${PT}" font-family="Courier New" font-size="10" fill="#303030">Cumulative Cash Position</text>
    </svg>`;
  }

  function makeRampSVG(pts) {
    const W=680,H=220,PL=80,PR=20,PT=20,PB=44,iW=W-PL-PR,iH=H-PT-PB;
    const vals=pts.map(p=>p.npv); const mn=Math.min(...vals), mx=Math.max(...vals);
    const range=mx-mn||1; const maxMo=60;
    const toX=mo=>PL+(mo/maxMo)*iW, toY=v=>PT+iH*(1-(v-mn)/range);
    const fmtAx=v=>{const a=Math.abs(v);return (v<0?'-':'')+(a>=1e6?'$'+(a/1e6).toFixed(1)+'M':a>=1e3?'$'+(a/1e3).toFixed(0)+'K':'$0');};
    const ticks=[mn,0,mx/2,mx].filter((v,i,a)=>a.findIndex(x=>Math.abs(x-v)<range*.04)===i);
    const polyPts=pts.map(p=>toX(p.mo)+','+toY(p.npv)).join(' ');
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">
      ${ticks.map(v=>`<line x1="${PL}" y1="${toY(v)}" x2="${PL+iW}" y2="${toY(v)}" stroke="${v===0?'#303030':'#E6E6E6'}" stroke-width="${v===0?1.5:.5}" stroke-dasharray="${v===0?'none':'4,3'}"/>
        <text x="${PL-6}" y="${toY(v)+4}" text-anchor="end" font-family="Courier New" font-size="10" fill="#757575">${fmtAx(v)}</text>`).join('')}
      <polyline points="${polyPts}" fill="none" stroke="#1565C0" stroke-width="2.5" stroke-linejoin="round"/>
      ${pts.filter(p=>p.mo%12===0).map(p=>`<circle cx="${toX(p.mo)}" cy="${toY(p.npv)}" r="4" fill="${p.npv>=0?'#A8F931':'#EB5757'}" stroke="#000" stroke-width="1.5"/>`).join('')}
      <line x1="${PL}" y1="${PT+iH}" x2="${PL+iW}" y2="${PT+iH}" stroke="#BDBDBD" stroke-width="1"/>
      ${[0,12,24,36,48,60].map(mo=>`<text x="${toX(mo)}" y="${PT+iH+16}" text-anchor="middle" font-family="Courier New" font-size="10" fill="#757575">${mo}</text>`).join('')}
      <text x="${PL+iW/2}" y="${H-2}" text-anchor="middle" font-family="Courier New" font-size="10" fill="#999">Months</text>
      <line x1="${PL}" y1="${PT-4}" x2="${PL+24}" y2="${PT-4}" stroke="#1565C0" stroke-width="2.5"/>
      <text x="${PL+28}" y="${PT}" font-family="Courier New" font-size="10" fill="#303030">Cumulative NPV</text>
    </svg>`;
  }

  function makeBarSVG(items) { // items: [{name,value}]
    if(!items.length) return '';
    const W=640, LPAD=8, NAME_W=240, VAL_W=80;
    const BAR_X=NAME_W+LPAD, BAR_W=W-BAR_X-VAL_W-LPAD;
    const ROW_H=24, GAP=4, AX_H=22;
    const mx=Math.max(...items.map(r=>r.value),1);
    const niceMax=v=>{const m=Math.pow(10,Math.floor(Math.log10(v)));const n=v/m;return (n<=1?1:n<=2?2:n<=5?5:10)*m;};
    const ax=niceMax(mx);
    const totalH=AX_H+items.length*(ROW_H+GAP)+8;
    const fmtAx=v=>v>=1e6?'$'+(v/1e6).toFixed(1)+'M':v>=1e3?'$'+(v/1e3).toFixed(0)+'K':'$0';
    let rows='';
    [0,.25,.5,.75,1].forEach(f=>{
      const tx=BAR_X+f*BAR_W;
      rows+=`<text x="${tx}" y="${AX_H-4}" text-anchor="middle" font-family="Courier New" font-size="9" fill="#999">${fmtAx(ax*f)}</text>
        <line x1="${tx}" y1="${AX_H}" x2="${tx}" y2="${totalH-4}" stroke="#E6E6E6" stroke-width=".5"/>`;
    });
    items.forEach((r,i)=>{
      const y=AX_H+i*(ROW_H+GAP);
      const bw=Math.max(2,(r.value/ax)*BAR_W);
      const nm=r.name.length>36?r.name.slice(0,34)+'…':r.name;
      rows+=`<text x="${NAME_W-4}" y="${y+ROW_H*.65}" text-anchor="end" font-family="Arial,sans-serif" font-size="11" fill="#303030">${nm}</text>
        <rect x="${BAR_X}" y="${y+4}" width="${BAR_W}" height="${ROW_H-8}" fill="#F2F2F2" rx="2"/>
        <rect x="${BAR_X}" y="${y+4}" width="${bw}" height="${ROW_H-8}" fill="#A8F931" rx="2"/>
        <text x="${BAR_X+bw+6}" y="${y+ROW_H*.65}" font-family="Courier New" font-size="11" font-weight="700" fill="#303030">${F(r.value)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${totalH}" width="100%" style="display:block">${rows}</svg>`;
  }

  // ── DCF Table rows (12 rows, 5 cols) ────────────────────────────────────
  const dcfTableRows = Array.from({length:12},(_,i)=>{
    const mo=i+1;
    return [mo,...[1,2,3,4,5].map(yr=>{ const bk=yrBuckets[yr]||[]; return bk[i]!=null?Math.round(bk[i]).toLocaleString():''; })];
  });

  // ── Build HTML document ──────────────────────────────────────────────────
  const CSS = `
    /* ZebraSans/ZebraMono loaded by parent page — PDF uses Arial/Courier fallback for print */
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:10pt;color:#303030;background:#fff;line-height:1.5}
    @page{size:letter portrait;margin:.6in .65in .6in .65in}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}

    /* ── Page breaks ── */
    .pb{page-break-after:always}
    .avoid{page-break-inside:avoid}

    /* ── Header / footer (via running header hack) ── */
    .doc-header{position:fixed;top:0;left:0;right:0;height:.5in;display:flex;align-items:center;
      justify-content:space-between;padding:0 .65in;border-bottom:1px solid #E6E6E6;background:#fff}
    .doc-header .brand{font-weight:700;font-size:11pt;letter-spacing:1px}
    .doc-header .doc-title{font-size:8pt;color:#757575;font-family:'Courier New',monospace}
    .doc-footer{position:fixed;bottom:0;left:0;right:0;height:.35in;display:flex;align-items:center;
      justify-content:space-between;padding:0 .65in;border-top:1px solid #E6E6E6;background:#fff;font-size:8pt;color:#999}
    .page-content{margin-top:.6in;margin-bottom:.45in}

    /* ── Cover ── */
    .cover{display:flex;flex-direction:column;justify-content:flex-end;min-height:8in;padding-bottom:.5in}
    .cover-tag{font-family:'Courier New',monospace;font-size:8pt;color:#757575;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
    .cover-title{font-size:32pt;font-weight:700;line-height:1.15;color:#000;margin-bottom:8px}
    .cover-sub{font-size:12pt;color:#757575;margin-bottom:28px}
    .cover-meta{font-size:9.5pt;color:#999;line-height:1.8}
    .cover-stripe{height:4px;background:#A8F931;width:80px;margin-bottom:20px}

    /* ── Section headings ── */
    h1{font-size:22pt;font-weight:400;color:#000;margin:0 0 4px;line-height:1.2}
    h2{font-size:13pt;font-weight:600;color:#303030;margin:16px 0 6px}
    h3{font-size:10.5pt;font-weight:700;color:#000;margin:14px 0 4px}
    .rule{border:none;border-top:1px solid #E6E6E6;margin:6px 0 14px}
    .rule-heavy{border:none;border-top:2px solid #000;margin:6px 0 14px}

    /* ── Summary tiles ── */
    .tiles{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #E6E6E6;margin:12px 0}
    .tile{padding:14px 16px;border-right:1px solid #E6E6E6;border-bottom:1px solid #E6E6E6}
    .tile:nth-child(3n){border-right:none}
    .tile-val{font-size:20pt;font-weight:700;color:#000;line-height:1.1}
    .tile-lbl{font-size:8.5pt;color:#757575;margin-top:4px;line-height:1.3}

    /* ── Tables ── */
    table{width:100%;border-collapse:collapse;font-size:9pt;margin:8px 0}
    th{font-weight:700;color:#000;text-align:left;padding:6px 10px;border-bottom:2px solid #000}
    th.r,td.r{text-align:right}
    td{padding:5px 10px;border-bottom:.5px solid #E6E6E6;color:#303030}
    tr:nth-child(even) td{background:#F9F9F9}
    .total-row td{font-weight:700;color:#000;border-top:1.5px solid #000;border-bottom:1.5px solid #000;background:#fff!important}
    .group-row td{font-weight:700;background:#F2F2F2!important;font-size:8.5pt;text-transform:uppercase;letter-spacing:.5px;color:#757575}

    /* ── Misc ── */
    p{margin-bottom:8px;font-size:10pt;line-height:1.55}
    .label{font-size:8.5pt;color:#757575;font-family:'Courier New',monospace;letter-spacing:.5px;text-transform:uppercase;margin-bottom:4px}
    .chart-cap{font-size:8.5pt;color:#757575;margin-top:4px;font-family:'Courier New',monospace}
    .disclaimer{font-size:7.5pt;color:#999;line-height:1.5;margin-top:16px;border-top:1px solid #E6E6E6;padding-top:10px}
    .ev-block{margin-bottom:10px;padding:8px 10px;border-left:3px solid #E6E6E6}
    .section-intro{font-size:10pt;color:#303030;margin-bottom:12px;line-height:1.55}
    .no-print-hint{font-size:9pt;color:#757575;text-align:center;padding:10px;background:#F2F2F2;border-radius:4px;margin-bottom:16px}
    @media print{.no-print-hint{display:none}}

    /* ── Cover KPI strip ── */
    .cover{display:flex;flex-direction:column;justify-content:flex-start;padding-top:.6in;min-height:8in}
    .cover-hero{flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 0 .3in}
    .cover-kpi-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid rgba(255,255,255,.15);border-radius:4px;overflow:hidden;margin-top:28px}
    .ck{padding:16px 14px;text-align:center;border-right:1px solid rgba(0,0,0,.08)}
    .ck:last-child{border-right:none}
    .ck-val{font-size:22pt;font-weight:700;color:#000;line-height:1;margin-bottom:3px}
    .ck-lbl{font-size:7.5pt;text-transform:uppercase;letter-spacing:1px;color:#757575;font-family:'Courier New',monospace}
    .cover-scenarios{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px}
    .cover-sc-pill{font-size:7.5pt;background:#F2F2F2;border:1px solid #E0E0E0;border-radius:3px;padding:2px 8px;color:#565656;font-family:'Courier New',monospace}

    /* ── Scenario block with donut ── */
    .sc-block{border-left:3px solid #A8F931;padding:12px 12px 4px 14px;margin-bottom:20px;page-break-inside:avoid}
    .sc-grid{display:grid;grid-template-columns:1fr 200px;gap:20px;align-items:start}
    .sc-left{}
    .sc-right{text-align:center}
    .sc-donut-label{font-size:8pt;font-family:'Courier New',monospace;color:#757575;text-transform:uppercase;letter-spacing:.5px;margin-top:6px}
    .sc-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0}
    .sc-m{background:#F8F8F8;border:1px solid #EEEEEE;border-radius:3px;padding:7px;text-align:center}
    .sc-mv{font-size:13pt;font-weight:700;color:#000;line-height:1}
    .sc-ml{font-size:7pt;text-transform:uppercase;color:#999;font-family:'Courier New',monospace;letter-spacing:.5px;margin-top:2px}
    .sc-narrative{font-size:9pt;color:#454545;line-height:1.6;margin:8px 0;padding:8px 10px;background:#FAFAFA;border-left:2px solid #E0E0E0;font-style:italic}
    .sc-bottom{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px}
    .ev-pill{display:inline-block;background:#F2F2F2;border:1px solid #E0E0E0;border-radius:3px;padding:1px 6px;font-size:7.5pt;color:#565656;margin:0 3px 3px 0;font-family:'Courier New',monospace}
    .pl-tag{background:#F0FAE4;border:1px solid #D4EFA8;border-radius:3px;padding:6px 10px;margin-top:6px}
    .pl-tag-lbl{font-size:7.5pt;font-weight:700;text-transform:uppercase;color:#5A7A2A;font-family:'Courier New',monospace}
    .pl-tag-val{font-size:9pt;color:#303030;margin-top:2px}

    /* ── Section intro visual strip ── */
    .section-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0 20px;padding:14px;background:#F8F8F8;border-radius:4px}
    .ss-item{text-align:center}
    .ss-val{font-size:18pt;font-weight:700;color:#000}
    .ss-lbl{font-size:7.5pt;text-transform:uppercase;color:#757575;font-family:'Courier New',monospace;letter-spacing:.5px}
  `;

  // ── Scenario blocks for Benefits Evaluation ──────────────────────────────
  // ── Inline mini benefit ramp chart (SVG) per scenario ──────────────────
  // ── Inline donut chart — this scenario vs total ─────────────────────────
  function makeDonutSVG(scAnn, totalAnn, label) {
    var pct = totalAnn>0 ? Math.min(scAnn/totalAnn, 1) : 0;
    var pctLabel = Math.round(pct*100)+'%';
    var r=72, cx=100, cy=100, stroke=18;
    var circ = 2*Math.PI*r;
    var dash = pct*circ;
    var fmt = function(v){ return v>=1e6?'$'+(v/1e6).toFixed(1)+'M':v>=1e3?'$'+(v/1e3).toFixed(0)+'K':'$0'; };
    return '<svg viewBox="0 0 200 200" width="160" height="160" style="display:block;margin:0 auto">'
      +'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#F0F0F0" stroke-width="'+stroke+'"/>'
      +'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#A8F931" stroke-width="'+stroke+'"'
      +' stroke-dasharray="'+dash+' '+circ+'" stroke-dashoffset="'+(circ/4)+'" stroke-linecap="round"/>'
      +'<text x="'+cx+'" y="'+(cy-10)+'" text-anchor="middle" font-family="Arial" font-size="22" font-weight="700" fill="#1A1A1A">'+pctLabel+'</text>'
      +'<text x="'+cx+'" y="'+(cy+10)+'" text-anchor="middle" font-family="Courier New" font-size="9" fill="#757575">OF TOTAL</text>'
      +'<text x="'+cx+'" y="'+(cy+26)+'" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#1A1A1A">'+fmt(scAnn)+'</text>'
      +'</svg>';
  }

  // ── Horizontal bar chart — 5yr ramp values ───────────────────────────────
  function makeRampBarsSVG(bRow) {
    var vals = [bRow.y1||0, bRow.y2||0, bRow.y3||0, bRow.y3||0, bRow.y3||0];
    var mx = Math.max.apply(null, vals.concat([1]));
    var W=340, ROW=22, GAP=5, LPAD=36, RPAD=60;
    var iW = W-LPAD-RPAD;
    var fmt = function(v){ return v>=1e6?'$'+(v/1e6).toFixed(1)+'M':v>=1e3?'$'+(v/1e3).toFixed(0)+'K':'$0'; };
    var H = vals.length*(ROW+GAP)+8;
    var bars = vals.map(function(v,i){
      var bw = Math.max(2, (v/mx)*iW);
      var y = i*(ROW+GAP);
      return '<text x="'+LPAD+'" y="'+(y+ROW*.72)+'" text-anchor="end" font-family="Courier New" font-size="9" fill="#999">Yr'+(i+1)+'</text>'
        +'<rect x="'+(LPAD+2)+'" y="'+y+'" width="'+iW+'" height="'+ROW+'" fill="#F0F0F0" rx="2"/>'
        +'<rect x="'+(LPAD+2)+'" y="'+y+'" width="'+bw+'" height="'+ROW+'" fill="'+(i===0?'#A8F931':i===1?'#7CD420':'#5AB010')+'" rx="2"/>'
        +'<text x="'+(LPAD+2+bw+4)+'" y="'+(y+ROW*.72)+'" font-family="Courier New" font-size="9" font-weight="700" fill="#303030">'+fmt(v)+'</text>';
    }).join('');
    return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="display:block;max-width:340px">'+bars+'</svg>';
  }

  function makeScRampSVG(bRow) {
    const W=420, H=90, PL=52, PR=12, PT=12, PB=28, iW=W-PL-PR, iH=H-PT-PB;
    const vals=[0, bRow.y1||0, bRow.y2||0, bRow.y3||0, bRow.y3||0, bRow.y3||0];
    const mx = Math.max.apply(null, vals.concat([1]));
    const toX = function(i){ return PL + (i/5)*iW; };
    const toY = function(v){ return PT + iH*(1 - v/mx); };
    const fmt = function(v){ var a=Math.abs(v); return a>=1e6?'$'+(a/1e6).toFixed(1)+'M':a>=1e3?'$'+(a/1e3).toFixed(0)+'K':'$0'; };
    const pts = vals.map(function(v,i){ return toX(i)+','+toY(v); }).join(' ');
    const area = vals.map(function(v,i){ return toX(i)+','+toY(v); }).join(' ')
                 +' '+toX(5)+','+String(PT+iH)+' '+toX(0)+','+String(PT+iH);
    var dots = vals.map(function(v,i){
      return '<circle cx="'+toX(i)+'" cy="'+toY(v)+'" r="3" fill="'+(v>0?'#A8F931':'#ccc')+'" stroke="#000" stroke-width="1"/>';
    }).join('');
    var xlabels = [0,1,2,3,4,5].map(function(i){
      return '<text x="'+toX(i)+'" y="'+(PT+iH+14)+'" text-anchor="middle" font-family="Courier New" font-size="9" fill="#999">Yr'+i+'</text>';
    }).join('');
    return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="display:block;max-width:420px">'
      +'<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">'
      +'<stop offset="0%" stop-color="#A8F931" stop-opacity=".35"/>'
      +'<stop offset="100%" stop-color="#A8F931" stop-opacity=".04"/></linearGradient></defs>'
      +'<line x1="'+PL+'" y1="'+PT+'" x2="'+PL+'" y2="'+(PT+iH)+'" stroke="#E6E6E6" stroke-width="1"/>'
      +'<line x1="'+PL+'" y1="'+(PT+iH)+'" x2="'+(PL+iW)+'" y2="'+(PT+iH)+'" stroke="#E6E6E6" stroke-width="1"/>'
      +'<polygon points="'+area+'" fill="url(#sg)"/>'
      +'<polyline points="'+pts+'" fill="none" stroke="#A8F931" stroke-width="2" stroke-linejoin="round"/>'
      +dots+xlabels
      +'<text x="'+(PL-4)+'" y="'+(toY(mx)+4)+'" text-anchor="end" font-family="Courier New" font-size="9" fill="#757575">'+fmt(mx)+'</text>'
      +'<text x="'+(PL-4)+'" y="'+(toY(0)+4)+'" text-anchor="end" font-family="Courier New" font-size="9" fill="#757575">'+fmt(0)+'</text>'
      +'</svg>';
  }

  const scBlocks = Object.entries(groups).map(([grp,scs])=>{
    const grpAnn = scs.reduce(function(a,sc){ var r=b.rows.find(function(x){return x.sc.id===sc.id;}); return a+(r?r.ann:0); },0);
    return '<div><div style="display:grid;grid-template-columns:1fr auto;align-items:center;margin:0 0 4px"><h2 style="margin:0">'+grp+'</h2>'
      +'<span style="font-size:9pt;font-family:Courier New;color:#757575;font-weight:700">'+F(grpAnn)+' / yr</span></div>'
      +'<hr class="rule">'
      + scs.map(function(sc){
          var bRow = b.rows.find(function(r){return r.sc.id===sc.id;})||{ann:0,y1:0,y2:0,y3:0};
          var ramp = RAMP[sc.rampType]||{y1:.5,y2:.85,y3:1,label:sc.rampType};
          var inps = state.inputs[sc.id]||{};
          var inpRows = Object.entries(inps).slice(0,6)
            .filter(function(kv){return !kv[0].toLowerCase().includes('annual value');})
            .map(function(kv){
              var k=kv[0], v=kv[1];
              return '<tr><td style="padding:4px 8px;border-bottom:.5px solid #E8E8E8;font-size:9pt;color:#454545">'+k+'</td>'
                +'<td style="padding:4px 8px;border-bottom:.5px solid #E8E8E8;font-size:9pt;font-weight:700;text-align:right;font-family:Courier New;color:#000">'+(typeof v==='number'?v.toLocaleString():v)+'</td></tr>';
            }).join('');
          var evIds = (sc.evidenceIds||[]).slice(0,4);
          var evPills = evIds.map(function(id){
            var e=EVIDENCE.find(function(x){return x.id===id;});
            return e?'<span class="ev-pill">'+e.id+' · '+(e.publisher||'')+' '+(e.year||'')+'</span>':'';
          }).join('');
          var moAnn = (bRow.ann||0)/12;
          var narrative = sc.narrative || sc.oneLiner || ('Item-level RFID enables '+sc.name.toLowerCase()+', delivering measurable operational and financial returns through improved process visibility and reduced manual intervention.');
          var formula = sc.formula ? '<div style="margin-top:6px;font-size:8pt;font-family:Courier New;color:#5A5A5A;background:#F5F5F5;padding:5px 8px;border-radius:3px;line-height:1.5">Formula: '+sc.formula+'</div>' : '';
          return '<div class="sc-block">'
            // Header row
            +'<div style="display:grid;grid-template-columns:1fr auto;align-items:start;margin-bottom:6px">'
            +'<div><h3 style="margin:0 0 1px">'+sc.name+' <span style="font-weight:400;color:#999;font-size:9pt">['+sc.id+']</span></h3>'
            +(sc.oneLiner?'<p style="color:#757575;font-size:8.5pt;margin:0;font-style:italic">'+sc.oneLiner+'</p>':'')+'</div>'
            +'<div style="text-align:center;padding-left:10px">'
            +'<div style="font-size:7.5pt;text-transform:uppercase;letter-spacing:.5px;color:#999;font-family:Courier New;margin-bottom:2px">Share of Total</div>'
            +makeDonutSVG(bRow.ann||0, b.totAnnual||1, sc.name)
            +'</div></div>'
            // Inputs left | Ramp bars right
            +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:8px">'
            +'<div><div style="font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:5px;font-family:Courier New">Discovery Inputs</div>'
            +(inpRows?'<table style="width:100%;border-collapse:collapse"><tbody>'+inpRows+'</tbody></table>':'<p style="font-size:9pt;color:#999;font-style:italic">Benchmark defaults applied</p>')
            +'</div>'
            +'<div><div style="font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:5px;font-family:Courier New">5-Year Benefit Ramp</div>'
            +makeRampBarsSVG(bRow)
            +'</div></div>'
            // 4 metric tiles
            +'<div class="sc-metrics">'
            +'<div class="sc-m"><div class="sc-mv">'+F(moAnn)+'</div><div class="sc-ml">Avg Monthly</div></div>'
            +'<div class="sc-m"><div class="sc-mv">'+F(bRow.y1||0)+'</div><div class="sc-ml">Year 1</div></div>'
            +'<div class="sc-m"><div class="sc-mv">'+F(bRow.y2||0)+'</div><div class="sc-ml">Year 2</div></div>'
            +'<div class="sc-m" style="background:#F0FAE4;border-color:#D4EFA8"><div class="sc-mv" style="color:#3A7A00">'+F(bRow.y3||bRow.ann||0)+'</div><div class="sc-ml" style="color:#5A7A2A">Yr 3–5 Steady</div></div>'
            +'</div>'
            // Narrative + formula
            +'<div class="sc-narrative">'+narrative+'</div>'
            +formula
            // Evidence + P&L tag
            +'<div class="sc-bottom">'
            +'<div>'
            +(evPills?'<div style="font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:4px;font-family:Courier New">Supporting Evidence</div><div>'+evPills+'</div>':'<span style="font-size:8.5pt;color:#ccc;font-style:italic">No evidence tags</span>')
            +'</div>'
            +'<div class="pl-tag"><div class="pl-tag-lbl">P&amp;L Impact · Ramp Type</div><div class="pl-tag-val">'+(sc.theme||'Operational Efficiency')+' · '+(ramp.label||sc.rampType)+'</div></div>'
            +'</div>'
            +'<div style="height:8px"></div></div>';
        }).join('')
      +'</div>';
  }).join('');

  // ── Benefits summary table ───────────────────────────────────────────────
  const sumTableRows = Object.entries(groups).map(([grp,scs])=>{
    const rows = scs.map(sc=>{
      const bRow=b.rows.find(r=>r.sc.id===sc.id)||{ann:0};
      return `<tr><td style="padding-left:20px">${sc.name}</td><td class="r">${F(bRow.ann/12)}</td></tr>`;
    }).join('');
    return `<tr class="group-row"><td>${grp}</td><td></td></tr>${rows}`;
  }).join('');

  // ── Non-recurring cost table rows ────────────────────────────────────────
  const nrcRows = (oneTime.length ? oneTime : [{label:'Solution',total:yr0}])
    .map(r=>`<tr><td>${r.label}</td><td class="r">0</td><td class="r">${F(r.total||r.yr0||0)}</td></tr>`).join('');
  const recRows = recurring.map(r=>`<tr><td>${r.label}</td><td>${r.cadence||'Annual'}</td><td class="r">${F(r.total||r.yr1||r.yr2||0)}</td></tr>`).join('');

  // ── Cash / benefits only tables ─────────────────────────────────────────
  const cbRows = b.rows.map(r=>`<tr><td>${r.sc.name}</td><td class="r">${F(r.ann)}</td></tr>`).join('');

  // ── DCF table HTML ───────────────────────────────────────────────────────
  const dcfHTML = `
    <table>
      <thead><tr><th>Month</th><th class="r">Year 1</th><th class="r">Year 2</th><th class="r">Year 3</th><th class="r">Year 4</th><th class="r">Year 5</th></tr></thead>
      <tbody>
        <tr><td>0</td><td class="r">${F(-yr0)}</td><td></td><td></td><td></td><td></td></tr>
        ${dcfTableRows.map(r=>`<tr><td>${r[0]}</td>${r.slice(1).map(v=>`<td class="r">${v}</td>`).join('')}</tr>`).join('')}
        <tr class="total-row"><td colspan="1"><b>Year Total</b></td>
          ${[1,2,3,4,5].map(yr=>`<td class="r">${Math.round((yrBuckets[yr]||[]).reduce((a,v)=>a+v,0)).toLocaleString()}</td>`).join('')}
        </tr>
      </tbody>
    </table>`;

  // ── Evidence section ─────────────────────────────────────────────────────
  const evHTML = evidence.length ? `
    <div class="pb"></div>
    <h1>Evidence Registry</h1><hr class="rule-heavy">
    <p class="label">Tier 1 = peer-reviewed / academic · Tier 2 = industry association · Tier 3 = analyst / practitioner</p>
    ${evidence.map(ev=>`
      <div class="ev-block avoid">
        <h3>${ev.id||''} — ${ev.title||''}</h3>
        <div class="label">${ev.tier||''} · ${ev.publisher||''} · ${ev.year||''}</div>
        <p style="margin-top:4px;font-size:9pt">${ev.claim||''}</p>
      </div>`).join('')}
  ` : '';

  const barData = b.rows.map(r=>({name:r.sc.name,value:r.ann})).sort((a,z)=>z.value-a.value);

  // ── Assemble full document ───────────────────────────────────────────────
  const html = `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8">
    <title>${co} — RFID Investment Appraisal</title>
    <style>${CSS}</style>
  </head><body>

  <div class="doc-header">
    <span class="brand">ZEBRA</span>
    <span class="doc-title">Investment Appraisal for ${co}</span>
  </div>
  <div class="doc-footer">
    <span>Zebra Technologies · Confidential</span>
    <span>${dateStr}</span>
  </div>

  <div class="page-content">
    <div class="no-print-hint">💡 To save as PDF: File → Print → Destination: Save as PDF · Recommended: Letter, Portrait, No margins</div>

    <!-- ── COVER ── -->
    <div class="cover pb">
      <div class="cover-hero">
        <div class="cover-stripe"></div>
        <div class="cover-tag">RFID Investment Appraisal · Confidential</div>
        <div class="cover-title">Investment Appraisal<br>for ${co}</div>
        <div class="cover-sub">${titleS}</div>
        <div class="cover-meta">
          ${seller?`Prepared by: <b>${seller}</b> &nbsp;·&nbsp; `:''}
          ${partners?`${partners} &nbsp;·&nbsp; `:''}
          ${dateStr}
        </div>
        ${pain?`<div style="margin-top:14px;font-size:9pt;color:#565656;border-left:3px solid #A8F931;padding:6px 10px;background:#F9F9F9"><strong>Discovery KPIs:</strong> ${pain}</div>`:''}
        <!-- KPI strip -->
        <div class="cover-kpi-strip" style="background:#fff">
          <div class="ck" style="background:#1A1A1A">
            <div class="ck-val" style="color:#A8F931">${F(totAnnual)}</div>
            <div class="ck-lbl" style="color:rgba(255,255,255,.5)">Full Annual Value</div>
          </div>
          <div class="ck">
            <div class="ck-val">${pb}</div>
            <div class="ck-lbl">Payback Period</div>
          </div>
          <div class="ck">
            <div class="ck-val">${F(npv5)}</div>
            <div class="ck-lbl">5-Year NPV</div>
          </div>
          <div class="ck">
            <div class="ck-val">${roi3}%</div>
            <div class="ck-lbl">3-Year Net ROI (benefit less cost)</div>
          </div>
        </div>
        <!-- Scenario pills -->
        <div style="margin-top:16px">
          <div style="font-size:7.5pt;text-transform:uppercase;letter-spacing:1px;color:#999;font-family:'Courier New',monospace;margin-bottom:8px">${active.length} Quantified Value Scenarios</div>
          <div class="cover-scenarios">
            ${active.map(sc=>`<span class="cover-sc-pill">${sc.id} · ${sc.name}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- ── BASIS OF PREPARATION ── -->
    <h1>Basis of Preparation</h1><hr class="rule-heavy">
    <p>This appraisal has been prepared to provide <b>${co}</b> with the potential financial implications and investment returns arising from the proposed Zebra RFID solution.</p>
    <p>It is based upon a number of stages that together provide an assessment of the investment returns likely to be delivered as a result of project acceptance.</p>
    <p>This assessment is based upon information and explanation from <b>${co}</b> and is indicative only. It is therefore not a part of the contractual offer from Zebra Technologies.</p>

    <h1 style="margin-top:24px">Background to Investment Appraisal</h1><hr class="rule-heavy">
    <p>This business case aims to show, in modelled dollars, how RFID can address the identified challenges at <b>${co}</b>${pain?' · Discovery KPIs: '+pain:''} — covering the project investment and delivering attractive payback and multi-year ROI. The objective is to tie each lever to a specific P&L line so stakeholders can see where savings land and how RFID supports more reliable operational performance.</p>
    ${seller&&seller!=='—'?`<p>This appraisal has been prepared by <b>${seller}</b> in collaboration with ${partners}. It should be cross-referred to the sales proposal submitted separately.</p>`:''}
    <p>The following appraisal methods have been used:</p>

    <h2>Net Present Value</h2>
    <p>A financial measure of whether a proposal delivers a "profit" or a "loss" using an annual cost of money applied to the timing of spend and savings. It includes the initial cost of the equipment and services, the monthly cost of maintenance, compared to the financial benefits accruing. The result is the change in shareholder value to be anticipated from project acceptance.</p>

    <h2>Internal Rate of Return (IRR) — Modeled, Illustrative, Pre-Tax</h2>
    <p>The return rate per year to <b>${co}</b> taking into account: initial cost of the equipment and services, monthly cost of maintenance, and comparing these to the timing of benefits identified as a result of implementing the project.</p>

    <h2>Payback</h2>
    <p>A comparison of the initial outlay to buy equipment or services, against the time taken for the savings to cover the initial outlay. This derives an answer which is a time measure, usually quoted in months / years.</p>

    <div class="pb"></div>

    <!-- ── INVESTMENT SUMMARY ── -->
    <h1>Investment Summary</h1><hr class="rule-heavy">
    <h2>Non-Recurring Costs</h2>
    <table>
      <thead><tr><th>Item</th><th class="r">Month</th><th class="r">Cost</th></tr></thead>
      <tbody>
        ${nrcRows}
        ${contingency?`<tr style="font-style:italic;color:#757575"><td>Contingency (7%)</td><td class="r">0</td><td class="r">${F(contingency.yr0||0)}</td></tr>`:''}
        <tr class="total-row"><td><b>Total non-recurring costs</b></td><td></td><td class="r"><b>${F(yr0)}</b></td></tr>
      </tbody>
    </table>
    <div class="label" style="margin-top:6px">Non-recurring costs total ${F(yr0)}</div>
    <div style="margin-top:12px;max-width:680px">${makeBarSVG((oneTime.length?oneTime:[{label:'Solution',total:yr0}]).map(r=>({name:r.label,value:r.total||r.yr0||0})))}</div>

    ${recurring.length?`
    <h2>Recurring Costs</h2>
    <table>
      <thead><tr><th>Item</th><th>Cadence</th><th class="r">Annual Cost</th></tr></thead>
      <tbody>
        ${recRows}
        <tr class="total-row"><td><b>Total recurring (annual)</b></td><td></td><td class="r"><b>${F(yr1)}</b></td></tr>
      </tbody>
    </table>`:''}

    <div class="pb"></div>

    <!-- ── BENEFITS EVALUATION ── -->
    <h1>Benefits Evaluation</h1><hr class="rule-heavy">
    <div class="section-strip">
      <div class="ss-item"><div class="ss-val">${active.length}</div><div class="ss-lbl">Scenarios Quantified</div></div>
      <div class="ss-item"><div class="ss-val">${Object.keys(groups).length}</div><div class="ss-lbl">Value Themes</div></div>
      <div class="ss-item"><div class="ss-val">${F(totAnnual)}</div><div class="ss-lbl">Total Annual Value</div></div>
    </div>
    <p class="section-intro">The following ${active.length} scenarios have been quantified using discovery inputs and Zebra benchmark data. Each scenario includes a proportional share of total value (donut), a 5-year benefit ramp, supporting evidence, and P&amp;L mapping.</p>
    ${scBlocks}

    <div class="pb"></div>

    <!-- ── BENEFITS SUMMARY ── -->
    <h1>Benefits Summary</h1><hr class="rule-heavy">
    <table>
      <thead><tr><th>Scenario</th><th class="r">Monthly Value</th></tr></thead>
      <tbody>
        ${sumTableRows}
        <tr class="total-row"><td><b>Total average monthly benefits</b></td><td class="r"><b>${F(moAvg)}</b></td></tr>
      </tbody>
    </table>
    <div style="margin-top:16px;max-width:680px">${makeBarSVG(barData)}</div>
    <div class="chart-cap">Annual benefits by scenario · Total ${F(totAnnual)} / yr · Average monthly ${F(moAvg)}</div>
    <div style="margin-top:20px;padding:14px;background:#F8F8F8;border-radius:4px">
      <div style="font-size:8pt;font-family:Courier New;text-transform:uppercase;letter-spacing:1px;color:#757575;margin-bottom:10px">Investment Ratio</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;text-align:center">
        <div><div style="font-size:20pt;font-weight:700">$1 : $${invRatio}</div><div style="font-size:8pt;color:#757575;font-family:Courier New;text-transform:uppercase">Return per $1 invested</div></div>
        <div><div style="font-size:20pt;font-weight:700">${F(npv5)}</div><div style="font-size:8pt;color:#757575;font-family:Courier New;text-transform:uppercase">5-Year NPV</div></div>
        <div><div style="font-size:20pt;font-weight:700">${roi3}%</div><div style="font-size:8pt;color:#757575;font-family:Courier New;text-transform:uppercase">3-Year Net ROI (benefit less total cost)</div></div>
      </div>
    </div>

    <div class="pb"></div>

    <!-- ── CASH ONLY SUMMARY ── -->
    <h1>Cash Summary</h1><hr class="rule-heavy">
    <table>
      <thead><tr><th>Benefits</th><th class="r">Annual Value</th></tr></thead>
      <tbody>
        ${cbRows}
        <tr class="total-row"><td><b>Total Benefits</b></td><td class="r"><b>${F(totAnnual)}</b></td></tr>
      </tbody>
    </table>
    <table style="margin-top:10px">
      <thead><tr><th>Costs</th><th class="r">Value</th></tr></thead>
      <tbody>
        ${(oneTime.length?oneTime:[{label:'Solution',total:yr0}]).map(r=>`<tr><td>${r.label}</td><td class="r">${F(r.total||r.yr0||0)}</td></tr>`).join('')}
        ${recurring.map(r=>`<tr><td>${r.label} (annual)</td><td class="r">${F(r.total||r.yr1||0)}</td></tr>`).join('')}
        <tr class="total-row"><td><b>Total Investment (Yr 0 non-recurring)</b></td><td class="r"><b>${F(yr0)}</b></td></tr>
      </tbody>
    </table>
    <table style="margin-top:10px;width:60%">
      <tbody>
        <tr class="total-row"><td><b>Net Benefits</b></td><td class="r"><b>${F(totAnnual-yr0)}</b></td></tr>
        <tr><td><b>Investment Ratio*</b></td><td class="r"><b>$1.00 : $${invRatio}</b></td></tr>
        <tr><td><b>3-Year ROI</b></td><td class="r"><b>${roi3}%</b></td></tr>
      </tbody>
    </table>
    <p style="font-size:8.5pt;color:#757575;margin-top:6px">*The ratio between the investment cost and the benefit returned. For every $1.00 spent, $${invRatio} is returned.</p>

    <div class="pb"></div>

    <!-- ── ROI — NPV ── -->
    <h1>Return On Investment Appraisal Elements</h1><hr class="rule-heavy">
    <h2>Net Present Value (NPV)</h2>
    <table style="width:60%">
      <tbody>
        <tr><td>Review period (months)</td><td class="r">60</td></tr>
        <tr><td>Non-recurring costs</td><td class="r">${F(yr0)}</td></tr>
        <tr><td>Average monthly benefits</td><td class="r">${F(moAvg)}</td></tr>
        <tr><td>Minimum return (per year)</td><td class="r">10%</td></tr>
        <tr class="total-row"><td><b>NPV</b></td><td class="r"><b>${F(npv5)}</b></td></tr>
      </tbody>
    </table>

    <h2>Discounted Cashflow Analysis — NPV</h2>
    ${dcfHTML}

    <div class="pb"></div>

    <div style="margin-bottom:16px;max-width:680px">${makeRampSVG(cfPts)}</div>
    <div class="chart-cap">NPV Cumulative Discounted Cashflow ${F(npv5)}</div>

    <h2 style="margin-top:24px">Internal Rate of Return (IRR) — Modeled, Illustrative, Pre-Tax</h2>
    <table style="width:60%">
      <tbody>
        <tr><td>Review period (months)</td><td class="r">60</td></tr>
        <tr><td>Non-recurring costs</td><td class="r">${F(yr0)}</td></tr>
        <tr><td>Average monthly benefits</td><td class="r">${F(moAvg)}</td></tr>
        <tr class="total-row"><td><b>IRR</b></td><td class="r"><b>${irrVal==='N/A'?'N/A':irrVal+'%'}</b></td></tr>
      </tbody>
    </table>

    <h2>DCF Year Totals</h2>
    <table style="width:60%">
      <tbody>
        ${[1,2,3,4,5].map(yr=>`<tr><td>Year ${yr}</td><td class="r">${Math.round((yrBuckets[yr]||[]).reduce((a,v)=>a+v,0)).toLocaleString()}</td></tr>`).join('')}
        <tr class="total-row"><td><b>Total</b></td><td class="r"><b>${Math.round([1,2,3,4,5].flatMap(yr=>yrBuckets[yr]||[]).reduce((a,v)=>a+v,0)).toLocaleString()}</b></td></tr>
      </tbody>
    </table>

    <div class="pb"></div>

    <!-- ── PAYBACK ── -->
    <h1>Payback</h1><hr class="rule-heavy">
    <table style="width:60%">
      <tbody>
        <tr><td>Non-recurring costs</td><td class="r">${F(yr0)}</td></tr>
        <tr><td>Average monthly benefits</td><td class="r">${F(moAvg)}</td></tr>
        <tr class="total-row"><td><b>Payback (Months)</b></td><td class="r"><b>${paybackMo?paybackMo.toFixed(1):'—'}</b></td></tr>
      </tbody>
    </table>
    <div style="margin:16px 0;max-width:680px">${makePaybackSVG(cfPts, paybackMo)}</div>
    <div class="chart-cap">Payback cumulative cashflow${paybackMo?' — '+paybackMo.toFixed(1)+' months':''}</div>

    <div class="pb"></div>

    <!-- ── SUMMARY ── -->
    <h1>Summary</h1><hr class="rule-heavy">
    <div class="tiles">
      <div class="tile"><div class="tile-val">${F(yr0)}</div><div class="tile-lbl">Non-recurring costs</div></div>
      <div class="tile"><div class="tile-val">60 months</div><div class="tile-lbl">Review period</div></div>
      <div class="tile"><div class="tile-val">${F(moAvg)}</div><div class="tile-lbl">Average monthly benefits</div></div>
      <div class="tile"><div class="tile-val">${F(npv5)}</div><div class="tile-lbl">Net Present Value (5-year)</div></div>
      <div class="tile"><div class="tile-val">${irrVal==='N/A'?'N/A':irrVal+'%'}</div><div class="tile-lbl">Modeled Unlevered IRR (illustrative, pre-tax)</div></div>
      <div class="tile"><div class="tile-val">${pb}</div><div class="tile-lbl">Payback period</div></div>
      <div class="tile"><div class="tile-val">${roi3}%</div><div class="tile-lbl">3-Year Net ROI (benefit less total cost, conservative ramps)</div></div>
      <div class="tile"><div class="tile-val">10%</div><div class="tile-lbl">Assumed cost of capital</div></div>
      <div class="tile"><div class="tile-val">$1 : $${invRatio}</div><div class="tile-lbl">Investment ratio</div></div>
    </div>
    <p style="margin-top:16px">The Investment Appraisal outlined above is based upon identified benefits that would accrue to <b>${co}</b> as a result of project acceptance.</p>
    <p>The investment evaluation has been completed using the Zebra RFID Value Accelerator. The output from this tool is fully visible and can be audited by ${co} if so required.</p>
    <p>This indicative analysis stands separately from the contractual elements of the Zebra Technologies solution and is necessarily dependent upon the benefits identified jointly with ${co}.</p>

    <div class="disclaimer"><b>Modeling Disclaimer:</b> Financial estimates are illustrative projections generated from benchmark data and the parameters provided. Actual results depend on deployment scope, operational execution, system integration, and market conditions. Zebra Technologies makes no guarantee of specific outcomes. This model supports internal business case development and pre-sale discovery — not a contractual commitment.</div>

    ${evHTML}
  </div>

  <script>window.onload=function(){window.print();}<\/script>
  </body></html>`;

  const win = window.open('','_blank');
  if(!win){ alert('Pop-up blocked. Please allow pop-ups for this page and try again.'); return; }
  win.document.write(html);
  win.document.close();
}

// ── DECK PREVIEW — slide-by-slide viewer + PDF/PPTX download ─────────────
async function exportPPTX() {
  ensureCosts();
  if(!state.benefits || !state.benefits.totAnnual) renderROI();
  const b = state.benefits;
  const c = state.costs;
  const co       = document.getElementById('i-customer')?.value  || 'Your Customer';
  const vendor   = document.getElementById('i-company')?.value   || 'Zebra Technologies';
  const titleS   = document.getElementById('i-title')?.value     || 'RFID Strategic Value Analysis';
  const seller   = document.getElementById('i-seller')?.value    || '';
  const partners = document.getElementById('i-partners')?.value  || 'Zebra Technologies';
  const pain     = document.getElementById('i-pain')?.value     || '';
  const dateStr  = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const active   = SCENARIOS.filter(s=>state.selectedIds.has(s.id));
  const totAnnual= b.totAnnual||0;
  const yr0=c.yr0||0, yr1=c.yr1||0, yr2=c.yr2||0;
  const moAvg = totAnnual/12;
  const paybackMo = moAvg>0&&yr0>0 ? Math.round(yr0/moAvg) : null;
  const pb = paybackMo ? paybackMo+' months' : '—';
  const npv5 = Math.round(((b.totY1-(yr1))/(1.1))+((b.totY2-(yr2))/(1.21))+((b.totY3-(yr2))/(1.331))+((b.totY3-(yr2))/(1.464))+((b.totY3-(yr2))/(1.611)));
  const roi3 = yr0>0 ? Math.round(((b.totY1+b.totY2+b.totY3-(yr0+yr1+yr2*2))/(yr0+yr1+yr2*2))*100) : 0;
  const invRatio = yr0>0 ? ((b.totY1+b.totY2+b.totY3)/yr0).toFixed(2) : '—';
  const F = v => v==null?'—':'$'+Math.round(v).toLocaleString();
  const pct = v => Math.round((v||0)*100)+'%';

  // Group active scenarios by vertical
  const groups = {};
  active.forEach(sc=>{ if(!groups[sc.vertical||sc.theme||'Other']) groups[sc.vertical||sc.theme||'Other']=[]; groups[sc.vertical||sc.theme||'Other'].push(sc); });

  // ── Slide definitions ─────────────────────────────────────────────────────
  function slideWrap(num, total, content, dark) {
    const bg   = dark ? '#1A1A1A' : '#FFFFFF';
    const text = dark ? '#FFFFFF' : '#1A1A1A';
    return `
    <div class="slide" id="slide-${num}">
      <div class="slide-inner" style="background:${bg};color:${text}">
        <div class="slide-num">${num} / ${total}</div>
        ${content}
        <div class="slide-footer" style="color:${dark?'rgba(255,255,255,.3)':'#BDBDBD'}">
          <span>ZEBRA TECHNOLOGIES · RFID VALUE ACCELERATOR</span>
          <span>${co} · ${dateStr}</span>
        </div>
      </div>
    </div>`;
  }

  // ── Inline SVG helpers for deck ─────────────────────────────────────────
  function deckBarH(rows, maxVal) {
    // rows: [{label, value, color}] — horizontal bars
    var ROW=16, GAP=5, LPAD=8, VPAD=4;
    var H = rows.length*(ROW+GAP)+VPAD*2;
    var fmt = function(v){ return v>=1e6?'$'+(v/1e6).toFixed(1)+'M':v>=1e3?'$'+(v/1e3).toFixed(0)+'K':'$'+Math.round(v); };
    var bars = rows.map(function(r,i){
      var bw = maxVal>0 ? Math.max(2, (r.value/maxVal)*100) : 2;
      var y = VPAD + i*(ROW+GAP);
      return '<rect x="0" y="'+y+'" width="100" height="'+ROW+'" fill="#F0F0F0" rx="2"/>'
        +'<rect x="0" y="'+y+'" width="'+bw+'" height="'+ROW+'" fill="'+(r.color||'#A8F931')+'" rx="2"/>'
        +'<text x="'+(bw+2)+'" y="'+(y+ROW*.72)+'" font-family="Courier New" font-size="6" fill="#333" font-weight="700">'+fmt(r.value)+'</text>';
    }).join('');
    return '<svg viewBox="0 0 100 '+H+'" width="100%" preserveAspectRatio="none" style="display:block;height:'+(H*2)+'px">'+bars+'</svg>';
  }

  function deckDonut(pct, label, val) {
    var r=38, cx=48, cy=48, stroke=10, circ=2*Math.PI*r;
    var dash=Math.min(pct,1)*circ;
    var fmt=function(v){return v>=1e6?'$'+(v/1e6).toFixed(1)+'M':v>=1e3?'$'+(v/1e3).toFixed(0)+'K':'$'+Math.round(v);};
    return '<svg viewBox="0 0 96 96" width="96" height="96" style="display:block">'
      +'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#2A2A2A" stroke-width="'+stroke+'"/>'
      +'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#A8F931" stroke-width="'+stroke+'"'
      +' stroke-dasharray="'+dash+' '+circ+'" stroke-dashoffset="'+(circ/4)+'" stroke-linecap="round"/>'
      +'<text x="'+cx+'" y="'+(cy-5)+'" text-anchor="middle" font-family="Arial" font-size="13" font-weight="700" fill="#fff">'+Math.round(pct*100)+'%</text>'
      +'<text x="'+cx+'" y="'+(cy+10)+'" text-anchor="middle" font-family="Courier New" font-size="6" fill="#aaa">'+fmt(val)+'</text>'
      +'</svg>';
  }

  function deckLineArea(vals, color) {
    // vals: array of numbers, renders area chart
    var W=180, H=60, PL=2, PT=4, iW=W-PL-6, iH=H-PT-14;
    var mx=Math.max.apply(null,vals.concat([1]));
    var toX=function(i){return PL+(i/(vals.length-1))*iW;};
    var toY=function(v){return PT+iH*(1-v/mx);};
    var fmt=function(v){return v>=1e6?'$'+(v/1e6).toFixed(1)+'M':v>=1e3?'$'+(v/1e3).toFixed(0)+'K':'$0';};
    var pts=vals.map(function(v,i){return toX(i)+','+toY(v);}).join(' ');
    var area=pts+' '+toX(vals.length-1)+','+(PT+iH)+' '+toX(0)+','+(PT+iH);
    var dots=vals.map(function(v,i){
      return '<circle cx="'+toX(i)+'" cy="'+toY(v)+'" r="2.5" fill="'+(color||'#A8F931')+'"/>';
    }).join('');
    var labels=vals.map(function(v,i){
      return '<text x="'+toX(i)+'" y="'+(PT+iH+11)+'" text-anchor="middle" font-family="Courier New" font-size="6" fill="#888">Yr'+i+'</text>';
    }).join('');
    return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="display:block">'
      +'<defs><linearGradient id="lg'+Math.round(Math.random()*9999)+'" x1="0" y1="0" x2="0" y2="1">'
      +'<stop offset="0%" stop-color="'+(color||'#A8F931')+'" stop-opacity=".3"/>'
      +'<stop offset="100%" stop-color="'+(color||'#A8F931')+'" stop-opacity=".03"/></linearGradient></defs>'
      +'<polygon points="'+area+'" fill="url(#lg0)" opacity=".8"/>'
      +'<polyline points="'+pts+'" fill="none" stroke="'+(color||'#A8F931')+'" stroke-width="1.5" stroke-linejoin="round"/>'
      +dots+labels
      +'<text x="'+toX(vals.length-1)+'" y="'+(toY(mx)-3)+'" text-anchor="end" font-family="Courier New" font-size="6" fill="#ccc">'+fmt(mx)+'</text>'
      +'</svg>';
  }

  const totalSlides = 4 + Object.keys(groups).length + 3;
  let n = 0;

  // ── Slide 1: Cover ────────────────────────────────────────────────────────
  const s1 = slideWrap(++n, totalSlides, `
    <div style="display:grid;grid-template-columns:1fr 280px;gap:32px;height:100%">
      <div style="display:flex;flex-direction:column;justify-content:center">
        <div class="cover-bar"></div>
        <div class="cover-tag">RFID Investment Appraisal · Confidential</div>
        <div class="cover-title">${titleS}</div>
        <div class="cover-co">${co}</div>
        <div class="cover-meta">
          ${seller?`<div>Prepared by <strong style="color:rgba(255,255,255,.7)">${seller}</strong></div>`:''}
          ${partners?`<div>${partners}</div>`:''}
          <div>${dateStr}</div>
        </div>
        ${pain?`<div style="margin-top:12px;font-size:9px;color:rgba(255,255,255,.35);font-family:Courier New;border-left:2px solid #A8F931;padding-left:8px;line-height:1.7">${pain}</div>`:''}
      </div>
      <div style="display:flex;flex-direction:column;justify-content:center;gap:8px">
        <div style="font-size:7px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.3);font-family:Courier New;margin-bottom:4px">${active.length} Scenarios · ${Object.keys(groups).length} Themes</div>
        <div class="cover-kpi-row" style="grid-template-columns:1fr 1fr">
          <div class="ck"><div class="ck-v">${F(totAnnual)}</div><div class="ck-l">Annual Value</div></div>
          <div class="ck"><div class="ck-v">${pb}</div><div class="ck-l">Payback</div></div>
          <div class="ck"><div class="ck-v">${F(npv5)}</div><div class="ck-l">5-Yr NPV</div></div>
          <div class="ck"><div class="ck-v">${roi3}%</div><div class="ck-l">3-Yr ROI</div></div>
        </div>
        <div style="margin-top:8px;border-top:1px solid rgba(255,255,255,.08);padding-top:8px">
          ${active.slice(0,6).map(sc=>`<div style="font-size:7px;font-family:Courier New;color:rgba(255,255,255,.3);padding:2px 0;border-bottom:1px solid rgba(255,255,255,.05)">${sc.id} · ${sc.name}</div>`).join('')}
          ${active.length>6?`<div style="font-size:7px;font-family:Courier New;color:rgba(255,255,255,.2);padding-top:2px">+${active.length-6} more scenarios</div>`:''}
        </div>
      </div>
    </div>
  `, true);

  // ── Slide 2: Executive Summary ────────────────────────────────────────────
  const execLineVals = [0, b.totY1||0, b.totY2||0, b.totY3||0, b.totY3||0, b.totY3||0];
  const s2 = slideWrap(++n, totalSlides, `
    <div class="slide-title">Executive Summary <span class="slide-title-sub">${active.length} scenarios · ${Object.keys(groups).length} value themes</span></div>
    <div style="display:grid;grid-template-columns:1fr 200px;gap:24px">
      <div>
        <div class="kpi4">
          <div class="k4"><div class="k4v" style="color:#1A1A1A">${F(totAnnual)}</div><div class="k4l">Full Annual Value</div></div>
          <div class="k4"><div class="k4v">${pb}</div><div class="k4l">Payback Period</div></div>
          <div class="k4"><div class="k4v">${F(npv5)}</div><div class="k4l">5-Year NPV</div></div>
          <div class="k4"><div class="k4v">${roi3}%</div><div class="k4l">3-Year ROI</div></div>
        </div>
        <div class="slide-sub" style="margin-top:14px">Investment Profile</div>
        <div class="kpi4">
          <div class="k4"><div class="k4v">${F(yr0)}</div><div class="k4l">Yr 0 NRC</div></div>
          <div class="k4"><div class="k4v">${F(yr1)}</div><div class="k4l">Yr 1 Recurring</div></div>
          <div class="k4"><div class="k4v">${F(yr2)}</div><div class="k4l">Yr 2+ Annual</div></div>
          <div class="k4"><div class="k4v">$1:$${invRatio}</div><div class="k4l">Return Ratio</div></div>
        </div>
        <div class="narr">Benefits ramp to full run-rate at steady-state. NPV calculated at 10% discount rate. Investment ratio: every $1.00 returns $${invRatio} over 3 years.</div>
    <div class="narr" style="margin-top:6px;color:#888;font-size:7px">Only quantified direct benefits from ${active.length} modeled scenarios are included. Strategic and soft benefits are discussed separately.</div>
      </div>
      <div>
        <div style="font-size:7px;text-transform:uppercase;letter-spacing:1px;color:#999;font-family:Courier New;margin-bottom:6px">Benefit Ramp · 5 Year</div>
        ${deckLineArea(execLineVals, '#A8F931')}
        <div style="margin-top:10px">
          ${Object.entries(groups).slice(0,5).map(([grp,scs])=>{
            const gv = scs.reduce((a,sc)=>{const r=b.rows?.find(x=>x.sc.id===sc.id);return a+(r?.ann||0);},0);
            const gpct = totAnnual>0?Math.round(gv/totAnnual*100):0;
            return `<div style="display:grid;grid-template-columns:1fr auto;font-size:7px;font-family:Courier New;color:#555;margin-bottom:3px;gap:6px">
              <div>${grp}</div><div style="color:#1A1A1A;font-weight:700">${gpct}%</div>
              <div style="grid-column:1/-1;background:#EEE;height:3px;border-radius:2px;position:relative">
                <div style="position:absolute;top:0;left:0;width:${gpct}%;height:3px;background:#A8F931;border-radius:2px"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `, false);

  // ── Slide 3: Investment Summary ───────────────────────────────────────────
  const costRowsHtml = (c.rows||[]).slice(0,7).map(r=>`
    <tr><td>${r.label||'—'}</td><td style="text-align:right;font-family:Courier New">${F(r.total||r.yr0||0)}</td><td style="text-align:center;color:#888">${r.cadence||'One-time'}</td></tr>
  `).join('');
  const costBarsData = (c.rows||[{label:'Solution',total:yr0}]).slice(0,6).map(r=>({label:r.label||'—',value:r.total||r.yr0||0,color:'#555'}));
  const maxCost = Math.max.apply(null, costBarsData.map(r=>r.value).concat([1]));
  const s3 = slideWrap(++n, totalSlides, `
    <div class="slide-title">Investment Summary</div>
    <div class="two-col-6">
      <div>
        <table class="sl-table">
          <thead><tr><th>Item</th><th style="text-align:right">Amount</th><th style="text-align:center">Cadence</th></tr></thead>
          <tbody>
            ${costRowsHtml||`<tr><td>RFID Solution</td><td style="text-align:right;font-family:Courier New">${F(yr0)}</td><td style="text-align:center">One-time</td></tr>`}
            <tr class="tot-row"><td><strong>Total (Yr 0 NRC)</strong></td><td style="text-align:right"><strong>${F(yr0)}</strong></td><td></td></tr>
          </tbody>
        </table>
        <div class="narr">Yr 1 recurring: ${F(yr1)} · Yr 2+ annual: ${F(yr2)}. Every $1.00 invested returns $${invRatio}.</div>
        <div style="margin-top:8px;padding:8px;background:#F8F8F8;border-radius:3px;border-left:2px solid #1A1A1A">
          <div style="font-size:7px;font-family:Courier New;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:5px">Cost Summary</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
            <div style="text-align:center"><div style="font-size:12px;font-weight:700">${F(yr0)}</div><div style="font-size:6px;font-family:Courier New;color:#888;text-transform:uppercase">Yr 0 Deployment</div></div>
            <div style="text-align:center"><div style="font-size:12px;font-weight:700">${F(yr1)}</div><div style="font-size:6px;font-family:Courier New;color:#888;text-transform:uppercase">Annual Run-Rate</div></div>
            <div style="text-align:center"><div style="font-size:12px;font-weight:700">${F((yr0||0)+((yr1||0)*4))}</div><div style="font-size:6px;font-family:Courier New;color:#888;text-transform:uppercase">5-Year Total</div></div>
          </div>
          <div style="margin-top:6px;font-size:6.5px;color:#888;font-style:italic">Includes tags, readers, SaaS, services, internal time, and contingency. All categories shown in line-item table.</div>
        </div>
      </div>
      <div>
        <div style="font-size:7px;text-transform:uppercase;letter-spacing:1px;color:#999;font-family:Courier New;margin-bottom:8px">Cost Breakdown</div>
        ${costBarsData.map(r=>{
          const bw = maxCost>0?Math.round((r.value/maxCost)*100):2;
          return `<div style="margin-bottom:6px">
            <div style="font-size:7px;font-family:Courier New;color:#888;margin-bottom:2px">${r.label}</div>
            <div style="background:#F0F0F0;height:12px;border-radius:2px;position:relative">
              <div style="position:absolute;top:0;left:0;width:${bw}%;height:12px;background:#444;border-radius:2px"></div>
              <div style="position:absolute;top:0;left:${bw}%;padding-left:4px;font-size:7px;font-family:Courier New;font-weight:700;line-height:12px;color:#333">${F(r.value)}</div>
            </div>
          </div>`;
        }).join('')}
        <div style="margin-top:10px;padding:8px;background:#F0FAE4;border-radius:3px;border-left:2px solid #A8F931">
          <div style="font-size:7px;font-family:Courier New;color:#5A7A2A;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px">Investment Ratio</div>
          <div style="font-size:16px;font-weight:700;color:#2E7D32">$1 : $${invRatio}</div>
        </div>
      </div>
    </div>
  `, false);

  // ── Group slides: one per vertical ───────────────────────────────────────
  const groupSlides = Object.entries(groups).map(([grp,scs])=>{
    const grpAnn = scs.reduce((a,sc)=>{ const r=b.rows?.find(x=>x.sc.id===sc.id); return a+(r?.ann||0); },0);
    const grpY1  = scs.reduce((a,sc)=>{ const r=b.rows?.find(x=>x.sc.id===sc.id); return a+(r?.y1||0); },0);
    const maxAnn = Math.max.apply(null, scs.map(sc=>{ const r=b.rows?.find(x=>x.sc.id===sc.id); return r?.ann||0; }).concat([1]));
    const gpct = totAnnual>0?Math.round(grpAnn/totAnnual*100):0;
    const scCards = scs.map(sc=>{
      const r=b.rows?.find(x=>x.sc.id===sc.id);
      const ann=r?.ann||0;
      const bw=maxAnn>0?Math.round((ann/maxAnn)*100):2;
      return `<div class="sc-card">
        <span class="sc-id">${sc.id}</span>
        <div><div class="sc-name">${sc.name}</div><div class="sc-bar-bg"><div class="sc-bar-fg" style="width:${bw}%"></div></div></div>
        <div class="sc-ann">${F(ann)}</div>
      </div>`;
    }).join('');
    return slideWrap(++n, totalSlides, `
      <div style="display:grid;grid-template-columns:1fr 160px;gap:20px;height:100%">
        <div>
          <div class="slide-title">${grp} <span class="slide-title-sub">${scs.length} scenario${scs.length>1?'s':''}</span></div>
          ${scCards}
          <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
            <div style="background:#F8F8F8;border:1px solid #EEE;border-radius:3px;padding:6px;text-align:center">
              <div style="font-size:14px;font-weight:700">${F(grpY1)}</div>
              <div style="font-size:6px;text-transform:uppercase;color:#999;font-family:Courier New">Year 1</div>
            </div>
            <div style="background:#F8F8F8;border:1px solid #EEE;border-radius:3px;padding:6px;text-align:center">
              <div style="font-size:14px;font-weight:700">${F(grpAnn)}</div>
              <div style="font-size:6px;text-transform:uppercase;color:#999;font-family:Courier New">Full Annual</div>
            </div>
            <div style="background:#F0FAE4;border:1px solid #D4EFA8;border-radius:3px;padding:6px;text-align:center">
              <div style="font-size:14px;font-weight:700;color:#2E7D32">${gpct}%</div>
              <div style="font-size:6px;text-transform:uppercase;color:#5A7A2A;font-family:Courier New">Share of Total</div>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;gap:8px">
          <div style="font-size:7px;text-transform:uppercase;letter-spacing:1px;color:#999;font-family:Courier New">Value Share</div>
          ${deckDonut(totAnnual>0?grpAnn/totAnnual:0, grp, grpAnn)}
          <div style="font-size:7px;font-family:Courier New;color:#888;text-align:center;line-height:1.5">${gpct}% of<br>${F(totAnnual)}</div>
          <div style="width:100%;margin-top:4px">
            <div style="font-size:6px;text-transform:uppercase;color:#999;font-family:Courier New;margin-bottom:4px">Ramp Profile</div>
            ${(()=>{
              const rvals=[0,...scs.map((sc,i)=>{const r=b.rows?.find(x=>x.sc.id===sc.id);return r?.y1||0;}), grpAnn, grpAnn];
              return deckLineArea([0,grpY1,grpAnn,grpAnn,grpAnn,grpAnn], '#A8F931');
            })()}
          </div>
        </div>
      </div>
    `, false);
  });

  // ── Benefits Summary slide ────────────────────────────────────────────────
  const topRows = (b.rows||[]).sort((a,z)=>(z.ann||0)-(a.ann||0)).slice(0,8);
  const maxBen  = topRows.length ? topRows[0].ann : 1;
  const sB = slideWrap(++n, totalSlides, `
    <div class="slide-title">Benefits Summary <span class="slide-title-sub">ranked by annual value</span></div>
    <div class="two-col-6">
      <div>
        ${topRows.map(r=>{
          const bw=maxBen>0?Math.round((r.ann/maxBen)*100):2;
          return `<div style="margin-bottom:5px;padding-bottom:5px;border-bottom:1px solid #F0F0F0">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
              <div style="font-size:8px;font-weight:600">${r.sc.name} <span style="font-size:6px;color:#999;font-family:Courier New">[${r.sc.id}]</span></div>
              <div style="font-size:6.5px;color:#777;font-style:italic;margin-top:1px">${r.sc.oneLiner||''}</div>
              <div style="font-size:9px;font-weight:700;font-family:Courier New">${F(r.ann)}</div>
            </div>
            <div style="background:#F0F0F0;height:5px;border-radius:2px"><div style="width:${bw}%;height:5px;background:#A8F931;border-radius:2px"></div></div>
          </div>`;
        }).join('')}
        <div style="margin-top:8px;padding:6px;background:#1A1A1A;border-radius:3px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:8px;font-family:Courier New;color:#999;text-transform:uppercase">Total Annual Value</span>
          <span style="font-size:16px;font-weight:700;color:#A8F931">${F(totAnnual)}</span>
        </div>
      </div>
      <div>
        <div style="font-size:7px;text-transform:uppercase;letter-spacing:1px;color:#999;font-family:Courier New;margin-bottom:6px">Value by Theme</div>
        ${Object.entries(groups).map(([grp,scs])=>{
          const gv=scs.reduce((a,sc)=>{const r=b.rows?.find(x=>x.sc.id===sc.id);return a+(r?.ann||0);},0);
          const gpct=totAnnual>0?Math.round(gv/totAnnual*100):0;
          const bw=Math.max(2,gpct);
          return `<div style="margin-bottom:7px">
            <div style="display:flex;justify-content:space-between;font-size:7px;font-family:Courier New;color:#555;margin-bottom:2px">
              <span>${grp}</span><span style="font-weight:700;color:#1A1A1A">${F(gv)}</span>
            </div>
            <div style="background:#F0F0F0;height:8px;border-radius:2px"><div style="width:${bw}%;height:8px;background:#A8F931;border-radius:2px"></div></div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `, false);

  // ── Financial Model slide ─────────────────────────────────────────────────
  const yrData = [1,2,3,4,5].map(yr=>{
    const yb = yr===1?b.totY1:yr===2?b.totY2:b.totY3||0;
    const yc = yr===1?(yr0+yr1):yr===2?(yr0+yr1+yr2):(yr0+yr1+yr2*yr);
    return {yr, yb:yb||0, yc, net:(yb||0)-yc};
  });
  const maxFin = Math.max.apply(null, yrData.map(d=>Math.max(d.yb,d.yc)).concat([1]));
  const sF = slideWrap(++n, totalSlides, `
    <div class="slide-title">Financial Model</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div>
        <div class="kpi4" style="grid-template-columns:repeat(2,1fr)">
          <div class="k4"><div class="k4v">${F(npv5)}</div><div class="k4l">5-Year NPV</div></div>
          <div class="k4"><div class="k4v">${roi3}%</div><div class="k4l">3-Yr Net ROI</div></div>
          <div class="k4"><div class="k4v">${pb}</div><div class="k4l">Payback</div></div>
          <div class="k4" style="background:#F0FAE4;border-color:#D4EFA8"><div class="k4v" style="color:#2E7D32">$1:$${invRatio}</div><div class="k4l">Return Ratio</div></div>
        </div>
        <div style="margin-top:12px">
          <div style="font-size:7px;text-transform:uppercase;letter-spacing:1px;color:#999;font-family:Courier New;margin-bottom:6px">Annual Net Position</div>
          ${yrData.map(d=>{
            const posFrac = maxFin>0?Math.round((d.yb/maxFin)*100):0;
            const negFrac = maxFin>0?Math.round((d.yc/maxFin)*100):0;
            const netColor = d.net>=0?'#2E7D32':'#C62828';
            return `<div style="margin-bottom:5px">
              <div style="display:flex;justify-content:space-between;font-size:7px;font-family:Courier New;color:#888;margin-bottom:2px">
                <span>Year ${d.yr}</span><span style="font-weight:700;color:${netColor}">${F(d.net)}</span>
              </div>
              <div style="position:relative;height:8px;background:#F0F0F0;border-radius:2px">
                <div style="position:absolute;top:0;left:0;width:${negFrac}%;height:8px;background:#E0E0E0;border-radius:2px"></div>
                <div style="position:absolute;top:0;left:0;width:${posFrac}%;height:8px;background:${d.net>=0?'#A8F931':'#EF9A9A'};border-radius:2px"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:7px;text-transform:uppercase;letter-spacing:1px;color:#999;font-family:Courier New;margin-bottom:6px">Cumulative Benefit Ramp</div>
        ${deckLineArea([0,b.totY1||0,b.totY2||0,b.totY3||0,b.totY3||0,b.totY3||0],'#A8F931')}
        <table class="sl-table" style="margin-top:10px">
          <thead><tr><th>Year</th><th style="text-align:right">Benefits</th><th style="text-align:right">Investment</th><th style="text-align:right">Net</th></tr></thead>
          <tbody>
            ${yrData.map(d=>`<tr>
              <td>Yr ${d.yr}</td>
              <td style="text-align:right;font-family:Courier New">${F(d.yb)}</td>
              <td style="text-align:right;font-family:Courier New;color:#888">${F(d.yc)}</td>
              <td style="text-align:right;font-family:Courier New;font-weight:700;color:${d.net>=0?'#2E7D32':'#C62828'}">${F(d.net)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `, false);

  // ── Evidence & Disclaimer slide ───────────────────────────────────────────
  const evIds = [...new Set(active.flatMap(s=>s.evidenceIds||[]))].slice(0,6);
  const evItems = evIds.map(id=>{ const e=EVIDENCE.find(x=>x.id===id); return e?`<div class="ev-row"><strong>${e.id}</strong> · ${e.title} <span style="color:#999">· ${e.publisher} ${e.year}</span></div>`:''; }).join('');
  const sE = slideWrap(++n, totalSlides, `
    <div class="slide-title">Evidence & Disclaimer</div>
    <div class="two-col">
      <div>
        <div style="font-size:7px;text-transform:uppercase;letter-spacing:1px;color:#999;font-family:Courier New;margin-bottom:6px">Supporting Evidence</div>
        <div class="ev-block">${evItems||'Evidence referenced inline per scenario.'}</div>
      </div>
      <div>
        <div style="font-size:7px;text-transform:uppercase;letter-spacing:1px;color:#999;font-family:Courier New;margin-bottom:6px">Disclaimer</div>
        <div class="disc" style="font-size:8px;line-height:1.7">Financial estimates are illustrative projections generated from benchmark data and the parameters provided. Actual results depend on deployment scope, operational execution, system integration, and market conditions. Zebra Technologies makes no guarantee of specific outcomes. This model supports internal business case development and pre-sale discovery — not a contractual commitment.</div>
        <div style="margin-top:12px;padding:8px;background:#F8F8F8;border-radius:3px">
          <div style="font-size:7px;font-family:Courier New;color:#999;text-transform:uppercase;margin-bottom:4px">Summary</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <div style="font-size:8px"><span style="color:#999">Scenarios:</span> <strong>${active.length}</strong></div>
            <div style="font-size:8px"><span style="color:#999">Annual Value:</span> <strong>${F(totAnnual)}</strong></div>
            <div style="font-size:8px"><span style="color:#999">Payback:</span> <strong>${pb}</strong></div>
            <div style="font-size:8px"><span style="color:#999">5-Yr NPV:</span> <strong>${F(npv5)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  `, false);

  // ── Deck popup CSS ───────────────────────────────────────────────────────
  const CSS = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#2a2a2a;font-family: 'ZebraSans', Arial, sans-serif;padding:0}
    .toolbar{position:fixed;top:0;left:0;right:0;height:52px;background:#111;display:flex;align-items:center;gap:10px;padding:0 20px;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,.5)}
    .toolbar-title{color:#fff;font-size:13px;font-weight:700;letter-spacing:.5px;flex:1}
    .tb-btn{padding:8px 18px;border-radius:4px;border:none;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:.5px;text-transform:uppercase}
    .tb-pdf{background:#A8F931;color:#000}.tb-pdf:hover{background:#90d920}
    .tb-pptx{background:#fff;color:#000;border:1px solid #555}.tb-pptx:hover{background:#f0f0f0}
    .tb-close{background:transparent;color:#999;border:1px solid #444;font-size:11px}.tb-close:hover{color:#fff;border-color:#fff}
    .slides{padding:72px 0 40px;display:flex;flex-direction:column;align-items:center;gap:24px}
    .slide{width:960px;max-width:96vw}
    .slide-inner{position:relative;width:100%;aspect-ratio:16/9;border-radius:6px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.4);padding:40px 52px 40px}
    .slide-num{position:absolute;top:12px;right:16px;font-size:9px;color:#999;font-family:Courier New;letter-spacing:1px}
    .slide-footer{position:absolute;bottom:10px;left:52px;right:52px;display:flex;justify-content:space-between;font-size:8px;font-family:Courier New;letter-spacing:.5px;text-transform:uppercase}
    .cover-bar{width:60px;height:4px;background:#A8F931;margin-bottom:14px}
    .cover-tag{font-size:9px;font-family:Courier New;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:14px}
    .cover-title{font-size:28px;font-weight:700;line-height:1.15;margin-bottom:8px;color:#fff}
    .cover-co{font-size:16px;color:#A8F931;font-weight:700;margin-bottom:12px}
    .cover-meta{font-size:11px;color:rgba(255,255,255,.45);line-height:1.9}
    .cover-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:18px}
    .ck{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:4px;padding:10px;text-align:center}
    .ck-v{font-size:17px;font-weight:700;color:#A8F931;margin-bottom:2px}
    .ck-l{font-size:7px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.4);font-family:Courier New}
    .slide-title{font-size:20px;font-weight:700;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #A8F931;display:flex;align-items:baseline;gap:10px}
    .slide-title-sub{font-size:10px;font-weight:400;color:#999;font-family:Courier New}
    .slide-sub{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A8F931;margin:12px 0 6px;font-family:Courier New}
    .narr{font-size:9px;color:#888;margin-top:10px;line-height:1.6;font-style:italic}
    .kpi4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    .k4{background:#F8F8F8;border:1px solid #E6E6E6;border-radius:4px;padding:10px;text-align:center}
    .k4v{font-size:18px;font-weight:700;margin-bottom:2px}
    .k4l{font-size:7px;text-transform:uppercase;letter-spacing:1px;color:#757575;font-family:Courier New}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
    .two-col-6{display:grid;grid-template-columns:3fr 2fr;gap:20px;align-items:start}
    .sl-table{width:100%;border-collapse:collapse;font-size:9px;margin-top:4px}
    .sl-table th{background:#1A1A1A;color:#fff;padding:5px 7px;text-align:left;font-size:7px;text-transform:uppercase;letter-spacing:.5px;font-family:Courier New}
    .sl-table td{padding:4px 7px;border-bottom:1px solid #EDEDED;vertical-align:middle}
    .sl-table tr:nth-child(even) td{background:#F9F9F9}
    .tot-row td{background:#F0FAE4!important;font-weight:700;border-top:2px solid #A8F931;font-size:10px}
    .sc-card{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;padding:5px 7px;border-bottom:1px solid #EDEDED}
    .sc-id{font-size:7px;font-family:Courier New;color:#A8F931;background:#111;padding:2px 4px;border-radius:2px;white-space:nowrap}
    .sc-name{font-size:9px;font-weight:600;color:#1A1A1A}
    .sc-ann{font-size:11px;font-weight:700;font-family:Courier New;text-align:right;white-space:nowrap}
    .sc-bar-bg{height:4px;background:#F0F0F0;border-radius:2px;margin-top:2px}
    .sc-bar-fg{height:4px;background:#A8F931;border-radius:2px}
    .ev-block{font-size:8px;line-height:1.8;color:#404040;margin-bottom:10px}
    .ev-row{padding:3px 0;border-bottom:1px solid #F0F0F0}
    .disc{font-size:7px;color:#999;line-height:1.6;border-top:1px solid #E6E6E6;padding-top:8px;font-style:italic}
    @media print{
      body{background:#fff;padding:0}
      .toolbar{display:none!important}
      .slides{padding:0;gap:0}
      .slide{width:100%;max-width:100%;page-break-after:always}
      .slide-inner{border-radius:0;box-shadow:none;aspect-ratio:16/9;width:100%;overflow:hidden}
      @page{size:landscape;margin:0}
    }
  `;

  const allSlides = [s1, s2, s3, ...groupSlides, sB, sF, sE].join('');

  const popHTML = `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8">
    <title>${co} — RFID Value Deck</title>
    <style>${CSS}</style>
  </head><body>
  <div class="toolbar">
    <div class="toolbar-title">📊 ${titleS} — ${co} &nbsp;·&nbsp; ${totalSlides} slides</div>
    <button class="tb-btn tb-pdf" onclick="window.print()">🖨 Save as PDF</button>
    <button class="tb-btn tb-pptx" id="pptx-dl-btn" onclick="tryPPTX()">⬇ Download PPTX</button>
    <button class="tb-btn tb-close" onclick="window.close()">✕ Close</button>
  </div>
  <div class="slides">${allSlides}</div>
  <script>
  function tryPPTX(){
    var btn=document.getElementById('pptx-dl-btn');
    // Signal back to parent to run the PPTX generator
    if(window.opener && window.opener.runPPTXDownload){
      btn.textContent='⏳ Building…';
      btn.disabled=true;
      window.opener.runPPTXDownload(btn);
    } else {
      alert('PPTX download requires the app window to still be open. Please keep the main window open and try again.');
    }
  }
  <\/script>
  </body></html>`;

  const win = window.open('','_blank');
  if(!win){ alert('Pop-up blocked. Please allow pop-ups for this page and try again.'); return; }
  win.document.write(popHTML);
  win.document.close();
}

// ── PPTX download — called directly from main button ─────────────────────
async function runPPTXDownload(callerBtn) {
  // callerBtn is the main Export Deck button passed directly via onclick="runPPTXDownload(this)"
  if(typeof PptxGenJS === 'undefined') {
    alert('PPTX library not found — please reload the app.');
    return;
  }
  if(callerBtn){ callerBtn.textContent='⏳ Building deck…'; callerBtn.disabled=true; }

  try {
    ensureCosts();
    if(!state.benefits || !state.benefits.totAnnual) renderROI();

    // ── State ──────────────────────────────────────────────────────────────
    const co      = document.getElementById('i-customer')?.value  || 'Your Customer';
    const vendor  = document.getElementById('i-company')?.value   || 'Zebra Technologies';
    const title   = document.getElementById('i-title')?.value     || 'RFID Strategic Value Analysis';
    const seller  = document.getElementById('i-seller')?.value    || '';
    const partners= document.getElementById('i-partners')?.value  || 'Zebra Technologies';
    const pain    = document.getElementById('i-pain')?.value      || '';
    const b       = state.benefits;
    const c       = state.costs;
    const active  = SCENARIOS.filter(s=>state.selectedIds.has(s.id));
    const dateStr = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
    const FN      = BRAND.fonts; // font names

    // ── Colors — ALL-DARK PALETTE ──────────────────────────────────────────
    const payback  = b.totAnnual>0 ? Math.round((c.yr0/(b.totAnnual/12))*10)/10 : 99;
    const yr0net   = -(c.yr0||0);
    const yr1net   = (b.totY1||0)-(c.yr1||0);
    const yr2net   = (b.totY2||0)-(c.yr2||0);
    const yr3net   = (b.totAnnual||0)-(c.yr2||0);
    const npv5     = Math.round((yr1net/1.1)+(yr2net/1.21)+(yr3net/1.331)+(yr3net/1.464)+(yr3net/1.611));
    const irr      = typeof estimateIRR==='function' ? estimateIRR([yr0net,yr1net,yr2net,yr3net,yr3net]) : '—';
    const roi3     = c.yr0>0 ? Math.round(((b.totY1+b.totY2+b.totAnnual-(c.yr0+c.yr1+c.yr2+c.yr2))/(c.yr0+c.yr1+c.yr2+c.yr2))*100) : 0;
    const bc3      = c.yr2>0 ? (b.totAnnual/c.yr2).toFixed(1)+'x' : '—';
    const groups   = {};
    active.forEach(sc=>{ const k=sc.vertical||sc.theme||'Other'; if(!groups[k]) groups[k]=[]; groups[k].push(sc); });

    // ── PALETTE — white deck, Zebra brand ──────────────────────────────────
    const Z={
      WHITE:  'FFFFFF',
      BG:     'F7F8FA',     // near-white slide bg
      CARD:   'FFFFFF',     // card surface
      BORDER: 'E2E6EA',     // light rule
      INK:    '1A1A2E',     // near-black headings
      BODY:   '4A5568',     // body text
      MUTED:  '94A3B8',     // captions/labels
      GREEN:  'A8F931',     // Zebra lime — accent only
      GNBG:   '1A2E0A',     // dark green bg for green-on-dark chips
      BLACK:  '000000',     // cover / dark slides
      RED:    'DC2626',
      AMBER:  'D97706',
      BLUE:   '2563EB',
      TEAL:   '0891B2',
    };

    // Utility
    const fmt$ = v => '$'+Math.round(v||0).toLocaleString();
    const pres  = new PptxGenJS();
    pres.layout  = 'LAYOUT_WIDE';
    pres.author  = 'Zebra Technologies';
    pres.title   = co+' — RFID Value Case';
    let slideN   = 0;

    // ── EMBEDDED ASSETS ────────────────────────────────────────────────────
    const PPTX_LOGO_DARK_BG  = 'data:image/svg+xml;base64,PHN2ZyBpZD0iSG9yaXpvbnRhbF9Mb2dvIiBkYXRhLW5hbWU9Ikhvcml6b250YWwgTG9nbyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTcyLjMxIDE3Ny4yNyI+IDxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iMTAwLjQ0IDUzLjg1IDEwMC40MyA1My44NSAxMDAuNDQgNTMuODYgMTAwLjQ0IDUzLjg1Ii8+CiAgPHBvbHlnb24gZmlsbD0iI2ZmZiIgcG9pbnRzPSIwIDk0Ljc0IDgyLjgxIDE3Ny4yNyA4Mi44MSAxNTkuNjggMCA3Ny4xMyAwIDk0Ljc0Ii8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyNi40LDc5LjcxaDBzLTEyLjk0LTEyLjk0LTEyLjk0LTEyLjk0aC0xNy43cy0xMi45Ni0xMi45Mi0xMi45Ni0xMi45MmgxNy42MmwtMTIuODItMTIuOS0xNy43Ni4wM0wzNS4yOSw2LjYyYy0yLjczLDEuMTQtOC45Niw1LjE4LTEwLjc2LDYuNzdsMzIuMzYsMzIuMjd2NzAuNDdsMjUuOTEsMjUuODJ2LTE3LjYybC0xMi45Ny0xMi45MnYtNTcuNTdoMTIuOTd2NTkuMThoMTIuOTZ2LTQ2LjI2bDEyLjkzLDEyLjkzdjMzLjMzaDEyLjk2czAtMjAuNDQsMC0yMC40NGwtMTIuOTYtMTIuODloMTcuNzFaIi8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTkwLjQxLDIwLjQ4YzAtMTEuMzItOS4xOS0yMC40OC0yMC41NS0yMC40OHY0MC45N2MxMS4zNSwwLDIwLjU1LTkuMTcsMjAuNTUtMjAuNDhaIi8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTQzLjk1LDEwMy4yN3YtNTIuOTRTMTUuNDcsMjEuOTQsMTUuNDcsMjEuOTRjLTIuNjYsMy4wMS01LjQ1LDcuMDktNy4zLDEwLjM0bDIyLjgzLDIyLjc4djE3LjdMMi44MSw0NC42NkMxLjI3LDUwLC4zOCw1NC4zOS4xMSw1OS41N2w0My44Myw0My43aC4wMVoiLz4KICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMzk0LjE4LDg2LjI4YzEzLjEzLTMuMiwxNS45NS0xNC41NiwxNS45NS0yMC45LDAtOC42NS0zLjg4LTE2LjMyLTEwLjI3LTIwLjEtNS0zLjExLTExLjc5LTQuMzItMjMuNTktNC4zMmguMDFzLTMxLjYzLDAtMzEuNjMsMHY4OS45OWgzNy44OGM5LjQzLDAsMTQuOTgtMS4yNSwxOS41Ni00LjIyLDUuOTctMy45MSw5LjQzLTExLjMyLDkuNDMtMTkuNjgsMC02LjYxLTIuMDctMTEuODctNi4yNS0xNS42NS0yLjkxLTIuNy01LjQyLTMuOTItMTEuMS01LjEzWk0zNjcuMTQsNTcuMjhoNS4yNmMxMC41MywwLDE0Ljg0LDIuOTcsMTQuODQsMTAuMzlzLTQuMywxMC41MS0xNC41NiwxMC41MWgtNS41NHYtMjAuOVpNMzc1LjMxLDExNS4yOGgtOC4xOXMuMDEtMjEuMTguMDEtMjEuMThoNS4xMmM2LjgsMCw5LjAzLjI2LDExLjUyLDEuNjEsMy4zMywxLjc2LDUsNC44NSw1LDkuMTcsMCw3LjI4LTQuMDMsMTAuMzktMTMuNDYsMTAuMzlaIi8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTU0My4xMyw0MC45OGgtMjcuNTRsLTI4LjMyLDg2LjgtMTkuOS0zMy42N2gtLjAxYzEzLjU4LTQuMjIsMTkuNTEtMTQuMjYsMTkuNTEtMjUuNzMsMC0yNC40My0yMi4xMi0yNy40LTM0LjMyLTI3LjRoLTMyLjEydjg5Ljk5aDIyLjQ5di0zNy4zMmwyMC4yNiwzNy4zMmg0NS44Nmw1LjQ3LTE3LjcxaDI4LjgxbDUuNDcsMTcuNzFoMjMuNTJsLTI5LjE4LTg5Ljk5Wk00NDkuNzUsNzkuOThoLTYuODZ2LTIyLjY5aDYuNjFjOS41MywwLDE1LjM4LDIuMjYsMTUuMzgsMTAuOTMsMCwxMC41LTUuODUsMTEuNzYtMTUuMTMsMTEuNzZaTTUxOS45Nyw5NS40Mmw4Ljk0LTI4LjY5LDguOTMsMjguNjloLTE3Ljg3WiIvPgogIDxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iMjc3LjM0IDEzMC45NiAzMzMuNjUgMTMwLjk2IDMzMy42NSAxMTMuMjkgMjk5LjA0IDExMy4yOSAyOTkuMDQgOTQuNzEgMzI4LjM4IDk0LjcxIDMyOC4zOCA3Ny4wNSAyOTkuMDQgNzcuMDUgMjk5LjA0IDU4LjY1IDMzMy42NSA1OC42NSAzMzMuNjUgNDAuOTggMjc3LjM0IDQwLjk4IDI3Ny4zNCAxMzAuOTYiLz4KICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTM0LjYsOTguOGwtLjA2LDE0LjIyaC0xMi44OWMwLDExLjMyLDkuMTksMjAuNDgsMjAuNTUsMjAuNDhzMjAuNTUtOS4xNywyMC41NS0yMC40OGgwdi0uMDNsLTE0LjI1LTE0LjJoLTEzLjg5WiIvPgogIDxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iMjA5Ljg5IDQwLjk4IDIwMC4zNCA1OC42NSAyMzQuNjMgNTguNjUgMTk1Ljg5IDEzMC45NiAyNTUuNDcgMTMwLjk2IDI2NS4wMyAxMTMuMyAyMzAuNzQgMTEzLjMgMjY5LjQ3IDQwLjk4IDIwOS44OSA0MC45OCIvPgo8L3N2Zz4=';
    const PPTX_LOGO_LIGHT_BG = 'data:image/svg+xml;base64,PHN2ZyBpZD0iSG9yaXpvbnRhbF9Mb2dvIiBkYXRhLW5hbWU9Ikhvcml6b250YWwgTG9nbyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTcyLjMxIDE3Ny4yNyI+CiAgPHBvbHlnb24gcG9pbnRzPSIxMDAuNDQgNTMuODUgMTAwLjQzIDUzLjg1IDEwMC40NCA1My44NiAxMDAuNDQgNTMuODUiLz4KICA8cG9seWdvbiBwb2ludHM9IjAgOTQuNzQgODIuODEgMTc3LjI3IDgyLjgxIDE1OS42OCAwIDc3LjEzIDAgOTQuNzQiLz4KICA8cGF0aCBkPSJNMTI2LjQsNzkuNzFoMHMtMTIuOTQtMTIuOTQtMTIuOTQtMTIuOTRoLTE3LjdzLTEyLjk2LTEyLjkyLTEyLjk2LTEyLjkyaDE3LjYybC0xMi44Mi0xMi45LTE3Ljc2LjAzTDM1LjI5LDYuNjJjLTIuNzMsMS4xNC04Ljk2LDUuMTgtMTAuNzYsNi43N2wzMi4zNiwzMi4yN3Y3MC40N2wyNS45MSwyNS44MnYtMTcuNjJsLTEyLjk3LTEyLjkydi01Ny41N2gxMi45N3Y1OS4xOGgxMi45NnYtNDYuMjZsMTIuOTMsMTIuOTN2MzMuMzNoMTIuOTZzMC0yMC40NCwwLTIwLjQ0bC0xMi45Ni0xMi44OWgxNy43MVoiLz4KICA8cGF0aCBkPSJNOTAuNDEsMjAuNDhjMC0xMS4zMi05LjE5LTIwLjQ4LTIwLjU1LTIwLjQ4djQwLjk3YzExLjM1LDAsMjAuNTUtOS4xNywyMC41NS0yMC40OFoiLz4KICA8cGF0aCBkPSJNNDMuOTUsMTAzLjI3di01Mi45NFMxNS40NywyMS45NCwxNS40NywyMS45NGMtMi42NiwzLjAxLTUuNDUsNy4wOS03LjMsMTAuMzRsMjIuODMsMjIuNzh2MTcuN0wyLjgxLDQ0LjY2QzEuMjcsNTAsLjM4LDU0LjM5LjExLDU5LjU3bDQzLjgzLDQzLjdoLjAxWiIvPgogIDxwYXRoIGQ9Ik0zOTQuMTgsODYuMjhjMTMuMTMtMy4yLDE1Ljk1LTE0LjU2LDE1Ljk1LTIwLjksMC04LjY1LTMuODgtMTYuMzItMTAuMjctMjAuMS01LTMuMTEtMTEuNzktNC4zMi0yMy41OS00LjMyaC4wMXMtMzEuNjMsMC0zMS42Mywwdjg5Ljk5aDM3Ljg4YzkuNDMsMCwxNC45OC0xLjI1LDE5LjU2LTQuMjIsNS45Ny0zLjkxLDkuNDMtMTEuMzIsOS40My0xOS42OCwwLTYuNjEtMi4wNy0xMS44Ny02LjI1LTE1LjY1LTIuOTEtMi43LTUuNDItMy45Mi0xMS4xLTUuMTNaTTM2Ny4xNCw1Ny4yOGg1LjI2YzEwLjUzLDAsMTQuODQsMi45NywxNC44NCwxMC4zOXMtNC4zLDEwLjUxLTE0LjU2LDEwLjUxaC01LjU0di0yMC45Wk0zNzUuMzEsMTE1LjI4aC04LjE5cy4wMS0yMS4xOC4wMS0yMS4xOGg1LjEyYzYuOCwwLDkuMDMuMjYsMTEuNTIsMS42MSwzLjMzLDEuNzYsNSw0Ljg1LDUsOS4xNywwLDcuMjgtNC4wMywxMC4zOS0xMy40NiwxMC4zOVoiLz4KICA8cGF0aCBkPSJNNTQzLjEzLDQwLjk4aC0yNy41NGwtMjguMzIsODYuOC0xOS45LTMzLjY3aC0uMDFjMTMuNTgtNC4yMiwxOS41MS0xNC4yNiwxOS41MS0yNS43MywwLTI0LjQzLTIyLjEyLTI3LjQtMzQuMzItMjcuNGgtMzIuMTJ2ODkuOTloMjIuNDl2LTM3LjMybDIwLjI2LDM3LjMyaDQ1Ljg2bDUuNDctMTcuNzFoMjguODFsNS40NywxNy43MWgyMy41MmwtMjkuMTgtODkuOTlaTTQ0OS43NSw3OS45OGgtNi44NnYtMjIuNjloNi42MWM5LjUzLDAsMTUuMzgsMi4yNiwxNS4zOCwxMC45MywwLDEwLjUtNS44NSwxMS43Ni0xNS4xMywxMS43NlpNNTE5Ljk3LDk1LjQybDguOTQtMjguNjksOC45MywyOC42OWgtMTcuODdaIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIyNzcuMzQgMTMwLjk2IDMzMy42NSAxMzAuOTYgMzMzLjY1IDExMy4yOSAyOTkuMDQgMTEzLjI5IDI5OS4wNCA5NC43MSAzMjguMzggOTQuNzEgMzI4LjM4IDc3LjA1IDI5OS4wNCA3Ny4wNSAyOTkuMDQgNTguNjUgMzMzLjY1IDU4LjY1IDMzMy42NSA0MC45OCAyNzcuMzQgNDAuOTggMjc3LjM0IDEzMC45NiIvPgogIDxwYXRoIGQ9Ik0xMzQuNiw5OC44bC0uMDYsMTQuMjJoLTEyLjg5YzAsMTEuMzIsOS4xOSwyMC40OCwyMC41NSwyMC40OHMyMC41NS05LjE3LDIwLjU1LTIwLjQ4aDB2LS4wM2wtMTQuMjUtMTQuMmgtMTMuODlaIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIyMDkuODkgNDAuOTggMjAwLjM0IDU4LjY1IDIzNC42MyA1OC42NSAxOTUuODkgMTMwLjk2IDI1NS40NyAxMzAuOTYgMjY1LjAzIDExMy4zIDIzMC43NCAxMTMuMyAyNjkuNDcgNDAuOTggMjA5Ljg5IDQwLjk4Ii8+Cjwvc3ZnPg==';


    // Logo top-right on white body slides
    const addLogo = (sl) => {
      sl.addImage({data:PPTX_LOGO_LIGHT_BG,x:11.3,y:0.08,w:1.85,h:0.57});
    };

    // ── FOOTER ──────────────────────────────────────────────────────────────
    const addFooter = (sl, txt) => {
      sl.addShape(pres.shapes.RECTANGLE,{x:0,y:7.28,w:13.33,h:0.22,fill:{color:Z.BG},line:{color:Z.BORDER,width:0}});
      sl.addShape(pres.shapes.RECTANGLE,{x:0,y:7.28,w:13.33,h:0.02,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
      sl.addText('ZEBRA TECHNOLOGIES',{x:0.4,y:7.32,w:3,h:0.14,fontSize:6,color:Z.MUTED,fontFace:FN.pptxMono,bold:true,charSpacing:2});
      sl.addText(txt||'',{x:3.5,y:7.32,w:6.3,h:0.14,fontSize:6,color:Z.MUTED,fontFace:FN.pptxMono,align:'center'});
      sl.addText(String(++slideN),{x:12.3,y:7.32,w:0.6,h:0.14,fontSize:6,color:Z.MUTED,fontFace:FN.pptxMono,align:'right'});
    };

    // ── HEADER — thin green rule + eyebrow + title ──────────────────────────
    const hdr = (sl, eyebrow, hdTitle, sub) => {
      sl.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:13.33,h:0.04,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
      sl.addText(eyebrow,{x:0.5,y:0.12,w:10,h:0.2,fontSize:7,color:Z.GREEN,fontFace:FN.pptxMono,charSpacing:4,bold:true});
      sl.addText(hdTitle,{x:0.5,y:0.34,w:10.8,h:0.52,fontSize:22,color:Z.INK,fontFace:FN.pptxHead,bold:true,autoFit:true});
      sl.addShape(pres.shapes.RECTANGLE,{x:0.5,y:0.94,w:12.5,h:0.015,fill:{color:Z.BORDER},line:{color:Z.BORDER,width:0}});
    };

    // ── SECTION DIVIDER — dark with green accent ────────────────────────────
    const secDiv = (eyebrow, headline, sub) => {
      const s = pres.addSlide(); s.background={color:'000000'};
      // Left lime bar
      s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:0.5,h:7.5,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
      // Bottom rule
      s.addShape(pres.shapes.RECTANGLE,{x:0,y:7.44,w:13.33,h:0.06,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
      s.addText(eyebrow,{x:1.0,y:1.4,w:11,h:0.3,fontSize:9,color:Z.GREEN,fontFace:FN.pptxMono,charSpacing:6,bold:true});
      s.addText(headline,{x:1.0,y:1.9,w:9,h:3.6,fontSize:58,color:Z.WHITE,fontFace:FN.pptxHead,bold:true,autoFit:true});
      if(sub) s.addText(sub,{x:1.0,y:5.8,w:11,h:0.4,fontSize:11,color:Z.MUTED,fontFace:FN.pptxBody});
      s.addImage({data:PPTX_LOGO_DARK_BG,x:10.5,y:0.1,w:2.6,h:0.8});
      s.addText(co+' · '+dateStr,{x:1.0,y:6.7,w:11,h:0.3,fontSize:8,color:'444444',fontFace:FN.pptxMono,charSpacing:2});
      slideN++;
      return s;
    };

    // ── METRIC TILE — white card with lime top rule ─────────────────────────
    const mTile = (sl, x, y, w, h, label, val, sub, accent) => {
      const ac = accent||Z.GREEN;
      sl.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:Z.CARD},line:{color:Z.BORDER,width:0.5}});
      sl.addShape(pres.shapes.RECTANGLE,{x,y,w,h:0.05,fill:{color:ac},line:{color:ac,width:0}});
      sl.addText(label,{x:x+0.16,y:y+0.14,w:w-0.32,h:0.2,fontSize:6.5,color:Z.MUTED,fontFace:FN.pptxMono,charSpacing:1,bold:true});
      sl.addText(val,  {x:x+0.16,y:y+0.38,w:w-0.32,h:0.68,fontSize:22,color:ac===Z.GREEN?Z.INK:ac,fontFace:FN.pptxHead,bold:true,autoFit:true});
      if(sub) sl.addText(sub,{x:x+0.16,y:y+1.08,w:w-0.32,h:0.2,fontSize:8,color:Z.MUTED,fontFace:FN.pptxBody});
    };

    // ── BIG STAT — huge number, label below ────────────────────────────────
    const bigStat = (sl, x, y, w, val, label, accent) => {
      const ac = accent||Z.GREEN;
      sl.addText(val,{x,y,w,h:0.8,fontSize:38,color:ac===Z.GREEN?Z.INK:ac,fontFace:FN.pptxHead,bold:true,align:'center',autoFit:true});
      sl.addShape(pres.shapes.RECTANGLE,{x:x+w/2-0.4,y:y+0.78,w:0.8,h:0.04,fill:{color:ac},line:{color:ac,width:0}});
      sl.addText(label,{x,y:y+0.88,w,h:0.2,fontSize:7.5,color:Z.MUTED,fontFace:FN.pptxMono,align:'center',charSpacing:1});
    };

    // ══════════════════════════════════════════════════════════════════════
    // SLIDE 1 — COVER
    // ══════════════════════════════════════════════════════════════════════
    let s = pres.addSlide(); s.background={color:'000000'}; slideN++;
    // Left green accent bar
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:0.5,h:7.5,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
    // Top + bottom green rules
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:13.33,h:0.04,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:7.46,w:13.33,h:0.04,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
    // Zebra logo top right
    s.addImage({data:PPTX_LOGO_DARK_BG,x:10.5,y:0.1,w:2.6,h:0.8});
    // Eyebrow
    s.addText('RFID  ·  STRATEGIC VALUE CASE',{x:0.9,y:1.4,w:9,h:0.28,fontSize:8,color:Z.GREEN,fontFace:FN.pptxMono,charSpacing:5,bold:true});
    // Company name — big
    s.addText(co,{x:0.9,y:1.82,w:11.0,h:2.6,fontSize:54,color:Z.WHITE,fontFace:FN.pptxHead,bold:true,autoFit:true});
    // Pain / tagline
    if(pain){
      const painParts=pain.split(';').map(p=>p.trim()).filter(Boolean).slice(0,3);
      s.addText(painParts.join('  ·  '),{x:0.9,y:4.6,w:11,h:0.4,fontSize:10,color:'888888',fontFace:FN.pptxBody,autoFit:true});
    }
    // Presenter + date
    s.addText('Presented by '+partners+'  ·  '+dateStr,{x:0.9,y:5.1,w:11,h:0.26,fontSize:9,color:'555555',fontFace:FN.pptxBody});
    // KPI row — simple, no dark box
    s.addShape(pres.shapes.RECTANGLE,{x:0.9,y:5.9,w:11.5,h:0.02,fill:{color:'333333'},line:{color:'333333',width:0}});
    [[fmt$(b.totAnnual),'ANNUAL BENEFIT'],[payback+'mo','PAYBACK'],[fmt$(npv5),'5-YR NPV'],[roi3+'%','3-YR ROI']].forEach(([v,l],i)=>{
      const sx=0.9+i*2.88;
      if(i>0) s.addShape(pres.shapes.RECTANGLE,{x:sx,y:5.96,w:0.01,h:1.1,fill:{color:'333333'},line:{color:'333333',width:0}});
      s.addText(v,{x:sx+0.12,y:5.96,w:2.7,h:0.62,fontSize:22,color:Z.GREEN,fontFace:FN.pptxHead,bold:true,align:'center',autoFit:true});
      s.addText(l,{x:sx+0.12,y:6.62,w:2.7,h:0.18,fontSize:6,color:'666666',fontFace:FN.pptxMono,align:'center',charSpacing:2});
    });

    // ══════════════════════════════════════════════════════════════════════
    // SLIDE 2 — THE SITUATION
    // ══════════════════════════════════════════════════════════════════════
    s = pres.addSlide(); s.background={color:Z.BG};
    hdr(s,'THE SITUATION','Where Things Stand Today',co); addLogo(s);
    const painBullets=pain?pain.split(';').map(p=>p.trim()).filter(Boolean):[];
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:1.12,w:7.6,h:5.5,fill:{color:Z.CARD},line:{color:Z.BORDER,width:0.5}});
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:1.12,w:0.06,h:5.5,fill:{color:Z.RED},line:{color:Z.RED,width:0}});
    s.addText('CURRENT STATE',{x:0.76,y:1.22,w:7,h:0.2,fontSize:7,color:Z.RED,fontFace:FN.pptxMono,charSpacing:3,bold:true});
    if(painBullets.length){
      painBullets.forEach((pt,i)=>{
        const by=1.56+i*1.1;
        s.addShape(pres.shapes.RECTANGLE,{x:0.72,y:by,w:7.2,h:0.9,fill:{color:Z.BG},line:{color:Z.BORDER,width:0.5}});
        s.addShape(pres.shapes.RECTANGLE,{x:0.72,y:by,w:7.2,h:0.035,fill:{color:Z.RED,transparency:40},line:{color:Z.RED,width:0}});
        s.addText(pt,{x:0.9,y:by+0.1,w:6.8,h:0.72,fontSize:11,color:Z.INK,fontFace:FN.pptxBody,autoFit:true});
      });
    } else {
      s.addText('Complete the Pain Statement field in Step 1 to populate this slide with customer-specific challenges.',
        {x:0.76,y:1.6,w:7.1,h:1,fontSize:10,color:Z.MUTED,fontFace:FN.pptxBody,italic:true,autoFit:true});
    }
    s.addShape(pres.shapes.RECTANGLE,{x:8.4,y:1.12,w:4.55,h:5.5,fill:{color:Z.INK},line:{color:Z.INK,width:0}});
    s.addShape(pres.shapes.RECTANGLE,{x:8.4,y:1.12,w:0.06,h:5.5,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
    s.addText('WITH RFID',{x:8.62,y:1.24,w:4.1,h:0.2,fontSize:7,color:Z.GREEN,fontFace:FN.pptxMono,charSpacing:3,bold:true});
    [['93–99%','Inventory accuracy vs. low 70s today'],['10 sec','Per item vs. 3 min manual count'],['≤7 mo','Typical cash payback period'],['Always-on','Item visibility at every location']].forEach(([v,l],i)=>{
      const by=1.62+i*1.2;
      s.addText(v,{x:8.66,y:by,w:4.1,h:0.44,fontSize:22,color:Z.GREEN,fontFace:FN.pptxHead,bold:true,autoFit:true});
      s.addText(l,{x:8.66,y:by+0.44,w:4.1,h:0.26,fontSize:9,color:'AAAAAA',fontFace:FN.pptxBody,autoFit:true});
    });
    addFooter(s,co+' — Situation');

    // ══════════════════════════════════════════════════════════════════════
    // SLIDE 3 — FULL INVESTMENT SNAPSHOT
    // ══════════════════════════════════════════════════════════════════════
    s = pres.addSlide(); s.background={color:Z.BG};
    hdr(s,'EXECUTIVE SUMMARY','The Investment Case',co); addLogo(s);

    // ── ROW 1: 6 KPI tiles ──────────────────────────────────────────────
    const kW=2.0, kH=1.38, kGap=0.13;
    const kX0=0.5;
    const roi5 = c.yr0>0 ? Math.round(((b.totY1+b.totY2+b.totAnnual+b.totAnnual+b.totAnnual-(c.yr0+c.yr1+c.yr2*4))/(c.yr0+c.yr1+c.yr2*4))*100) : 0;
    [
      [fmt$(b.totAnnual),'ANNUAL BENEFIT','yr 3 steady state',Z.GREEN],
      [payback+'mo',     'PAYBACK',       'months to recover yr 0',Z.INK],
      [fmt$(npv5),       '5-YEAR NPV',    'at 10% discount rate',Z.TEAL],
      [irr+'%',          'IRR',           'unlevered pre-tax',Z.BLUE],
      [roi3+'%',         '3-YEAR ROI',    'net return on investment',Z.AMBER],
      [roi5+'%',         '5-YEAR ROI',    'net return on investment',Z.BLUE],
    ].forEach(([v,l,sub,ac],i)=>mTile(s,kX0+i*(kW+kGap),1.1,kW,kH,l,v,sub,ac));

    // ── ROW 2 LEFT: Project summary panel ───────────────────────────────
    const sumX=0.5, sumY=2.66, sumW=4.5, sumH=4.36;
    s.addShape(pres.shapes.RECTANGLE,{x:sumX,y:sumY,w:sumW,h:sumH,fill:{color:Z.INK},line:{color:Z.INK,width:0}});
    s.addShape(pres.shapes.RECTANGLE,{x:sumX,y:sumY,w:sumW,h:0.04,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
    s.addText('PROJECT SUMMARY',{x:sumX+0.18,y:sumY+0.12,w:sumW-0.36,h:0.2,fontSize:7,color:Z.GREEN,fontFace:FN.pptxMono,charSpacing:3,bold:true});

    // Summary rows
    const sumRows=[
      ['Customer',    co],
      ['Scenarios',   active.length+' selected'],
      ['Yr 0 Invest', fmt$(c.yr0||0)],
      ['Annual OpEx', fmt$(c.yr2||0)],
      ['5-Yr Benefit',fmt$((b.totAnnual||0)*3+(b.totY1||0)+(b.totY2||0))],
      ['Net 5-Yr',    fmt$(((b.totAnnual||0)*3+(b.totY1||0)+(b.totY2||0))-((c.yr0||0)+(c.yr2||0)*4+(c.yr1||0)))],
      ['B:C Ratio',   bc3],
      ['Pain Signal', pain ? pain.split(';')[0].trim().substring(0,38) : '—'],
    ];
    sumRows.forEach(([lbl,val],i)=>{
      const ry=sumY+0.46+i*0.48;
      s.addShape(pres.shapes.RECTANGLE,{x:sumX,y:ry,w:sumW,h:0.44,fill:{color:i%2===0?'111111':'0A0A0A'},line:{color:'1E1E1E',width:0}});
      s.addText(lbl,{x:sumX+0.18,y:ry+0.08,w:1.6,h:0.28,fontSize:8,color:'888888',fontFace:FN.pptxMono,charSpacing:0.5});
      s.addText(val,{x:sumX+1.86,y:ry+0.08,w:sumW-2.04,h:0.28,fontSize:8.5,color:Z.WHITE,fontFace:FN.pptxMono,bold:false,autoFit:true});
    });

    // ── ROW 2 RIGHT: 5-year benefit bar chart ───────────────────────────
    const chX=5.22, chY=2.66, chW=8.1, chH=4.36;
    s.addShape(pres.shapes.RECTANGLE,{x:chX,y:chY,w:chW,h:chH,fill:{color:Z.CARD},line:{color:Z.BORDER,width:0.5}});
    s.addShape(pres.shapes.RECTANGLE,{x:chX,y:chY,w:chW,h:0.04,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
    s.addText('BENEFIT RAMP  ·  5 YEARS',{x:chX+0.18,y:chY+0.12,w:chW-0.36,h:0.2,fontSize:7,color:Z.MUTED,fontFace:FN.pptxMono,charSpacing:3,bold:true});

    // Y1-Y5 values (Y4 and Y5 carry Y3 steady-state)
    const yrVals=[b.totY1||0, b.totY2||0, b.totAnnual||0, b.totAnnual||0, b.totAnnual||0];
    const yrLabels=['YR 1','YR 2','YR 3','YR 4','YR 5'];
    const yrColors=['B8C0CC','9CA3AF','6B7280', Z.INK, Z.INK];
    const maxYr=Math.max(...yrVals,1);
    const barAreaX=chX+0.5, barAreaW=chW-0.7;
    const barAreaY=chY+0.46, barAreaH=chH-1.08;
    const bW5=barAreaW/5-0.14, bGap5=0.14;

    // Horizontal grid lines (3 levels)
    [0.33,0.66,1.0].forEach(f=>{
      const lineY=barAreaY+barAreaH*(1-f);
      s.addShape(pres.shapes.RECTANGLE,{x:barAreaX,y:lineY,w:barAreaW,h:0.01,fill:{color:Z.BORDER},line:{color:Z.BORDER,width:0}});
      s.addText(fmt$(maxYr*f),{x:chX+0.02,y:lineY-0.12,w:0.55,h:0.2,fontSize:6.5,color:Z.MUTED,fontFace:FN.pptxMono,align:'right'});
    });

    yrVals.forEach((v,i)=>{
      const bh=(v/maxYr)*barAreaH;
      const bx=barAreaX+i*(bW5+bGap5);
      const by=barAreaY+barAreaH-bh;
      const isFullRunRate=(i>=2);
      // Bar fill
      s.addShape(pres.shapes.RECTANGLE,{x:bx,y:by,w:bW5,h:bh,
        fill:{color:isFullRunRate?Z.INK:'E2E8F0'},line:{color:isFullRunRate?'334155':Z.BORDER,width:0.5}});
      // Green cap
      if(bh>0.06) s.addShape(pres.shapes.RECTANGLE,{x:bx,y:by,w:bW5,h:0.05,
        fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
      // Value label above bar
      s.addText(fmt$(v),{x:bx-0.1,y:by-0.28,w:bW5+0.2,h:0.24,fontSize:8.5,
        color:isFullRunRate?Z.INK:Z.BODY,fontFace:FN.pptxMono,bold:isFullRunRate,align:'center',autoFit:true});
      // Year label below
      s.addText(yrLabels[i],{x:bx,y:barAreaY+barAreaH+0.06,w:bW5,h:0.2,fontSize:7.5,
        color:Z.MUTED,fontFace:FN.pptxMono,align:'center'});
      // % of run-rate badge
      const pctV=Math.round(v/maxYr*100);
      if(!isFullRunRate){
        s.addText(pctV+'%',{x:bx,y:by+0.08,w:bW5,h:0.22,fontSize:8,
          color:Z.MUTED,fontFace:FN.pptxMono,align:'center'});
      } else {
        s.addText('STEADY STATE',{x:bx,y:by+0.08,w:bW5,h:0.22,fontSize:6,
          color:Z.GREEN,fontFace:FN.pptxMono,align:'center',charSpacing:0.5,bold:true});
      }
    });

    // Callout strip at bottom of chart
    s.addShape(pres.shapes.RECTANGLE,{x:chX,y:chY+chH-0.52,w:chW,h:0.52,fill:{color:Z.INK},line:{color:Z.INK,width:0}});
    s.addText('For every $1 invested, '+bc3+' returns by year 3.  Cash-positive inside year one.',
      {x:chX+0.18,y:chY+chH-0.42,w:chW-0.36,h:0.34,fontSize:9.5,color:Z.WHITE,fontFace:FN.pptxHead,bold:true,autoFit:true});

    addFooter(s,co+' — Investment Snapshot');

    // ══════════════════════════════════════════════════════════════════════
    // SLIDE 4 — CASH STORY
    // ══════════════════════════════════════════════════════════════════════
    s = pres.addSlide(); s.background={color:Z.BG};
    hdr(s,'CASH STORY','When Does This Start Paying You Back?',co); addLogo(s);
    const cumPts=[0];
    let cum=yr0net;
    [yr1net,yr2net,yr3net,yr3net,yr3net].forEach(v=>{cum+=v;cumPts.push(cum);});
    const tblCols=['YR 0','YR 1','YR 2','YR 3','YR 4','YR 5'];
    const cfMaxAbs=Math.max(...cumPts.map(Math.abs),1);
    // Left: big narrative
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:1.08,w:4.0,h:5.8,fill:{color:Z.INK},line:{color:Z.INK,width:0}});
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:1.08,w:4.0,h:0.04,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
    s.addText('PAYBACK',{x:0.7,y:1.2,w:3.6,h:0.22,fontSize:7,color:Z.GREEN,fontFace:FN.pptxMono,charSpacing:4,bold:true});
    s.addText(payback+'\nmonths',{x:0.7,y:1.48,w:3.6,h:1.4,fontSize:44,color:Z.WHITE,fontFace:FN.pptxHead,bold:true,align:'center',autoFit:true});
    s.addShape(pres.shapes.RECTANGLE,{x:1.0,y:3.04,w:3.0,h:0.03,fill:{color:'333333'},line:{color:'333333',width:0}});
    s.addText('Net 5-year value',{x:0.7,y:3.22,w:3.6,h:0.22,fontSize:8,color:'888888',fontFace:FN.pptxMono,charSpacing:1});
    s.addText(fmt$(cumPts[5]),{x:0.7,y:3.46,w:3.6,h:0.5,fontSize:22,color:Z.GREEN,fontFace:FN.pptxHead,bold:true,autoFit:true});
    s.addText('Total investment',{x:0.7,y:4.12,w:3.6,h:0.22,fontSize:8,color:'888888',fontFace:FN.pptxMono,charSpacing:1});
    s.addText(fmt$(c.yr0||0),{x:0.7,y:4.34,w:3.6,h:0.4,fontSize:16,color:Z.WHITE,fontFace:FN.pptxMono,bold:true});
    s.addText('Decision starts paying back inside year one, then compounds.',
      {x:0.7,y:5.06,w:3.6,h:0.8,fontSize:9.5,color:'AAAAAA',fontFace:FN.pptxBody,autoFit:true});
    // Right: waterfall bars
    s.addText('CUMULATIVE NET CASH POSITION  ·  YR 0 → YR 5',{x:4.8,y:1.08,w:8.1,h:0.2,fontSize:7,color:Z.MUTED,fontFace:FN.pptxMono,charSpacing:2,bold:true});
    const cfBarW=1.0,cfBarGap=0.24,cfBarX0=4.82,cfMidY=5.6,cfScale=3.0;
    s.addShape(pres.shapes.RECTANGLE,{x:4.7,y:cfMidY,w:8.4,h:0.025,fill:{color:Z.INK},line:{color:Z.INK,width:0}});
    s.addText('BREAKEVEN',{x:4.72,y:cfMidY-0.26,w:2,h:0.2,fontSize:6.5,color:Z.GREEN,fontFace:FN.pptxMono,charSpacing:1,bold:true});
    cumPts.forEach((v,i)=>{
      const bh=Math.min((Math.abs(v)/cfMaxAbs)*cfScale,cfScale);
      const bx=cfBarX0+i*(cfBarW+cfBarGap);
      const isPos=v>=0;
      s.addShape(pres.shapes.RECTANGLE,{x:bx,y:isPos?cfMidY-bh:cfMidY,w:cfBarW,h:Math.max(bh,0.04),
        fill:{color:isPos?'D1FAE5':'FEE2E2'},line:{color:isPos?'6EE7B7':'FCA5A5',width:0.5}});
      if(bh>0.06){
        const lineY=isPos?cfMidY-bh:cfMidY+bh-0.04;
        s.addShape(pres.shapes.RECTANGLE,{x:bx,y:lineY,w:cfBarW,h:0.04,fill:{color:isPos?'059669':'DC2626'},line:{color:isPos?'059669':'DC2626',width:0}});
      }
      const lblY=isPos?cfMidY-bh-0.32:cfMidY+bh+0.06;
      s.addText(fmt$(v),{x:bx-0.1,y:lblY,w:cfBarW+0.2,h:0.26,fontSize:8.5,color:isPos?'065F46':'991B1B',fontFace:FN.pptxMono,bold:true,align:'center',autoFit:true});
      s.addText(tblCols[i],{x:bx,y:cfMidY+0.08,w:cfBarW,h:0.2,fontSize:7.5,color:Z.MUTED,fontFace:FN.pptxMono,align:'center'});
    });
    addFooter(s,co+' — Cash Story');

    // ══════════════════════════════════════════════════════════════════════
    // SLIDE 5 — WHERE VALUE COMES FROM
    // ══════════════════════════════════════════════════════════════════════
    s = pres.addSlide(); s.background={color:Z.BG};
    hdr(s,'VALUE DRIVERS','What Is Actually Moving the Needle',co); addLogo(s);
    const clusters=[
      {label:'Labor & Capacity',  keys:['Labor & Human Capacity'],                       color:'0F766E', light:'CCFBF1'},
      {label:'Revenue & Margin',  keys:['Revenue / Margin'],                              color:'1D4ED8', light:'DBEAFE'},
      {label:'Cost & Shrink',     keys:['Direct Cost & Spend'],                           color:'DC2626', light:'FEE2E2'},
      {label:'Working Capital',   keys:['Working Capital','Operational Efficiency'],      color:'7C3AED', light:'EDE9FE'},
    ];
    clusters.forEach(cl=>{
      cl.scenarios=active.filter(sc=>cl.keys.some(k=>sc.themeKeys?.includes(k)||sc.theme===k));
      cl.total=cl.scenarios.reduce((a,sc)=>{const row=b.rows?.find(r=>r.sc.id===sc.id);return a+(row?.ann||sc.annualBenefit||0);},0);
    });
    const grandTotal=clusters.reduce((a,cl)=>a+cl.total,0)||b.totAnnual||1;
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:1.1,w:12.4,h:0.72,fill:{color:Z.CARD},line:{color:Z.BORDER,width:0.5}});
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:1.1,w:12.4,h:0.04,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
    s.addText('TOTAL ANNUAL VALUE AT STEADY STATE',{x:0.7,y:1.18,w:6,h:0.2,fontSize:7,color:Z.MUTED,fontFace:FN.pptxMono,charSpacing:2,bold:true});
    s.addText(fmt$(grandTotal),{x:0.7,y:1.38,w:6,h:0.36,fontSize:22,color:Z.INK,fontFace:FN.pptxHead,bold:true});
    s.addText('across '+active.length+' value scenarios',{x:6.8,y:1.42,w:5.8,h:0.3,fontSize:9,color:Z.MUTED,fontFace:FN.pptxBody,align:'right'});
    const clW=2.9,clH=3.5,clGap=0.22,clX0=(13.33-4*clW-3*clGap)/2;
    clusters.forEach((cl,i)=>{
      const cx=clX0+i*(clW+clGap),cy=2.06;
      const pct=grandTotal>0?Math.round(cl.total/grandTotal*100):0;
      const bw=(cl.total/grandTotal)*clW;
      s.addShape(pres.shapes.RECTANGLE,{x:cx,y:cy,w:clW,h:clH,fill:{color:Z.CARD},line:{color:Z.BORDER,width:0.5}});
      s.addShape(pres.shapes.RECTANGLE,{x:cx,y:cy,w:clW,h:0.06,fill:{color:'#'+cl.color},line:{color:'#'+cl.color,width:0}});
      s.addShape(pres.shapes.RECTANGLE,{x:cx+clW-0.72,y:cy+0.1,w:0.6,h:0.3,fill:{color:cl.light},line:{color:cl.light,width:0}});
      s.addText(pct+'%',{x:cx+clW-0.72,y:cy+0.1,w:0.6,h:0.3,fontSize:8,color:'#'+cl.color,fontFace:FN.pptxMono,bold:true,align:'center',valign:'middle'});
      s.addText(cl.label.toUpperCase(),{x:cx+0.16,y:cy+0.14,w:clW-0.9,h:0.2,fontSize:6.5,color:'#'+cl.color,fontFace:FN.pptxMono,charSpacing:1,bold:true});
      s.addText(fmt$(cl.total),{x:cx+0.16,y:cy+0.4,w:clW-0.32,h:0.56,fontSize:20,color:Z.INK,fontFace:FN.pptxHead,bold:true,autoFit:true});
      s.addText('per year at full run-rate',{x:cx+0.16,y:cy+0.98,w:clW-0.32,h:0.2,fontSize:7.5,color:Z.MUTED,fontFace:FN.pptxBody});
      s.addShape(pres.shapes.RECTANGLE,{x:cx+0.16,y:cy+1.26,w:clW-0.32,h:0.12,fill:{color:Z.BG},line:{color:Z.BORDER,width:0.5}});
      if(bw>0.05) s.addShape(pres.shapes.RECTANGLE,{x:cx+0.16,y:cy+1.26,w:Math.min(bw-0.32,clW-0.32),h:0.12,fill:{color:'#'+cl.color,transparency:20},line:{color:'#'+cl.color,width:0}});
      cl.scenarios.slice(0,4).forEach((sc,j)=>{
        const row=b.rows?.find(r=>r.sc.id===sc.id);
        const ann=row?.ann||sc.annualBenefit||0;
        const sy=cy+1.56+j*0.46;
        s.addShape(pres.shapes.RECTANGLE,{x:cx+0.16,y:sy,w:clW-0.32,h:0.4,fill:{color:j%2===0?Z.BG:Z.CARD},line:{color:Z.BORDER,width:0}});
        s.addText(sc.id,{x:cx+0.2,y:sy+0.06,w:0.55,h:0.26,fontSize:6,color:'#'+cl.color,fontFace:FN.pptxMono,bold:true});
        s.addText(sc.name,{x:cx+0.76,y:sy+0.06,w:clW-1.0,h:0.26,fontSize:7.5,color:Z.BODY,fontFace:FN.pptxBody,autoFit:true});
        s.addText(fmt$(ann),{x:cx+0.16,y:sy+0.22,w:clW-0.32,h:0.16,fontSize:7,color:Z.MUTED,fontFace:FN.pptxMono});
      });
    });
    addFooter(s,co+' — Value Drivers');

    // ══════════════════════════════════════════════════════════════════════
    // SLIDE 6 — COST OF DELAY
    // ══════════════════════════════════════════════════════════════════════
    s = pres.addSlide(); s.background={color:Z.BG};
    hdr(s,'COST OF DELAY','Every Month of Inaction Has a Price Tag',co); addLogo(s);
    const perMo=Math.round((b.totY1||0)/12);
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:1.1,w:12.4,h:1.2,fill:{color:Z.INK},line:{color:Z.INK,width:0}});
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:1.1,w:12.4,h:0.04,fill:{color:Z.RED},line:{color:Z.RED,width:0}});
    s.addText(fmt$(perMo),{x:0.7,y:1.16,w:5,h:0.84,fontSize:42,color:Z.GREEN,fontFace:FN.pptxHead,bold:true,autoFit:true});
    s.addText('in run-rate benefit foregone for every month the decision is delayed.',
      {x:5.8,y:1.28,w:6.8,h:0.84,fontSize:13,color:Z.WHITE,fontFace:FN.pptxHead,autoFit:true});
    [[3,'3-MONTH DELAY',Z.AMBER],[6,'6-MONTH DELAY',Z.RED],[12,'12-MONTH DELAY',Z.RED]].forEach(([mo,lbl,ac],i)=>
      mTile(s,0.5+i*4.18,2.58,3.9,1.52,'VALUE LEFT ON TABLE — '+lbl,fmt$(perMo*mo),'cumulative foregone benefit',ac));
    s.addText('VALUE AT RISK BY SCENARIO  ·  6-MONTH DELAY',{x:0.5,y:4.34,w:12.4,h:0.2,fontSize:7,color:Z.MUTED,fontFace:FN.pptxMono,charSpacing:2,bold:true});
    const sortedRows=[...(b.rows||[])].sort((a,bb)=>bb.y1-a.y1).slice(0,6);
    const maxM=Math.max(...sortedRows.map(r=>r.y1/2),1);
    sortedRows.forEach((row,i)=>{
      const missed=(row.y1/12)*6;
      const bw=Math.max((missed/maxM)*7.8,0.08);
      const by=4.64+i*0.44;
      s.addText(row.sc.name,{x:0.5,y:by,w:3.5,h:0.38,fontSize:8.5,color:Z.BODY,fontFace:FN.pptxBody,autoFit:true});
      s.addShape(pres.shapes.RECTANGLE,{x:4.1,y:by+0.04,w:7.8,h:0.28,fill:{color:Z.CARD},line:{color:Z.BORDER,width:0.5}});
      s.addShape(pres.shapes.RECTANGLE,{x:4.1,y:by+0.04,w:bw,h:0.28,fill:{color:'FEE2E2'},line:{color:'FCA5A5',width:0.5}});
      s.addText(fmt$(missed),{x:12.1,y:by,w:1.2,h:0.38,fontSize:8,color:Z.RED,fontFace:FN.pptxMono,bold:true,align:'right'});
    });
    addFooter(s,co+' — Cost of Delay');

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO SECTION DIVIDER
    // ══════════════════════════════════════════════════════════════════════
    secDiv('VALUE SCENARIOS','The\nLevers','Each scenario is independently verifiable from operational data.');

    // ══════════════════════════════════════════════════════════════════════
    // ONE SLIDE PER SCENARIO
    // ══════════════════════════════════════════════════════════════════════
    const rampAcMap={hard_labor:'0F766E',hard_cost:'065F46',revenue:'1D4ED8',soft:'6B7280',working_cap:'7C3AED',strategic:'374151'};
    active.forEach(sc=>{
      const row=b.rows?.find(r=>r.sc.id===sc.id);
      const ann=row?.ann||sc.annualBenefit;
      const rt=RAMP[sc.rampType]||RAMP.hard_labor;
      const y1=ann*rt.y1,y2=ann*rt.y2,y3=ann*rt.y3;
      const rAc='#'+(rampAcMap[sc.rampType]||'374151');

      s=pres.addSlide(); s.background={color:Z.BG};
      hdr(s,sc.id+' · '+sc.theme.toUpperCase(),sc.name); addLogo(s);

      // Pills
      s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:1.0,w:2.6,h:0.24,fill:{color:Z.BG},line:{color:Z.BORDER,width:0.5}});
      s.addText(sc.theme.toUpperCase(),{x:0.52,y:1.02,w:2.56,h:0.2,fontSize:6.5,color:Z.BODY,fontFace:FN.pptxMono,align:'center',charSpacing:1});
      s.addShape(pres.shapes.RECTANGLE,{x:3.26,y:1.0,w:2.0,h:0.24,fill:{color:Z.BG},line:{color:rAc,width:0.5}});
      s.addText((rt.label||sc.rampType).toUpperCase(),{x:3.28,y:1.02,w:1.96,h:0.2,fontSize:6.5,color:rAc,fontFace:FN.pptxMono,align:'center',charSpacing:1,bold:true});

      // Outcome line
      s.addText(sc.oneLiner||'',{x:0.5,y:1.32,w:8.6,h:0.58,fontSize:14,color:Z.INK,fontFace:FN.pptxHead,bold:true,autoFit:true});

      // 3 story rows
      const evText=(sc.evidenceIds||[]).map(id=>{const ev=EVIDENCE.find(e=>e.id===id);return ev?ev.publisher+(ev.year?' '+ev.year:''):'';}).filter(Boolean).join('  ·  ');
      const inputText=sc.inputs?Object.values(sc.inputs).slice(0,2).map(v=>v.label+': '+v.value+' ('+v.hint+')').join('  ·  '):sc.oneLiner||'';
      [{label:'HOW IT WORKS',text:inputText,ac:rAc},
       {label:'EVIDENCE BASIS',text:evText||'See evidence registry',ac:rAc},
       {label:'HANDLING OBJECTIONS',text:sc.challenge||'—',ac:Z.AMBER},
      ].forEach((r,i)=>{
        const ry=2.04+i*1.36;
        s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:ry,w:8.6,h:1.26,fill:{color:Z.CARD},line:{color:Z.BORDER,width:0.5}});
        s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:ry,w:0.04,h:1.26,fill:{color:r.ac},line:{color:r.ac,width:0}});
        s.addText(r.label,{x:0.68,y:ry+0.1,w:8.2,h:0.18,fontSize:6.5,color:r.ac,fontFace:FN.pptxMono,charSpacing:2,bold:true});
        s.addText(r.text,{x:0.68,y:ry+0.32,w:8.2,h:0.84,fontSize:9,color:Z.BODY,fontFace:FN.pptxBody,autoFit:true});
      });

      // Right value panel
      s.addShape(pres.shapes.RECTANGLE,{x:9.4,y:1.0,w:3.5,h:4.68,fill:{color:Z.INK},line:{color:Z.INK,width:0}});
      s.addShape(pres.shapes.RECTANGLE,{x:9.4,y:1.0,w:3.5,h:0.06,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
      s.addText('ANNUAL VALUE',{x:9.6,y:1.12,w:3.1,h:0.2,fontSize:7,color:Z.GREEN,fontFace:FN.pptxMono,charSpacing:3,bold:true});
      s.addText(fmt$(ann),{x:9.6,y:1.36,w:3.1,h:0.78,fontSize:30,color:Z.WHITE,fontFace:FN.pptxHead,bold:true,autoFit:true});
      [[y1,'YEAR 1'],[y2,'YEAR 2'],[y3,'YEAR 3+']].forEach(([v,lbl],i)=>{
        const ty=2.3+i*0.82;
        s.addShape(pres.shapes.RECTANGLE,{x:9.4,y:ty,w:3.5,h:0.76,fill:{color:i===2?'1A2E0A':'111111'},line:{color:'2A2A2A',width:0}});
        s.addText(lbl,{x:9.6,y:ty+0.06,w:3.1,h:0.18,fontSize:6.5,color:i===2?Z.GREEN:'888888',fontFace:FN.pptxMono,charSpacing:1});
        s.addText(fmt$(v),{x:9.6,y:ty+0.26,w:3.1,h:0.4,fontSize:17,color:i===2?Z.GREEN:Z.WHITE,fontFace:FN.pptxMono,bold:i===2,autoFit:true});
        const rp=i===0?rt.y1:i===1?rt.y2:rt.y3;
        s.addShape(pres.shapes.RECTANGLE,{x:9.48,y:ty+0.68,w:3.34,h:0.05,fill:{color:'222222'},line:{color:'222222',width:0}});
        s.addShape(pres.shapes.RECTANGLE,{x:9.48,y:ty+0.68,w:3.34*rp,h:0.05,fill:{color:Z.GREEN,transparency:i===2?0:40},line:{color:Z.GREEN,width:0}});
      });
      s.addText(Math.round(rt.y1*100)+'% · '+Math.round(rt.y2*100)+'% · '+Math.round(rt.y3*100)+'%  (YR1 · YR2 · YR3)',
        {x:9.6,y:4.76,w:3.1,h:0.2,fontSize:7,color:'555555',fontFace:FN.pptxMono,align:'center'});

      addFooter(s,sc.id+' · '+sc.name.substring(0,40));
    });

    // ══════════════════════════════════════════════════════════════════════
    // SCENARIO SUMMARY TABLE
    // ══════════════════════════════════════════════════════════════════════
    s=pres.addSlide(); s.background={color:Z.BG};
    hdr(s,'INVESTMENT MODEL','Value by Scenario — Full Summary',co); addLogo(s);
    const sumCols=[{w:3.8,l:'SCENARIO'},{w:1.5,l:'TYPE'},{w:1.5,l:'YR 1'},{w:1.5,l:'YR 2'},{w:1.5,l:'YR 3+'},{w:1.5,l:'ANNUAL'}];
    const totSumW=sumCols.reduce((a,c)=>a+c.w,0)+0.04*(sumCols.length-1);
    const sumXOff=(13.33-totSumW)/2;
    let scx=sumXOff;
    sumCols.forEach(c=>{
      s.addShape(pres.shapes.RECTANGLE,{x:scx,y:1.1,w:c.w,h:0.3,fill:{color:Z.INK},line:{color:Z.INK,width:0}});
      s.addText(c.l,{x:scx+0.05,y:1.14,w:c.w-0.1,h:0.22,fontSize:7.5,color:Z.GREEN,fontFace:FN.pptxMono,charSpacing:1,bold:true});
      scx+=c.w+0.04;
    });
    const maxRows=Math.min(active.length,11);
    active.slice(0,maxRows).forEach((sc,i)=>{
      const row=b.rows?.find(r=>r.sc.id===sc.id);
      const ann=row?.ann||sc.annualBenefit;
      const rt=RAMP[sc.rampType]||RAMP.hard_labor;
      const ry=1.44+i*0.38,bg=i%2===0?Z.CARD:Z.BG;
      const rAc='#'+(rampAcMap[sc.rampType]||'374151');
      scx=sumXOff;
      [sc.name,'',fmt$(ann*rt.y1),fmt$(ann*rt.y2),fmt$(ann*rt.y3),fmt$(ann)].forEach((v,j)=>{
        s.addShape(pres.shapes.RECTANGLE,{x:scx,y:ry,w:sumCols[j].w,h:0.34,fill:{color:bg},line:{color:Z.BORDER,width:0.5}});
        if(j===1){
          s.addShape(pres.shapes.RECTANGLE,{x:scx+0.06,y:ry+0.05,w:sumCols[1].w-0.12,h:0.22,fill:{color:Z.BG},line:{color:rAc,width:0.5}});
          s.addText((RAMP[sc.rampType]?.label||sc.rampType).toUpperCase(),{x:scx+0.08,y:ry+0.07,w:sumCols[1].w-0.16,h:0.18,fontSize:5.5,color:rAc,fontFace:FN.pptxMono,align:'center',charSpacing:0.5,bold:true});
        } else {
          s.addText(v,{x:scx+0.06,y:ry+0.05,w:sumCols[j].w-0.12,h:0.26,fontSize:j===0?8.5:8,color:j>=2?Z.INK:Z.BODY,fontFace:j>=2?FN.pptxMono:FN.pptxBody,bold:j>=2,autoFit:true});
        }
        scx+=sumCols[j].w+0.04;
      });
    });
    const totY=1.44+maxRows*0.38;
    scx=sumXOff;
    ['TOTAL','',fmt$(b.totY1||0),fmt$(b.totY2||0),fmt$(b.totAnnual||0),fmt$(b.totAnnual||0)].forEach((v,j)=>{
      s.addShape(pres.shapes.RECTANGLE,{x:scx,y:totY,w:sumCols[j].w,h:0.42,fill:{color:Z.INK},line:{color:Z.INK,width:0}});
      if(v) s.addText(v,{x:scx+0.06,y:totY+0.08,w:sumCols[j].w-0.12,h:0.28,fontSize:j===0?9.5:8.5,color:j>=2?Z.GREEN:Z.WHITE,fontFace:FN.pptxMono,bold:true,align:j>=2?'right':'left'});
      scx+=sumCols[j].w+0.04;
    });
    addFooter(s,co+' — Scenario Summary');

    // ══════════════════════════════════════════════════════════════════════
    // APPENDIX SECTION
    // ══════════════════════════════════════════════════════════════════════
    secDiv('APPENDIX','Methodology\n& Evidence','Benefit ramps, model inputs, and research basis.');

    // COST MODEL
    s=pres.addSlide(); s.background={color:Z.BG};
    hdr(s,'INVESTMENT MODEL','Cost Structure',co); addLogo(s);
    mTile(s,0.5,1.1,3.7,1.35,'YEAR 0 INVESTMENT',fmt$(c.yr0||0),'one-time deployment',Z.INK);
    mTile(s,4.35,1.1,3.7,1.35,'ANNUAL OPERATING COST',fmt$(c.yr1||0),'ongoing year 1 costs',Z.BODY);
    mTile(s,8.2,1.1,4.65,1.35,'5-YEAR TOTAL INVESTMENT',fmt$((c.yr0||0)+(c.yr2||0)*4),'yr0 + 4 yrs operating',Z.MUTED);
    s.addText('COST LINE ITEMS',{x:0.5,y:2.62,w:12.4,h:0.2,fontSize:7,color:Z.MUTED,fontFace:FN.pptxMono,charSpacing:3,bold:true});
    const liCols=[{w:5.5,l:'LINE ITEM'},{w:1.8,l:'CADENCE'},{w:1.8,l:'YR 0'},{w:1.8,l:'YR 1'},{w:1.8,l:'YR 2+'}];
    let lix=0.5;
    liCols.forEach(c2=>{
      s.addShape(pres.shapes.RECTANGLE,{x:lix,y:2.9,w:c2.w,h:0.3,fill:{color:Z.INK},line:{color:Z.INK,width:0}});
      s.addText(c2.l,{x:lix+0.05,y:2.94,w:c2.w-0.1,h:0.22,fontSize:7.5,color:Z.GREEN,fontFace:FN.pptxMono,charSpacing:1,bold:true});
      lix+=c2.w+0.04;
    });
    (costRows||[]).slice(0,10).forEach((row,i)=>{
      const ry=3.24+i*0.37,bg=i%2===0?Z.CARD:Z.BG;
      const total=typeof row.total==='number'?row.total:(row.qty||0)*(row.unit||0);
      const isYr0=row.cadence==='One-time'||row.cadence==='one-time';
      const isAnn=row.cadence==='Annual'||row.cadence==='annual';
      lix=0.5;
      [row.label,row.cadence||'',isYr0?fmt$(total):'',isAnn?fmt$(total):'',isAnn?fmt$(total):''].forEach((v,j)=>{
        s.addShape(pres.shapes.RECTANGLE,{x:lix,y:ry,w:liCols[j].w,h:0.32,fill:{color:bg},line:{color:Z.BORDER,width:0.5}});
        s.addText(v||'',{x:lix+0.06,y:ry+0.04,w:liCols[j].w-0.12,h:0.24,fontSize:8.5,color:j>=2?Z.INK:Z.BODY,fontFace:j>=2?FN.pptxMono:FN.pptxBody,autoFit:true});
        lix+=liCols[j].w+0.04;
      });
    });
    addFooter(s,co+' — Cost Model');

    // RAMP METHODOLOGY
    s=pres.addSlide(); s.background={color:Z.BG};
    hdr(s,'METHODOLOGY','Benefit Realization Framework',co); addLogo(s);
    s.addText('Adoption curves calibrated to operational change velocity — GS1 US and Auburn University RFID Lab guidance.',
      {x:0.5,y:1.08,w:12.4,h:0.24,fontSize:9,color:Z.MUTED,fontFace:FN.pptxBody});
    [{key:'hard_labor',label:'Hard Labor',rates:'50 → 85 → 100%',rationale:'Direct labor hours freed at go-live. Process change lag only — not technical risk.',ac:'0F766E'},
     {key:'hard_cost',label:'Hard Cost',rates:'50 → 85 → 100%',rationale:'Direct P&L cost avoidance confirmed through audits.',ac:'065F46'},
     {key:'revenue',label:'Revenue Uplift',rates:'30 → 70 → 100%',rationale:'Demand-side variability requires integration ramp. Lead as upside.',ac:'1D4ED8'},
     {key:'soft',label:'Soft Productivity',rates:'25 → 65 → 100%',rationale:'Behavior and training change. Introduce after hard-dollar case is agreed.',ac:'6B7280'},
     {key:'working_cap',label:'Working Capital',rates:'20 → 60 → 100%',rationale:'Inventory optimization compounds over multiple replenishment cycles.',ac:'7C3AED'},
     {key:'strategic',label:'Strategic',rates:'0 → 20 → 60%',rationale:'Long-horizon optionality. Not in core model.',ac:'374151'},
    ].forEach((rt,i)=>{
      const rx=0.5+(i%3)*4.11,ry=1.46+Math.floor(i/3)*2.14;
      s.addShape(pres.shapes.RECTANGLE,{x:rx,y:ry,w:3.95,h:2.0,fill:{color:Z.CARD},line:{color:Z.BORDER,width:0.5}});
      s.addShape(pres.shapes.RECTANGLE,{x:rx,y:ry,w:3.95,h:0.05,fill:{color:'#'+rt.ac},line:{color:'#'+rt.ac,width:0}});
      s.addText(rt.label.toUpperCase(),{x:rx+0.14,y:ry+0.14,w:3.67,h:0.22,fontSize:8,color:'#'+rt.ac,fontFace:FN.pptxMono,bold:true,charSpacing:1});
      s.addText(rt.rates,{x:rx+0.14,y:ry+0.42,w:3.67,h:0.34,fontSize:16,color:Z.INK,fontFace:FN.pptxHead,bold:true});
      s.addText('YR 1  ·  YR 2  ·  YR 3+',{x:rx+0.14,y:ry+0.78,w:3.67,h:0.18,fontSize:7,color:Z.MUTED,fontFace:FN.pptxMono,charSpacing:1});
      s.addText(rt.rationale,{x:rx+0.14,y:ry+1.04,w:3.67,h:0.86,fontSize:8.5,color:Z.BODY,fontFace:FN.pptxBody,autoFit:true});
    });
    addFooter(s,co+' — Benefit Realization Methodology');

    // BASIS OF PREPARATION
    s=pres.addSlide(); s.background={color:Z.BG};
    hdr(s,'BASIS OF PREPARATION','Model Inputs & Methods',co); addLogo(s);
    [['Discount Rate','10% per annum (cost of capital assumption)'],
     ['Horizon','60 months (5 years)'],
     ['NPV Method','Discounted cash flow — benefits net of investment'],
     ['IRR','Unlevered, pre-tax, illustrative model output'],
     ['ROI Framing','3-year net ROI: cumulative benefit less total cost'],
     ['Benefit Ramps','Hard labor/cost: 3–12 month ramp. Revenue: 6–18 month ramp. Working capital: 6–12 month ramp.'],
     ['Scenarios',''+active.length+' scenarios across '+Object.keys(groups).length+' value theme(s)'],
     ['Inputs','Benchmark defaults from published studies; replace with customer data where available'],
    ].forEach((row,i)=>{
      const ry=1.18+i*0.46,bg=i%2===0?Z.CARD:Z.BG;
      s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:ry,w:5.5,h:0.4,fill:{color:bg},line:{color:Z.BORDER,width:0.5}});
      s.addShape(pres.shapes.RECTANGLE,{x:6.08,y:ry,w:6.8,h:0.4,fill:{color:bg},line:{color:Z.BORDER,width:0.5}});
      s.addText(row[0],{x:0.62,y:ry+0.06,w:5.2,h:0.28,fontSize:8.5,color:Z.INK,fontFace:FN.pptxMono,bold:true,autoFit:true});
      s.addText(row[1],{x:6.2,y:ry+0.06,w:6.5,h:0.28,fontSize:8.5,color:Z.BODY,fontFace:FN.pptxBody,autoFit:true});
    });
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:5.02,w:12.4,h:1.0,fill:{color:'FFFBEB'},line:{color:'FCD34D',width:0.5}});
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y:5.02,w:0.06,h:1.0,fill:{color:Z.AMBER},line:{color:Z.AMBER,width:0}});
    s.addText('DISCLAIMER',{x:0.72,y:5.1,w:12,h:0.2,fontSize:7,color:Z.AMBER,fontFace:FN.pptxMono,bold:true,charSpacing:2});
    s.addText('Financial estimates are illustrative projections from benchmark data and the inputs provided. Actual results depend on deployment scope, execution, and market conditions. This supports pre-sale discovery — it is indicative, not contractual.',
      {x:0.72,y:5.32,w:12.0,h:0.62,fontSize:7.5,color:Z.BODY,fontFace:FN.pptxBody,autoFit:true});
    addFooter(s,co+' — Basis of Preparation');

    // EVIDENCE REGISTRY
    const allEvIds=[...new Set(active.flatMap(sc=>sc.evidenceIds||[]))];
    const allEv=allEvIds.map(id=>EVIDENCE.find(e=>e.id===id)).filter(Boolean);
    const tierColor={'Tier 1':'065F46','Tier 2':'1D4ED8','Tier 3':'374151'};
    for(let p=0;p<Math.max(1,Math.ceil(allEv.length/4));p++){
      s=pres.addSlide(); s.background={color:Z.BG};
      hdr(s,'EVIDENCE REGISTRY','Research Basis'+(allEv.length>4?' — pg '+(p+1):''),co); addLogo(s);
      allEv.slice(p*4,(p+1)*4).forEach((ev,i)=>{
        const ex=i%2===0?0.5:6.94,ey=1.1+Math.floor(i/2)*2.92;
        const tc='#'+(tierColor[ev.tier]||'374151');
        s.addShape(pres.shapes.RECTANGLE,{x:ex,y:ey,w:5.94,h:2.72,fill:{color:Z.CARD},line:{color:Z.BORDER,width:0.5}});
        s.addShape(pres.shapes.RECTANGLE,{x:ex,y:ey,w:5.94,h:0.05,fill:{color:tc},line:{color:tc,width:0}});
        s.addShape(pres.shapes.RECTANGLE,{x:ex+5.3,y:ey+0.08,w:0.56,h:0.24,fill:{color:Z.BG},line:{color:Z.BORDER,width:0.5}});
        s.addText(ev.tier,{x:ex+5.3,y:ey+0.08,w:0.56,h:0.24,fontSize:6.5,color:tc,fontFace:FN.pptxMono,bold:true,align:'center',valign:'middle'});
        s.addText(ev.id,{x:ex+0.14,y:ey+0.1,w:5.1,h:0.2,fontSize:7,color:tc,fontFace:FN.pptxMono,charSpacing:1,bold:true});
        if(ev.year) s.addText(String(ev.year),{x:ex+4.7,y:ey+0.1,w:0.56,h:0.2,fontSize:7,color:Z.MUTED,fontFace:FN.pptxMono,align:'right'});
        s.addText(ev.title||'',{x:ex+0.14,y:ey+0.38,w:5.66,h:0.38,fontSize:10,color:Z.INK,fontFace:FN.pptxHead,bold:true,autoFit:true});
        s.addText(ev.publisher||'',{x:ex+0.14,y:ey+0.78,w:5.66,h:0.2,fontSize:8,color:Z.MUTED,fontFace:FN.pptxMono});
        s.addText(ev.claim||'',{x:ex+0.14,y:ey+1.04,w:5.66,h:1.58,fontSize:9,color:Z.BODY,fontFace:FN.pptxBody,autoFit:true});
      });
      addFooter(s,co+' — Evidence Registry');
    }

    // ══════════════════════════════════════════════════════════════════════
    // CLOSING
    // ══════════════════════════════════════════════════════════════════════
    s=pres.addSlide(); s.background={color:'000000'}; slideN++;
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:0.5,h:7.5,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:13.33,h:0.04,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
    s.addShape(pres.shapes.RECTANGLE,{x:0,y:7.46,w:13.33,h:0.04,fill:{color:Z.GREEN},line:{color:Z.GREEN,width:0}});
    s.addImage({data:PPTX_LOGO_DARK_BG,x:10.5,y:0.1,w:2.6,h:0.8});
    s.addText('ZEBRA TECHNOLOGIES  ·  RFID VALUE CASE',{x:1.0,y:1.1,w:10.5,h:0.28,fontSize:9,color:Z.GREEN,fontFace:FN.pptxMono,charSpacing:5,bold:true});
    s.addText('Thank You.',{x:1.0,y:1.52,w:8.5,h:2.2,fontSize:72,color:Z.WHITE,fontFace:FN.pptxHead,bold:true,autoFit:true});
    s.addText("Questions, next steps, or a live walk-through — we're ready.",{x:1.0,y:3.86,w:8.5,h:0.38,fontSize:12,color:"888888",fontFace:FN.pptxBody});
    [[fmt$(b.totAnnual),'Annual Benefit'],[active.length+' Scenarios','Quantified'],[payback+'mo','Payback'],[fmt$(npv5),'5-Yr NPV']].forEach(([v,l],i)=>{
      const sx=1.0+i*2.88;
      if(i>0) s.addShape(pres.shapes.RECTANGLE,{x:sx,y:4.86,w:0.015,h:0.7,fill:{color:'333333'},line:{color:'333333',width:0}});
      s.addText(v,{x:sx+0.1,y:4.84,w:2.7,h:0.32,fontSize:12,color:Z.GREEN,fontFace:FN.pptxHead,bold:true,align:'center',autoFit:true});
      s.addText(l,{x:sx+0.1,y:5.18,w:2.7,h:0.2,fontSize:7,color:'666666',fontFace:FN.pptxMono,align:'center',charSpacing:1});
    });
    if(seller) s.addText(seller,{x:1.0,y:5.76,w:11.5,h:0.38,fontSize:13,color:Z.GREEN,fontFace:FN.pptxHead,bold:true,align:'center'});
    s.addText(partners+'  ·  zebra.com/rfid',{x:1.0,y:6.22,w:11.5,h:0.28,fontSize:9,color:'555555',fontFace:FN.pptxBody,align:'center'});
    s.addText('Indicative model based on customer inputs and Zebra / GS1 US / Auburn University RFID Lab benchmarks. Not a contractual commitment.',
      {x:1.0,y:7.0,w:11.5,h:0.26,fontSize:6.5,color:'383838',fontFace:FN.pptxBody,italic:true,align:'center'});

    const fname=co.replace(/\s+/g,'_')+'_RFID_Value_Case_'+new Date().toISOString().slice(0,10)+'.pptx';
    if(typeof pres.writeFile === 'function') {
      // v3 path (fallback, should not hit with embedded 4.0.1)
      await pres.writeFile({fileName:fname});
    } else {
      // v4 path
      const blob = await pres.write({outputType:'blob'});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = fname;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    }

  } catch(err){
    console.error('PPTX error:',err);
    alert('PPTX export failed: '+err.message);
  } finally {
    if(callerBtn){ callerBtn.textContent='📊 Export Deck (PPTX)'; callerBtn.disabled=false; }
  }
}




// ── INIT ──

// ── JSON EXPORT — serializes full state payload for generate_pdf.py ──
async function exportJSON() {
  const btn = document.querySelector('[onclick="exportJSON()"]');
  if(btn){ btn.textContent = '⏳ Exporting...'; btn.disabled = true; }

  try {
    // Ensure benefits and costs are computed
    ensureCosts();
    if(!state.benefits || !state.benefits.totAnnual) renderROI();
    const b = state.benefits;
    const c = state.costs;
    const active = SCENARIOS.filter(s=>state.selectedIds.has(s.id));

    // Build JSON payload matching generate_pdf.py schema
    const payload = {
      company:  document.getElementById('i-customer')?.value || 'Your Customer',
      vendor:   document.getElementById('i-company')?.value  || 'Zebra Technologies',
      title:    document.getElementById('i-title')?.value    || 'RFID Strategic Value Analysis',
      seller:   document.getElementById('i-seller')?.value || '—',
      partners: document.getElementById('i-partners')?.value || '—',
      pain:     document.getElementById('i-pain')?.value || '—',
      date:     new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}),
      benefits: {
        totAnnual: b.totAnnual||0,
        totY1: b.totY1||0,
        totY2: b.totY2||0,
        totY3: b.totY3||0,
        rows: (b.rows||[]).map(r=>({
          id: r.sc.id, name: r.sc.name, rampType: r.sc.rampType,
          ann: r.ann, y1: r.y1, y2: r.y2, y3: r.y3
        }))
      },
      costs: {
        yr0: c.yr0||0, yr1: c.yr1||0, yr2: c.yr2||0,
        rows: (costRows||[]).map(r=>({
          label: r.label, cadence: r.cadence||'One-time',
          total: typeof r.total==='number' ? r.total : (r.qty||0)*(r.unit||0)
        }))
      },
      scenarios: active.map(sc => {
        const row = (b.rows||[]).find(r=>r.sc.id===sc.id);
        const ann = row ? row.ann : sc.annualBenefit;
        const inp = state.inputs[sc.id] || {};
        const inputValues = {};
        Object.entries(sc.inputs||{}).slice(0,6).forEach(([k,v])=>{
          inputValues[v.label||k] = inp[k]!==undefined ? inp[k] : v.value;
        });
        return {
          id: sc.id, name: sc.name, theme: sc.theme,
          rampType: sc.rampType, ann,
          evidenceIds: sc.evidenceIds||[],
          oneLiner: sc.oneLiner||'',
          inputValues
        };
      }),
      evidence: [...new Set(active.flatMap(s=>s.evidenceIds||[]))]
        .map(id=>EVIDENCE.find(e=>e.id===id)).filter(Boolean)
        .map(ev=>({id:ev.id,tier:ev.tier,title:ev.title,
                   publisher:ev.publisher,year:ev.year,claim:ev.claim}))
    };

    // Call Anthropic API to generate PDF-ready JSON (validated/enriched)
    // Then trigger download of the serialized payload as .json for now
    // In production this would POST to a server running generate_pdf.py
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const co = (payload.company||'Company').replace(/[^a-zA-Z0-9]/g,'-');
    a.href = url;
    a.download = `Zebra-RFID-Value-Analysis-${co}-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

  } catch(e) {
    console.error('JSON export error:', e);
    alert('Export error: ' + e.message);
  } finally {
    if(btn){ btn.textContent = '⬇ Export JSON'; btn.disabled = false; }
  }
}

// ── LLM PROMPT EXPORT — builds a rich, copy-pasteable brief for AI analysis ──
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
