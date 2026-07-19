#!/usr/bin/env python3
"""Convert the Marcus (Corona) Obsidian vault into an interactive codex data file.

Reads the markdown notes, resolves [[wikilinks]] into clickable codex references,
converts Obsidian markdown (headings, tables, lists, quotes, image embeds) to HTML,
and emits assets/js/data.js as `window.CODEX`.
"""
import os, re, json, html

VAULT = os.path.join(os.path.dirname(__file__), "..", "content")
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "js", "data.js")

# ---- filename (basename, no ext) -> slug ----
SLUG = {
    "Marcus": "marcus",
    "The Eclipse Knights": "eclipse-knights",
    "Julius Caerulius Bellator Prima": "julius",
    "Juno Caerulius Aurum Prima": "juno",
    "Lucia Ensis": "lucia",
    "Phoenix": "phoenix",
    "Solas": "solas",
    "The First Emperor": "first-emperor",
    "The Hegemon": "hegemon",
    "Penumbra": "penumbra",
    "The Proving": "proving",
    "The Forty-Nine": "forty-nine",
    "The Imperial Observers": "imperial-observers",
    "Solarian": "solarian",
    "Imperial Conquest": "imperial-conquest",
    "The Eclipse Treaty": "eclipse-treaty",
    "Imperial Offering": "imperial-offering",
    "Helion Nodes": "helion-nodes",
    "Helios Hegemony": "helios-hegemony",
    "Helian Race": "helian-race",
    "Helios Prime": "helios-prime",
    "Caerulius Bloodline": "caerulius-bloodline",
    "Patrilium": "patrilium",
    "Matrilium": "matrilium",
    "Heir Candidacy System": "heir-candidacy",
    "Algalterian Galactic Empire": "algalterian-empire",
    "The Seven Noble Dynasties": "seven-dynasties",
    "House Aegis": "house-aegis",
    "House Aurum": "house-aurum",
    "House Genesis": "house-genesis",
    "House Logos": "house-logos",
    "House Veil": "house-veil",
    "House Vox": "house-vox",
    "House Bellator": "house-bellator",
    "Aegyrium Continent": "aegyrium",
    "Aurion Continent": "aurion",
    "Bellaris Continent": "bellaris",
    "Genethra Continent": "genethra",
    "Logyra Continent": "logyra",
    "Velkaris Continent": "velkaris",
    "Voxara Continent": "voxara",
    "Helios System": "helios-system",
}

# alias (lowercased) -> slug  (built from frontmatter + hand map)
ALIAS = {
    "a-7527": "marcus", "corona": "marcus", "prince sept": "marcus",
    "eclipse knights": "eclipse-knights", "the order": "eclipse-knights",
    "caerulius": "caerulius-bloodline", "ensis": "house-bellator",
    "algalterian conquest": "imperial-conquest", "wars of conquest": "imperial-conquest",
    "heir candidates": "heir-candidacy",
}

# image embed filename -> web asset path (relative to site root)
IMG = {
    "4DB22FE7-2FFB-47FA-9795-9969E9E935B1.png": "assets/img/marcus-portrait.jpg",
    "marcus-armor.png": "assets/img/marcus-armor.jpg",
    "marcus-armor-corona.png": "assets/img/marcus-armor-corona.jpg",
    "marcus-prison-dormant.png": "assets/img/marcus-prison-dormant.jpg",
    "eclipse-knights-emblem.svg": "assets/img/eclipse-knights-emblem.svg",
    "A7D6D2A8-3F35-4773-801D-76B2015F1F74.png": "assets/img/house-sigils.jpg",
    "9B22AEE5-4114-40FC-B524-E63842FC2ACE.png": "assets/img/aegyrium-wide.jpg",
    "IMG_3601.png": "assets/img/continents/aurion.jpg",
    "IMG_3602.png": "assets/img/continents/bellaris.jpg",
    "IMG_3603.png": "assets/img/continents/genethra.jpg",
    "IMG_3604.png": "assets/img/continents/logyra.jpg",
    "IMG_3605.png": "assets/img/continents/velkaris.jpg",
    "IMG_3606.png": "assets/img/continents/voxara.jpg",
}

