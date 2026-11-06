// DAHAX – jednoduchý admin za heslom (6. 11. 2026, želanie používateľa: „nastavenia, kde vstup bude cez heslo
// a tam jednoduchý admin: korekcia firiem, ktoré chcem prezentovať, plus analýza pozerania“).
// Web je statický (bez servera), preto:
//  - heslo nie je v kóde ani na webe – nastaví si ho používateľ sám na každom zariadení (Nastavenia → Admin),
//  - API token GoatCountera (len na čítanie) sa zašifruje heslom: PBKDF2-SHA-256 (310 000 opakovaní, náhodná soľ)
//    → kľúč AES-GCM 256; v localStorage „dahax-admin“ je len zašifrovaný údaj, soľ a iv. Heslo sa overí tak,
//    že token ide dešifrovať. Heslo ani token sa nikam neposielajú (token len v hlavičke Authorization do GoatCountera)
//    a nikde sa nezapisujú v čitateľnej podobe,
//  - „Zabudnuté heslo“ zmaže zašifrovaný údaj, admin sa potom nastaví znova,
//  - po 10 minútach nečinnosti sa admin sám zamkne (token zostáva len v pamäti, kým je admin otvorený).
// Časti: Firmy na prezentáciu (panel z assets/dahax-vyber.js, z verejného menu je preč) a Štatistiky (GoatCounter API,
// CORS povolené, limit 4 požiadavky/s → požiadavky idú po jednej). Štýly: dahax-upravy-3.css („admin“).
(() => {
  const GC = "https://dahax.goatcounter.com";
  const KLUC = "dahax-admin", ITER = 310000, NECINNOST = 10 * 60 * 1000;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const b64 = (u8) => btoa(String.fromCharCode(...new Uint8Array(u8)));
  const ub64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const citaj = () => { try { const v = JSON.parse(localStorage.getItem(KLUC) || "null"); return v && v.ct ? v : null; } catch (e) { return null; } };

  // ── šifrovanie ──
  const kluc = async (heslo, salt) => {
    const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(heslo), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITER }, k, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  };
  const zasifruj = async (heslo, data) => {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await kluc(heslo, salt), new TextEncoder().encode(JSON.stringify(data)));
    localStorage.setItem(KLUC, JSON.stringify({ v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
  };
  const desifruj = async (heslo) => {
    const z = citaj();
    if (!z) return null;
    const salt = ub64(z.salt);
    const k = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: z.iter || ITER },
      await crypto.subtle.importKey("raw", new TextEncoder().encode(heslo), "PBKDF2", false, ["deriveKey"]), { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ub64(z.iv) }, k, ub64(z.ct)); // zlé heslo → výnimka
    return JSON.parse(new TextDecoder().decode(pt));
  };

  // ── stav ──
  let ov = null, tajne = null, heslo = null, casovac = 0, obdobie = "7";
  const zamkni = () => { tajne = null; heslo = null; clearTimeout(casovac); if (ov) { ov.remove(); ov = null; } };
  const aktivita = () => { clearTimeout(casovac); if (tajne) casovac = setTimeout(zamkni, NECINNOST); };
  ["pointerdown", "keydown", "wheel"].forEach((t) => document.addEventListener(t, () => ov && aktivita(), true));

  const ZAMOK = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';

  const otvor = () => {
    if (ov) return;
    ov = document.createElement("div");
    ov.className = "dxa";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-label", "Admin");
    document.body.appendChild(ov);
    tajne ? hlavny("firmy") : citaj() ? prihlasenie() : nastavenie();
  };
  const ram = (obsah, vnutri) =>
    '<div class="dxa__bar"><p class="dxa__t">' + ZAMOK + "<span>Admin</span></p>" + (vnutri || "") +
    '<button type="button" class="dxa__x" data-a="zavriet" aria-label="Zavrieť">×</button></div><div class="dxa__body">' + obsah + "</div>";
  const klik = (fn) => { ov.onclick = (e) => { const a = e.target.closest("[data-a]"); if (!a) return; if (a.dataset.a === "zavriet") { tajne ? (ov.remove(), (ov = null)) : zamkni(); return; } fn(a.dataset.a, a, e); }; };

  // ── prvé nastavenie ──
  const nastavenie = (chyba) => {
    ov.innerHTML = ram(
      '<form class="dxa__form" autocomplete="off"><p class="eyebrow">Prvé nastavenie na tomto zariadení</p><h2>Nastaviť admin</h2>' +
      "<p>Zvoľte si heslo (aspoň 8 znakov) a vložte API token GoatCountera len na čítanie. Token sa uloží zašifrovaný týmto heslom iba v tomto zariadení. Heslo ani token nikomu neposielajte.</p>" +
      '<label>Heslo<input name="h1" type="password" minlength="8" required autocomplete="new-password"></label>' +
      '<label>Heslo znova<input name="h2" type="password" minlength="8" required autocomplete="new-password"></label>' +
      '<label>API token GoatCountera <small>(môžete doplniť aj neskôr)</small><input name="tok" type="password" autocomplete="off" spellcheck="false"></label>' +
      '<p class="dxa__err" aria-live="polite">' + esc(chyba || "") + "</p>" +
      '<div class="dxa__akcie"><button class="btn dxa__ok" type="submit">Uložiť a otvoriť</button></div></form>');
    klik(() => {});
    const f = ov.querySelector("form");
    f.onsubmit = async (e) => {
      e.preventDefault();
      const h1 = f.h1.value, h2 = f.h2.value, tok = f.tok.value.trim();
      if (h1.length < 8) return nastavenie("Heslo musí mať aspoň 8 znakov.");
      if (h1 !== h2) return nastavenie("Heslá sa nezhodujú.");
      f.querySelector("button").disabled = true;
      try { await zasifruj(h1, { token: tok }); tajne = { token: tok }; heslo = h1; aktivita(); hlavny("firmy"); }
      catch (err) { nastavenie("Uloženie zlyhalo (" + (err && err.name) + ")."); }
    };
    f.h1.focus();
  };

  // ── prihlásenie ──
  const prihlasenie = (chyba) => {
    ov.innerHTML = ram(
      '<form class="dxa__form" autocomplete="off"><p class="eyebrow">Nastavenia</p><h2>Vstup do adminu</h2>' +
      '<label>Heslo<input name="h" type="password" required autocomplete="current-password"></label>' +
      '<p class="dxa__err" aria-live="polite">' + esc(chyba || "") + "</p>" +
      '<div class="dxa__akcie"><button class="btn dxa__ok" type="submit">Otvoriť</button>' +
      '<button class="btn btn--line dxa__reset" type="button" data-a="reset">Zabudnuté heslo – resetovať admin</button></div></form>');
    klik((a) => {
      if (a !== "reset") return;
      if (!confirm("Resetovať admin? Zašifrovaný token sa z tohto zariadenia zmaže a admin bude treba nastaviť znova (heslo aj token). Výber firiem ostane.")) return;
      try { localStorage.removeItem(KLUC); } catch (e) {}
      nastavenie();
    });
    const f = ov.querySelector("form");
    f.onsubmit = async (e) => {
      e.preventDefault();
      const b = f.querySelector(".dxa__ok"); b.disabled = true; b.textContent = "Overujem…";
      try { tajne = await desifruj(f.h.value); heslo = f.h.value; aktivita(); hlavny("firmy"); }
      catch (err) { prihlasenie("Nesprávne heslo."); }
    };
    f.h.focus();
  };

  // ── hlavná obrazovka ──
  const hlavny = (cast) => {
    ov.innerHTML = ram('<div class="dxa__cast"></div>',
      '<nav class="dxa__tabs"><button type="button" data-a="firmy"' + (cast === "firmy" ? ' aria-current="true"' : "") + ">Firmy na prezentáciu</button>" +
      '<button type="button" data-a="stat"' + (cast === "stat" ? ' aria-current="true"' : "") + ">Štatistiky</button>" +
      '<button type="button" data-a="token"' + (cast === "token" ? ' aria-current="true"' : "") + ">Token</button></nav>" +
      '<button type="button" class="btn btn--line dxa__lock" data-a="zamknut">' + ZAMOK + "Zamknúť</button>");
    const c = ov.querySelector(".dxa__cast");
    klik((a, el) => {
      if (a === "zamknut") return zamkni();
      if (a === "firmy" || a === "stat" || a === "token") return hlavny(a);
      if (el.dataset.o) { obdobie = el.dataset.o; return hlavny("stat"); }
      if (a === "obnov") return hlavny("stat");
      if (a === "ulozTok") return ulozToken(c);
    });
    if (cast === "firmy") {
      if (window.__dxVyberPanel) window.__dxVyberPanel(c);
      else c.innerHTML = "<p>Výber firiem sa nenačítal.</p>";
    } else if (cast === "token") tokenCast(c);
    else statistiky(c);
  };

  const tokenCast = (c, sprava) => {
    c.innerHTML = '<form class="dxa__form" autocomplete="off" onsubmit="return false"><p class="eyebrow">GoatCounter</p><h2>API token</h2>' +
      "<p>Token len na čítanie (GoatCounter → Settings → API → New API token, oprávnenie „Read statistics“). " +
      (tajne && tajne.token ? "Token je uložený." : "Token zatiaľ nie je uložený.") + "</p>" +
      '<label>Nový token<input name="tok" type="password" autocomplete="off" spellcheck="false"></label>' +
      '<p class="dxa__err" aria-live="polite">' + esc(sprava || "") + "</p>" +
      '<div class="dxa__akcie"><button class="btn dxa__ok" type="button" data-a="ulozTok">Uložiť token</button></div></form>';
  };
  const ulozToken = async (c) => {
    const tok = c.querySelector("input[name=tok]").value.trim();
    if (!tok) return tokenCast(c, "Vložte token.");
    try { await zasifruj(heslo, { token: tok }); tajne = { token: tok }; tokenCast(c, "Token je uložený."); }
    catch (e) { tokenCast(c, "Uloženie zlyhalo."); }
  };

  // ── štatistiky ──
  const OBDOBIA = { "1": "Dnes", "7": "7 dní", "30": "30 dní" };
  const rozsah = () => {
    const end = new Date(); end.setMinutes(0, 0, 0); end.setHours(end.getHours() + 1);
    const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (Number(obdobie) - 1));
    return "start=" + encodeURIComponent(start.toISOString().replace(/\.\d+Z$/, "Z")) + "&end=" + encodeURIComponent(end.toISOString().replace(/\.\d+Z$/, "Z"));
  };
  const cakaj = (ms) => new Promise((r) => setTimeout(r, ms));
  const api = async (cesta, pokus = 0) => {
    const r = await fetch(GC + "/api/v0/" + cesta, { headers: { Authorization: "Bearer " + tajne.token, "Content-Type": "application/json" }, cache: "no-store" });
    if (r.status === 429 && pokus < 4) { await cakaj(1200); return api(cesta, pokus + 1); }
    if (r.status === 401 || r.status === 403) throw new Error("token");
    if (!r.ok) throw new Error("http " + r.status);
    await cakaj(280); // limit GoatCountera: 4 požiadavky za sekundu
    return r.json();
  };
  const cislo = (n) => Number(n || 0).toLocaleString("sk-SK");
  const zoznam = (riadky, prazdne) => !riadky.length ? '<p class="dxa__nic">' + (prazdne || "Zatiaľ nič.") + "</p>" :
    '<ol class="dxa__ls">' + riadky.map((r) => '<li' + (r.zle ? ' class="is-zle"' : "") + '><span>' + esc(r.n) + (r.p ? "<small>" + esc(r.p) + "</small>" : "") + "</span><b>" + cislo(r.c) + "</b></li>").join("") + "</ol>";
  const blok = (nadpis, html, trieda) => '<section class="dxa__blok' + (trieda ? " " + trieda : "") + '"><h3>' + nadpis + "</h3>" + html + "</section>";

  const graf = (body) => {
    const max = Math.max(1, ...body.map((b) => b.c));
    const w = 100 / Math.max(1, body.length);
    return '<div class="dxa__graf" role="img" aria-label="Návštevy podľa ' + (obdobie === "1" ? "hodín" : "dní") + '">' +
      body.map((b) => '<div class="dxa__st" style="width:' + w + '%"><i style="height:' + Math.round((b.c / max) * 100) + '%"></i><span>' + esc(b.l) + "</span><em>" + (b.c ? cislo(b.c) : "") + "</em></div>").join("") + "</div>";
  };

  // „odkiaľ“ z dahax-statistiky.js: zariadenie/<názov>[/zakaznik/<meno>]
  const rozober = (ref) => {
    const m = /^zariadenie\/([a-z0-9-]+)(?:\/zakaznik\/([a-z0-9-]+))?$/.exec(String(ref || "").trim());
    return m ? { zar: m[1], zak: m[2] || "" } : null;
  };

  const statistiky = async (c) => {
    if (!tajne || !tajne.token) {
      c.innerHTML = blok("Štatistiky", '<p class="dxa__nic">Najprv uložte API token GoatCountera (záložka Token).</p><p><a class="btn btn--line" href="' + GC + '" target="_blank" rel="noopener">Otvoriť GoatCounter</a></p>');
      return;
    }
    c.innerHTML = '<div class="dxa__hlava"><div class="dxa__obd">' +
      Object.entries(OBDOBIA).map(([k, v]) => '<button type="button" data-a="obd" data-o="' + k + '"' + (k === obdobie ? ' aria-current="true"' : "") + ">" + v + "</button>").join("") +
      '</div><button type="button" class="btn btn--line" data-a="obnov">Obnoviť</button><a class="btn btn--line" href="' + GC + '" target="_blank" rel="noopener">Otvoriť GoatCounter</a></div>' +
      '<p class="dxa__nic dxa__nacit">Načítavam štatistiky…</p>';
    const q = rozsah();
    let total, hits, refs, loc, sizes;
    try {
      total = await api("stats/total?" + q);
      hits = await api("stats/hits?" + q + "&limit=100");
      refs = await api("stats/toprefs?" + q + "&limit=100");
      loc = await api("stats/locations?" + q + "&limit=20");
      sizes = await api("stats/sizes?" + q + "&limit=20");
    } catch (e) {
      if (!ov || !c.isConnected) return;
      c.querySelector(".dxa__nacit").textContent = e.message === "token" ? "Token je neplatný alebo nemá oprávnenie čítať štatistiky. Uložte nový v záložke Token." :
        navigator.onLine === false ? "Zariadenie je offline – štatistiky sa nedajú načítať." : "Štatistiky sa nepodarilo načítať (" + e.message + "). Skúste Obnoviť.";
      return;
    }
    if (!ov || !c.isConnected) return;

    // graf
    const dni = (total.stats || []);
    let body;
    if (obdobie === "1") {
      const h = (dni[dni.length - 1] && dni[dni.length - 1].hourly) || [];
      const teraz = new Date().getHours();
      body = h.slice(0, teraz + 1).map((v, i) => ({ c: v, l: i % 3 ? "" : String(i) }));
    } else body = dni.map((d) => ({ c: d.daily, l: (d.day || "").slice(8, 10) + "." + (d.day || "").slice(5, 7) + "." }));

    // strany, firmy a udalosti
    const firmy = Object.fromEntries((window.__dxFirmy || []).map((f) => [f.id, f.name]));
    const SPOL = { "": "Úvod", "preco-dahax": "Prečo DAHAX", logistika: "Logistika", vyrobcovia: "Výrobcovia", "doplnkovy-sortiment": "Doplnkový sortiment", realizacie: "Realizácie", kontakt: "Kontakt" };
    const strany = [], udal = { play: [], pdf: [], vyber: [] }, poFirme = {};
    for (const h of hits.hits || []) {
      if (h.event) {
        const [druh, ...zv] = h.path.split("/");
        if (udal[druh]) udal[druh].push({ n: zv.join("/") || h.title, c: h.count });
        continue;
      }
      const seg = h.path.replace(/^\/+/, "").split("/");
      const meno = firmy[seg[0]] ? firmy[seg[0]] + (seg[1] ? " · " + seg.slice(1).join(" / ") : "") : SPOL[seg[0]] != null ? SPOL[seg[0]] : h.path;
      strany.push({ n: meno, p: h.path, c: h.count });
      if (firmy[seg[0]]) poFirme[seg[0]] = (poFirme[seg[0]] || 0) + h.count;
    }
    const topFirmy = Object.entries(poFirme).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, n]) => ({ n: firmy[id], c: n }));
    strany.sort((a, b) => b.c - a.c);

    // zariadenia, zákazníci, cudzie zdroje
    const zar = {}, zak = {}, cudzie = [];
    let nezname = 0;
    for (const r of refs.stats || []) {
      const o = rozober(r.name);
      if (!o) { cudzie.push({ n: r.name || "(bez údaja)", c: r.count, zle: true }); continue; }
      if (o.zak) zak[o.zak] = (zak[o.zak] || 0) + r.count;
      zar[o.zar] = (zar[o.zar] || 0) + r.count;
      if (o.zar === "nezname" && !o.zak) nezname += r.count;
    }
    const zarL = Object.entries(zar).sort((a, b) => b[1] - a[1]).map(([n, k]) => ({ n: n === "nezname" ? "neznáme" : n, c: k, zle: n === "nezname" }));
    const zakL = Object.entries(zak).sort((a, b) => b[1] - a[1]).map(([n, k]) => ({ n, c: k }));
    const cudzieSpolu = cudzie.reduce((s, r) => s + r.c, 0);
    const TYP = { phone: "Mobil", largephone: "Veľký mobil", tablet: "Tablet", desktop: "PC", desktophd: "PC (veľká obrazovka)", unknown: "Neznámy" };

    const pozor = nezname || cudzieSpolu;
    c.innerHTML = c.querySelector(".dxa__hlava").outerHTML +
      '<div class="dxa__fakty">' +
      '<div><b>' + cislo(total.total) + "</b><span>návštev strán</span></div>" +
      '<div><b>' + cislo(total.total_events) + "</b><span>udalostí (▶, PDF, výber)</span></div>" +
      '<div><b>' + cislo(Object.keys(zar).filter((z) => z !== "nezname").length) + "</b><span>pomenovaných zariadení</span></div>" +
      '<div class="' + (pozor ? "is-zle" : "is-ok") + '"><b>' + cislo(nezname + cudzieSpolu) + "</b><span>" + (pozor ? "návštev z neznámych zariadení" : "žiadne neznáme zariadenie") + "</span></div></div>" +
      (pozor ? '<p class="dxa__alarm">Pozor: ' + (nezname ? cislo(nezname) + " návštev prišlo zo zariadenia bez názvu a bez značky zákazníka" : "") +
        (nezname && cudzieSpolu ? " a " : "") + (cudzieSpolu ? cislo(cudzieSpolu) + " z cudzieho zdroja (odkaz mimo prezentácie)" : "") +
        ". Ak máte všetky svoje tablety pomenované, odkaz má pravdepodobne niekto cudzí – pozrite krajinu a typ zariadenia nižšie.</p>" : "") +
      blok("Návštevy – " + OBDOBIA[obdobie].toLowerCase(), body.length ? graf(body) : '<p class="dxa__nic">Zatiaľ žiadne návštevy.</p>', "dxa__blok--siroky") +
      '<div class="dxa__mriezka">' +
      blok("Najpozeranejšie firmy", zoznam(topFirmy)) +
      blok("Najpozeranejšie strany", zoznam(strany.slice(0, 10))) +
      blok("Zariadenia", zoznam(zarL, "Zatiaľ žiadne.")) +
      blok("Zákazníci (odkaz ?z=)", zoznam(zakL, "Zatiaľ žiadny odkaz so značkou.")) +
      (cudzie.length ? blok("Cudzie zdroje", zoznam(cudzie.slice(0, 10)), "is-zle") : "") +
      blok("Krajiny", zoznam((loc.stats || []).slice(0, 10).map((r) => ({ n: r.name || r.id || "neznáma", c: r.count })))) +
      blok("Typ zariadenia", zoznam((sizes.stats || []).map((r) => ({ n: TYP[r.id] || r.name || r.id, c: r.count, zle: r.id === "phone" || r.id === "largephone" })))) +
      blok("Spustené ▶", zoznam(udal.play.map((r) => ({ n: r.n === "uvod" ? "Celá prezentácia (úvod)" : r.n === "klimas" ? "KLIMAS komplet" : r.n, c: r.c })))) +
      blok("Otvorené dokumenty (PDF)", zoznam(udal.pdf.sort((a, b) => b.c - a.c).slice(0, 10))) +
      blok("Zmeny výberu firiem", zoznam(udal.vyber.map((r) => ({ n: r.n === "vsetky" ? "všetky firmy" : r.n.split("+").map((id) => firmy[id] || id).join(", "), c: r.c })))) +
      "</div>" +
      '<p class="dxa__pozn">Mobil je zvýraznený, lebo prezentácia sa predvádza na tabletoch. Mestá GoatCounter neuvádza, len krajinu.</p>';
  };

  // ── tlačidlo v Nastaveniach ──
  const karta = () => {
    for (const s of document.querySelectorAll(".sheet--settings")) {
      if (s.querySelector(".dxa-karta")) continue;
      const za = s.querySelector(".dxz") || s.querySelector(".dxu");
      if (!za) continue;
      const box = document.createElement("div");
      box.className = "set__card dxa-karta";
      box.innerHTML = '<button type="button" class="btn btn--line dxa-btn">' + ZAMOK + "Admin</button>";
      box.querySelector("button").addEventListener("click", otvor);
      za.after(box);
    }
  };
  new MutationObserver(karta).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && ov) { tajne ? (ov.remove(), (ov = null)) : zamkni(); } });
})();
