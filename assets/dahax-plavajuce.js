/* DAHAX – plávajúce výrobky (DK MONT, 27. 10. 2026, želanie používateľa; scripts/update-2026-10-27-dkmont-3-strany.mjs).
   Firma bez videa dostane namiesto neho výrobky bez pozadia, ktoré sa pomaly vznášajú:
    - firma.plavajuce → v ľavom paneli úvodnej snímky firmy v páse medzi logom a nadpisom (namiesto videa pri iných firmách),
    - kategória.plavajuce → namiesto obrázka kategórie (.media__img),
    - kategória.skupiny = [{ od, nazov }] → nadpisy skupín v zozname výrobkov (data-skupina pri riadku, text kreslí CSS),
    - výrobok.detailObrazok → obrázok v detaile výrobku (pole image by pri 2 a viac výrobkoch prepol snímku na karty).
   Položka: { src, x, y, w (v % šírky plochy; na úvode plocha s pomerom strán 0,4), r (natočenie °), d (dĺžka pohybu s), z }.
   Pri obmedzení pohybu stoja.
   Galéria kategórie s obrázkami img/dkmont/ (dlaždice vo farbách DK MONT) je v CSS, JS jej dá len popisy (data-popis).
   Štýly: assets/dahax-plavajuce.css. */
(() => {
  const firmy = [], kat = [], POMER = 0.4;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const detaily = new Map(); // "firma/kategória/výrobok" → detailObrazok
  const load = (c) => {
    for (const m of c.manufacturers || []) {
      if (m.plavajuce && m.logo) firmy.push(m);
      for (const k of m.categories || []) {
        if (k.plavajuce || k.skupiny) kat.push(k);
        for (const p of k.products || []) if (p.detailObrazok) detaily.set(m.id + "/" + k.id + "/" + p.id, p.detailObrazok);
      }
    }
  };

  // detail výrobku (#/firma/kategória/~výrobok): obrázok z detailObrazok namiesto obrázka kategórie
  const detail = () => {
    const h = decodeURIComponent(location.hash).match(/^#\/([^/]+)\/([^/]+)\/~([^/?]+)/);
    const im = h && document.querySelector(".sheet--product .ps__img > img");
    if (!im) return;
    // bundle pri prepnutí na výrobok s tým istým obrázkom kategórie src nemení – pôvodný si pamätáme a vrátime ho
    const src = detaily.get(h[1] + "/" + h[2] + "/" + h[3]) || im.dataset.dxplPov;
    if (!src || im.getAttribute("src") === src) return;
    if (!im.dataset.dxplPov) im.dataset.dxplPov = im.getAttribute("src");
    im.setAttribute("src", src);
  };
  addEventListener("hashchange", () => { for (const t of [0, 60, 200]) setTimeout(detail, t); });

  const vrstva = (zoznam, cls) => {
    const d = document.createElement("div");
    d.className = "dxpl " + cls;
    d.setAttribute("aria-hidden", "true");
    d.innerHTML = '<div class="dxpl__box">' + zoznam.map((p, i) =>
      '<i class="dxpl__v" style="left:' + +p.x + "%;top:" + +p.y + "%;width:" + +p.w + "%;z-index:" + (+p.z || 1) +
      ";--r:" + (+p.r || 0) + "deg;--d:" + (+p.d || 7) + "s;--o:-" + (i * 1.9).toFixed(1) + 's"><img alt="" src="' + esc(p.src) + '"></i>').join("") + "</div>";
    return d;
  };

  const kontrola = () => {
    for (const m of firmy) {
      const side = document.querySelector('.brand__logo img[src="' + m.logo + '"]')?.closest(".brand__side");
      if (!side) continue;
      let v = side.querySelector(":scope > .dxpl");
      if (!v) {
        side.classList.add("dxpl-side");
        v = vrstva(m.plavajuce, "dxpl--uvod");
        side.prepend(v);
      }
      // pás medzi logom a nadpisom firmy (mení sa s veľkosťou obrazovky; offset* sú bez zmenšenia scény); skupina výrobkov
      // má stály pomer strán (POMER = výška / šírka), v páse je v strede a pri nízkom páse sa zmenší
      const logo = side.querySelector(".brand__logo"), id = side.querySelector(".brand__id"), eb = id?.querySelector(".eyebrow");
      if (logo && id) {
        const hore = logo.offsetTop + logo.offsetHeight, dole = id.offsetTop + (eb ? eb.offsetTop : 0), pas = Math.max(0, dole - hore);
        const sirka = Math.min(side.clientWidth - 24, pas / POMER), box = v.firstChild;
        v.style.top = hore + "px";
        v.style.height = pas + "px";
        box.style.width = Math.round(sirka) + "px";
        box.style.height = Math.round(sirka * POMER) + "px";
      }
    }
    for (const k of kat) {
      const s = [...document.querySelectorAll(".s__in.media")].find((x) => x.querySelector(".cat__title")?.textContent.trim() === k.title);
      if (!s) continue;
      const fig = s.querySelector(".media__img");
      if (k.plavajuce && fig && !fig.querySelector(":scope > .dxpl")) {
        fig.classList.add("dxpl-obr");
        fig.appendChild(vrstva(k.plavajuce, "dxpl--obr"));
      }
      if (k.skupiny) {
        const li = s.querySelectorAll(".rows > li");
        s.classList.add("dxpl-skupiny");
        for (const g of k.skupiny) if (li[g.od] && li[g.od].dataset.skupina !== g.nazov) li[g.od].dataset.skupina = g.nazov;
      }
    }
    // dlaždice galérie s výrobkami DK MONT: popis (caption = alt obrázka) kreslí CSS z data-popis
    for (const im of document.querySelectorAll('.brands2__grid > button > img[src*="img/dkmont/"]'))
      if (im.alt && im.parentNode.dataset.popis !== im.alt) im.parentNode.dataset.popis = im.alt;
    detail();
    setTimeout(kontrola, 500);
  };

  if (window.__DAHAX_CONTENT__) { load(window.__DAHAX_CONTENT__); kontrola(); }
  else fetch("content/content.json", { cache: "no-cache" }).then((r) => r.json()).then((c) => { load(c); kontrola(); }).catch(() => {});
})();
