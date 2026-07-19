#!/usr/bin/env python3
"""Generate the Eclipse Knights emblem as a self-contained SVG."""
import math

CX, CY = 200, 205
W, H = 400, 430

def P(x, y): return f"{x:.2f} {y:.2f}"

def polar(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)

# ---- solar prominences (tapered flares around the eclipse) ----
def prominences(cx, cy, r0, r1, n, half_w, seed_lens):
    out = []
    for i in range(n):
        deg = -90 + i * (360 / n)
        rl = r1 * seed_lens[i % len(seed_lens)]
        bx1, by1 = polar(cx, cy, r0, deg - half_w)
        bx2, by2 = polar(cx, cy, r0, deg + half_w)
        tx, ty = polar(cx, cy, rl, deg)
        out.append(f'<path d="M {P(bx1,by1)} L {P(tx,ty)} L {P(bx2,by2)} Z"/>')
    return "\n".join(out)

# ---- laurel branch: leaves along an arc from a1 to a2 at given radius ----
def laurel(cx, cy, radius, a1, a2, n, side):
    leaves = []
    # main stem (arc)
    x1, y1 = polar(cx, cy, radius, a1)
    xm, ym = polar(cx, cy, radius + 6, (a1 + a2) / 2)
    x2, y2 = polar(cx, cy, radius, a2)
    stem = f'<path class="stem" d="M {P(x1,y1)} Q {P(xm,ym)} {P(x2,y2)}"/>'
    leaves.append(stem)
    for i in range(n):
        t = i / (n - 1)
        deg = a1 + (a2 - a1) * t
        px, py = polar(cx, cy, radius, deg)
        # leaf points outward+forward
        grow = 11 - 3 * math.sin(t * math.pi)
        lead = 12 * side
        tipx, tipy = polar(cx, cy, radius + grow, deg + lead)
        # control points to make a leaf blade
        c1x, c1y = polar(cx, cy, radius + grow * 0.6, deg + lead * 0.2)
        c2x, c2y = polar(cx, cy, radius + grow * 0.6, deg + lead * 0.85)
        leaves.append(
            f'<path class="leaf" d="M {P(px,py)} Q {P(c1x,c1y)} {P(tipx,tipy)} '
            f'Q {P(c2x,c2y)} {P(px,py)} Z"/>')
    return "\n".join(leaves)

# ---- a single sword pointing up, centered at x=200 ----
def sword():
    return '''<g class="sword">
      <path class="blade" d="M 200 16 L 206 80 L 203 200 L 197 200 L 194 80 Z"/>
      <path class="blade-hi" d="M 200 24 L 201.6 80 L 200.8 198 L 200 198 Z"/>
      <rect class="guard" x="174" y="198" width="52" height="9" rx="3"/>
      <rect class="grip" x="196" y="207" width="8" height="170" rx="4"/>
      <circle class="pommel" cx="200" cy="388" r="11"/>
      <circle class="pommel-hi" cx="196.8" cy="384.8" r="3.6"/>
    </g>'''

seed = [1.0, 0.74, 0.9, 0.66, 1.0, 0.72, 0.88, 0.64]
prom = prominences(CX, CY, 44, 96, 16, 2.4, seed)
# eclipse position within the medallion (slightly above centre of inner field)
ECX, ECY = 200, 196
prom = prominences(ECX, ECY, 40, 78, 16, 2.6, seed)
wreath_L = laurel(ECX, ECY + 10, 100, 168, 90, 10, +1)
wreath_R = laurel(ECX, ECY + 10, 100, 12, 90, 10, -1)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="Emblem of the Eclipse Knights: an eclipsed blue sun crowned with corona, over crossed swords and a laurel wreath.">
<defs>
  <radialGradient id="ekField" cx="50%" cy="42%" r="72%">
    <stop offset="0%" stop-color="#0d1830"/>
    <stop offset="55%" stop-color="#070c1c"/>
    <stop offset="100%" stop-color="#03050c"/>
  </radialGradient>
  <linearGradient id="ekRim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#bfe4ff"/>
    <stop offset="50%" stop-color="#5aa0e6"/>
    <stop offset="100%" stop-color="#22508f"/>
  </linearGradient>
  <radialGradient id="ekCorona" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="30%" stop-color="#cfeeff"/>
    <stop offset="60%" stop-color="#66b8f2"/>
    <stop offset="100%" stop-color="#1b4f96" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="ekDisc" cx="46%" cy="42%" r="62%">
    <stop offset="0%" stop-color="#0a1122"/>
    <stop offset="70%" stop-color="#05070f"/>
    <stop offset="100%" stop-color="#020308"/>
  </radialGradient>
  <linearGradient id="ekSteel" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#59647a"/>
    <stop offset="45%" stop-color="#d7e0ee"/>
    <stop offset="55%" stop-color="#eef3fb"/>
    <stop offset="100%" stop-color="#4a5568"/>
  </linearGradient>
  <linearGradient id="ekGold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f0e3b8"/>
    <stop offset="50%" stop-color="#c9a24a"/>
    <stop offset="100%" stop-color="#8a6a26"/>
  </linearGradient>
  <linearGradient id="ekLeaf" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#bfe6ff"/>
    <stop offset="100%" stop-color="#3f79c8"/>
  </linearGradient>
  <filter id="ekGlow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="ekSoft" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="9"/>
  </filter>
  <path id="ekTopArc" d="M {P(*polar(CX,CY,133,183))} A 133 133 0 0 1 {P(*polar(CX,CY,133,-3))}" fill="none"/>
  <path id="ekBotArc" d="M {P(*polar(CX,CY,127,150))} A 127 127 0 0 0 {P(*polar(CX,CY,127,30))}" fill="none"/>
