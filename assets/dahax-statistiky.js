// DAHAX – štatistiky návštev cez GoatCounter (6. 11. 2026, želanie používateľa: „mať pod kontrolou, či sa link
// niekde nezdieľa“). Bez cookies a bez osobných údajov – GoatCounter neukladá IP adresu ani nič, čím by sa dal
// človek identifikovať, preto netreba lištu so súhlasom.
//  - každá strana sa počíta ako vlastná cesta: #/klimas/katalog → /klimas/katalog, úvod → /
//  - udalosti: play/uvod, play/klimas (spustenie ▶), pdf/<názov dokumentu>, vyber/<firmy> (zmena výberu firiem)
//  - pri každom zázname ide ako „odkiaľ“ (referrer): „zariadenie/<názov | nezname>“ a pri odkaze ?z=<meno> aj
//    „/zakaznik/<meno>“ (malé písmená bez diakritiky) – v GoatCounteri v časti Referrers, v Admin → Štatistiky
//  - názov zariadenia sa zadáva v Nastaveniach (localStorage „dahax-zariadenie“), značka ?z= sa pamätá
//    do zatvorenia karty (sessionStorage „dahax-z“)
//  - nemeria sa na file:, localhost, *.localhost, 127.0.0.1 a počas automatického prehrávania ▶ (len jeho spustenie)
// Návod: NAVOD-statistiky.md. Štýly: dahax-upravy-3.css („štatistiky“).
(() => {
  // ↓↓↓ Adresa GoatCountera (napr. "https://dahax.goatcounter.com"). Prázdne = štatistiky vypnuté.
  const GC = "https://dahax.goatcounter.com";
  // ↑↑↑

  const ZAR = "dahax-zariadenie", ZAK = "dahax-z";
  const ls = (k) => { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } };
  const ss = (k) => { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } };
  const cisti = (s, n) => String(s || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, n);

  // značka zákazníka z odkazu ?z=<meno> (zapamätá sa aj po prechode na ďalšie strany)
  try {
    const z = cisti(new URLSearchParams(location.search).get("z"), 60);
    if (z) sessionStorage.setItem(ZAK, z);
  } catch (e) {}

  // ── pole „Názov zariadenia“ v Nastaveniach (karta za kartou Aktualizácia z dahax-verzia.js) ──
  const karta = () => {
    for (const u of document.querySelectorAll(".sheet--settings .dxu")) {
      if (u.nextElementSibling && u.nextElementSibling.classList.contains("dxz")) continue;
      const box = document.createElement("div");
      box.className = "set__card dxz";
      box.innerHTML = '<label class="dxz__l" for="dxz-meno">Názov zariadenia</label>' +
        '<input id="dxz-meno" class="dxz__i" type="text" maxlength="40" autocomplete="off" spellcheck="false" placeholder="napr. Tablet – obchodník Peter">' +
        '<p class="dxz__s" aria-live="polite"></p>';
      const inp = box.querySelector("input"), out = box.querySelector(".dxz__s");
      inp.value = ls(ZAR);
      let t;
      inp.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const v = cisti(inp.value, 40);
          try { v ? localStorage.setItem(ZAR, v) : localStorage.removeItem(ZAR); } catch (e) {}
          out.textContent = v ? "Uložené" : "Bez názvu – v štatistikách „neznáme“";
        }, 400);
      });
      u.after(box);
    }
  };
  new MutationObserver(karta).observe(document.documentElement, { childList: true, subtree: true });

  // ── odosielanie ──
  const h = location.hostname;
  if (window.__dxWeb) return; // webový režim (dahax.com): štatistiky len so súhlasom majiteľa – zatiaľ vypnuté
  if (!GC || location.protocol === "file:" || h === "localhost" || h === "127.0.0.1" || h === "[::1]" || /\.localhost$/.test(h)) return;

  // GoatCounter „odkiaľ“ čistí ako adresu (odreže časť pred dvojbodkou, zakóduje diakritiku a medzery), preto
  // ide ako jednoduchá cesta bez diakritiky: zariadenie/tablet-peter alebo zariadenie/nezname/zakaznik/novak
  const slug = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  const odkial = () => {
    const z = slug(ss(ZAK));
    return "zariadenie/" + (slug(ls(ZAR)) || "nezname") + (z ? "/zakaznik/" + z : "");
  };
  const posli = (cesta, nazov, udalost) => {
    const url = GC.replace(/\/+$/, "") + "/count?p=" + encodeURIComponent(cesta) +
      "&t=" + encodeURIComponent(nazov || cesta) + "&r=" + encodeURIComponent(odkial()) +
      (udalost ? "&e=true" : "") + "&s=" + encodeURIComponent(screen.width + "," + screen.height + "," + (devicePixelRatio || 1)) +
      "&rnd=" + Math.random().toString(36).slice(2);
    try { if (navigator.sendBeacon && navigator.sendBeacon(url)) return; } catch (e) {}
    const img = new Image(); img.src = url;
  };

  const hra = () => { const s = window.__dxPlay && window.__dxPlay.stav && window.__dxPlay.stav(); return !!(s && s.hra && !s.stoj); };
  const cesta = () => "/" + decodeURIComponent((location.hash || "").replace(/^#\/?/, "")).replace(/[?#].*$/, "").replace(/\/+$/, "");
  let posledna = "", cas = 0;
  const strana = () => {
    if (hra()) return;
    const p = cesta(), teraz = Date.now();
    if (p === posledna && teraz - cas < 3000) return;
    posledna = p; cas = teraz;
    posli(p, p);
  };
  window.addEventListener("hashchange", () => setTimeout(strana, 300));
  if (document.readyState === "complete") setTimeout(strana, 800);
  else window.addEventListener("load", () => setTimeout(strana, 800));

  // udalosti (zachytávanie pred obsluhou v bundli – pri výbere firiem sa stránka hneď načíta znova, sendBeacon to prežije)
  document.addEventListener("click", (e) => {
    const t = e.target.closest ? e.target : null;
    if (!t) return;
    const play = t.closest(".dxp-btn");
    if (play && !hra()) { const s = window.__dxPlay && window.__dxPlay.stav && window.__dxPlay.stav(); if (!(s && s.stoj)) posli("play/" + (cesta().startsWith("/klimas") ? "klimas" : "uvod"), "Spustené prehrávanie ▶", true); return; }
    const doc = t.closest("button.doc");
    if (doc) { const n = cisti((doc.querySelector(".doc__t b") || doc).textContent, 120); posli("pdf/" + n, n, true); return; }
    const ok = t.closest(".dxv-vyber__ok");
    if (ok) {
      const ids = [...document.querySelectorAll(".dxv-vyber input[type=checkbox]:checked")].map((b) => b.value);
      const vsetky = document.querySelectorAll(".dxv-vyber input[type=checkbox]").length;
      posli("vyber/" + (ids.length === vsetky ? "vsetky" : ids.join("+")), "Výber firiem", true);
    }
  }, true);
})();
