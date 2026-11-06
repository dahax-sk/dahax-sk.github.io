// DAHAX – webový režim: responzívna verzia pre mobil a tablet na výšku (6. 11. 2026). Namiesto výzvy „Otočte zariadenie
// na šírku“ sa ukáže posúvateľná stránka s rovnakou grafikou a obsahom (content.json): úvod, prečo DAHAX, výrobcovia,
// logistika, realizácie, dokumenty, kontakt s formulárom a pätička s firemnými údajmi. Stránka firmy: #/<firma>
// (rovnaké adresy ako prezentácia – po otočení na šírku ostane otvorená tá istá firma).
// Len vo webovom režime (assets/dahax-web.js). Na šírku (mobil aj tablet) beží plná prezentácia. Štýly: dahax-web.css.
(() => {
  if (!window.__dxWeb) return;
  const html = document.documentElement;
  const mq = matchMedia("(orientation: portrait) and (max-width: 1100px)");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const br = (s) => esc(s).replace(/\n/g, "<br>");
  let c = null, box = null, poslednaFirma = "";

  const SEKCIE = [["uvod", "Úvod"], ["preco-dahax", "Prečo DAHAX"], ["vyrobcovia", "Výrobcovia"], ["logistika", "Logistika"], ["realizacie", "Realizácie"], ["dokumenty", "Dokumenty"], ["kontakt", "Kontakt"]];
  const firmy = () => c.manufacturers.filter((m) => !m.hidden);
  const firma = (id) => firmy().find((m) => m.id === id);
  const tel = () => c.company.phone.replace(/\s/g, "");
  const jazyk = (t) => (String(t).match(/\((SK|CZ|PL|EN|DE)\)\s*$/) || [])[1] || "";
  const bezJazyka = (t) => String(t).replace(/\s*\((SK|CZ|PL|EN|DE)\)\s*$/, "");
  const obrProduktu = (p) => p.image || p.detailObrazok || ((p.gallery || [])[0] && ((p.gallery[0].src) || p.gallery[0])) || "";

  // ── komponenty ──
  const dlazdica = (m) =>
    '<a class="dxw-firma-t" href="#/' + esc(m.id) + '"><span class="dxw-firma-t__lg" style="background:' + esc((m.tile && m.tile.bg) || "#fff") + '"><img src="' + esc(m.logo) + '" alt="' + esc(m.name) + '" loading="lazy"></span>' +
    "<span class=\"dxw-firma-t__tx\"><b>" + esc(m.name) + "</b><small>" + esc(m.role || m.eyebrow || "") + "</small></span></a>";
  const video = (src, popis) => {
    if (!src || /^https?:/.test(src)) return "";
    const poster = (c.videoPosters || {})[src] || src.replace(/\.mp4$/, ".webp"); // rovnako ako dahax-video.js
    return '<figure class="dxw-vid"><video controls playsinline preload="none"' + (poster ? ' poster="' + esc(poster) + '"' : "") + ' src="' + esc(src) + '"></video>' + (popis ? "<figcaption>" + esc(popis) + "</figcaption>" : "") + "</figure>";
  };
  const dokument = (d) =>
    '<a class="dxw-doc" href="' + esc(d.href) + '" target="_blank" rel="noopener"><i>PDF</i><span>' + esc(bezJazyka(d.title)) + (d.produkt ? "<small>" + esc(d.produkt) + "</small>" : "") + "</span>" + (jazyk(d.title) ? "<em>" + jazyk(d.title) + "</em>" : "") + "</a>";
  const dokumentyFirmy = (m) => {
    const out = [], bolo = new Set();
    const pridaj = (d, produkt) => { if (d && d.href && !bolo.has(d.href)) { bolo.add(d.href); out.push({ ...d, produkt }); } };
    (m.categories || []).forEach((k) => (k.products || []).forEach((p) => (p.documents || []).forEach((d) => pridaj(d, p.name))));
    (m.documents || []).forEach((d) => pridaj(d, ""));
    return out;
  };
  const nadpis = (eyebrow, titul, h = "h2") => (eyebrow ? '<p class="eyebrow">' + esc(eyebrow) + "</p>" : "") + "<" + h + ' class="dxw-h">' + esc(titul) + "</" + h + ">";
  const cta = (vyrobca) =>
    '<div class="dxw-cta"><p>' + (vyrobca ? "Ceny, dostupnosť a termín dodania " + esc(vyrobca) + " vám pošleme obratom." : "Pošlite nám dopyt – ozveme sa s cenovou ponukou a termínom dodania.") + "</p>" +
    '<div class="dxw-cta__b"><button type="button" class="dxw-btn dxw-btn--red" data-dxw="dopyt"' + (vyrobca ? ' data-vyrobca="' + esc(vyrobca) + '"' : "") + '>Poslať dopyt</button><a class="dxw-btn" href="tel:' + tel() + '">' + esc(c.company.phone) + "</a></div></div>";

  const hlavicka = () =>
    '<header class="dxw-m__top"><a class="dxw-m__logo" href="#/" aria-label="DAHAX – úvod"><img src="img/logo/dahax-white.svg" alt="DAHAX"></a>' +
    '<button type="button" class="dxw-btn dxw-btn--red dxw-m__dopyt" data-dxw="dopyt">Dopyt</button>' +
    '<button type="button" class="dxw-m__menu" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button></header>' +
    '<nav class="dxw-m__nav" aria-label="Hlavné menu">' + SEKCIE.map(([k, t]) => '<a href="#/' + (k === "uvod" ? "" : k) + '">' + t + "</a>").join("") + "</nav>";
  const paticka = () => {
    const U = window.__dxWebUdaje, co = c.company;
    return '<footer class="dxw-pata"><img src="img/logo/dahax-white.svg" alt="DAHAX" class="dxw-pata__logo"><p>' + esc(co.slogan) + "</p>" +
      '<div class="dxw-pata__k"><b>Kontakt</b><span>' + esc(co.contactPerson) + '</span><a href="tel:' + tel() + '">' + esc(co.phone) + '</a><a href="mailto:' + esc(co.email) + '">' + esc(co.email) + '</a><a href="mailto:' + esc(co.orderEmail) + '">' + esc(co.orderEmail) + "</a></div>" +
      '<div class="dxw-pata__k"><b>Sklady</b>' + co.warehouses.map((w) => "<span>" + esc(w.city) + "</span>").join("") + "</div>" +
      '<p class="dxw-pata__f">© ' + new Date().getFullYear() + " " + (U ? U.html(co).riadok : esc(co.name)) + "</p>" +
      '<p class="dxw-pata__f"><button type="button" class="dxw-link" data-dxw="ochrana">Ochrana osobných údajov</button> · Web nepoužíva cookies ani sledovanie.</p></footer>';
  };

  // ── úvodná stránka ──
  const uvod = () => {
    const co = c.company, why = c.why, lg = c.logistics, r = c.realizations;
    const core = firmy().filter((m) => m.tier === "core"), plus = firmy().filter((m) => m.tier !== "core");
    const fotky = (r.galeria || []).filter((g) => g.typ !== "video" && g.src).map((g) => ({ src: g.src, popis: g.popis })).concat((r.photos || []).map((p) => ({ src: p.src, popis: p.caption })));
    const unik = [...new Map(fotky.map((f) => [f.src, f])).values()];
    const docs = firmy().flatMap((m) => dokumentyFirmy(m).map((d) => ({ ...d, firma: m.name, fid: m.id }))).concat((c.documents || []).map((d) => ({ ...d, firma: "DAHAX", fid: "dahax" })));
    return '<section class="dxw-hero" id="dxw-uvod"><div class="dxw-hero__bg"></div><div class="dxw-tok" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<div class="dxw-hero__in"><img class="dxw-hero__logo" src="img/logo/dahax-white.svg" alt="DAHAX"><p class="dxw-hero__lead">' + esc(co.slogan) + "</p>" +
      '<div class="dxw-cta__b"><a class="dxw-btn dxw-btn--red" href="#/vyrobcovia">Naši výrobcovia</a><button type="button" class="dxw-btn" data-dxw="dopyt">Poslať dopyt</button></div></div>' +
      '<p class="dhx-dalej dxw-dalej" aria-hidden="true"><span>Posuňte</span><i></i><i></i><i></i></p></section>' +
      '<div class="dxw-cisla"><div><b>' + firmy().length + "</b><span>európskych výrobcov</span></div><div><b>2</b><span>sklady – Prešov a Čajkov</span></div><div><b>SK + CZ</b><span>doprava po celom území</span></div><div><b>1</b><span>dodávateľ na všetko</span></div></div>" +
      '<section class="dxw-s" id="dxw-preco-dahax">' + nadpis(why.eyebrow, why.title) +
      '<div class="dxw-karty">' + why.points.map((p) => '<div class="dxw-karta' + (p.featured ? " is-hl" : "") + '"><h3>' + esc(p.title) + "</h3>" + (p.lines ? "<ul>" + p.lines.map((l) => "<li>" + esc(l) + "</li>").join("") + "</ul>" : "<p>" + esc(p.text) + "</p>") + "</div>").join("") + "</div></section>" +
      '<section class="dxw-s" id="dxw-vyrobcovia">' + nadpis(c.portfolio.eyebrow, c.portfolio.title) + '<p class="dxw-lead">' + esc(c.portfolio.intro) + "</p>" +
      '<div class="dxw-firmy">' + core.map(dlazdica).join("") + "</div>" +
      (plus.length ? '<h3 class="dxw-h3">' + esc(c.supplementary.title) + '</h3><p class="dxw-lead">' + esc(c.supplementary.intro) + '</p><div class="dxw-firmy">' + plus.map(dlazdica).join("") + "</div>" : "") + "</section>" +
      '<section class="dxw-s" id="dxw-logistika">' + nadpis(lg.eyebrow, lg.title) + '<p class="dxw-lead">' + esc(lg.intro) + "</p>" +
      '<div class="dxw-karty dxw-karty--2">' + lg.points.map((p) => '<div class="dxw-karta"><h3>' + esc(p.title) + "</h3><p>" + esc(p.text) + "</p></div>").join("") + "</div>" +
      ((lg.network || []).length ? '<h3 class="dxw-h3">' + esc(lg.networkTitle) + '</h3><div class="dxw-karty dxw-karty--2">' + lg.network.map((p) => '<div class="dxw-karta"><h3>' + esc(p.title) + "</h3><p>" + esc(p.text) + "</p></div>").join("") + "</div>" : "") +
      '<div class="dxw-sklady">' + co.warehouses.map((w) => '<div class="dxw-sklad"><p class="eyebrow">Sklad</p><h3>' + esc(w.city) + "</h3><p>" + esc(w.address) + "</p></div>").join("") + '</div><p class="dxw-pozn">' + esc(co.delivery) + "</p></section>" +
      (r.hidden || !unik.length ? "" : '<section class="dxw-s" id="dxw-realizacie">' + nadpis(r.eyebrow, r.title) + '<p class="dxw-lead">' + esc(r.intro) + "</p>" +
        '<div class="dxw-fotky">' + unik.map((f, i) => '<button type="button" class="dxw-foto' + (i >= 6 ? " is-viac" : "") + '" data-lb="' + esc(f.src) + '" data-cap="' + esc(f.popis || "") + '"><img src="' + esc(f.src) + '" alt="' + esc(f.popis || "") + '" loading="lazy"></button>').join("") + "</div>" +
        (unik.length > 6 ? '<button type="button" class="dxw-btn dxw-viac" data-viac>Zobraziť všetky (' + unik.length + ")</button>" : "") + "</section>") +
      '<section class="dxw-s" id="dxw-dokumenty">' + nadpis("Na stiahnutie", "Dokumenty") + '<p class="dxw-lead">Technické listy, vyhlásenia o parametroch, certifikáty a katalógy – ' + docs.length + " dokumentov.</p>" +
      '<input class="dxw-hladaj" type="search" placeholder="Hľadať, napr. THERMODRIVE alebo vyhlásenie" aria-label="Hľadať dokument">' +
      '<div class="dxw-docs">' + docs.map((d) => dokument(d).replace('<a class="dxw-doc"', '<a class="dxw-doc" data-t="' + esc((d.title + " " + d.firma + " " + (d.produkt || "")).toLowerCase()) + '"')).join("") + '</div><p class="dxw-pozn dxw-docs__nic" hidden>Nič sa nenašlo.</p></section>' +
      kontaktSekcia();
  };
  const kontaktSekcia = () => {
    const co = c.company;
    return '<section class="dxw-s dxw-kontakt" id="dxw-kontakt">' + nadpis("Kontakt", c.closing || "Ozvite sa nám") +
      '<dl class="dxw-kv"><div><dt class="eyebrow">Kontakt</dt><dd>' + esc(co.contactPerson) + '</dd></div><div><dt class="eyebrow">Telefón</dt><dd class="dxw-kv__big"><a href="tel:' + tel() + '">' + esc(co.phone) + "</a></dd></div>" +
      '<div><dt class="eyebrow">E-mail</dt><dd><a href="mailto:' + esc(co.email) + '">' + esc(co.email) + '</a></dd></div><div><dt class="eyebrow">Objednávky</dt><dd><a href="mailto:' + esc(co.orderEmail) + '">' + esc(co.orderEmail) + "</a></dd></div></dl>" +
      cta() + "</section>";
  };

  // ── stránka firmy ──
  const stranaFirmy = (m) => {
    const pr = m.profile || {};
    const kats = (m.categories || []).map((k) => {
      const prods = (k.products || []).map((p) => {
        const im = obrProduktu(p);
        const specs = (p.specs || []).map((s) => "<li" + (s.accent ? ' class="is-acc"' : "") + "><b>" + br(s.value) + "</b><span>" + br(s.label) + "</span></li>").join("");
        return '<article class="dxw-prod">' + (im ? '<div class="dxw-prod__im"><img src="' + esc(im) + '" alt="' + esc(p.name) + '" loading="lazy"></div>' : "") + "<h4>" + esc(p.name) + "</h4>" +
          (p.description ? "<p>" + esc(p.description) + "</p>" : "") + (specs ? '<ul class="dxw-specs">' + specs + "</ul>" : "") +
          ((p.documents || []).length ? '<div class="dxw-prod__docs">' + p.documents.slice(0, 3).map(dokument).join("") + "</div>" : "") + "</article>";
      }).join("");
      const kat = k.katalog;
      const kategorie = kat && (kat.kategorie || []).length ? '<div class="dxw-kat-tiles">' + kat.kategorie.map((x) => '<a class="dxw-kat-tile" href="' + esc(x.odkaz) + '" target="_blank" rel="noopener"><img src="' + esc(x.obrazok) + '" alt="" loading="lazy"><span><b>' + esc(x.nazov) + "</b><small>" + esc(x.vyrobkov) + " výrobkov ↗</small></span></a>").join("") + "</div>" : "";
      const banery = kat && (kat.banery || []).length ? '<div class="dxw-banery">' + kat.banery.map((b) => '<a class="dxw-baner" href="' + esc(b.odkaz) + '" target="_blank" rel="noopener" style="--f:' + esc(b.farba || "#de1f26") + '"><img src="' + esc(b.obrazok) + '" alt="" loading="lazy"><span><b>' + esc(b.nadpis) + "</b><small>" + esc(b.podnadpis) + "</small></span></a>").join("") + "</div>" : "";
      if (!prods && !kategorie && !banery && !k.intro && !k.image) return "";
      return '<section class="dxw-kat" id="dxw-k-' + esc(k.id) + '">' + ((k.eyebrow || k.name) !== (k.title || k.name) ? '<p class="eyebrow">' + esc(k.eyebrow || k.name) + '</p>' : '') + '<h3 class="dxw-h3">' + esc(k.title || k.name) + "</h3>" +
        (k.intro ? '<p class="dxw-lead">' + esc(k.intro) + "</p>" : "") +
        ((k.chips || []).length ? '<div class="dxw-chips">' + k.chips.map((x) => "<span>" + br(x) + "</span>").join("") + "</div>" : "") +
        (k.image ? '<figure class="dxw-kat__im' + (k.imageOnWhite ? " is-biele" : "") + '"><img src="' + esc(k.image) + '" alt="' + esc(k.imageCaption || k.name) + '" loading="lazy"></figure>' : "") +
        banery + kategorie + (prods ? '<div class="dxw-prods">' + prods + "</div>" : "") +
        (kat && kat.zdroj ? '<p class="dxw-pozn">Kompletný katalóg: <a href="' + esc(kat.zdroj) + '" target="_blank" rel="noopener">' + esc(kat.zdroj.replace(/^https?:\/\//, "").replace(/\/$/, "")) + " ↗</a></p>" : "") + "</section>";
    }).join("");
    const videa = (m.media || []).filter((x) => x.kind === "video" && x.src && x.src !== m.video && !/^https?:/.test(x.src));
    const fotky = (m.media || []).filter((x) => x.kind !== "video" && x.src);
    const docs = dokumentyFirmy(m);
    return '<div class="dxw-fhero" style="--t:' + esc((m.tile && m.tile.bg) || "#fff") + '"><a class="dxw-spat" href="#/vyrobcovia">‹ Výrobcovia</a>' +
      '<div class="dxw-fhero__lg"><img src="' + esc(m.logo) + '" alt="' + esc(m.name) + '"></div>' +
      '<p class="eyebrow">' + esc(m.eyebrow || m.role || "") + '</p><h1 class="dxw-h">' + esc(m.name) + '</h1><p class="dxw-lead">' + esc(m.tagline) + "</p>" +
      (m.role ? '<p class="dxw-pozn">' + esc(m.role) + ((m.scope || []).length ? " · " + esc(m.scope.join(" + ")) : "") + "</p>" : "") +
      '<div class="dxw-cta__b"><button type="button" class="dxw-btn dxw-btn--red" data-dxw="dopyt" data-vyrobca="' + esc(m.name) + '">Dopyt na ' + esc(m.name) + "</button>" +
      (m.website ? '<a class="dxw-btn" href="' + esc(m.website) + '" target="_blank" rel="noopener">Web výrobcu ↗</a>' : "") + "</div></div>" +
      (m.video ? '<div class="dxw-s dxw-s--tesne">' + video(m.video, m.name + " – predstavenie") + "</div>" : "") +
      (pr.about ? '<section class="dxw-s"><p class="eyebrow">O výrobcovi</p><h2 class="dxw-h">' + esc(m.name) + (pr.since ? " – od roku " + esc(pr.since) : "") + '</h2><p class="dxw-lead">' + esc(pr.about) + "</p>" +
        ((pr.facts || []).length ? '<div class="dxw-fakty">' + pr.facts.map((x) => "<div><b>" + esc(x.value) + "</b><span>" + esc(x.label) + "</span></div>").join("") + "</div>" : "") +
        ((pr.makes || []).length ? '<div class="dxw-karta"><h3>Vyrába</h3><ul>' + pr.makes.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul></div>" : "") + "</section>" : "") +
      (kats ? '<div class="dxw-s dxw-s--kat">' + kats + "</div>" : "") +
      (videa.length ? '<section class="dxw-s"><p class="eyebrow">Videá</p><h2 class="dxw-h">Ako to funguje</h2><div class="dxw-videa">' + videa.map((v) => video(v.src, v.caption)).join("") + "</div></section>" : "") +
      (fotky.length ? '<section class="dxw-s"><p class="eyebrow">Galéria</p><h2 class="dxw-h">Fotografie</h2><div class="dxw-fotky">' + fotky.map((p) => '<button type="button" class="dxw-foto" data-lb="' + esc(p.src) + '" data-cap="' + esc(p.caption || "") + '"><img src="' + esc(p.src) + '" alt="' + esc(p.caption || m.name) + '" loading="lazy"></button>').join("") + "</div></section>" : "") +
      (docs.length ? '<section class="dxw-s"><p class="eyebrow">Na stiahnutie</p><h2 class="dxw-h">Dokumenty ' + esc(m.name) + '</h2><div class="dxw-docs">' + docs.map(dokument).join("") + "</div></section>" : "") +
      '<section class="dxw-s">' + cta(m.name) + "</section>";
  };

  // ── vykreslenie podľa adresy ──
  const cesta = () => decodeURIComponent(location.hash || "").replace(/^#\/?/, "").split(/[/?~]/)[0];
  const vykresli = () => {
    if (!box || !c) return;
    const id = cesta(), m = firma(id);
    const obsahEl = box.querySelector(".dxw-m__obsah");
    const kluc = m ? "f:" + m.id : "uvod";
    if (obsahEl.dataset.k !== kluc) {
      obsahEl.dataset.k = kluc;
      obsahEl.innerHTML = (m ? stranaFirmy(m) : uvod()) + paticka();
      box.scrollTop = 0;
    }
    zavriMenu();
    if (m) { poslednaFirma = m.id; return; }
    const sek = SEKCIE.find(([k]) => k === id);
    const ciel = sek && sek[0] !== "uvod" ? box.querySelector("#dxw-" + sek[0]) : id === "" && poslednaFirma ? box.querySelector("#dxw-vyrobcovia") : null;
    poslednaFirma = "";
    if (ciel) setTimeout(() => { box.style.scrollBehavior = "auto"; box.scrollTop = ciel.offsetTop - 64; box.style.scrollBehavior = ""; }, 0);
    else if (!id) box.scrollTop = 0;
  };
  const zavriMenu = () => { if (!box) return; box.classList.remove("is-menu"); const b = box.querySelector(".dxw-m__menu"); if (b) b.setAttribute("aria-expanded", "false"); };

  // svetelník fotiek
  let lb = null, lbI = 0, lbG = [];
  const lbUkaz = (i) => {
    lbI = (i + lbG.length) % lbG.length;
    lb.querySelector("img").src = lbG[lbI].dataset.lb;
    lb.querySelector("p").textContent = lbG[lbI].dataset.cap || "";
  };
  const lbOtvor = (btn) => {
    lbG = [...btn.closest(".dxw-fotky").querySelectorAll(".dxw-foto")];
    lb = document.createElement("div");
    lb.className = "dxw-lb";
    lb.innerHTML = '<button type="button" class="dxw-lb__x" aria-label="Zavrieť">×</button><button type="button" class="dxw-lb__a" data-s="-1" aria-label="Predchádzajúca">‹</button><img alt=""><button type="button" class="dxw-lb__a dxw-lb__a--n" data-s="1" aria-label="Ďalšia">›</button><p></p>';
    lb.addEventListener("click", (e) => { const s = e.target.closest("[data-s]"); if (s) return lbUkaz(lbI + +s.dataset.s); if (e.target === lb || e.target.closest(".dxw-lb__x")) { lb.remove(); lb = null; } });
    let sx = null;
    lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) lbUkaz(lbI + (dx < 0 ? 1 : -1)); }, { passive: true });
    document.body.appendChild(lb);
    lbUkaz(lbG.indexOf(btn));
  };

  const postav = () => {
    box = document.createElement("div");
    box.className = "dxw-m";
    box.innerHTML = hlavicka() + '<main class="dxw-m__obsah"></main>';
    box.addEventListener("click", (e) => {
      const t = e.target;
      if (t.closest(".dxw-m__menu")) { const o = box.classList.toggle("is-menu"); t.closest(".dxw-m__menu").setAttribute("aria-expanded", o); return; }
      const f = t.closest(".dxw-foto"); if (f) return lbOtvor(f);
      if (t.closest("[data-viac]")) { box.querySelectorAll(".dxw-foto.is-viac").forEach((x) => x.classList.remove("is-viac")); t.closest("[data-viac]").remove(); return; }
      const a = t.closest('a[href^="#/"]');
      if (a && a.getAttribute("href") === location.hash) { e.preventDefault(); vykresli(); } // rovnaká adresa – len posun na sekciu
    });
    box.addEventListener("input", (e) => {
      if (!e.target.classList.contains("dxw-hladaj")) return;
      const s = e.target.value.toLowerCase().trim(); let n = 0;
      box.querySelectorAll("#dxw-dokumenty .dxw-doc").forEach((d) => { const ok = !s || d.dataset.t.includes(s); d.hidden = !ok; if (ok) n++; });
      box.querySelector(".dxw-docs__nic").hidden = n > 0;
    });
    document.body.appendChild(box);
  };

  const prepni = () => {
    const mobil = mq.matches;
    html.classList.toggle("dxw-mobil", mobil);
    if (!mobil) return;
    if (!c) {
      fetch("content/content.json").then((r) => r.json()).then((d) => { c = d; prepni(); }).catch(() => {});
      return;
    }
    if (!box) postav();
    vykresli();
  };
  (mq.addEventListener ? mq.addEventListener("change", prepni) : mq.addListener(prepni));
  // záloha: niektoré prehliadače (a emulácia) neohlásia zmenu media query – stav sa overí aj pri zmene veľkosti okna
  let tZmena = 0;
  const kontrola = () => { clearTimeout(tZmena); tZmena = setTimeout(() => { if (mq.matches !== html.classList.contains("dxw-mobil")) prepni(); }, 150); };
  addEventListener("resize", kontrola);
  addEventListener("orientationchange", kontrola);
  addEventListener("hashchange", () => { if (mq.matches) vykresli(); });
  addEventListener("keydown", (e) => { if (lb && e.key === "Escape") { lb.remove(); lb = null; } if (lb && e.key === "ArrowRight") lbUkaz(lbI + 1); if (lb && e.key === "ArrowLeft") lbUkaz(lbI - 1); });
  if (document.body) prepni(); else addEventListener("DOMContentLoaded", prepni);
})();