# curated metadata per slug
META = {
    "marcus": ("character", "Blue Sun · Inmate A-7527", "The Prisoner"),
    "eclipse-knights": ("order", "Order of exiled Solarians", "The Order"),
    "julius": ("people", "Last Hegemon before the Conquest", "History"),
    "juno": ("people", "House Aurum · his first love", "The Prisoner"),
    "lucia": ("people", "The mother who saved him", "The Prisoner"),
    "phoenix": ("order", "The Blade who raised him", "The Order"),
    "solas": ("order", "Sovereign of the Eclipse Knights", "The Order"),
    "first-emperor": ("history", "The first Blue Sun", "History"),
    "hegemon": ("people", "Aurion Caerulius Genesis Prima", "The World"),
    "penumbra": ("order", "Home of the Eclipse Knights", "The Order"),
    "proving": ("order", "The rite that makes a Blade", "The Order"),
    "forty-nine": ("realm", "Marcus's cycle of rivals", "The World"),
    "imperial-observers": ("realm", "The Empire's eyes on Helios Prime", "The World"),
    "solarian": ("power", "Wielders of stellar power", "The Power"),
    "helion-nodes": ("power", "The biology of solar power", "The Power"),
    "imperial-conquest": ("history", "The wars that ended a civilization", "History"),
    "eclipse-treaty": ("history", "The terms of subjugation", "History"),
    "imperial-offering": ("history", "The ritual of forty-nine children", "History"),
    "heir-candidacy": ("history", "How an heir is chosen", "History"),
    "helios-hegemony": ("realm", "A conquered solar civilization", "The World"),
    "helian-race": ("realm", "Warrior humanoids of the blue sun", "The World"),
    "helios-prime": ("realm", "Tidally-locked cradle world", "The World"),
    "helios-system": ("realm", "The home star system", "The World"),
    "caerulius-bloodline": ("realm", "The imperial line of Blue Sun", "The World"),
    "patrilium": ("realm", "Council of the seven Patriarchs", "The World"),
    "matrilium": ("realm", "Council of the Principal Wives", "The World"),
    "algalterian-empire": ("realm", "The conqueror beyond the stars", "The World"),
    "seven-dynasties": ("houses", "The seven great houses", "Seven Houses"),
    "house-aegis": ("houses", "Defense & Security", "Seven Houses"),
    "house-aurum": ("houses", "Wealth & Commerce", "Seven Houses"),
    "house-genesis": ("houses", "Sustenance & Colonization", "Seven Houses"),
    "house-logos": ("houses", "Science & Discovery", "Seven Houses"),
    "house-veil": ("houses", "Intelligence & Shadows", "Seven Houses"),
    "house-vox": ("houses", "Diplomacy & Statecraft", "Seven Houses"),
    "house-bellator": ("houses", "War & Expansion", "Seven Houses"),
    "aegyrium": ("continents", "Seat of House Aegis", "Seven Houses"),
    "aurion": ("continents", "Seat of House Aurum", "Seven Houses"),
    "bellaris": ("continents", "Seat of House Bellator", "Seven Houses"),
    "genethra": ("continents", "Seat of House Genesis", "Seven Houses"),
    "logyra": ("continents", "Seat of House Logos", "Seven Houses"),
    "velkaris": ("continents", "Seat of House Veil", "Seven Houses"),
    "voxara": ("continents", "Seat of House Vox", "Seven Houses"),
}

