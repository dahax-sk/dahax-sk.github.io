/* DAHAX – KLIMAS „Kotvenie tepelnej izolácie ETICS“: 3 TOP strany kotiev (LFMG-10, WKTHERM S-8, THERMODRIVE V2-8)
   – „naše trójske kone“ (27. 10. 2026, želanie používateľa; obsah z cz.klimas.com – scripts/update-2026-10-27-klimas-etics-top.mjs,
   rozdelenie na 3 snímky – scripts/update-2026-10-27-klimas-etics-3-snimky.mjs).
   Kategórie s poľom etics (content.json) vykreslí nad hotovú snímku bundla (.s__in.media) vlastné rozloženie .dxe:
   v pozadí vpravo fotka fasády (etics.top.foto, stmavená do čiernej), vľavo názov, druh, hlavná veta (claim), 3 výhody
   s číslami (pri THERMODRIVE 3 spôsoby montáže s nákresmi), 3 kľúčové čísla s červeným akcentom, podklady A – E a tlačidlo
   detailu; v strede kotva bez bieleho pozadia (etics.top.kotva) s jemným svetlom, ktoré sa prelína do fotky, a s bielym leskom, ktorý cez ňu sem-tam prebehne (len po jej tvare); vpravo dole video tejto kotvy (stlmené, dokola, hrá len pri viditeľnej snímke
   a bez otvoreného detailu;) – LFMG-10 video nemá, kotva sa otáča o 360° z 80 snímok ako na cz.klimas.com (etics.top.otocka360). Pôvodný obsah snímky ostane neviditeľný – „‹ KLIMAS“ a „Detail produktu
   a dokumenty“ klikajú na pôvodné tlačidlá (detail s dokumentmi a celým videom). Štýly: assets/dahax-etics.css. */
