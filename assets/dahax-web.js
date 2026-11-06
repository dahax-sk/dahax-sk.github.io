// DAHAX – WEBOVÝ REŽIM prezentácie pre verejný web dahax.com (6. 11. 2026, želanie majiteľa: „web bude presne tá istá
// prezentácia so všetkými efektmi, len prispôsobená na web“). Prezentácia pre tablet ostáva bez zmeny.
//  - zapne sa na dahax.com / www.dahax.com alebo odkazom ?web=1 (pamätá sa do zatvorenia karty; ?web=0 vypne)
//  - <html class="dx-web">, window.__dxWeb = true – dahax-stav.js (vypínač), dahax-statistiky.js (GoatCounter – len so
//    súhlasom majiteľa) a dahax-play.js sa podľa toho vypnú; tlačidlá len pre tablet skryje dahax-web.css
//  - ovládanie: koliesko myši / touchpad a šípky ↑ ↓ (← → PageUp PageDown medzerník rieši bundle) prepínajú snímky,
//    v posúvateľných paneloch (katalóg, dokumenty, galéria …) koliesko posúva obsah
//  - na snímke Kontakt: tlačidlo „Poslať dopyt“ (formulár → e-mail cez mailto), firemné údaje a Ochrana osobných údajov
//  - mobil a tablet na výšku: namiesto „Otočte zariadenie“ responzívna verzia (assets/dahax-web-mobil.js)
// Údaje a texty: assets/dahax-web-udaje.js. Štýly: assets/dahax-web.css. Zostava pre dahax.com: scripts/zostav-web.mjs.
(() => {
  const html = document.documentElement;
  const h = location.hostname.toLowerCase();
  let web = window.__dxWebVzdy === true || h === "dahax.com" || h === "www.dahax.com"; // __dxWebVzdy: balík prezentacia-web (aj na dočasnej adrese hostingu)
  try {
    const q = new URLSearchParams(location.search).get("web");
    if (q === "1") sessionStorage.setItem("dahax-web", "1");
    if (q === "0") sessionStorage.removeItem("dahax-web");
    if (!web) web = sessionStorage.getItem("dahax-web") === "1";
  } catch (e) {}
  window.__dxWeb = web;
  if (!web) return;
  html.classList.add("dx-web");

  const U = () => window.__dxWebUdaje;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  let obsah = window.__DAHAX_CONTENT__ || null;
  const nacitaj = () => obsah ? Promise.resolve(obsah) : fetch("content/content.json").then((r) => r.json()).then((c) => (obsah = c));
  const co = () => (obsah && obsah.company) || { email: "dahaxsk@dahaxsk.sk", phone: "+421 908 927 459", name: "DAHAX SK s.r.o." };

  // ── okná (formulár, ochrana údajov) ──
  let okno = null;
  const zavri = () => { if (okno) { okno.remove(); okno = null; } };
  const otvorOkno = (trieda, obsahHtml) => {
    zavri();
    okno = document.createElement("div");
    okno.className = "dxw-okno " + trieda;
    okno.innerHTML = '<div class="dxw-okno__p" role="dialog" aria-modal="true"><button type="button" class="dxw-okno__x" aria-label="Zavrieť">×</button>' + obsahHtml + "</div>";
    okno.addEventListener("click", (e) => { if (e.target === okno || e.target.closest(".dxw-okno__x")) zavri(); });
    document.body.appendChild(okno);
    const f = okno.querySelector("input,textarea,select,a,button:not(.dxw-okno__x)");
    if (f && f.focus) setTimeout(() => f.focus({ preventScroll: true }), 50);
    return okno;
  };
  window.__dxWebOchrana = () => nacitaj().then(() => otvorOkno("dxw-okno--text", '<p class="eyebrow">GDPR</p><h2 class="dxw-okno__h">Ochrana osobných údajov</h2><div class="dxw-prose">' + U().html(co()).ochrana + "</div>"));

  const formular = (vyrobca) => {
    const firmy = (obsah && obsah.manufacturers ? obsah.manufacturers : []).filter((m) => !m.hidden);
    return '<form class="dxw-form" novalidate><p class="eyebrow">Kontakt</p><h2 class="dxw-okno__h">Poslať dopyt</h2>' +
      '<p class="dxw-form__uvod">Cenovú ponuku, dostupnosť aj termín dodania vám pošleme obratom.</p>' +
      '<div class="dxw-form__g">' +
      '<label>Meno a priezvisko *<input name="meno" required autocomplete="name"></label>' +
      '<label>Firma<input name="firma" autocomplete="organization"></label>' +
      '<label>Telefón<input name="tel" type="tel" autocomplete="tel"></label>' +
      '<label>E-mail *<input name="email" type="email" required autocomplete="email"></label>' +
      '<label class="dxw-form__w">Záujem o<select name="vyrobca"><option value="">Vyberte výrobcu</option>' +
      firmy.map((m) => "<option" + (m.name === vyrobca ? " selected" : "") + ">" + esc(m.name) + "</option>").join("") + "<option>Iné</option></select></label>" +
      '<label class="dxw-form__w">Správa *<textarea name="sprava" required rows="5" placeholder="Čo potrebujete, množstvo, miesto dodania…"></textarea></label></div>' +
      '<p class="dxw-form__chyba" aria-live="polite"></p>' +
      '<div class="dxw-form__akcie"><button type="submit" class="dxw-btn dxw-btn--red">Pripraviť e-mail</button><a class="dxw-btn" href="tel:' + esc(co().phone.replace(/\s/g, "")) + '">' + esc(co().phone) + "</a></div>" +
      '<p class="dxw-form__pozn">Formulár otvorí váš e-mailový program s pripravenou správou na ' + esc(co().email) +
      '. Údaje použijeme len na odpoveď na váš dopyt – <button type="button" class="dxw-link" data-dxw="ochrana">ochrana osobných údajov</button>.</p></form>';
  };
  const odosli = (f) => {
    const d = new FormData(f), chyba = f.querySelector(".dxw-form__chyba");
    const meno = String(d.get("meno") || "").trim(), mail = String(d.get("email") || "").trim(), sprava = String(d.get("sprava") || "").trim();
    if (!meno || !sprava || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      chyba.textContent = "Vyplňte meno, platný e-mail a správu.";
      (f.querySelector(!meno ? "[name=meno]" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ? "[name=email]" : "[name=sprava]") || {}).focus?.();
      return;
    }
    chyba.textContent = "";
    const firma = String(d.get("firma") || "").trim();
    const sub = "Dopyt z webu – " + (firma || meno);
    const body = "Meno: " + meno + "\nFirma: " + firma + "\nTelefón: " + (d.get("tel") || "") + "\nE-mail: " + mail + "\nZáujem o: " + (d.get("vyrobca") || "") + "\n\n" + sprava;
    location.href = "mailto:" + co().email + "?subject=" + encodeURIComponent(sub) + "&body=" + encodeURIComponent(body);
  };
  window.__dxWebDopyt = (vyrobca) => nacitaj().then(() => {
    const o = otvorOkno("dxw-okno--form", formular(vyrobca));
    o.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); odosli(e.target); });
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("[data-dxw]");
    if (!a) return;
    e.preventDefault(); e.stopPropagation();
    if (a.dataset.dxw === "ochrana") window.__dxWebOchrana();
    if (a.dataset.dxw === "dopyt") window.__dxWebDopyt(a.dataset.vyrobca || "");
  }, true);

  // ── snímka Kontakt: tlačidlo dopytu, firemné údaje a ochrana údajov ──
  const kontakt = () => {
    for (const s of document.querySelectorAll(".contact:not([data-dxw])")) {
      s.setAttribute("data-dxw", "1");
      const l = s.querySelector(".contact__l");
      if (l) {
        const b = document.createElement("div");
        b.className = "dxw-kontakt-akcie";
        b.innerHTML = '<button type="button" class="dxw-btn dxw-btn--red" data-dxw="dopyt">Poslať dopyt</button>';
        l.appendChild(b);
      }
      const p = document.createElement("p");
      p.className = "dxw-firma";
      p.innerHTML = (U() ? U().html(co()).riadok : "") + ' · <button type="button" class="dxw-link" data-dxw="ochrana">Ochrana osobných údajov</button> · Web nepoužíva cookies.';
      (s.querySelector(".contact__in") || s).appendChild(p);
    }
    // výzva na úvode: myšou sa neťahá, ale posúva
    for (const sp of document.querySelectorAll(".dhx-dalej span")) if (sp.textContent === "Potiahnite") sp.textContent = "Posuňte";
  };
  new MutationObserver(kontakt).observe(html, { childList: true, subtree: true });
  nacitaj().catch(() => {});

  // ── koliesko myši, touchpad a šípky ↑ ↓ ──
  const OKNA = ".dxw-okno, .dxm, .dxa, .sheet, .pane, .pdf, .ov, .dxv-ov, .dxp-ov, .lb, .dxr-ov, .dxw-m";
  const otvoreneOkno = () => !!okno || [...document.querySelectorAll(".dxm, .dxa, .pdf, .ov, .sheet, .pane")].some((x) => x.getClientRects().length > 0);
  const posuvatelny = (t, dy) => {
    for (let el = t; el && el !== document.body && el.nodeType === 1; el = el.parentElement) {
      const s = getComputedStyle(el);
      if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 2) {
        if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
      }
      if (/(auto|scroll)/.test(s.overflowX) && el.scrollWidth > el.clientWidth + 2 && Math.abs(dy) < 1) return true;
    }
    return false;
  };
  const krok = (smer) => dispatchEvent(new KeyboardEvent("keydown", { key: smer > 0 ? "ArrowRight" : "ArrowLeft", bubbles: true }));
  let suma = 0, zamok = 0, posledne = 0;
  addEventListener("wheel", (e) => {
    if (html.classList.contains("dxw-mobil") || e.ctrlKey) return; // mobilná verzia sa posúva normálne, Ctrl + koliesko = zväčšenie
    const t = e.target;
    if (t.closest && t.closest(OKNA)) return; // otvorené okno / panel – koliesko posúva jeho obsah
    const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (posuvatelny(t, d)) return;
    e.preventDefault();
    const teraz = Date.now();
    if (teraz - posledne > 220) suma = 0; // nové gesto
    posledne = teraz;
    if (teraz < zamok) return; // dobeh zotrvačnosti touchpadu po prepnutí sa ignoruje
    suma += e.deltaMode === 1 ? d * 30 : d;
    if (Math.abs(suma) < 60) return;
    krok(suma);
    suma = 0;
    zamok = teraz + 750;
  }, { passive: false });
  addEventListener("keydown", (e) => {
    if (!e.isTrusted || html.classList.contains("dxw-mobil")) return;
    if (okno) { if (e.key === "Escape") { zavri(); e.preventDefault(); } e.stopImmediatePropagation(); return; }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const t = e.target;
    if (t && (t.closest?.("input,textarea,select,[contenteditable]") || t.closest?.(OKNA))) return;
    if (otvoreneOkno()) return;
    e.preventDefault();
    krok(e.key === "ArrowDown" ? 1 : -1);
  }, true);
})();