</defs>

<style>
  .blade{{fill:url(#ekSteel);stroke:#2b3242;stroke-width:1}}
  .blade-hi{{fill:#f4f8ff;opacity:.7}}
  .guard{{fill:url(#ekGold);stroke:#5c4718;stroke-width:.8}}
  .grip{{fill:#26304a;stroke:none;stroke-width:0}}
  .pommel{{fill:url(#ekGold);stroke:#5c4718;stroke-width:.8}}
  .pommel-hi{{fill:#fff6da;opacity:.8}}
  .prom{{fill:url(#ekCorona)}}
  .leaf{{fill:url(#ekLeaf);stroke:#274d86;stroke-width:.5}}
  .stem{{fill:none;stroke:#4f86c9;stroke-width:1.6}}
  .bandtext{{fill:#dbe9ff;font-family:'Cinzel','Times New Roman',serif;font-weight:700;letter-spacing:5px}}
  .mottotext{{fill:#8fb4e6;font-family:'Cinzel','Times New Roman',serif;font-weight:600;letter-spacing:3px}}
</style>

<!-- outer aura -->
<circle cx="{CX}" cy="{CY}" r="150" fill="#3a78c8" opacity="0.28" filter="url(#ekSoft)"/>

<!-- crossed swords behind medallion -->
<g transform="rotate(34 {CX} {CY})">{sword()}</g>
<g transform="rotate(-34 {CX} {CY})">{sword()}</g>

<!-- medallion -->
<circle cx="{CX}" cy="{CY}" r="151" fill="url(#ekRim)"/>
<circle cx="{CX}" cy="{CY}" r="147" fill="url(#ekField)"/>
<circle cx="{CX}" cy="{CY}" r="147" fill="none" stroke="none" stroke-width="0"/>

<!-- ring band -->
<circle cx="{CX}" cy="{CY}" r="120" fill="none" stroke="#8fc4ff" stroke-width="1.2" opacity=".55"/>
<circle cx="{CX}" cy="{CY}" r="146" fill="none" stroke="#9fd0ff" stroke-width="1" opacity=".5"/>
<text class="bandtext" font-size="18"><textPath href="#ekTopArc" startOffset="50%" text-anchor="middle">THE ECLIPSE KNIGHTS</textPath></text>
<text class="mottotext" font-size="11"><textPath href="#ekBotArc" startOffset="50%" text-anchor="middle">OBSCURED · NOT EXTINGUISHED</textPath></text>

<!-- inner field -->
<circle cx="{CX}" cy="{CY}" r="119" fill="url(#ekField)"/>

<!-- apex spark -->
<g transform="translate({CX} 92)" filter="url(#ekGlow)">
  <path d="M 0 -14 L 3 -3 L 14 0 L 3 3 L 0 14 L -3 3 L -14 0 L -3 -3 Z" fill="url(#ekCorona)"/>
</g>

<!-- laurel wreath -->
<g filter="url(#ekGlow)" opacity="0.96">
{wreath_L}
{wreath_R}
</g>
<!-- wreath tie -->
<path d="M 188 296 Q 200 306 212 296" fill="none" stroke="#4f86c9" stroke-width="2"/>

<!-- the eclipse -->
<circle cx="{ECX}" cy="{ECY}" r="70" fill="url(#ekCorona)" opacity="0.5" filter="url(#ekSoft)"/>
<g class="prom" filter="url(#ekGlow)">
{prom}
</g>
<circle cx="{ECX}" cy="{ECY}" r="46" fill="url(#ekDisc)"/>
<circle cx="{ECX}" cy="{ECY}" r="46" fill="none" stroke="url(#ekCorona)" stroke-width="4" filter="url(#ekGlow)"/>
<circle cx="{ECX}" cy="{ECY}" r="46" fill="none" stroke="#eaf6ff" stroke-width="1.4" opacity=".9"/>
<!-- corona spill crescent (lower-left) -->
<path d="M {P(*polar(ECX,ECY,47,40))} A 47 47 0 0 1 {P(*polar(ECX,ECY,47,175))}" fill="none" stroke="#ffffff" stroke-width="2.4" opacity=".85" filter="url(#ekGlow)"/>
</svg>'''

with open("/home/user/Corona/assets/img/eclipse-knights-emblem.svg", "w") as f:
    f.write(svg)
print("wrote emblem")