(() => {
  const cats = new Map(); // "#/<firma>/<kategória>" → kategória
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const dve = (n) => (n < 10 ? "0" : "") + n;

  const load = (c) => {
    for (const m of c.manufacturers || []) for (const k of m.categories || []) if (k.etics) cats.set("#/" + m.id + "/" + k.id, k);
  };

  // snímka bundla tejto kategórie: .s__in.media s nadpisom = názov kotvy
  const najdi = (k) => [...document.querySelectorAll(".s__in.media")].find((s) => s.querySelector(".cat__title")?.textContent.trim() === k.title);

  // blesk po kotve: spustí animáciu (.is-blesk-on) raz a ďalšiu po nepravidelnej pauze (± 1 s); setTimeout, nie rAF
  // (rAF v skrytom okne nebeží); pri obmedzení pohybu nič
  const blesk = (d, cfg) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const k = d.querySelector(".dxt__kotva"), pauzy = cfg.pauzy || [5, 9, 16, 7, 12, 10];
    let i = 0;
    const tik = () => {
      if (!d.isConnected) return;
      k.classList.remove("is-blesk-on");
      void k.offsetWidth; // nový beh tej istej animácie
      k.classList.add("is-blesk-on");
      setTimeout(tik, (pauzy[i++ % pauzy.length] + Math.random() * 2 - 1) * 1000);
    };
    setTimeout(tik, 1500);
  };

  // kotva 360° (etics.top.otocka360 = { cesta, pocet, sirka, vyska }): snímky cesta/00.webp … na canvase, sama sa otáča
  // 12 snímok/s (ako Orbitvu na cz.klimas.com) len pri viditeľnej snímke bez otvoreného detailu; ťahaním sa otočí ručne
  // a po 2,5 s sa znova otáča sama. Ťah nesmie prepnúť snímku prezentácie (stopPropagation). setTimeout, nie rAF.
  const otacka360 = (d, cfg) => {
    const cv = d.querySelector(".dxt__360"), g = cv.getContext("2d"), n = cfg.pocet;
    const snimky = Array.from({ length: n }, (_, i) => { const im = new Image(); im.decoding = "async"; im.src = cfg.cesta + dve(i) + ".webp"; return im; });
    let i = 0, ukazana = -1, tah = null, pokoj = 0;
    const kresli = () => {
      const im = snimky[i];
      if (ukazana === i || !im.complete || !im.naturalWidth) return;
      g.clearRect(0, 0, cv.width, cv.height);
      g.drawImage(im, 0, 0, cv.width, cv.height);
      ukazana = i;
    };
    snimky[0].onload = kresli;
    const stoj = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tik = () => {
      if (!d.isConnected) return;
      const r = cv.getBoundingClientRect();
      const on = document.visibilityState === "visible" && r.width > 0 && r.right > 0 && r.left < innerWidth && !document.querySelector(".sheet");
      if (on && !stoj && !tah && Date.now() > pokoj) i = (i + 1) % n;
      kresli();
      setTimeout(tik, on ? 83 : 500);
    };
    const x = (ev) => (ev.touches ? ev.touches[0].clientX : ev.clientX);
    const zaciatok = (ev) => { ev.stopPropagation(); tah = { x: x(ev), i }; cv.classList.add("is-tah"); };
    const pohyb = (ev) => {
      if (!tah) return;
      ev.stopPropagation();
      if (ev.cancelable && ev.type === "touchmove") ev.preventDefault();
      const krok = Math.round((x(ev) - tah.x) / (cv.getBoundingClientRect().width / n * 1.2)); // ~ 1 otáčka na šírku kotvy
      i = (((tah.i - krok) % n) + n) % n;
      kresli();
    };
    const koniec = (ev) => { if (!tah) return; ev.stopPropagation(); tah = null; pokoj = Date.now() + 2500; cv.classList.remove("is-tah"); };
    cv.addEventListener("pointerdown", (ev) => { zaciatok(ev); cv.setPointerCapture?.(ev.pointerId); });
    cv.addEventListener("pointermove", pohyb);
    cv.addEventListener("pointerup", koniec);
    cv.addEventListener("pointercancel", koniec);
    for (const t of ["touchstart", "touchmove", "touchend", "mousedown", "mousemove", "mouseup", "click"]) cv.addEventListener(t, (ev) => ev.stopPropagation(), { passive: t !== "touchmove" });
    cv.addEventListener("touchmove", (ev) => { if (ev.cancelable) ev.preventDefault(); }, { passive: false });
    tik();
  };

  const postav = (s, k, kluc) => {
    const p = k.products[0], e = k.etics, t = e.top || {};
    const typ = String(p.type || "").replace(new RegExp("^" + (p.druh || "") + "\\s*·\\s*"), "");
    const sec = s.parentNode;
    if (t.foto) {
      const f = document.createElement("div");
      f.className = "dxt-foto";
      f.style.backgroundImage = "url('" + t.foto + "')";
      sec.appendChild(f);
    }
    const d = document.createElement("div");
    d.className = "dxe dxt" + (e.video ? (e.pomer < 1 ? " dxt--vysoke" : " dxt--siroke") : " dxt--bez");
    d.dataset.k = kluc;
    d.innerHTML =
      '<header class="dxe__hlava"><button type="button" class="dxe__spat">‹ KLIMAS</button>' +
      '<p class="dxe__eb">KLIMAS · TOP kotvy ETICS</p>' +
      '<p class="dxe__cislo">Kotva <b>' + e.poradie + "</b> / " + e.spolu + "</p></header>" +
      '<div class="dxt__text">' +
      '<h1 class="dxt__n">' + esc(p.name) + "</h1>" +
      '<p class="dxe__druh"><span>' + esc(p.druh) + "</span>" + esc(typ) + "</p>" +
      (t.claim ? '<p class="dxt__claim">' + esc(t.claim) + "</p>" : "") +
      (t.sklad ? '<div class="dxt__sklad"><span class="dxt__sklad-l"><i></i>Skladom</span><b>' + esc(t.sklad.od) + " – " + esc(t.sklad.do) +
        " <small>mm</small></b></div>" : "") +
      (t.vyhodyNadpis ? '<p class="dxt__h">' + esc(t.vyhodyNadpis) + "</p>" : "") +
      '<ol class="dxt__vyhody' + ((t.vyhody || []).some((v) => v.obr) ? " s-obr" : "") + '">' + (t.vyhody || []).map((v, i) =>
        "<li><b>" + dve(i + 1) + "</b><span><strong>" + esc(v.t) + "</strong>" + esc(v.p) + "</span>" +
        (v.obr ? '<i><img alt="" src="' + esc(v.obr) + '"></i>' : "") + "</li>").join("") + "</ol>" +
      '<dl class="dxt__cisla">' + (t.cisla || []).map((c) => "<div><dt>" + esc(c.v) + "</dt><dd>" + esc(c.l) + "</dd></div>").join("") + "</dl>" +
      '<div class="dxt__spodok"><div class="dxt__podklady"><p>Podklady A – E</p><ul>' +
      (e.podklady || []).map((x) => '<li class="' + ((p.podklady || "").includes(x.k) ? "" : "is-off") + '" title="' + esc(x.nazov) + '"><img alt="" src="' + esc(x.obr) + '"><b>' + x.k + "</b></li>").join("") +
      '</ul></div><button type="button" class="btn btn--line dxe__det">Detail produktu a dokumenty ›</button></div>' +
      "</div>" +
      (t.otocka360
        // kotva 360° ako na cz.klimas.com: snímky Orbitvu na canvase (otacka360)
        ? '<figure class="dxt__obr is-vyrez is-360"><canvas class="dxt__360" role="img" aria-label="' + esc(p.name) + ' 360°" width="' + t.otocka360.sirka +
          '" height="' + t.otocka360.vyska + '"></canvas><p class="dxt__360-znak"><b>360°</b>Potiahnite a otočte</p></figure>'
        : '<figure class="dxt__obr' + (t.kotva ? " is-vyrez" : "") + '"><span class="dxt__kotva"><img alt="' + esc(p.name) + '" src="' + esc(t.kotva || p.image) + '">' +
          // blesk (etics.top.blesk): zasvieti zelená skrutka hore (iskra) a svetlo prebehne po tvare kotvy nadol
          (t.kotva && t.blesk ? '<i class="dxt__iskra' + (t.blesk.kov ? " is-kov" : "") + '" style="top:' + (+t.blesk.y || 7) + '%"></i>' : "") +
          // pri blesku je lesk v obale so žiarou (filter obalu svieti aj kúsok za tvar kotvy, maska je až na lesku)
          (t.kotva ? (t.blesk ? '<i class="dxt__bobal' + (t.blesk.kov ? " is-kov" : "") + '">' : "") + '<i class="dxt__lesk' + (t.blesk ? " is-blesk" : "") + '" style="-webkit-mask-image:url(&quot;' + esc(t.kotva) + '&quot;);mask-image:url(&quot;' + esc(t.kotva) + '&quot;)"></i>' + (t.blesk ? "</i>" : "") : "") + "</span></figure>") +
      (e.video
        ? '<figure class="dxt__video"><video muted playsinline loop preload="metadata" src="' + esc(e.video) + '" poster="' + esc(e.video.replace(/\.mp4$/, ".webp")) +
          '"></video>' + (e.videoPopis === false ? "" : "<figcaption><span>Video</span>" + esc(e.videoNazov || p.name) + "</figcaption>") + "</figure>"
        : "");
    sec.appendChild(d);
    s.classList.add("dxe-skryte");
    const klik = (sel) => s.querySelector(sel)?.click();
    d.querySelector(".dxe__spat").addEventListener("click", () => klik(".cat__back"));
    d.querySelector(".dxe__det").addEventListener("click", () => klik(".media__text > .btn"));
    if (t.blesk) blesk(d, t.blesk);
    if (t.otocka360) otacka360(d, t.otocka360);
    return d;
  };

  // video hrá, len keď je snímka viditeľná a nie je otvorený detail
  const hraj = (d) => {
    const r = d.getBoundingClientRect(), on = document.visibilityState === "visible" && r.width > 0 && r.right > 0 && r.left < innerWidth && !document.querySelector(".sheet");
    d.querySelectorAll("video").forEach((v) => {
      if (on && v.paused) v.play().catch(() => {});
      if (!on && !v.paused) v.pause();
    });
  };

  const postavVsetko = () => {
    const out = [];
    for (const [kluc, k] of cats) {
      const s = najdi(k);
      if (s) out.push(s.parentNode.querySelector(":scope > .dxe") || postav(s, k, kluc));
    }
    return out;
  };
  const kontrola = () => {
    postavVsetko().forEach(hraj);
    setTimeout(kontrola, 500);
  };
  // 28. 10. 2026: rozloženie kotvy sa postaví hneď, keď bundle vloží snímku (MutationObserver beží pred vykreslením),
  // nie až pri ďalšej kontrole o ≤ 0,5 s – inak po prekliknutí na chvíľu prebleskla pôvodná snímka a okná „preskočili“
  const start = (c) => {
    load(c);
    new MutationObserver(() => { if (cats.size) postavVsetko(); }).observe(document.documentElement, { childList: true, subtree: true });
    kontrola();
  };

  if (window.__DAHAX_CONTENT__) start(window.__DAHAX_CONTENT__);
  else fetch("content/content.json", { cache: "no-cache" }).then((r) => r.json()).then(start).catch(() => {});
})();
