#!/usr/bin/env python3
"""
Zebra RFID Value Accelerator — Build Script
============================================
Combines all src/ files into a single deployable HTML file in dist/.

Usage:
    python3 build.py

Output:
    dist/zebra-rfid-value-accelerator.html
"""

import os, re, sys
from pathlib import Path

BASE   = Path(__file__).parent
SRC    = BASE / 'src'
DIST   = BASE / 'dist'
OUTPUT = DIST / 'zebra-rfid-value-accelerator.html'

DIST.mkdir(exist_ok=True)

def read(filename):
    path = SRC / filename
    if not path.exists():
        print(f'  ERROR: {filename} not found')
        sys.exit(1)
    return path.read_text(encoding='utf-8')

print('Building Zebra RFID Value Accelerator...')
print(f'  Source: {SRC}')
print(f'  Output: {OUTPUT}')
print()

# Read source files
pptxgenjs   = (BASE / 'vendor' / 'pptxgenjs.min.js').read_text() if (BASE / 'vendor' / 'pptxgenjs.min.js').exists() else None
css         = read('styles.css')
html_body   = read('template.html')
brand       = read('brand.js')
scenarios   = read('scenarios.js')
evidence    = read('evidence.js')
core        = read('core.js')
exports     = read('exports.js')
llm_prompt  = read('llm-prompt.js')
pptx_build  = read('pptx-builder.js')
init        = read('init.js')

# ── Assemble ──────────────────────────────────────────────────────────────────
# Read the original head content (font-faces, meta tags, etc.)
# We keep a head.html snippet for the <head> section
head_html = (SRC / 'head.html').read_text() if (SRC / 'head.html').exists() else ''

html = f'''<!DOCTYPE html>
<html lang="en">
{head_html}
<style>
{css}
</style>

<!-- PptxGenJS 4.0.1 -->
<script id="pptxgen-inline">
{pptxgenjs if pptxgenjs else "// PptxGenJS not found in vendor/ — see README"}
</script>

{html_body}

<script>
// ── DATA ─────────────────────────────────────────────────────────────────────
{brand}

{scenarios}

{evidence}

// ── CORE APP LOGIC ────────────────────────────────────────────────────────────
{core}

// ── EXPORTS ───────────────────────────────────────────────────────────────────
{exports}

// ── LLM PROMPT ────────────────────────────────────────────────────────────────
{llm_prompt}

// ── PPTX BUILDER ──────────────────────────────────────────────────────────────
{pptx_build}

// ── INIT ──────────────────────────────────────────────────────────────────────
{init}
</script>
</html>
'''

OUTPUT.write_text(html, encoding='utf-8')

# ── Verify ────────────────────────────────────────────────────────────────────
content = OUTPUT.read_text()
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
    ok = needle in content
    print(f'  {"✓" if ok else "✗"} {label}')
    if not ok:
        all_ok = False

# Brace balance check
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
    print(f'✅ Build successful — {size_kb}KB → dist/zebra-rfid-value-accelerator.html')
else:
    print('❌ Build has errors — check above')
    sys.exit(1)
