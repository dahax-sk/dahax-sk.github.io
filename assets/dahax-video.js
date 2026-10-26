// DAHAX – videá k výrobkom (scripts/update-2026-10-26-klimas-videa.mjs).
// Údaje z content.json: `video` pri výrobku / dlaždici a pri firme. Na snímkach:
//  - výrobok s videom (dlaždica, karta, riadok) dostane tlačidlo „Video“ → video cez celú obrazovku,
//  - detail výrobku: video namiesto fotky, úvodná snímka firmy: video na pozadí ľavého panela,
//  - videá bežia stlmené a dokola, len keď sú na obrazovke (šetrí batériu); plagát = rovnaký názov .webp,
//  - galéria „Fotky a videá“: videá stlmené, dokola, s plagátom.
(() => {
  const poster = (src) => src.replace(/\.mp4$/, ".webp");
  let byName = new Map(), brands = new Map();
  const norm = (s) => (s || "").split("\n")[0].replace(/\s+/g, " ").trim().toUpperCase();

  const load = (c) => {
    byName = new Map();
    brands = new Map();
    for (const m of c.manufacturers || []) {
      if (m.video) brands.set(norm(m.name), { src: m.video, range: m.videoRange, rate: m.videoRate });
      for (const cat of m.categories || []) {
        for (const t of cat.tiles || []) if (t.video) byName.set(norm(t.name), t.video);
        for (const p of cat.products || []) if (p.video) byName.set(norm(p.name), p.video);
      }
    }
    decorate();
  };

  // prehrávanie len viditeľných videí
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => {
    for (const e of es) {
      const v = e.target;
      if (e.isIntersecting && document.visibilityState === "visible") v.play().catch(() => {});
      else v.pause();
    }
  }, { threshold: 0.25 }) : null;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") document.querySelectorAll("video.dxv-auto").forEach((v) => v.pause());
  });

  const make = (src, cls, controls) => {
    const v = document.createElement("video");
    Object.assign(v, { src, poster: poster(src), muted: true, loop: true, playsInline: true, autoplay: !io, preload: "metadata" });
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    if (controls) v.controls = true;
    v.className = cls;
    return v;
  };
  const auto = (v) => { v.classList.add("dxv-auto"); io ? io.observe(v) : v.play().catch(() => {}); };
  // úsek videa [od, do] v sekundách dokola a rýchlosť (napr. bez úvodného a záverečného loga, 1,5×)
  const segment = (v, range, rate) => {
    if (rate) {
      v.defaultPlaybackRate = rate;
      const r = () => { if (v.playbackRate !== rate) v.playbackRate = rate; };
      v.addEventListener("play", r);
      v.addEventListener("loadedmetadata", r);
    }
    if (!range) return;
    const [a, b] = range;
    v.loop = false;
    v.addEventListener("loadedmetadata", () => { if (v.currentTime < a) v.currentTime = a; });
    v.addEventListener("timeupdate", () => { if (v.currentTime < a - 0.5 || v.currentTime >= b) v.currentTime = a; });
    v.addEventListener("ended", () => { v.currentTime = a; v.play().catch(() => {}); });
  };

  // celá obrazovka
  let ov = null;
  const close = () => { if (ov) { ov.querySelector("video").pause(); ov.remove(); ov = null; } };
  const open = (src, title) => {
    close();
    ov = document.createElement("div");
    ov.className = "dxv-ov";
    ov.innerHTML = `<div class="dxv-ov__bar"><span></span><button type="button" aria-label="Zavrieť">✕</button></div>`;
    ov.querySelector("span").textContent = title || "";
    const v = make(src, "dxv-ov__v", true);
    v.autoplay = true;
    ov.appendChild(v);
    ov.querySelector("button").addEventListener("click", close);
    ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
    document.body.appendChild(ov);
    v.play().catch(() => {});
  };
  addEventListener("keydown", (e) => { if (ov) { e.stopImmediatePropagation(); if (e.key === "Escape") close(); } }, true);

  const badge = (host, src, title) => {
    if (host.querySelector(":scope > .dxv-badge")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dxv-badge";
    b.innerHTML = `<i></i>Video`;
    b.setAttribute("aria-label", "Prehrať video – " + title);
    const stop = (e) => { e.stopPropagation(); };
    b.addEventListener("pointerdown", stop);
    b.addEventListener("pointerup", stop);
    b.addEventListener("touchstart", stop, { passive: true });
    b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); open(src, title); });
    host.appendChild(b);
  };

  const decorate = () => {
    if (!byName.size && !brands.size) return;
    // dlaždice, karty, riadky – tlačidlo „Video“
    document.querySelectorAll(".screen .tile").forEach((t) => {
      const n = t.querySelector(".tile__name"), src = n && byName.get(norm(n.textContent));
      if (src) badge(t, src, norm(n.textContent));
    });
    document.querySelectorAll(".screen .pc").forEach((c) => {
      const n = c.querySelector(".pc__name"), src = n && byName.get(norm(n.textContent));
      const host = c.querySelector(".pc__img") || c;
      if (src) badge(host, src, norm(n.textContent));
    });
    document.querySelectorAll(".screen .row").forEach((r) => {
      const n = r.querySelector(".row__name"), src = n && byName.get(norm(n.textContent));
      if (src) badge(r.querySelector(".row__txt") || r, src, norm(n.textContent));
    });
    // detail výrobku – video namiesto fotky
    document.querySelectorAll(".sheet").forEach((s) => {
      const n = s.querySelector(".ps__name"), box = s.querySelector(".ps__img"), src = n && box && byName.get(norm(n.textContent));
      const cur = box && box.querySelector(":scope > video.dxv-sheet");
      if (cur && cur.dataset.src !== src) cur.remove();
      if (src && box && !box.querySelector(":scope > video.dxv-sheet")) {
        const v = make(src, "dxv-sheet");
        v.dataset.src = src;
        v.addEventListener("click", (e) => { e.stopPropagation(); open(src, norm(n.textContent)); });
        box.appendChild(v);
        auto(v);
      }
    });
    // úvodná snímka firmy – video na pozadí ľavého panela
    document.querySelectorAll(".screen .brand").forEach((b) => {
      const n = b.querySelector(".brand__name"), side = b.querySelector(".brand__side"), bv = n && side && brands.get(norm(n.textContent));
      if (bv && side && !side.querySelector(":scope > video.dxv-bg")) {
        const v = make(bv.src, "dxv-bg");
        segment(v, bv.range, bv.rate);
        side.prepend(v);
        auto(v);
      }
    });
    // galéria – stlmené, dokola, s plagátom
    document.querySelectorAll(".gal__stage video, .mg__thumb video").forEach((v) => {
      if (v.dataset.dxv) return;
      v.dataset.dxv = "1";
      v.muted = true;
      v.defaultMuted = true;
      v.loop = true;
      const s = v.getAttribute("src") || "";
      if (/\.mp4$/.test(s) && !v.poster) v.poster = poster(s);
    });
  };

  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; decorate(); });
  }).observe(document.documentElement, { childList: true, subtree: true });

  if (window.__DAHAX_CONTENT__) load(window.__DAHAX_CONTENT__);
  else fetch("content/content.json", { cache: "no-cache" }).then((r) => r.json()).then(load).catch(() => {});
})();