TITLE_BY_SLUG = {v: k for k, v in SLUG.items()}
# nicer display titles
DISPLAY = {
    "marcus": "Marcus", "eclipse-knights": "The Eclipse Knights",
    "juno": "Juno", "lucia": "Lucia Ensis", "phoenix": "Phoenix",
    "solas": "Solas", "first-emperor": "The First Emperor",
    "hegemon": "The Hegemon", "penumbra": "Penumbra", "proving": "The Proving",
    "forty-nine": "The Forty-Nine", "imperial-observers": "The Imperial Observers",
    "seven-dynasties": "The Seven Noble Dynasties",
    "aegyrium": "Aegyrium", "aurion": "Aurion", "bellaris": "Bellaris",
    "genethra": "Genethra", "logyra": "Logyra", "velkaris": "Velkaris",
    "voxara": "Voxara", "helios-system": "Helios System",
    "algalterian-empire": "Algalterian Galactic Empire",
}

def resolve(target):
    """Resolve a wikilink target string to a slug, or None."""
    t = target.strip()
    t = t.split("/")[-1]  # strip path
    if t in SLUG:
        return SLUG[t]
    tl = t.lower()
    for k, v in SLUG.items():
        if k.lower() == tl:
            return v
    if tl in ALIAS:
        return ALIAS[tl]
    return None

UNRESOLVED = set()

def conv_inline(text):
    """Inline markdown: wikilinks, bold, italic, escaping."""
    # protect: escape HTML first, then re-introduce our tags
    text = html.escape(text)
    # image embeds handled elsewhere (block); ignore here
    # wikilinks [[target|alias]] or [[target]]  (pipe may be escaped \|)
    def wl(m):
        inner = m.group(1)
        inner = inner.replace("\\|", "|")
        if "|" in inner:
            tgt, alias = inner.split("|", 1)
        else:
            tgt, alias = inner, inner
        tgt = tgt.strip(); alias = alias.strip()
        slug = resolve(tgt)
        alias_disp = alias.split("/")[-1]
        if slug:
            return f'<a class="xlink" data-entry="{slug}">{html.escape(alias_disp)}</a>'
        UNRESOLVED.add(tgt)
        return f'<span class="xlink-dead">{html.escape(alias_disp)}</span>'
    text = re.sub(r"\[\[([^\]]+)\]\]", wl, text)
    # bold then italic
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", text)
    return text

def split_cells(row):
    """Split a table row on unescaped pipes, preserving \\| inside cells."""
    row = row.strip().strip("|")
    parts = re.split(r"(?<!\\)\|", row)
    return [p.strip() for p in parts]

def is_table_sep(line):
    return bool(re.match(r"^\s*\|?[\s:|-]+\|[\s:|-]+", line)) and set(line.replace("|","").replace(":","").strip()) <= {"-"," "}

