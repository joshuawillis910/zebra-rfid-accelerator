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
