/* ============================================================
   CORONA — interactive codex application
   ============================================================ */
(function () {
  "use strict";
  const CODEX = window.CODEX || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  const CAT_COLOR = {
    character: "#6cc6ff", order: "#a7dbff", people: "#c9a24a", power: "#8fd0ff",
    history: "#e8c26a", realm: "#9d84d8", houses: "#e5b34d", continents: "#4fbf7b",
  };
  const CAT_LABEL = {
    character: "Character", order: "The Order", people: "Figures", power: "Power",
    history: "History", realm: "The World", houses: "Houses", continents: "Continents",
  };

  /* ---------- static play-data (grounded in the codex source) ---------- */
  const SPECTRUM = [
    { key: "red", name: "Red Sun", color: "#e5533d", rarity: "Lowest expression",
      desc: "Comparatively limited output, with abilities that manifest slowly and favor density, endurance, and gravitational influence over destructive force. Stable and difficult to extinguish, but lacking overwhelming intensity." },
    { key: "orange", name: "Orange Sun", color: "#f08a3c", rarity: "Moderate manifestation",
      desc: "Greater thermal and kinetic output than Red Suns while maintaining strong stability and control. Reliable and resilient — capable of sustaining prolonged combat without the volatility of higher colors." },
    { key: "yellow", name: "Yellow Sun", color: "#f2c94c", rarity: "The historical standard",
      desc: "The midpoint of the spectrum and the most common manifestation among the noble bloodlines: powerful enough to vastly surpass ordinary Helians, yet stable enough to refine through discipline. Most of Helian history's legendary Solarians were Yellow Suns." },
    { key: "green", name: "Green Sun", color: "#4fbf7b", rarity: "High-order manifestation",
      desc: "Advanced control and heightened solar perception. Greater output than Yellow Suns, expressed through precision rather than scale — command over energy manipulation, sensory range, and refined force." },
    { key: "blue", name: "Blue Sun", color: "#6cc6ff", rarity: "Marcus · the upper limit",
      desc: "An extremely rare manifestation at the upper limits of confirmed Solarian evolution. Vastly greater output than all lower spectra; awakens earlier and more violently. Their presence alone can destabilize environments through heat, pressure, and radiant force. The Hegemony's millennia of bloodline programs chased this and almost never caught it." },
  ];

  const STAGES = [
    { lv: "1–2", name: "Protostar", short: "Protostar", lo: 80, hi: 120, mid: 100, color: "#3a4a86" },
    { lv: "3–4", name: "T Tauri", short: "T Tauri", lo: 150, hi: 250, mid: 200, color: "#4f8fd8" },
    { lv: "5–7", name: "Main Sequence — Young", short: "MS · Young", lo: 400, hi: 700, mid: 550, color: "#d9c24a" },
    { lv: "8–10", name: "Main Sequence — Prime", short: "MS · Prime", lo: 1000, hi: 2000, mid: 1500, color: "#f2c94c", peak: true },
    { lv: "11–13", name: "Subgiant", short: "Subgiant", lo: 600, hi: 900, mid: 750, color: "#f08a3c" },
    { lv: "14–16", name: "Red Giant", short: "Red Giant", lo: 300, hi: 500, mid: 400, color: "#e5533d" },
    { lv: "17–18", name: "Helium Flash", short: "He Flash", lo: 100, hi: 150, mid: 125, color: "#c0392b" },
    { lv: "19", name: "White Dwarf / Supernova", short: "Supernova", lo: 40, hi: 60, mid: 50, color: "#9d84d8" },
    { lv: "20", name: "Stellar Remnant", short: "Remnant", lo: 20, hi: 30, mid: 25, color: "#6a5a9a" },
  ];

  const HOUSES = [
    { slug: "house-bellator", n: "Bellator", family: "Ensis", domain: "War & Expansion", color: "#e5533d",
      sigil: "bellator", continent: "bellaris", capital: "Bellator Rex", seat: "Bellaris",
      patriarch: "Rael Caerulius Ensis Sexta", wife: "Draea Ensis",
      spec: "Superior combat instincts, physical aptitude, and tactical aggression — nobles whose aristocracy is measured in campaigns won.",
      marcus: "Marcus — A-7527, “Corona” — was born the seventh child of this house's cycle: a true Solarian, exiled in secret by his mother." },
    { slug: "house-aegis", n: "Aegis", family: "Aegis", domain: "Defense & Security", color: "#7fa8d8",
      sigil: "aegis", continent: "aegyrium", capital: "Aegyrion Prime", seat: "Aegyrium",
      patriarch: "Varro Caerulius Aegis Tertius", wife: "Valeria Aegis",
      spec: "Tactical acuity, heightened threat assessment, and exceptional endurance — the tacticians, admirals, and guardians of imperial stability." },
    { slug: "house-veil", n: "Veil", family: "Veil", domain: "Intelligence & Shadows", color: "#9d84d8",
      sigil: "veil", continent: "velkaris", capital: "Vel Astra", seat: "Velkaris",
      patriarch: "Davan Caerulius Veil Secunda", wife: "Mira Veil",
      spec: "Perceptual acuity, emotional regulation, and deception — nobles difficult to read, impossible to surprise, comfortable where nothing is as it appears." },
    { slug: "house-logos", n: "Logos", family: "Logos", domain: "Science & Discovery", color: "#4fb9b0",
      sigil: "logos", continent: "logyra", capital: "Logyrium Ascendant", seat: "Logyra",
      patriarch: "Auren Caerulius Logos Prima", wife: "Ira Logos",
      spec: "Cognitive capability and pattern recognition — philosopher-engineers who regard any unsolved problem as a personal affront." },
    { slug: "house-vox", n: "Vox", family: "Vox", domain: "Diplomacy & Statecraft", color: "#e8c26a",
      sigil: "vox", continent: "voxara", capital: "Vox Imperialis", seat: "Voxara",
      patriarch: "Elia Caerulius Vox Quarta", wife: "Calla Vox",
      spec: "Oratory, social cognition, and ideological fluency — nobles who can hold a room, move a population, or end a crisis with the right words." },
    { slug: "house-aurum", n: "Aurum", family: "Aurum", domain: "Wealth & Commerce", color: "#e0a83c",
      sigil: "aurum", continent: "aurion", capital: "Sol Aurelia", seat: "Aurion",
      patriarch: "Cassia Caerulius Aurum Sept", wife: "Lyris Aurum",
      spec: "Economic intuition, persuasion, and long-horizon strategy — nobles who understand that controlling resources is the quietest form of conquest." },
    { slug: "house-genesis", n: "Genesis", family: "Genesis", domain: "Sustenance & Colonization", color: "#4fbf7b",
      sigil: "genesis", continent: "genethra", capital: "Nova Genesis", seat: "Genethra",
      patriarch: "Orin Caerulius Genesis Quinta", wife: "Senna Genesis",
      spec: "Biological intuition, patience, and systems thinking — nobles who think in generations and regard every living thing as something to optimize." },
  ];

  const TIMELINE = [
    { era: "The Founding", title: "The Blue Sun Emperor", color: "#6cc6ff", entry: "caerulius-bloodline",
      blurb: "The first and only Blue Sun unites the seven continents beneath a single banner and binds the dynasties to the throne through the Imperial Offering." },
    { era: "The Height", title: "A Star-System Power", color: "#e8c26a", entry: "helios-hegemony",
      blurb: "At its zenith the Hegemony controls the entire Helios System — colonies, fleets, and Solarian warriors conventional forces could not counter." },
    { era: "The Wars", title: "First Contact & Invasion", color: "#f08a3c", entry: "imperial-conquest",
      blurb: "The Algalterian Empire invades. Helian Solarians hold the line for decades, but scale, industry, and patience grind the outer colonies down." },
    { era: "The Wars", title: "The Betrayal", color: "#e5533d", entry: "imperial-conquest",
      blurb: "A faction of nobility secretly bargains with the Empire — titles and domains in exchange for delivering the Solarians who had held it back." },
    { era: "The Exodus", title: "Exile of the Knights", color: "#a7dbff", entry: "eclipse-knights",
      blurb: "The last loyal Hegemon, Julius, sends his most capable Solarians beyond Imperial reach. They never return — and become the Eclipse Knights." },
    { era: "The Fall", title: "The Purge", color: "#c0392b", entry: "imperial-conquest",
      blurb: "Known Solarians are executed and the knowledge of how manifestation occurs is deliberately erased. Dormant potential is judged no threat." },
    { era: "The Peace", title: "The Eclipse Treaty", color: "#9d84d8", entry: "eclipse-treaty",
      blurb: "The collaborating nobility sign away the outer system and the truth. The hidden Solarian Clause commits them to report any true Solarian to the Empire." },
    { era: "The Long Silence", title: "The Rewriting", color: "#e8c26a", entry: "heir-candidacy",
      blurb: "A false history is installed: solar power was always the nobility's alone. Emulation technology replaces the real thing in the Heir Candidacy System." },
    { era: "The Present Cycle", title: "The Birth of Marcus", color: "#7fa8d8", entry: "marcus",
      blurb: "Seventh child of the seventh house — silver hair, violet eyes. Unremarkable by noble standards. His gene treatments read as average." },
    { era: "The Present Cycle", title: "The Tenth Year Ball", color: "#e0a83c", entry: "juno",
      blurb: "Among nearly fifty rival siblings, one becomes something else. Beneath the stained solar glass of the Bellator ballroom, Marcus and Juno of House Aurum share their first kiss." },
    { era: "The Present Cycle", title: "The Manifestation", color: "#6cc6ff", entry: "marcus",
      blurb: "At twelve, the night he wins the Proving Tournament, the western wing of the Bellator estate erupts in blue fire. His mother finds a true Solarian." },
    { era: "The Present Cycle", title: "Exile & Training", color: "#a7dbff", entry: "eclipse-knights",
      blurb: "His death staged, Marcus is smuggled to the Eclipse Knights and raised as an Aspirant, then Squire, under a Blade named Phoenix." },
    { era: "The Present Cycle", title: "The Proving", color: "#e8c26a", entry: "eclipse-knights",
      blurb: "Dispatched alone into Imperial space to locate and defeat a designated target, he succeeds — and earns the name Corona." },
    { era: "The Present Cycle", title: "Capture", color: "#e5533d", entry: "eclipse-treaty",
      blurb: "Identified on his way out of Imperial territory, he is apprehended. Execution would violate the spirit of the treaty; imprisonment is chosen instead." },
    { era: "Now", title: "Inmate A-7527", color: "#8fd0ff", entry: "marcus",
      blurb: "Cold metal. Recycled air. The hum of a containment field. Marcus opens his eyes to darkness and chains." },
  ];

  const RANKS = [
    { name: "Aspirant", tier: "Nameless", color: "#5c6379",
      desc: "Come to the order seeking membership and under evaluation. An Aspirant who shows no Solarian aptitude within a defined period is respectfully turned away — the order cannot train what isn't there." },
    { name: "Squire", tier: "In training", color: "#7fa8d8",
      desc: "Shown enough promise to enter formal training, but not yet Proven. Assigned to a Blade for mentorship; not yet a full member of the order.", marcus: "Marcus trained to this rank under the Blade Phoenix." },
    { name: "Blade", tier: "Full knight", color: "#6cc6ff",
      desc: "Has completed the Proving and demonstrated both Solarian ability and mastery. Blades take missions, lead squire units, or operate alone.", marcus: "By completing his Proving — and earning the name Corona — Marcus claimed his place here, moments before his capture." },
    { name: "Sovereign", tier: "Supreme command", color: "#e8c26a",
      desc: "The order's supreme commander over all doctrine and strategy. Serves until death or until challenged and defeated by a member of Blade rank or above. The current Sovereign is Solas." },
  ];

  /* ---------- codex rendering ---------- */
  function wrapRich(html) { return '<div class="rich">' + html + "</div>"; }

  function renderInlineEntries() {
    $$("[data-entry-render]").forEach((el) => {
      const slug = el.getAttribute("data-entry-render");
      const e = CODEX[slug];
      if (!e) return;
      const mode = el.getAttribute("data-render-mode");
      if (mode === "feature") {
        const img = el.getAttribute("data-feature-img");
        el.innerHTML =
          (img ? '<img class="feature-img" loading="lazy" src="' + img + '" alt="">' : "") +
          '<div class="feature-inner">' + wrapRich(e.html) + "</div>";
      } else {
        el.innerHTML = wrapRich(e.html);
      }
    });
  }

  /* ---------- drawer / cross-link system ---------- */
  const drawer = $("#drawer"), scrim = $("#drawerScrim");
  const dTitle = $("#drawerTitle"), dTag = $("#drawerTag"), dContent = $("#drawerContent"),
    dCat = $("#drawerCat"), dBack = $("#drawerBack"), dScroll = $("#drawerScroll");
  let stack = [], lastFocus = null;

  function paintDrawer(slug) {
    const e = CODEX[slug];
    if (!e) return;
    dTitle.textContent = e.title;
    dTag.textContent = e.tagline || "";
    dTag.style.display = e.tagline ? "" : "none";
    dCat.textContent = CAT_LABEL[e.category] || "";
    dContent.innerHTML = wrapRich(e.html);
    dContent.style.setProperty("--dummy", "0");
    drawer.style.setProperty("--accent", CAT_COLOR[e.category] || "#6cc6ff");
    dBack.hidden = stack.length <= 1;
    dScroll.scrollTop = 0;
  }
  function openEntry(slug, push = true) {
    if (!CODEX[slug]) return;
    if (push) stack.push(slug);
    const wasOpen = drawer.classList.contains("show");
    if (!wasOpen) {
      lastFocus = document.activeElement;
      drawer.hidden = false; scrim.hidden = false;
      requestAnimationFrame(() => { drawer.classList.add("show"); scrim.classList.add("show"); });
      document.body.style.overflow = "hidden";
    }
    paintDrawer(slug);
    drawer.focus();
  }
  function closeDrawer() {
    drawer.classList.remove("show"); scrim.classList.remove("show");
    document.body.style.overflow = "";
    stack = [];
    setTimeout(() => { drawer.hidden = true; scrim.hidden = true; }, 400);
    if (lastFocus) lastFocus.focus();
  }
  function drawerBack() {
    if (stack.length > 1) { stack.pop(); paintDrawer(stack[stack.length - 1]); }
  }
  $("#drawerClose").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  dBack.addEventListener("click", drawerBack);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("show")) closeDrawer();
  });
  // global cross-link delegation
  document.addEventListener("click", (e) => {
    const link = e.target.closest(".xlink,[data-entry]");
    if (link && link.dataset.entry) {
      e.preventDefault();
      // if link is inside drawer, push onto stack; else fresh open
      if (drawer.contains(link)) openEntry(link.dataset.entry, true);
      else { stack = []; openEntry(link.dataset.entry, true); }
    }
  });

  /* ---------- solar spectrum ---------- */
  function buildSpectrum() {
    const bar = $("#spectrumBar"), detail = $("#spectrumDetail");
    SPECTRUM.forEach((s, i) => {
      const b = document.createElement("button");
      b.className = "spectrum-seg";
      b.style.background = "linear-gradient(160deg," + s.color + "," + shade(s.color, -18) + ")";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", s.key === "blue" ? "true" : "false");
      b.innerHTML = '<span class="seg-dot"></span><span class="seg-name">' + s.name + "</span>";
      b.addEventListener("click", () => select(i));
      b.addEventListener("keydown", (ev) => {
        if (ev.key === "ArrowRight") select((i + 1) % SPECTRUM.length);
        if (ev.key === "ArrowLeft") select((i - 1 + SPECTRUM.length) % SPECTRUM.length);
      });
      bar.appendChild(b);
    });
    function select(idx) {
      $$(".spectrum-seg", bar).forEach((el, j) => el.setAttribute("aria-selected", j === idx ? "true" : "false"));
      const s = SPECTRUM[idx];
      detail.innerHTML =
        '<div class="spectrum-badge" style="background:radial-gradient(circle at 40% 35%,#fff,' + s.color + ' 55%,' + shade(s.color, -30) + ')"></div>' +
        "<div><p class=\"sd-rarity\" style=\"color:" + s.color + '">' + s.rarity + "</p>" +
        "<h4>" + s.name + "</h4><p>" + s.desc + "</p></div>";
    }
    select(4); // Blue
  }

  /* ---------- attunement ---------- */
  function buildAttune() {
    const orb = $("#attuneOrb"), copy = $("#attuneCopy"), toggle = $("#attuneToggle");
    const modes = {
      photon: { verb: "Emit", title: "Photon Attunement",
        css: "radial-gradient(circle at 42% 38%,#fff,#ffd98a 30%,#f08a3c 62%,#e5533d 100%)",
        glow: "0 0 60px 6px rgba(240,138,60,.55),0 0 120px 20px rgba(229,83,61,.3)",
        text: "The Solarian attunes to the emissive, expansive nature of stars — light, heat, radiation, and explosive force. Marcus's strikes carry concentrated stellar radiation, and at full attunement his corona becomes blinding at close range. His Photon output scales with ambient energy; near a star, it is amplified." },
      graviton: { verb: "Pull", title: "Graviton Attunement",
        css: "radial-gradient(circle at 42% 38%,#eaf0ff,#7fa8d8 34%,#2f6fd0 66%,#0b1b3a 100%)",
        glow: "0 0 50px 4px rgba(47,111,208,.5),inset 0 0 40px 8px rgba(0,0,0,.55)",
        text: "The Solarian attunes to the contracting, pulling nature of stellar gravity — mass, control, and spatial distortion. Marcus can distort local gravity, redirect force, and become a center of mass enemies struggle to move around. Less developed than his Photon side, but genuine and growing." },
    };
    function set(mode) {
      const m = modes[mode];
      orb.style.background = m.css;
      orb.style.boxShadow = reduceMotion ? m.glow : m.glow;
      orb.style.transform = mode === "graviton" ? "scale(.82)" : "scale(1)";
      copy.innerHTML = '<h4><span class="a-verb" style="color:' + (mode === "photon" ? "#f08a3c" : "#7fa8d8") + '">' + m.verb + "</span>" + m.title + "</h4><p>" + m.text + "</p>";
      $$("button", toggle).forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
      toggle.querySelector(".is-active").style.background = mode === "photon"
        ? "linear-gradient(120deg,#ffd98a,#f08a3c)" : "linear-gradient(120deg,#a7dbff,#2f6fd0)";
      $$("button", toggle).forEach((b) => { if (!b.classList.contains("is-active")) b.style.background = "none"; });
    }
    $$("button", toggle).forEach((b) => b.addEventListener("click", () => set(b.dataset.mode)));
    set("photon");
  }

  /* ---------- two faces (inmate / knight) ---------- */
  function buildTwoFaces() {
    const toggle = $("#tfToggle"), stage = $("#tfStage"), cap = $("#tfCaption");
    if (!toggle || !stage) return;
    const faces = {
      inmate: { cls: "tf-inmate", grad: "linear-gradient(120deg,#e8a24d,#c9622a)",
        title: "Inmate A-7527", text: "Orange jumpsuit, sealed Solarian status, execution deferred. The file the Empire keeps." },
      knight: { cls: "tf-knight", grad: "linear-gradient(120deg,#a7dbff,#2f6fd0)",
        title: "Corona · Eclipse Knight", text: "Black-and-silver plate, the blue sun of his people on his shoulder. What his cell was built to contain." },
    };
    function set(face) {
      const f = faces[face];
      $$(".tf-img", stage).forEach((im) => im.classList.toggle("is-active", im.classList.contains(f.cls)));
      $$("button", toggle).forEach((b) => {
        const on = b.dataset.face === face;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.style.background = on ? f.grad : "none";
        b.style.color = on ? "#04121f" : "";
      });
      cap.innerHTML = "<strong>" + f.title + "</strong><span>" + f.text + "</span>";
    }
    $$("button", toggle).forEach((b) => b.addEventListener("click", () => set(b.dataset.face)));
    set("inmate");
  }

  /* ---------- radiant corona (ignite) ---------- */
  function buildCorona() {
    const show = $(".corona-show"), btn = $("#coronaBtn");
    if (!show || !btn) return;
    const lbl = btn.querySelector(".cb-label");
    btn.addEventListener("click", () => {
      const lit = show.classList.toggle("lit");
      btn.setAttribute("aria-pressed", lit ? "true" : "false");
      if (lbl) lbl.textContent = lit ? "Extinguish" : "Ignite the Corona";
    });
  }

  /* ---------- lifespan chart (SVG) ---------- */
  function buildChart() {
    const host = $("#lifespanChart");
    const W = 900, H = 430, m = { t: 26, r: 24, b: 74, l: 62 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const yMax = 2000;
    const x = (i) => m.l + (iw * (i + 0.5)) / STAGES.length;
    const y = (v) => m.t + ih - (v / yMax) * ih;
    const NS = "http://www.w3.org/2000/svg";
    const el = (t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); return n; };

    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Line chart of expected Helian lifespan by stellar stage, peaking at Main Sequence Prime." });
    const defs = el("defs", {});
    defs.innerHTML = '<linearGradient id="lifeGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="rgba(232,194,106,.42)"/>' +
      '<stop offset="100%" stop-color="rgba(232,194,106,0)"/></linearGradient>';
    svg.appendChild(defs);

    // y gridlines + labels
    [0, 500, 1000, 1500, 2000].forEach((v) => {
      svg.appendChild(el("line", { class: "gridline", x1: m.l, y1: y(v), x2: W - m.r, y2: y(v) }));
      const t = el("text", { class: "axis-txt", x: m.l - 10, y: y(v) + 4, "text-anchor": "end" });
      t.textContent = v.toLocaleString();
      svg.appendChild(t);
    });
    const yl = el("text", { class: "axis-lbl", x: -(m.t + ih / 2), y: 16, transform: "rotate(-90)", "text-anchor": "middle" });
    yl.textContent = "Expected lifespan (years)";
    svg.appendChild(yl);

    // area + line (midpoints)
    let dLine = "", dArea = "M " + x(0) + " " + y(0);
    STAGES.forEach((s, i) => { dLine += (i ? " L " : "M ") + x(i) + " " + y(s.mid); dArea += " L " + x(i) + " " + y(s.mid); });
    dArea += " L " + x(STAGES.length - 1) + " " + y(0) + " Z";
    svg.appendChild(el("path", { class: "area-fill", d: dArea }));
    svg.appendChild(el("path", { class: "area-line", d: dLine }));

    // cursor line
    const cursor = el("line", { class: "chart-cursor", y1: m.t, y2: m.t + ih });
    svg.appendChild(cursor);

    // dots + x labels
    const dots = [];
    STAGES.forEach((s, i) => {
      if (s.peak) svg.appendChild(el("circle", { class: "peak-ring", cx: x(i), cy: y(s.mid), r: 13 }));
      const c = el("circle", { class: "stage-dot", cx: x(i), cy: y(s.mid), r: s.peak ? 6.5 : 5, fill: s.color });
      svg.appendChild(c); dots.push(c);
      // x label (two lines)
      const parts = s.short.split(" · ");
      const lx = x(i);
      parts.forEach((p, k) => {
        const t = el("text", { class: "axis-txt", x: lx, y: m.t + ih + 20 + k * 13, "text-anchor": "middle" });
        t.textContent = p; svg.appendChild(t);
      });
      const lvl = el("text", { class: "axis-txt", x: lx, y: m.t + ih + (parts.length > 1 ? 46 : 33), "text-anchor": "middle", fill: "#8b93ad" });
      lvl.textContent = "L" + s.lv; svg.appendChild(lvl);
    });

    // hover overlay
    const overlay = el("rect", { x: m.l, y: m.t, width: iw, height: ih, fill: "transparent", style: "cursor:crosshair" });
    svg.appendChild(overlay);
    host.appendChild(svg);

    const tip = document.createElement("div");
    tip.className = "chart-tip"; host.appendChild(tip);

    function showAt(i, clientX) {
      const s = STAGES[i];
      cursor.setAttribute("x1", x(i)); cursor.setAttribute("x2", x(i)); cursor.style.opacity = ".8";
      dots.forEach((d, j) => d.setAttribute("r", j === i ? (STAGES[j].peak ? 9 : 8) : (STAGES[j].peak ? 6.5 : 5)));
      const rect = dots[i].getBoundingClientRect(), hrect = host.getBoundingClientRect();
      tip.innerHTML = "<b style=\"color:" + s.color + "\">" + s.name + "</b>" +
        '<span class="tip-life">' + s.lo.toLocaleString() + "–" + s.hi.toLocaleString() + " yrs</span> · Level " + s.lv +
        (s.peak ? '<br><span class="tip-peak">Peak of the curve</span>' : "");
      tip.style.left = (rect.left - hrect.left + rect.width / 2) + "px";
      tip.style.top = (rect.top - hrect.top) + "px";
      tip.style.opacity = "1";
    }
    function hide() { cursor.style.opacity = "0"; tip.style.opacity = "0"; dots.forEach((d, j) => d.setAttribute("r", STAGES[j].peak ? 6.5 : 5)); }
    function nearest(clientX) {
      const r = svg.getBoundingClientRect();
      const px = ((clientX - r.left) / r.width) * W;
      let best = 0, bd = Infinity;
      STAGES.forEach((s, i) => { const d = Math.abs(px - x(i)); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    overlay.addEventListener("pointermove", (ev) => showAt(nearest(ev.clientX), ev.clientX));
    overlay.addEventListener("pointerleave", hide);
    dots.forEach((d, i) => { d.addEventListener("pointerenter", () => showAt(i)); });

    // legend
    const legend = $("#lifespanLegend");
    [["#4f8fd8", "Rising — life extends"], ["#f2c94c", "Prime — the peak"], ["#e5533d", "Declining — life burns down"], ["#9d84d8", "Remnant — near the end"]]
      .forEach(([c, t]) => {
        const s = document.createElement("span");
        s.innerHTML = '<i style="background:' + c + '"></i>' + t; legend.appendChild(s);
      });

    // table
    const tbl = $("#lifespanTable");
    let html = "<table><thead><tr><th>Level</th><th>Stellar Stage</th><th>Helian Lifespan</th></tr></thead><tbody>";
    STAGES.forEach((s) => { html += "<tr><td>" + s.lv + "</td><td>" + s.name + (s.peak ? " · <em>Peak</em>" : "") + "</td><td>" + s.lo.toLocaleString() + "–" + s.hi.toLocaleString() + " yrs</td></tr>"; });
    tbl.innerHTML = html + "</tbody></table>";
    const btn = $("#lifespanTableBtn");
    btn.addEventListener("click", () => {
      const open = tbl.hasAttribute("hidden");
      if (open) { tbl.removeAttribute("hidden"); btn.textContent = "Hide data table"; btn.setAttribute("aria-expanded", "true"); }
      else { tbl.setAttribute("hidden", ""); btn.textContent = "Show data table"; btn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- houses explorer ---------- */
  function buildHouses() {
    const rail = $("#housesRail"), panel = $("#housePanel");
    HOUSES.forEach((h, i) => {
      const b = document.createElement("button");
      b.className = "house-tab"; b.setAttribute("role", "tab");
      b.style.setProperty("--htc", h.color);
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.innerHTML = '<img src="assets/img/sigils/' + h.sigil + '.jpg" alt="Sigil of House ' + h.n + '">' +
        '<span><span class="ht-name">House ' + h.n + '</span><span class="ht-domain">' + h.domain + "</span></span>";
      b.addEventListener("click", () => select(i));
      rail.appendChild(b);
    });
    function select(i) {
      $$(".house-tab", rail).forEach((el, j) => el.setAttribute("aria-selected", j === i ? "true" : "false"));
      const h = HOUSES[i];
      panel.style.setProperty("--htc", h.color);
      panel.innerHTML =
        '<div class="hp-accent"></div>' +
        '<div class="hp-hero"><img class="hp-continent" loading="lazy" src="assets/img/continents/' + h.continent + '.jpg" alt="' + h.seat + ' continent">' +
        '<img class="hp-sigil" src="assets/img/sigils/' + h.sigil + '.jpg" alt=""></div>' +
        '<div class="hp-body">' +
        '<p class="hp-eyebrow">The ' + ordinal(i, h) + ' Dynasty · Family name “' + h.family + '”</p>' +
        '<h3 class="hp-name">House ' + h.n + "</h3>" +
        '<p class="hp-domain">' + h.domain + "</p>" +
        '<div class="hp-meta"><div><dt>Continental Seat</dt><dd>' + h.seat + '</dd></div>' +
        "<div><dt>Capital Megacity</dt><dd>" + h.capital + "</dd></div></div>" +
        '<p class="hp-spec">' + h.spec + "</p>" +
        '<div class="hp-officers">' +
        '<div class="hp-officer"><span class="ho-role">Patriarch · Patrilium</span><span class="ho-name">' + h.patriarch + "</span></div>" +
        '<div class="hp-officer"><span class="ho-role">Principal Wife · Matrilium</span><span class="ho-name">' + h.wife + "</span></div></div>" +
        (h.marcus ? '<p class="hp-marcus">' + h.marcus + "</p>" : "") +
        '<button class="hp-link xlink" data-entry="' + h.slug + '">Open full house record →</button>' +
        "</div>";
    }
    select(0);
  }
  const HOUSE_CYCLE = ["Aegis", "Aurum", "Genesis", "Logos", "Veil", "Vox", "Bellator"];
  function ordinal(i, h) {
    const pos = HOUSE_CYCLE.indexOf(h.n) + 1;
    return ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh"][pos - 1] || "";
  }

  /* ---------- timeline ---------- */
  function buildTimeline() {
    const ol = $("#timeline");
    TIMELINE.forEach((t) => {
      const li = document.createElement("li");
      li.className = "tl-item";
      li.innerHTML =
        '<span class="tl-dot" style="--tlc:' + t.color + '"></span>' +
        '<button class="tl-card xlink" data-entry="' + t.entry + '" style="--tlc:' + t.color + '">' +
        '<span class="tl-era">' + t.era + "</span>" +
        '<span class="tl-title">' + t.title + "</span>" +
        '<p class="tl-blurb">' + t.blurb + "</p>" +
        '<span class="tl-more">Open record →</span></button>';
      ol.appendChild(li);
    });
  }

  /* ---------- ranks ---------- */
  function buildRanks() {
    const ol = $("#rankLadder");
    RANKS.forEach((r) => {
      const li = document.createElement("li");
      li.className = "rank-item" + (r.marcus && r.name === "Blade" ? " is-marcus" : "");
      li.style.setProperty("--rc", r.color);
      li.innerHTML =
        '<div class="rank-top"><span class="rank-name">' + r.name + '</span><span class="rank-tier">' + r.tier + "</span></div>" +
        '<p class="rank-desc">' + r.desc + "</p>" +
        (r.marcus ? '<span class="rank-flag">' + r.marcus + "</span>" : "");
      ol.appendChild(li);
    });
  }

  /* ---------- codex grid ---------- */
  function buildCodex() {
    const grid = $("#codexGrid"), filters = $("#codexFilters"), search = $("#codexSearch"), empty = $("#codexEmpty");
    const entries = Object.values(CODEX);
    const order = ["character", "power", "order", "history", "realm", "houses", "continents", "people"];
    entries.sort((a, b) => (order.indexOf(a.category) - order.indexOf(b.category)) || a.title.localeCompare(b.title));
    const cats = ["all"].concat(order.filter((c) => entries.some((e) => e.category === c)));
    let activeCat = "all", query = "";

    cats.forEach((c) => {
      const b = document.createElement("button");
      b.className = "cx-filter" + (c === "all" ? " active" : "");
      b.textContent = c === "all" ? "All" : (CAT_LABEL[c] || c);
      b.dataset.cat = c;
      b.addEventListener("click", () => { activeCat = c; $$(".cx-filter", filters).forEach((x) => x.classList.toggle("active", x === b)); render(); });
      filters.appendChild(b);
    });

    entries.forEach((e) => {
      const card = document.createElement("button");
      card.className = "cx-card"; card.dataset.entry = e.slug; card.dataset.cat = e.category;
      card.style.setProperty("--cxc", CAT_COLOR[e.category] || "#6cc6ff");
      const searchText = (e.title + " " + (e.tagline || "") + " " + (e.aliases || []).join(" ") + " " + e.html.replace(/<[^>]+>/g, " ")).toLowerCase();
      card._search = searchText;
      card.innerHTML =
        '<span class="cx-cat">' + (CAT_LABEL[e.category] || e.category) + "</span>" +
        '<span class="cx-title">' + e.title + "</span>" +
        '<span class="cx-tag">' + (e.tagline || "") + "</span>";
      grid.appendChild(card);
    });

    function render() {
      let shown = 0;
      $$(".cx-card", grid).forEach((card) => {
        const okCat = activeCat === "all" || card.dataset.cat === activeCat;
        const okQ = !query || card._search.indexOf(query) !== -1;
        const vis = okCat && okQ;
        card.style.display = vis ? "" : "none";
        if (vis) shown++;
      });
      empty.hidden = shown !== 0;
    }
    let deb;
    search.addEventListener("input", () => {
      clearTimeout(deb);
      deb = setTimeout(() => { query = search.value.trim().toLowerCase(); render(); }, 120);
    });
  }

  /* ---------- nav + reveal + hero ---------- */
  function initNav() {
    const nav = $("#nav"), toggle = $("#navToggle"), links = $(".nav-links");
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", (e) => {
      if (e.target.tagName === "A") { links.classList.remove("open"); toggle.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
    // active section highlight
    const secs = $$("section[data-section]");
    const navA = $$(".nav-links a");
    const spy = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (en.isIntersecting) {
          const id = en.target.id;
          navA.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach((s) => spy.observe(s));
  }

  function initReveal() {
    const sc = $("#sevenCount");
    if (reduceMotion) { $$(".reveal").forEach((e) => e.classList.add("in")); sc && sc.classList.add("in"); return; }
    // Simple geometry-based reveal instead of IntersectionObserver: reveal any
    // element whose top has scrolled into view. This is bullet-proof for
    // elements far taller than the viewport (an IO intersection *ratio* can
    // never reach a threshold for such elements, which left them stuck invisible).
    let pending = $$(".reveal");
    function check() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      pending = pending.filter((e) => {
        if (e.getBoundingClientRect().top < vh * 0.92) { e.classList.add("in"); return false; }
        return true;
      });
      if (sc && !sc.classList.contains("in") && sc.getBoundingClientRect().top < vh * 0.95) sc.classList.add("in");
    }
    let ticking = false;
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; check(); }); } }
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("load", check);
    // Failsafe: if scroll events somehow never fire, nothing stays hidden.
    setTimeout(check, 1200);
  }

  function initHeroVerse() {
    const lines = $$("#heroVerse [data-line]");
    if (reduceMotion) { lines.forEach((l) => l.classList.add("in")); return; }
    lines.forEach((l, i) => setTimeout(() => l.classList.add("in"), 500 + i * 900));
  }

  function buildSevenCount() {
    const el = $("#sevenCount");
    if (el) for (let i = 0; i < 7; i++) { const s = document.createElement("i"); s.style.transitionDelay = (i * 90) + "ms"; el.appendChild(s); }
  }

  /* ---------- starfield ---------- */
  function initStarfield() {
    const cv = $("#starfield"); if (!cv) return;
    const ctx = cv.getContext("2d");
    let stars = [], w, h, dpr = Math.min(window.devicePixelRatio || 1, 2), raf;
    function resize() {
      w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
      const n = Math.min(220, Math.floor((innerWidth * innerHeight) / 9000));
      stars = [];
      for (let i = 0; i < n; i++) {
        const blue = Math.random() < 0.5;
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          r: (Math.random() * 1.3 + 0.3) * dpr,
          a: Math.random() * 0.6 + 0.2, tw: Math.random() * 0.02 + 0.004,
          ph: Math.random() * Math.PI * 2, vy: (Math.random() * 0.12 + 0.02) * dpr,
          c: blue ? "108,198,255" : "232,214,180",
        });
      }
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.ph += s.tw; const a = s.a * (0.6 + 0.4 * Math.sin(s.ph));
        s.y += s.vy; if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
        ctx.beginPath(); ctx.fillStyle = "rgba(" + s.c + "," + a.toFixed(3) + ")";
        ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    resize(); window.addEventListener("resize", resize);
    if (!reduceMotion) frame();
    else { // static single paint
      for (const s of stars) { ctx.beginPath(); ctx.fillStyle = "rgba(" + s.c + "," + s.a + ")"; ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); }
    }
  }

  /* ---------- helpers ---------- */
  function shade(hex, pct) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = pct / 100;
    r = Math.round(r + (f < 0 ? r : 255 - r) * f);
    g = Math.round(g + (f < 0 ? g : 255 - g) * f);
    b = Math.round(b + (f < 0 ? b : 255 - b) * f);
    return "rgb(" + [r, g, b].map((v) => Math.max(0, Math.min(255, v))).join(",") + ")";
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderInlineEntries();
    buildTwoFaces();
    buildCorona();
    buildSpectrum();
    buildAttune();
    buildChart();
    buildHouses();
    buildTimeline();
    buildRanks();
    buildSevenCount();
    buildCodex();
    initNav();
    initReveal();
    initHeroVerse();
    initStarfield();
  });
})();
