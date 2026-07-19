#!/usr/bin/env python3
"""Generate the four Eclipse Knights rank insignia as self-contained SVGs.

The corona 'waxes' with rank: Aspirant (cold, unproven) -> Squire (a first
crescent) -> Blade (full corona + crossed swords) -> Sovereign (full corona,
laurel, and a gold crown). Shared eclipse language ties them to the order emblem.
"""
import math, os

CX, CY = 64, 60
R_DISC = 21
OUT = "/home/user/Corona/assets/img/ranks"
os.makedirs(OUT, exist_ok=True)

def P(x, y): return f"{x:.2f} {y:.2f}"
def polar(cx, cy, r, deg):
    a = math.radians(deg); return cx + r*math.cos(a), cy + r*math.sin(a)

def prominences(cx, cy, r0, r1, n, half_w, seed):
    out = []
    for i in range(n):
        deg = -90 + i*(360/n)
        rl = r1*seed[i % len(seed)]
        x1, y1 = polar(cx, cy, r0, deg-half_w)
        x2, y2 = polar(cx, cy, r0, deg+half_w)
        tx, ty = polar(cx, cy, rl, deg)
        out.append(f'<path d="M {P(x1,y1)} L {P(tx,ty)} L {P(x2,y2)} Z"/>')
    return "\n".join(out)

def pips(cx, cy, n, color):
    out = []
    gap = 11
    x0 = cx - (n-1)*gap/2
    for i in range(n):
        x = x0 + i*gap
        out.append(f'<path d="M {x:.1f} {cy-4} L {x+4:.1f} {cy} L {x:.1f} {cy+4} L {x-4:.1f} {cy} Z" fill="{color}"/>')
    return "\n".join(out)

def chevrons(cx, cy, n, color):
    out = []
    for i in range(n):
        yy = cy + i*6
        out.append(f'<path d="M {cx-9} {yy} L {cx} {yy+6} L {cx+9} {yy}" fill="none" stroke="{color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>')
    return "\n".join(out)

SEED = [1.0, 0.72, 0.9, 0.66, 1.0, 0.74, 0.88, 0.64]

DEFS = '''
  <radialGradient id="fld" cx="50%" cy="42%" r="70%">
    <stop offset="0%" stop-color="#0d1830"/><stop offset="60%" stop-color="#070c1c"/><stop offset="100%" stop-color="#03050c"/>
  </radialGradient>
  <radialGradient id="disc" cx="46%" cy="42%" r="62%">
    <stop offset="0%" stop-color="#0a1122"/><stop offset="70%" stop-color="#05070f"/><stop offset="100%" stop-color="#020308"/>
  </radialGradient>
  <radialGradient id="cor" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffffff"/><stop offset="34%" stop-color="#cfeeff"/><stop offset="64%" stop-color="#66b8f2"/><stop offset="100%" stop-color="#1b4f96" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="corGrey" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#e7ecf4"/><stop offset="45%" stop-color="#9aa6bc"/><stop offset="100%" stop-color="#4a5568" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="steel" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#59647a"/><stop offset="50%" stop-color="#e6ecf6"/><stop offset="100%" stop-color="#4a5568"/>
  </linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f4e9c2"/><stop offset="50%" stop-color="#d3ad55"/><stop offset="100%" stop-color="#8a6a26"/>
  </linearGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="soft" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="5"/></filter>
'''

def badge(name, ring_col, ring_w, corona, accent, marker, extra_back="", extra_front="", label_col=None):
    dclass = "url(#disc)"
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Eclipse Knights rank insignia: {name}.">']
    svg.append(f'<defs>{DEFS}</defs>')
    # outer aura for higher ranks
    if accent:
        svg.append(f'<circle cx="{CX}" cy="{CY}" r="52" fill="{accent}" opacity="0.20" filter="url(#soft)"/>')
    # crossed swords / back extras behind medallion
    svg.append(extra_back)
    # medallion
    svg.append(f'<circle cx="{CX}" cy="{CY}" r="55" fill="{ring_col}"/>')
    svg.append(f'<circle cx="{CX}" cy="{CY}" r="{55-ring_w}" fill="url(#fld)"/>')
    svg.append(f'<circle cx="{CX}" cy="{CY}" r="{55-ring_w-2}" fill="none" stroke="{accent or "#5b6a7a"}" stroke-width="0.8" opacity="0.5"/>')
    # corona behind disc
    svg.append(corona)
    # occulting disc
    svg.append(f'<circle cx="{CX}" cy="{CY}" r="{R_DISC}" fill="{dclass}"/>')
    svg.append(extra_front)
    # marker (pips/chevrons/crown) near bottom
    svg.append(marker)
    svg.append('</svg>')
    with open(f"{OUT}/{name}.svg", "w") as f:
        f.write("\n".join(svg))

# ---------- ASPIRANT: cold, no corona, unproven ----------
aspirant_corona = f'''<circle cx="{CX}" cy="{CY}" r="{R_DISC}" fill="none" stroke="url(#corGrey)" stroke-width="2" opacity="0.7"/>
<circle cx="{CX}" cy="{CY}" r="{R_DISC+0.5}" fill="none" stroke="#aeb9cc" stroke-width="0.8" opacity="0.5"/>'''
badge("aspirant", ring_col="#5a6478", ring_w=4, corona=aspirant_corona,
      accent="#8792a6", marker=pips(CX, 100, 1, "#9aa6bc"))