def conv(md):
    """Convert a markdown body (frontmatter already stripped) to HTML."""
    lines = md.split("\n")
    out = []
    i = 0
    n = len(lines)
    def flush_para(buf):
        if buf:
            out.append("<p>" + conv_inline(" ".join(buf).strip()) + "</p>")
            buf.clear()
    para = []
    while i < n:
        line = lines[i]
        raw = line.rstrip()
        stripped = raw.strip()

        # image embed ![[file]]
        m = re.match(r"^!\[\[([^\]]+)\]\]$", stripped)
        if m:
            flush_para(para)
            fn = m.group(1).split("|")[0].strip()
            src = IMG.get(fn)
            if src:
                out.append(f'<figure class="fig"><img loading="lazy" src="{src}" alt=""></figure>')
            i += 1; continue

        # blank
        if stripped == "":
            flush_para(para); i += 1; continue

        # hr
        if stripped == "---":
            flush_para(para); out.append('<hr>'); i += 1; continue

        # heading
        hm = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if hm:
            flush_para(para)
            lvl = len(hm.group(1))
            lvl = min(max(lvl, 2), 4)
            out.append(f"<h{lvl}>{conv_inline(hm.group(2).strip())}</h{lvl}>")
            i += 1; continue

        # table
        if stripped.startswith("|") and i + 1 < n and "|" in lines[i+1] and set(lines[i+1].replace("|","").replace(":","").strip()) <= {"-"," "}:
            flush_para(para)
            header = split_cells(stripped)
            i += 2
            rows = []
            while i < n and lines[i].strip().startswith("|"):
                rows.append(split_cells(lines[i]))
                i += 1
            t = ['<div class="table-wrap"><table>']
            t.append("<thead><tr>" + "".join(f"<th>{conv_inline(c)}</th>" for c in header) + "</tr></thead>")
            t.append("<tbody>")
            for r in rows:
                t.append("<tr>" + "".join(f"<td>{conv_inline(c)}</td>" for c in r) + "</tr>")
            t.append("</tbody></table></div>")
            out.append("".join(t))
            continue

        # blockquote (possibly multi-line)
        if stripped.startswith(">"):
            flush_para(para)
            buf = []
            while i < n and lines[i].strip().startswith(">"):
                buf.append(re.sub(r"^\s*>\s?", "", lines[i]))
                i += 1
            out.append('<blockquote>' + conv_inline(" ".join(x.strip() for x in buf).strip()) + '</blockquote>')
            continue

        # unordered list
        if re.match(r"^\s*[-*]\s+", raw):
            flush_para(para)
            items = []
            while i < n and re.match(r"^\s*[-*]\s+", lines[i]):
                items.append(re.sub(r"^\s*[-*]\s+", "", lines[i]).strip())
                i += 1
            out.append("<ul>" + "".join(f"<li>{conv_inline(it)}</li>" for it in items) + "</ul>")
            continue

        # ordered list
        if re.match(r"^\s*\d+\.\s+", raw):
            flush_para(para)
            items = []
            while i < n and re.match(r"^\s*\d+\.\s+", lines[i]):
                items.append(re.sub(r"^\s*\d+\.\s+", "", lines[i]).strip())
                i += 1
            out.append("<ol>" + "".join(f"<li>{conv_inline(it)}</li>" for it in items) + "</ol>")
            continue

        # paragraph text
        para.append(stripped)
        i += 1
    flush_para(para)
    return "\n".join(out)

def parse_file(path):
    with open(path, encoding="utf-8") as f:
        txt = f.read()
    aliases = []
    # frontmatter
    if txt.startswith("---"):
        m = re.match(r"^---\n(.*?)\n---\n?", txt, re.S)
        if m:
            fm = m.group(1)
            txt = txt[m.end():]
            for am in re.findall(r"-\s*(.+)", fm):
                aliases.append(am.strip())
    return aliases, txt

def main():
    entries = {}
    for root, _, files in os.walk(VAULT):
        if "__MACOSX" in root or ".obsidian" in root:
            continue
        for fn in files:
            if not fn.endswith(".md"):
                continue
            base = fn[:-3]
            if base not in SLUG:
                print("SKIP (no slug):", base); continue
            slug = SLUG[base]
            aliases, body = parse_file(os.path.join(root, fn))
            for a in aliases:
                ALIAS[a.lower()] = slug
    # second pass now that aliases registered
    for root, _, files in os.walk(VAULT):
        if "__MACOSX" in root or ".obsidian" in root:
            continue
        for fn in files:
            if not fn.endswith(".md"):
                continue
            base = fn[:-3]
            if base not in SLUG:
                continue
            slug = SLUG[base]
            aliases, body = parse_file(os.path.join(root, fn))
            html_body = conv(body)
            cat, tag, section = META.get(slug, ("realm", "", "The World"))
            title = DISPLAY.get(slug, base)
            entries[slug] = {
                "slug": slug, "title": title, "aliases": aliases,
                "category": cat, "tagline": tag, "section": section,
                "html": html_body,
            }
    # emit
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* Auto-generated from the Marcus (Corona) Obsidian vault. Do not edit by hand. */\n")
        f.write("window.CODEX = ")
        f.write(json.dumps(entries, ensure_ascii=False, indent=1))
        f.write(";\n")
    print("Wrote", OUT, "with", len(entries), "entries")
    if UNRESOLVED:
        print("UNRESOLVED wikilinks:", sorted(UNRESOLVED))

if __name__ == "__main__":
    main()
