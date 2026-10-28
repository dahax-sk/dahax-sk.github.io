// DAHAX – snímka „Katalóg výrobkov“ podľa sk.e-klimas.com (scripts/update-2026-10-26-klimas-katalog.mjs).
// Kategória s poľom `katalog` (content.json) sa vykreslí ako:
//  - pás 7 snímok: fotka, nadpis na farebnom páse, podnadpis, „zobraziť produkty ›“; čísla 01–07, šípky,
//    potiahnutie prstom, automatický posun 5 s, pri dotyku pauza,
//  - mriežka 16 kategórií: 1. ťuknutie otvorí panel s podkategóriami, ďalšie (alebo podkategória, tlačidlo)
//    otvorí sk.e-klimas.com v novej karte; bez internetu len hláška.
(() => {
  let cats = new Map(); // "#/<firma>/<kategória>" → katalog
  const load = (c) => {
    cats = new Map();
    for (const m of c.manufacturers || []) for (const k of m.categories || []) if (k.katalog) cats.set(`#/${m.id}/${k.id}`, { ...k.katalog, title: k.title });
    decorate();
  };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  // tmavý text, keď biely nemá na farbe kontrast aspoň 3 : 1 (WCAG, veľký text)
  const light = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const l = [n >> 16, (n >> 8) & 255, n & 255].map((c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 1.05 / (0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2] + 0.05) < 3;
  };
  const pocet = (n) => `${n.toLocaleString("sk-SK")} ${n === 1 ? "výrobok" : n < 5 ? "výrobky" : "výrobkov"}`;
  const stop = (e) => e.stopPropagation();

  const go = (url, msg) => {
    if (navigator.onLine) return void window.open(url, "_blank", "noopener");
    msg.textContent = "Otvorí sa po pripojení na internet";
    msg.classList.add("is-on");
    clearTimeout(msg._t);
    msg._t = setTimeout(() => msg.classList.remove("is-on"), 3000);
  };

  const carousel = (banery, msg) => {
    const car = el("div", "dxk-car");
    const track = el("div", "dxk-car__track");
    const nums = el("div", "dxk-car__nums");
    let i = 0, timer = null, pause = 0;
    const slides = banery.map((b, n) => {
      const s = el("div", "dxk-sl");
      const img = el("img");
      img.src = b.obrazok;
      img.alt = "";
      const txt = el("div", "dxk-sl__txt");
      const h = el("h2", "dxk-sl__h", b.nadpis);
      h.style.background = b.farba;
      h.style.color = light(b.farba) ? "#0a0b0d" : "#fff";
      const btn = el("button", "dxk-sl__btn", "zobraziť produkty ›");
      btn.type = "button";
      btn.addEventListener("click", (e) => { stop(e); go(b.odkaz, msg); });
      txt.append(h, el("p", "dxk-sl__p", b.podnadpis), btn);
      s.append(img, txt);
      const num = el("button", "dxk-car__n", String(n + 1).padStart(2, "0"));
      num.type = "button";
      num.setAttribute("aria-label", `Snímka ${n + 1}: ${b.nadpis}`);
      num.addEventListener("click", (e) => { stop(e); show(n); hold(); });
      nums.append(num);
      return s;
    });
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("is-on", k === i));
      [...nums.children].forEach((b, k) => b.classList.toggle("is-on", k === i));
    };
    const hold = () => (pause = Date.now() + 10000); // po dotyku 10 s bez automatického posunu
    const arrow = (cls, d, label) => {
      const a = el("button", "dxk-car__a " + cls);
      a.type = "button";
      a.setAttribute("aria-label", label);
      a.addEventListener("click", (e) => { stop(e); show(i + d); hold(); });
      return a;
    };
    track.append(...slides);
    car.append(track, nums, arrow("dxk-car__a--prev", -1, "Predchádzajúca snímka"), arrow("dxk-car__a--next", 1, "Ďalšia snímka"));
    // potiahnutie prstom – mení len snímku pásu, nie snímku prezentácie (dahax-dotyk.js pás vynecháva)
    let sx = null;
    car.addEventListener("pointerdown", (e) => { sx = e.clientX; hold(); });
    car.addEventListener("pointerup", (e) => {
      if (sx == null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
    });
    show(0);
    timer = setInterval(() => {
      if (!car.isConnected) return clearInterval(timer);
      if (Date.now() > pause && document.visibilityState === "visible") show(i + 1);
    }, 5000);
    return car;
  };

  const grid = (kategorie, msg) => {
    const wrap = el("div", "dxk-gw");
    const g = el("div", "dxk-grid");
    const pan = el("div", "dxk-pan");
    pan.hidden = true;
    let open = -1;
    const close = () => { pan.hidden = true; open = -1; [...g.children].forEach((t) => t.classList.remove("is-on")); };
    const panel = (k, n) => {
      pan.replaceChildren();
      pan.style.setProperty("--c", k.farba);
      const x = el("button", "dxk-pan__x", "✕");
      x.type = "button";
      x.setAttribute("aria-label", "Zavrieť");
      x.addEventListener("click", (e) => { stop(e); close(); });
      const list = el("div", "dxk-pan__list");
      for (const p of k.podkategorie) {
        const b = el("button", "dxk-pan__i");
        b.type = "button";
        b.append(el("span", "", p.nazov), el("b", "", String(p.vyrobkov)));
        b.addEventListener("click", (e) => { stop(e); go(p.odkaz, msg); });
        list.append(b);
      }
      const all = el("button", "dxk-pan__go", "prehliadať produkty ›");
      all.type = "button";
      all.addEventListener("click", (e) => { stop(e); go(k.odkaz, msg); });
      pan.append(x, el("p", "dxk-pan__e", pocet(k.vyrobkov)), el("h3", "dxk-pan__h", k.nazov), list, all);
      // panel na opačnej polovici mriežky ako dlaždica, aby ju nezakryl
      pan.classList.toggle("is-left", n % 8 >= 4);
      pan.hidden = false;
      open = n;
      [...g.children].forEach((t, j) => t.classList.toggle("is-on", j === n));
    };
    kategorie.forEach((k, n) => {
      const t = el("button", "dxk-t");
      t.type = "button";
      t.style.setProperty("--c", k.farba);
      const img = el("img");
      img.src = k.obrazok;
      img.alt = "";
      t.append(img, el("span", "dxk-t__n", k.dlazdica));
      t.addEventListener("click", (e) => { stop(e); open === n ? go(k.odkaz, msg) : panel(k, n); });
      g.append(t);
    });
    wrap.addEventListener("click", (e) => { if (!pan.contains(e.target)) close(); });
    wrap.append(g, pan);
    return wrap;
  };

  const decorate = () => {
    const d = cats.get(location.hash.replace(/\?.*$/, ""));
    if (!d) return;
    document.querySelectorAll(".screen .tiles").forEach((s) => {
      if (s.querySelector(":scope > .dxk")) return;
      if (s.querySelector(".cat__title")?.textContent.trim() !== d.title) return;
      const box = el("div", "dxk");
      const msg = el("p", "dxk-msg");
      msg.setAttribute("aria-live", "polite");
      box.append(carousel(d.banery, msg), grid(d.kategorie, msg), msg);
      // ťuknutie v katalógu nemá prepínať snímky ani otvárať galériu aplikácie
      box.addEventListener("pointerdown", stop);
      box.addEventListener("pointerup", stop);
      s.append(box);
    });
  };

  let q = false;
  new MutationObserver(() => {
    if (q) return;
    q = true;
    setTimeout(() => { q = false; decorate(); }, 40);
  }).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("hashchange", () => setTimeout(decorate, 60));

  if (window.__DAHAX_CONTENT__) load(window.__DAHAX_CONTENT__);
  else fetch("content/content.json", { cache: "no-cache" }).then((r) => r.json()).then(load).catch(() => {});
})();
