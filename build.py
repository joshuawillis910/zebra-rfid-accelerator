#!/usr/bin/env python3
"""
Zebra RFID Value Accelerator — Build Script v2
===============================================
Copies the canonical working HTML to docs/ for GitHub Pages deployment.
Also runs verification checks.

Usage:
    python3 build.py

Output:
    docs/zebra-rfid-value-accelerator.html
"""

import re, sys, shutil
from pathlib import Path

BASE   = Path(__file__).parent
DOCS   = BASE / 'docs'
SRC_HTML = BASE / 'src' / 'zebra-rfid-value-accelerator.html'
OUTPUT = DOCS / 'zebra-rfid-value-accelerator.html'

DOCS.mkdir(exist_ok=True)

# Look for source HTML — check src/ first, then root
if not SRC_HTML.exists():
    # Fall back to any html in root
    candidates = list(BASE.glob('*.html'))
    if candidates:
        SRC_HTML = candidates[0]
    else:
        print('ERROR: No source HTML found. Place zebra-rfid-value-accelerator.html in src/')
        sys.exit(1)

print(f'Building Zebra RFID Value Accelerator...')
print(f'  Source: {SRC_HTML}')
print(f'  Output: {OUTPUT}')
print()

shutil.copy2(SRC_HTML, OUTPUT)

# ── Verify ────────────────────────────────────────────────────────────────────
content = OUTPUT.read_text(encoding='utf-8')
checks = [
    ('function go(',             'Navigation go()'),
    ('function renderROI(',      'renderROI()'),
    ('function exportLLMPrompt', 'exportLLMPrompt()'),
    ('function runPPTXDownload', 'runPPTXDownload()'),
    ('const SCENARIOS =',        'SCENARIOS data'),
    ('const EVIDENCE =',         'EVIDENCE data'),
]

print('Verifying output...')
all_ok = True
for needle, label in checks:
    count = content.count(needle)
    ok = count == 1
    print(f'  {"✓" if ok else "✗"} {label} (found {count}x)')
    if not ok:
        all_ok = False

scripts = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
combined = '\n'.join(scripts)
ob, cb = combined.count('{'), combined.count('}')
brace_ok = abs(ob - cb) <= 5
print(f'  {"✓" if brace_ok else "✗"} Braces balanced ({ob}/{cb})')
if not brace_ok:
    all_ok = False

size_kb = len(content) // 1024
print()
if all_ok:
    print(f'✅ Build successful — {size_kb}KB → docs/zebra-rfid-value-accelerator.html')
    print(f'\n   Live URL (after push):')
    print(f'   https://joshuawillis910.github.io/zebra-rfid-accelerator/zebra-rfid-value-accelerator.html')
else:
    print('❌ Build has errors — check above')
    sys.exit(1)
