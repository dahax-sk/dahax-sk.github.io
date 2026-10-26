// DAHAX – videá k výrobkom (scripts/update-2026-10-26-klimas-videa.mjs).
// Údaje z content.json: `video` pri výrobku / dlaždici a pri firme. Na snímkach:
//  - výrobok s videom (dlaždica, karta, riadok) dostane tlačidlo „Video“ → video cez celú obrazovku,
//  - detail výrobku: najprv obrázok výrobku so šípkou (content.json → videoPosters), video sa spustí po kliknutí,
//    počas prehrávania je vpravo dole logo DAHAX (≈ 3 cm nad spodnou hranou); úvodná snímka firmy: video na pozadí ľavého panela,
//  - galéria: náhľady s obrázkom výrobku, po kliknutí sa video hneď spustí (logo DAHAX je pri názve v hlavičke),
//  - videá bežia stlmené a dokola, len keď sú na obrazovke (šetrí batériu); plagát = rovnaký názov .webp,
//  - galéria „Fotky a videá“: videá stlmené, dokola, s plagátom,
//  - pri videách výrobkov štítok s názvom (content.json → videoNames; nie na úvodnej snímke firmy), na celej obrazovke v hlavičke.
(() => {
  const poster = (src) => src.replace(/\.mp4$/, ".webp");
  let byName = new Map(), brands = new Map(), names = new Map(), posters = new Map();
  const norm = (s) => (s || "").split("\n")[0].replace(/\s+/g, " ").trim().toUpperCase();

  const load = (c) => {
    byName = new Map();
    brands = new Map();
    names = new Map(Object.entries(c.videoNames || {}));
    posters = new Map(Object.entries(c.videoPosters || {}));
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
    ov.querySelector("span").textContent = names.get(src) || title || "";
    const v = make(src, "dxv-ov__v", true);
    v.autoplay = true;
    ov.appendChild(v);
    ov.appendChild(logo(v));
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

  // štítok s názvom výrobku (vľavo hore – titulky vo videách sú vpravo)
  const tag = (host, src) => {
    const name = names.get(src), cur = host.querySelector(":scope > .dxv-tag");
    if (!name) return cur && cur.remove();
    if (cur) { if (cur.textContent !== name) cur.textContent = name; return; }
    const t = document.createElement("span");
    t.className = "dxv-tag";
    t.textContent = name;
    host.appendChild(t);
  };
  // logo DAHAX počas prehrávania – prezentujeme výrobcu, ale za DAHAX. Na každom videu rovnako: vpravo dole
  // vo viditeľnom obraze videa, spodok loga 16 % výšky obrazu nad spodnou hranou (na tablete cez celú obrazovku ≈ 3 cm).
  // b = odstup zdola, r = odstup sprava, w = šírka – % výšky/šírky viditeľného obrazu.
  // Svetlé animácie majú tmavé logo (ink), inak by biele logo na bielom pozadí nebolo vidieť; majú vpravo dole značky ETA/CE
  // (spodných ~22 % obrazu), preto je logo o kúsok vyššie – tesne nad nimi (DOLE_NAD_CE).
  const LOGO = "img/logo/dahax-white.svg";
  const LOGO_TMAVE = "img/logo/dahax-ink.svg";
  const DOLE = { b: 16, r: 3.2, w: 10.5 };
  const DOLE_NAD_CE = { b: 24, r: 3.2, w: 10.5 };
  const SVETLE = ["klimas-eco-drive-s", "klimas-eco-drive-w", "klimas-kpr-kps-fast", "klimas-fixplug", "klimas-lino", "klimas-sfx",
    "klimas-wktherm-s", "klimas-wfd", "klimas-ws", "klimas-chemicke-kotvy"];
  const umiestni = (v, i) => {
    if (!i.isConnected) return;
    const W = v.videoWidth, H = v.videoHeight, b = v.getBoundingClientRect();
    if (W && H && b.width) {
      const ink = SVETLE.includes((rel(v.currentSrc || v.src).split("/").pop() || "").replace(/.mp4$/, "")), m = ink ? DOLE_NAD_CE : DOLE;
      const fit = getComputedStyle(v).objectFit, k = fit === "cover" ? Math.max(b.width / W, b.height / H) : Math.min(b.width / W, b.height / H);
      const x = b.left + (b.width - W * k) / 2, y = b.top + (b.height - H * k) / 2;
      // viditeľná časť obrazu (pri cover je orezaná rámom videa)
      const vl = Math.max(x, b.left), vr = Math.min(x + W * k, b.right), vt = Math.max(y, b.top), vb = Math.min(y + H * k, b.bottom);
      const w = vr - vl, h = vb - vt;
      const fixed = getComputedStyle(i).position === "fixed", p = fixed ? { left: 0, top: 0 } : (i.offsetParent || v.parentNode).getBoundingClientRect();
      const lw = Math.max(64, (w * m.w) / 100), lh = lw * 107 / 867, src = ink ? LOGO_TMAVE : LOGO;
      if (!i.src.endsWith(src)) i.src = src;
      i.classList.toggle("is-ink", ink);
      i.style.width = lw + "px";
      i.style.left = vr - (w * m.r) / 100 - lw - p.left + "px";
      i.style.top = vb - (h * m.b) / 100 - lh - p.top + "px";
    }
    setTimeout(() => umiestni(v, i), 700);
  };
  const logo = (v) => {
    const i = document.createElement("img");
    i.className = "dxv-logo";
    i.src = LOGO;
    i.alt = "DAHAX";
    if (v) setTimeout(() => umiestni(v, i), 0);
    return i;
  };
  // obrázok výrobku so šípkou – video sa spustí až po kliknutí
  const cover = (host, v, src) => {
    const photo = posters.get(src), b = document.createElement("button");
    b.type = "button";
    b.className = "dxv-cover" + (photo ? " is-photo" : "");
    b.setAttribute("aria-label", "Prehrať video" + (names.get(src) ? " – " + names.get(src) : ""));
    b.innerHTML = '<img alt=""><i></i>';
    b.querySelector("img").src = photo || poster(src);
    const stop = (e) => e.stopPropagation();
    b.addEventListener("pointerdown", stop);
    b.addEventListener("pointerup", stop);
    b.addEventListener("touchstart", stop, { passive: true });
    b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      b.remove();
      v.controls = true;
      v.play().catch(() => {});
    });
    v.addEventListener("play", () => host.classList.add("dxv-playing"));
    v.addEventListener("pause", () => host.classList.remove("dxv-playing"));
    host.append(b, logo(v));
  };
  const rel = (src) => (src || "").replace(location.href.replace(/[#?].*$/, "").replace(/[^/]*$/, ""), "");

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
      const cur = box && box.querySelector(":scope > .dxv-sheet");
      if (cur && cur.dataset.src !== src) { cur.querySelector("video").pause(); cur.remove(); }
      if (src && box && !box.querySelector(":scope > .dxv-sheet")) {
        const w = document.createElement("div"), v = make(src, "dxv-v");
        w.className = "dxv-sheet";
        w.dataset.src = src;
        w.addEventListener("click", (e) => e.stopPropagation());
        v.preload = "none";
        v.poster = posters.get(src) || poster(src);
        w.appendChild(v);
        cover(w, v, src);
        tag(w, src);
        box.appendChild(w);
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
    document.querySelectorAll(".mg__thumb").forEach((t) => { const v = t.querySelector(":scope > video"); tag(t, v ? rel(v.getAttribute("src")) : ""); });
    document.querySelectorAll(".gal__stage video, .mg__thumb video").forEach((v) => {
      if (v.dataset.dxv) return;
      v.dataset.dxv = "1";
      v.muted = true;
      v.defaultMuted = true;
      v.loop = true;
      const s = v.getAttribute("src") || "";
      if (/\.mp4$/.test(s) && !v.poster) v.poster = posters.get(rel(s)) || poster(s);
      if (posters.has(rel(s))) v.classList.add("dxv-photo");
    });
  };

  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    setTimeout(() => { queued = false; decorate(); }, 40);
  }).observe(document.documentElement, { childList: true, subtree: true });

  if (window.__DAHAX_CONTENT__) load(window.__DAHAX_CONTENT__);
  else fetch("content/content.json", { cache: "no-cache" }).then((r) => r.json()).then(load).catch(() => {});
})();
