/* DAHAX – KLIMAS „Kotvenie tepelnej izolácie ETICS“: 3 TOP strany kotiev (LFMG-10, WKTHERM S-8, THERMODRIVE V2-8)
   – „naše trójske kone“ (27. 10. 2026, želanie používateľa; obsah z cz.klimas.com – scripts/update-2026-10-27-klimas-etics-top.mjs,
   rozdelenie na 3 snímky – scripts/update-2026-10-27-klimas-etics-3-snimky.mjs).
   Kategórie s poľom etics (content.json) vykreslí nad hotovú snímku bundla (.s__in.media) vlastné rozloženie .dxe:
   v pozadí vpravo fotka fasády (etics.top.foto, stmavená do čiernej), vľavo názov, druh, hlavná veta (claim), 3 výhody
   s číslami (pri THERMODRIVE 3 spôsoby montáže s nákresmi), 3 kľúčové čísla s červeným akcentom, podklady A – E a tlačidlo
   detailu; v strede kotva bez bieleho pozadia (etics.top.kotva) s jemným svetlom, ktoré sa prelína do fotky, a s bielym leskom, ktorý cez ňu sem-tam prebehne (len po jej tvare); vpravo dole video tejto kotvy (stlmené, dokola, hrá len pri viditeľnej snímke
   a bez otvoreného detailu;) – LFMG-10 video nemá, na jeho mieste sa v karte pomaly otáča kotva (etics.top.otocka). Pôvodný obsah snímky ostane neviditeľný – „‹ KLIMAS“ a „Detail produktu
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
      (t.otocka && t.kotva
        // jedna kotva otáčajúca sa o 360°: dve roviny pootočené o 90°, ktoré sa pri otáčaní prelínajú (tá, ktorá ide bokom, zmizne)
        ? '<figure class="dxt__obr is-vyrez is-360"><span class="dxt__360">' +
          '<img class="dxt__360a" alt="' + esc(p.name) + '" src="' + esc(t.kotva) + '"><img class="dxt__360b" alt="" src="' + esc(t.kotva) + '">' + "</span></figure>"
        : '<figure class="dxt__obr' + (t.kotva ? " is-vyrez" : "") + '"><span class="dxt__kotva"><img alt="' + esc(p.name) + '" src="' + esc(t.kotva || p.image) + '">' +
          (t.kotva ? '<i class="dxt__lesk" style="-webkit-mask-image:url(&quot;' + esc(t.kotva) + '&quot;);mask-image:url(&quot;' + esc(t.kotva) + '&quot;)"></i>' : "") + "</span></figure>") +
      (e.video
        ? '<figure class="dxt__video"><video muted playsinline loop preload="metadata" src="' + esc(e.video) + '" poster="' + esc(e.video.replace(/\.mp4$/, ".webp")) +
          '"></video><figcaption><span>Video</span>' + esc(e.videoNazov || p.name) + "</figcaption></figure>"
        : "");
    sec.appendChild(d);
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