# ---------- SQUIRE: a waxing crescent of corona ----------
# crescent: bright arc on upper-left of the disc rim
cr_a1, cr_a2 = 205, 320  # upper-left sweep
p1 = polar(CX, CY, R_DISC+1, cr_a1); p2 = polar(CX, CY, R_DISC+1, cr_a2)
squire_corona = f'''<circle cx="{CX}" cy="{CY}" r="30" fill="url(#cor)" opacity="0.28" filter="url(#soft)"/>
<path d="M {P(*p1)} A {R_DISC+1} {R_DISC+1} 0 0 1 {P(*p2)}" fill="none" stroke="url(#cor)" stroke-width="4" filter="url(#glow)"/>
<path d="M {P(*p1)} A {R_DISC+1} {R_DISC+1} 0 0 1 {P(*p2)}" fill="none" stroke="#eaf6ff" stroke-width="1.3"/>'''
badge("squire", ring_col="#3f6aad", ring_w=4, corona=squire_corona,
      accent="#7fb3e6", marker=chevrons(CX, 96, 1, "#bfe0ff"))

# ---------- BLADE: full corona + prominences + crossed swords ----------
def small_sword():
    return '''<g>
      <path d="M64 8 L66.4 30 L65.2 84 L62.8 84 L61.6 30 Z" fill="url(#steel)" stroke="#2b3242" stroke-width="0.5"/>
      <rect x="55" y="83" width="18" height="3.2" rx="1.2" fill="url(#gold)"/>
      <rect x="62.6" y="86" width="2.8" height="26" rx="1.2" fill="#26304a"/>
      <circle cx="64" cy="115" r="4" fill="url(#gold)"/>
    </g>'''
blade_back = f'<g transform="rotate(33 {CX} {CY})">{small_sword()}</g><g transform="rotate(-33 {CX} {CY})">{small_sword()}</g>'
blade_corona = f'''<circle cx="{CX}" cy="{CY}" r="32" fill="url(#cor)" opacity="0.4" filter="url(#soft)"/>
<g fill="url(#cor)" filter="url(#glow)">{prominences(CX, CY, R_DISC-2, R_DISC+13, 14, 3.0, SEED)}</g>
<circle cx="{CX}" cy="{CY}" r="{R_DISC+1}" fill="none" stroke="url(#cor)" stroke-width="4" filter="url(#glow)"/>
<circle cx="{CX}" cy="{CY}" r="{R_DISC+1}" fill="none" stroke="#eaf6ff" stroke-width="1.3"/>'''
badge("blade", ring_col="#4a8fe0", ring_w=4, corona=blade_corona,
      accent="#6cc6ff", marker=chevrons(CX, 92, 2, "#dff0ff"), extra_back=blade_back)

# ---------- SOVEREIGN: full corona + laurel + gold crown ----------
def laurel_small(side):
    a1, a2 = (188, 92) if side > 0 else (352, 88)
    leaves = []
    for i in range(6):
        t = i/5
        deg = a1 + (a2-a1)*t
        px, py = polar(CX, CY+6, 30, deg)
        grow = 6.5
        lead = 11*side
        tx, ty = polar(CX, CY+6, 30+grow, deg+lead)
        c1 = polar(CX, CY+6, 30+grow*0.6, deg+lead*0.2)
        c2 = polar(CX, CY+6, 30+grow*0.6, deg+lead*0.85)
        leaves.append(f'<path d="M {P(px,py)} Q {P(*c1)} {P(tx,ty)} Q {P(*c2)} {P(px,py)} Z" fill="url(#gold)" opacity="0.92"/>')
    return "\n".join(leaves)
crown = '''<g filter="url(#glow)">
  <path d="M50 26 L50 15 L57 21 L64 12 L71 21 L78 15 L78 26 Z" fill="url(#gold)" stroke="#8a6a26" stroke-width="0.6"/>
  <circle cx="64" cy="10" r="2.4" fill="#fff6da"/>
</g>'''
sov_corona = f'''<circle cx="{CX}" cy="{CY}" r="34" fill="url(#cor)" opacity="0.45" filter="url(#soft)"/>
<g fill="url(#cor)" filter="url(#glow)">{prominences(CX, CY, R_DISC-2, R_DISC+14, 16, 2.8, SEED)}</g>
<circle cx="{CX}" cy="{CY}" r="{R_DISC+1}" fill="none" stroke="url(#cor)" stroke-width="4.5" filter="url(#glow)"/>
<circle cx="{CX}" cy="{CY}" r="{R_DISC+1}" fill="none" stroke="#ffffff" stroke-width="1.4"/>'''
sov_front = f'<g filter="url(#glow)">{laurel_small(1)}{laurel_small(-1)}</g>'
badge("sovereign", ring_col="url(#gold)", ring_w=4, corona=sov_corona,
      accent="#8fd3ff", marker=crown, extra_front=sov_front)

# ---------- contact sheet ----------
tiles = ["aspirant", "squire", "blade", "sovereign"]
sheet = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 160">',
         '<rect width="560" height="160" fill="#080a12"/>']
labels = ["ASPIRANT", "SQUIRE", "BLADE", "SOVEREIGN"]
for i, t in enumerate(tiles):
    x = 20 + i*135
    inner = open(f"{OUT}/{t}.svg").read()
    inner = inner[inner.find(">")+1:inner.rfind("</svg>")]
    sheet.append(f'<g transform="translate({x} 8) scale(0.86)">{inner}</g>')
    sheet.append(f'<text x="{x+55}" y="150" fill="#cfe0ff" font-family="serif" font-size="14" text-anchor="middle" letter-spacing="2">{labels[i]}</text>')
sheet.append('</svg>')
with open("/home/user/Corona/assets/img/ranks/_sheet.svg", "w") as f:
    f.write("\n".join(sheet))
print("wrote", tiles)
