# CORONA — The Codex of Marcus, A-7527

An interactive character-backstory website for a **Starfinder 2e** campaign, built from
the *Marcus (Corona)* worldbuilding vault.

**Marcus** — "Corona", Inmate A-7527 — is the seventh child of the seventh noble house of
the Helios Hegemony: a true **Blue Sun Solarian**, exiled in secret as a child, raised by
the **Eclipse Knights**, and now held in an Imperial containment field.

## The site

A single-page immersive codex with:

- **The Prisoner** — Marcus's full dossier and Imperial detention card.
- **The Power** — an interactive solar-color spectrum, a Photon/Graviton attunement toggle,
  and a hover-driven chart of the Helian lifespan across all 20 stellar stages.
- **The World** — the Helios Hegemony, its Solar Throne, and the rule of seven.
- **The Seven Houses** — a sigil-driven explorer for all seven noble dynasties and their continents.
- **History** — an interactive timeline from the Blue Sun Emperor to the present.
- **The Eclipse Knights** — the order, its ladder of ranks, and the Proving.
- **The Codex** — a searchable, filterable grid of all 32 interconnected records, with a
  cross-linked reading drawer that mirrors the original Obsidian vault's `[[wikilinks]]`.

## How it's built

Pure static HTML / CSS / vanilla JS — no framework, no build step.

- `index.html` — page structure.
- `assets/css/styles.css` — the cosmic-imperial theme.
- `assets/js/app.js` — all interactivity (starfield, drawer/cross-link system, spectrum,
  attunement, SVG chart, houses explorer, timeline, codex search).
- `content/` — the **source of truth** for all lore: the Obsidian-style markdown notes,
  organized by folder (People, Helios History, Helios Hegemony, The Seven Great Houses,
  Continents). Edit these to change the story.
- `tools/build_data.py` — converts `content/` into `assets/js/data.js` (headings, tables,
  image embeds, and `[[wikilinks]]` become interactive cross-links). Run `python3 tools/build_data.py`
  after editing any note.
- `assets/js/data.js` — generated codex content. Do not edit by hand; regenerate from `content/`.
- `assets/img/` — the portrait, house sigils (cropped from the source sheet), and continent art.

### Editing the lore

1. Edit the relevant file under `content/`.
2. Run `python3 tools/build_data.py` to regenerate `assets/js/data.js`.
3. Commit both the changed note and the regenerated `data.js`.

## Deployment

Deployed to **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`) on every
push to `main`.

---

*A character codex for a Starfinder 2e campaign. Worldbuilding & character by Milec.
Solarian is a class of the Starfinder system.*
