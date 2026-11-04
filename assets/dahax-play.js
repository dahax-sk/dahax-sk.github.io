// DAHAX – automatické prehrávanie prezentácie (4. 11. 2026, želanie používateľa: „na úvodnej stránke daj play a pôjde komplet
// celá prezentácia firma po firme … KLIMAS, aby bolo samostatné play a pôjde dokola len KLIMAS komplet aj s galériou a videami“).
// Tlačidlo ▶ v hornej lište len na úvode a na stranách KLIMAS (ostatné firmy ho nemajú):
//  - úvod: spoločné strany a firma po firme (vybrané v dahax-vyber.js) – úvodné video celé a strany firmy, stále dokola,
//  - KLIMAS, stále dokola:
//  1. úvodné video firmy celé (bez slučky; pri úseku videoRange do konca úseku),
//  2. strany firmy po rade (company.prehravanie.strana s, strana s otáčaním 360° prehravanie.otocka s),
//  3. fotky firmy (Fotky a videá, galérie kategórií, Realizácie) cez celú obrazovku (prehravanie.foto s),
//  4. videá firmy (len vlastné .mp4, nie YouTube) cez celú obrazovku, celé.
// Zastavenie: dotyk obrazovky, kláves alebo ❚❚; ďalší ▶ pokračuje od toho istého miesta. Počas prehrávania sa lišta skryje,
// dole je tenký ukazovateľ priebehu a obrazovka nezhasína (Wake Lock, kde ho prehliadač má). Video, ktoré sa nenačíta
// do prehravanie.nacitanie s (napr. bez internetu), sa preskočí. Dĺžky sú v obsahu: company.prehravanie.
// Na skúšku sa dajú prepísať: window.__dxPrehravanieTest = { strana: 1, foto: 1, videoMax: 3 }.
// Štýly: dahax-upravy-3.css („prehrávanie“).
(() => {
  let obsah = null, kroky = [], i = 0, hra = false, stoj = false, beh = 0, lock = null, skryt = null;
  const C = () => Object.assign({ strana: 8, otocka: 12, foto: 4, videoMax: 300, nacitanie: 8 }, (obsah && obsah.company && obsah.company.prehravanie) || {}, window.__dxPrehravanieTest || {});
  const deck = () => document.querySelector(".deck");
  const firmy = () => (obsah ? obsah.manufacturers.filter((m) => !m.hidden) : []);
  const hashFirmy = () => (decodeURIComponent(location.hash).match(/^#\/([^/?~]+)/) || [])[1];

  // ── zostavenie krokov ──
  const kroky1 = (m) => {
    const out = [];
    out.push(m.video ? { t: "uvod", hash: "#/" + m.id, src: m.video } : { t: "strana", hash: "#/" + m.id, s: C().strana });
    for (const k of m.categories || []) out.push({ t: "strana", hash: "#/" + m.id + "/" + k.id, s: k.etics && k.etics.top && k.etics.top.otocka360 ? C().otocka : C().strana });
    const fotky = [], videa = [], bolo = new Set();
    const pridaj = (src, popis, video) => {
      if (!src || bolo.has(src) || /^https?:/.test(src)) return;
      bolo.add(src);
      if (video || /\.mp4$/i.test(src)) videa.push({ t: "film", src, popis });
      else if (/\.(webp|jpe?g|png)$/i.test(src)) fotky.push({ t: "foto", src, popis });
    };
    for (const x of m.media || []) if (x.kind !== "youtube") pridaj(x.src, x.caption, x.kind === "video");
    for (const k of m.categories || []) for (const g of k.gallery || []) pridaj(g.src, g.caption);
    const r = obsah.realizations;
    for (const g of (r && r.galeria) || []) if (g.firma === m.id) pridaj(g.src, g.popis || g.nazov, g.typ === "video");
    for (const k of m.categories || []) for (const p of k.products || []) if (p.video) pridaj(p.video, p.name, true);
    return out.concat(fotky, videa);
  };
  // úvod: celá prezentácia v poradí strán – spoločné strany, potom firma po firme (úvodné video celé a jej strany),
  // Doplnkový sortiment pred prvou doplnkovou firmou, na konci Realizácie a Kontakt; bez galérií a videí
  const celaPrezentacia = () => {
    const S = C().strana, out = ["#/", "#/preco-dahax", "#/doprava-a-sklad", "#/vyrobcovia"].map((hash) => ({ t: "strana", hash, s: S }));
    let doplnok = false;
    for (const m of firmy()) {
      if (m.tier === "plus" && !doplnok) { out.push({ t: "strana", hash: "#/doplnkovy-sortiment", s: S }); doplnok = true; }
      out.push(m.video ? { t: "uvod", hash: "#/" + m.id, src: m.video } : { t: "strana", hash: "#/" + m.id, s: S });
      for (const k of m.categories || []) out.push({ t: "strana", hash: "#/" + m.id + "/" + k.id, s: k.etics && k.etics.top && k.etics.top.otocka360 ? C().otocka : S });
    }
    if (!(obsah.realizations && obsah.realizations.hidden)) out.push({ t: "strana", hash: "#/realizacie", s: S });
    out.push({ t: "strana", hash: "#/kontakt", s: S });
    return out;
  };
  // ▶ je len na úvode (celá prezentácia) a pri KLIMAS (len KLIMAS komplet aj s fotkami a videami); režim určí strana pri spustení
  const PLAY_FIRMA = "klimas";
  const rezim = () => (hashFirmy() === PLAY_FIRMA ? "firma" : !location.hash || location.hash === "#/" || location.hash === "#" ? "uvod" : null);
  let mod = null;
  const zostav = () => {
    mod = rezim();
    const m = firmy().find((f) => f.id === PLAY_FIRMA);
    kroky = mod === "firma" && m ? kroky1(m) : mod === "uvod" ? celaPrezentacia() : [];
    i = 0;
  };

  // ── čakanie, ktoré stojí pri pauze ──
  const cakaj = (s, kontrola) => new Promise((ok) => {
    const moj = beh;
    let ost = s * 1000, t = performance.now();
    const tik = () => {
      if (moj !== beh) return ok(false);
      const n = performance.now();
      if (!stoj) ost -= n - t;
      t = n;
      priebeh(1 - Math.max(0, ost) / (s * 1000));
      if (ost <= 0 || (kontrola && !stoj && kontrola())) return ok(true);
      setTimeout(tik, 100);
    };
    tik();
  });

  // ── celá obrazovka pre fotky a videá ──
  let ov = null;
  const okno = () => {
    if (ov && ov.isConnected) return ov;
    ov = document.createElement("div");
    ov.className = "dxp-ov";
    ov.innerHTML = '<div class="dxp-ov__m"></div><p class="dxp-ov__p"></p>';
    (deck() || document.body).appendChild(ov);
    return ov;
  };
  const zavriOkno = () => { if (ov) { ov.querySelectorAll("video").forEach((v) => v.pause()); ov.remove(); ov = null; } };
  const ukaz = (el, popis) => {
    const o = okno(), m = o.querySelector(".dxp-ov__m");
    m.querySelectorAll("video").forEach((v) => v.pause());
    m.replaceChildren(el);
    o.querySelector(".dxp-ov__p").textContent = popis || "";
  };

  // ── kroky ──
  const strana = async (k) => {
    zavriOkno();
    if (location.hash !== k.hash) location.hash = k.hash;
    await cakaj(k.s);
  };
  const uvod = async (k) => {
    zavriOkno();
    if (location.hash !== k.hash) location.hash = k.hash;
    let v = null;
    await cakaj(3, () => (v = document.querySelector(".screen .brand video.dxv-bg")));
    if (!v) return strana({ hash: k.hash, s: C().strana });
    const m = firmy().find((f) => f.id === hashFirmy()), r = m && m.videoRange;
    const a = r ? r[0] : 0, b = r ? r[1] : Infinity;
    const loop = v.loop;
    v.loop = false;
    try { v.currentTime = a; } catch (e) {}
    v.play().catch(() => {});
    let pred = a, koniec = false, nacitane = false;
    const end = () => (koniec = true);
    v.addEventListener("ended", end);
    const t0 = performance.now();
    await cakaj(Math.min(C().videoMax, isFinite(b) ? b - a + 2 : C().videoMax), () => {
      if (stoj) { if (!v.paused) v.pause(); return false; }
      if (v.paused && !koniec) v.play().catch(() => {});
      if (v.currentTime > a + 0.2) nacitane = true;
      if (!nacitane && performance.now() - t0 > C().nacitanie * 1000) return true; // nenačítané – preskočiť
      const wrap = v.currentTime < pred - 0.5; // úsek videoRange sa vrátil na začiatok
      pred = v.currentTime;
      return koniec || wrap || v.currentTime >= b - 0.15;
    });
    v.removeEventListener("ended", end);
    v.loop = loop;
    if (v.paused) v.play().catch(() => {});
  };
  const foto = async (k) => {
    const im = new Image();
    im.alt = "";
    im.src = k.src;
    ukaz(im, k.popis);
    const dalsi = kroky[i + 1];
    if (dalsi && dalsi.t === "foto") new Image().src = dalsi.src;
    await cakaj(C().foto);
  };
  const film = async (k) => {
    const v = document.createElement("video");
    Object.assign(v, { src: k.src, muted: true, playsInline: true, preload: "auto" });
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.poster = (obsah.videoPosters && obsah.videoPosters[k.src]) || k.src.replace(/\.mp4$/i, ".webp");
    ukaz(v, (obsah.videoNames && obsah.videoNames[k.src]) || k.popis);
    let koniec = false, chyba = false, nacitane = false;
    v.addEventListener("ended", () => (koniec = true));
    v.addEventListener("error", () => (chyba = true));
    v.play().catch(() => {});
    const t0 = performance.now();
    await cakaj(C().videoMax, () => {
      if (stoj) { if (!v.paused) v.pause(); return false; }
      if (v.paused && !koniec) v.play().catch(() => {});
      if (v.currentTime > 0.2) nacitane = true;
      return koniec || chyba || (!nacitane && performance.now() - t0 > C().nacitanie * 1000);
    });
    v.pause();
  };

  const slucka = async () => {
    const moj = beh;
    while (hra && moj === beh && kroky.length) {
      const k = kroky[i];
      await ({ uvod, strana, foto, film }[k.t] || strana)(k);
      if (moj !== beh) return;
      i = (i + 1) % kroky.length;
    }
  };

  // ── ovládanie ──
  let pruh = null;
  const priebeh = (f) => {
    if (!pruh) return;
    pruh.style.transform = "scaleX(" + ((i + Math.min(1, f)) / Math.max(1, kroky.length)).toFixed(4) + ")";
  };
  const zamok = async (on) => {
    try {
      if (on && "wakeLock" in navigator && !lock) { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => (lock = null)); }
      if (!on && lock) { await lock.release(); lock = null; }
    } catch (e) { lock = null; }
  };
  const stav = () => {
    const h = document.documentElement;
    h.classList.toggle("dxp-hra", hra && !stoj);
    h.classList.toggle("dxp-stoj", hra && stoj);
    clearTimeout(skryt);
    h.classList.remove("dxp-skryte");
    if (hra && !stoj) skryt = setTimeout(() => h.classList.add("dxp-skryte"), 3000);
    const b = document.querySelector(".dxp-btn");
    if (b) b.hidden = !hra && !rezim(); // mimo úvodu a KLIMAS sa ▶ ukáže, len kým prehrávanie beží (aby sa dalo zastaviť)
    if (b) {
      const ide = hra && !stoj;
      b.classList.toggle("is-on", ide);
      b.setAttribute("aria-label", ide ? "Zastaviť prehrávanie" : "Spustiť prehrávanie");
      b.innerHTML = ide
        ? '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>'
        : '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>';
    }
    if (!pruh && hra) { pruh = document.createElement("i"); pruh.className = "dxp-pruh"; (deck() || document.body).appendChild(pruh); }
    if (pruh && !hra) { pruh.remove(); pruh = null; }
    zamok(hra && !stoj);
  };
  const spusti = () => {
    if (!obsah) return;
    if (hra && stoj) { stoj = false; return stav(); } // pokračovať od aktuálneho miesta
    zostav();
    if (!kroky.length) return;
    hra = true; stoj = false; beh++;
    stav();
    slucka();
  };
  const zastav = () => { if (hra && !stoj) { stoj = true; stav(); } };
  const ukonci = () => { hra = false; stoj = false; beh++; zavriOkno(); stav(); };

  // dotyk alebo kláves počas prehrávania = pauza (a nič iné – neprepne stranu, neotvorí detail)
  const pauzaDotykom = (e) => {
    if (!hra || stoj || !e.isTrusted) return;
    if (e.target.closest && e.target.closest(".dxp-btn")) return;
    zastav();
    e.stopPropagation();
    e.preventDefault();
  };
  addEventListener("pointerdown", pauzaDotykom, true);
  addEventListener("touchstart", pauzaDotykom, { capture: true, passive: false });
  addEventListener("keydown", (e) => { if (hra && !stoj && e.isTrusted) { zastav(); e.stopPropagation(); e.preventDefault(); } }, true);
  addEventListener("pointermove", () => { if (hra && !stoj) stav(); }, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && hra && !stoj) zamok(true); });
  // zatvorenie okna fotky/videa počas pauzy (✕) alebo prechod inam ukončí prehrávanie
  addEventListener("hashchange", () => { if (hra && stoj && kroky[i] && kroky[i].hash && location.hash !== kroky[i].hash && !ov) ukonci(); else stav(); });

  const tlacidlo = () => {
    const r = document.querySelector(".top .top__right");
    if (!r || r.querySelector(".dxp-btn")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ibtn ibtn--ink dxp-btn";
    b.addEventListener("click", (e) => { e.stopPropagation(); hra && !stoj ? zastav() : spusti(); });
    r.insertBefore(b, r.querySelector(".ibtn"));
    stav();
  };
  new MutationObserver(tlacidlo).observe(document.documentElement, { childList: true, subtree: true });
  const start = (c) => { obsah = c; tlacidlo(); };
  if (window.__DAHAX_CONTENT__) start(window.__DAHAX_CONTENT__);
  else fetch("content/content.json", { cache: "no-cache" }).then((r) => r.json()).then(start).catch(() => {});
  window.__dxPlay = { spusti, zastav, ukonci, stav: () => ({ hra, stoj, i, n: kroky.length, krok: kroky[i] }) };
})();
