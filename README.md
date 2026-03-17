# Zebra RFID Value Accelerator — Source

## Structure

```
zebra-rfid-accelerator/
├── src/
│   ├── head.html         ← <head> meta tags, title
│   ├── template.html     ← HTML body (nav, panels, UI)
│   ├── styles.css        ← All CSS
│   ├── brand.js          ← Logos, fonts, colors (BRAND object)
│   ├── scenarios.js      ← All 83 value scenarios (SCENARIOS array)
│   ├── evidence.js       ← Evidence registry (EVIDENCE array)
│   ├── core.js           ← App logic, renderROI, cost model, UI
│   ├── exports.js        ← PDF, JSON, deck preview exports
│   ├── llm-prompt.js     ← AI prompt export function
│   ├── pptx-builder.js   ← PPTX deck builder (runPPTXDownload)
│   └── init.js           ← DOMContentLoaded bootstrap
├── vendor/
│   └── pptxgenjs.min.js  ← PptxGenJS 4.0.1 (don't touch)
├── assets/
│   ├── fonts/            ← Zebra Sans + Mono OTF files
│   └── logos/            ← Zebra SVG logos
├── dist/
│   └── zebra-rfid-value-accelerator.html  ← THE OUTPUT (ship this)
├── build.py              ← Run this to rebuild dist/
└── README.md             ← This file
```

## How to make a change

1. Edit the file you care about in `src/`
2. Run `python3 build.py`
3. Test `dist/zebra-rfid-value-accelerator.html` in Chrome
4. If good: `git add . && git commit -m "describe what you changed"`

## Common edits

| What you want to do | File to edit |
|---|---|
| Add or edit a scenario | `src/scenarios.js` |
| Add or edit evidence | `src/evidence.js` |
| Change colors, logos, fonts | `src/brand.js` |
| Change the AI prompt | `src/llm-prompt.js` |
| Change the PPTX deck layout | `src/pptx-builder.js` |
| Change the PDF export | `src/exports.js` |
| Change app UI / buttons / layout | `src/template.html` |
| Change CSS styles | `src/styles.css` |

## Version control (Git)

First time setup (do this once in Terminal):
```bash
cd zebra-rfid-accelerator
git init
git add .
git commit -m "v3.0 — initial"
git tag v3.0
```

Saving a change:
```bash
git add .
git commit -m "added reverse logistics scenario"
```

Tagging a release:
```bash
git tag v3.1
```

Going back to a previous version:
```bash
git checkout v3.0 -- src/scenarios.js
```

## Shipping to sellers

After `python3 build.py`:
- `dist/zebra-rfid-value-accelerator.html` is the file sellers get
- Upload it (and the `assets/` folder) to OneDrive
- Or ZIP the whole `dist/` folder with `assets/` for offline use
