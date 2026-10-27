/* DAHAX – KLIMAS „Kotvenie tepelnej izolácie ETICS“: 3 snímky, jedna kotva = jedna snímka so svojím videom
   (27. 10. 2026, želanie používateľa – predtým jedna preplnená snímka; scripts/update-2026-10-27-klimas-etics-3-snimky.mjs).
   Kategórie s poľom etics (content.json) vykreslí nad hotovú snímku bundla (.s__in.media) vlastné rozloženie .dxe:
   vľavo obrázok kotvy, v strede názov, druh, popis a 4 parametre, podklady A – E (názvy podkladov raz, v jednom riadku –
   pri širokom videu pod videom, inak v texte), tlačidlo detailu na spodnej línii obrázka, vpravo video tejto kotvy
   (stlmené, dokola, hrá len pri viditeľnej snímke a bez otvoreného detailu); LFMG-10 video nemá.
   Pôvodný obsah snímky ostane neviditeľný – „‹ KLIMAS“ a „Detail produktu a dokumenty“ klikajú na pôvodné tlačidlá
   (detail s dokumentmi a celým videom ako doteraz). Na zmeny čaká cez setTimeout. Štýly: assets/dahax-etics.css. */
(() => {
  const cats = new Map(); // "#/<firma>/<kategória>" → kategória
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const load = (c) => {
    for (const m of c.manufacturers || []) for (const k of m.categories || []) if (k.etics) cats.set("#/" + m.id + "/" + k.id, k);
  };

  // snímka bundla tejto kategórie: .s__in.media s nadpisom = názov kotvy
  const najdi = (k) => [...document.querySelectorAll(".s__in.media")].find((s) => s.querySelector(".cat__title")?.textContent.trim() === k.title);

  const postav = (s, k, kluc) => {
    const p = k.products[0], e = k.etics;
    const siroke = !!e.video && e.pomer >= 1;
    const typ = String(p.type || "").replace(new RegExp("^" + (p.druh || "") + "\\s*·\\s*"), "");
    const sp = (p.specs || []).slice(0, 4);
    const podklady = '<div class="dxe__podklady"><p class="dxe__h">Podklady</p><ul>' +
      (e.podklady || []).map((x) => '<li class="' + ((p.podklady || "").includes(x.k) ? "" : "is-off") + '"><img alt="" src="' + esc(x.obr) + '"><b>' + x.k + "</b></li>").join("") +
      '</ul><p class="dxe__leg">' + (e.podklady || []).map((x) => "<span><b>" + x.k + "</b> " + esc(x.nazov.toLowerCase()) + "</span>").join("") + "</p></div>";
    const video = e.video
      ? '<div class="dxe__prava"><figure class="dxe__video"><video muted playsinline loop preload="metadata" src="' + esc(e.video) + '" poster="' +
        esc(e.video.replace(/\.mp4$/, ".webp")) + '"></video><figcaption><span>Video</span>' + esc(e.videoNazov || p.name) + "</figcaption></figure>" +
        (siroke ? podklady : "") + "</div>"
      : "";
    const d = document.createElement("div");
    d.className = "dxe" + (e.video ? (siroke ? " dxe--siroke" : " dxe--vysoke") : " dxe--bez");
    d.dataset.k = kluc;
    d.innerHTML =
      '<header class="dxe__hlava"><button type="button" class="dxe__spat">‹ KLIMAS</button>' +
      '<p class="dxe__eb">KLIMAS · Kotvenie tepelnej izolácie ETICS</p>' +
      '<p class="dxe__cislo">Kotva <b>' + e.poradie + "</b> / " + e.spolu + "</p></header>" +
      '<figure class="dxe__obr"><img alt="' + esc(p.name) + '" src="' + esc(p.image) + '"></figure>' +
      '<div class="dxe__text">' +
      '<h1 class="dxe__n">' + esc(p.name) + "</h1>" +
      '<p class="dxe__druh"><span>' + esc(p.druh) + "</span>" + esc(typ) + "</p>" +
      '<p class="dxe__popis">' + esc(p.description) + "</p>" +
      (e.druhText ? '<p class="dxe__ako">' + esc(p.druh) + " – " + esc(e.druhText) + "</p>" : "") +
      '<dl class="dxe__param">' + sp.map((x) => "<div><dt" + (x.accent ? ' class="is-accent"' : "") + ">" + esc(x.value) + "</dt><dd>" + esc(x.label) + "</dd></div>").join("") + "</dl>" +
      (siroke ? "" : podklady) +
      '<button type="button" class="btn btn--line dxe__det">Detail produktu a dokumenty ›</button>' +
      "</div>" + video;
    s.parentNode.appendChild(d);
    s.classList.add("dxe-skryte");
    const klik = (sel) => s.querySelector(sel)?.click();
    d.querySelector(".dxe__spat").addEventListener("click", () => klik(".cat__back"));
    d.querySelector(".dxe__det").addEventListener("click", () => klik(".media__text > .btn"));
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

  const kontrola = () => {
    for (const [kluc, k] of cats) {
      const s = najdi(k);
      if (!s) continue;
      const d = s.parentNode.querySelector(":scope > .dxe") || postav(s, k, kluc);
      hraj(d);
    }
    setTimeout(kontrola, 500);
  };

  if (window.__DAHAX_CONTENT__) { load(window.__DAHAX_CONTENT__); kontrola(); }
  else fetch("content/content.json", { cache: "no-cache" }).then((r) => r.json()).then((c) => { load(c); kontrola(); }).catch(() => {});
})();
