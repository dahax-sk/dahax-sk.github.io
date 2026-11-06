// DAHAX – výber firiem na prezentovanie (4. 11. 2026, želanie používateľa: „zaškrtnem firmu a výber zúžim“).
// Načíta sa ako prvý skript. Obsah (fetch content/content.json aj window.__DAHAX_CONTENT__ v PC verzii) upraví ešte
// predtým, ako ho prečíta bundle a ostatné skripty: firmy mimo výberu dostanú hidden: true (bundle ich vynechá zo strán,
// z bočnej lišty, z menu aj z počítadla), z Doplnkového sortimentu a Realizácií ostanú len vybrané firmy
// (prázdne Realizácie sa skryjú – úprava bundla scripts/update-2026-11-04-vyber-firiem-jadro.mjs).
// Výber je v localStorage „dahax-vyber“ (pole id firiem; nič = všetky). Od 6. 11. 2026 sa mení len v Nastavenia → Admin
// (za heslom, assets/dahax-admin.js volá window.__dxVyberPanel) – z verejného menu je tlačidlo preč, aby ho zákazník
// nemohol meniť. Po potvrdení sa prezentácia načíta znova (pri jednej firme rovno na jej strane).
// window.__dxFirmy = všetky firmy [{ id, name, logo, bg }] pred výberom (pre menu a prehrávanie).
// Štýly: dahax-upravy-3.css („výber firiem“).
(() => {
  const KLUC = "dahax-vyber";
  const citaj = () => { try { const v = JSON.parse(localStorage.getItem(KLUC) || "null"); return Array.isArray(v) && v.length ? v : null; } catch (e) { return null; } };
  const vyber = citaj();
  window.__dxVyber = vyber;

  const uprav = (c) => {
    if (!c || !Array.isArray(c.manufacturers) || c.__dxVyber) return c;
    c.__dxVyber = true;
    window.__dxFirmy = c.manufacturers.filter((m) => !m.hidden).map((m) => ({ id: m.id, name: m.name, logo: m.logo, bg: (m.tile && m.tile.bg) || "#fff", tier: m.tier }));
    if (!vyber) return c;
    const je = (id) => vyber.includes(id);
    for (const m of c.manufacturers) if (!je(m.id)) m.hidden = true;
    if (c.supplementary && Array.isArray(c.supplementary.brands)) c.supplementary.brands = c.supplementary.brands.filter((b) => !b.id || je(b.id));
    const r = c.realizations;
    if (r) {
      if (Array.isArray(r.galeria)) r.galeria = r.galeria.filter((g) => !g.firma || je(g.firma));
      if (r.firmy && typeof r.firmy === "object") for (const id of Object.keys(r.firmy)) if (!je(id)) delete r.firmy[id];
      if (Array.isArray(r.galeria) && !r.galeria.length) r.hidden = true;
    }
    return c;
  };

  if (window.__DAHAX_CONTENT__) uprav(window.__DAHAX_CONTENT__);
  const povodny = window.fetch.bind(window);
  window.fetch = (vstup, init) => {
    const url = typeof vstup === "string" ? vstup : (vstup && vstup.url) || "";
    const p = povodny(vstup, init);
    if (!/content\/content\.json(\?|$)/.test(url)) return p;
    return p.then((res) => {
      if (!res.ok) return res;
      return res.clone().json().then((c) => new Response(JSON.stringify(uprav(c)), { status: res.status, statusText: res.statusText, headers: { "Content-Type": "application/json" } }), () => res);
    });
  };

  // ── menu: tlačidlo „Výber firiem“ a panel so zaškrtnutím ──
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const ulozit = (ids) => {
    const vsetky = (window.__dxFirmy || []).map((f) => f.id);
    try {
      if (!ids.length || ids.length === vsetky.length) localStorage.removeItem(KLUC);
      else localStorage.setItem(KLUC, JSON.stringify(ids));
    } catch (e) {}
    location.hash = ids.length === 1 ? "#/" + ids[0] : "#/";
    location.reload();
  };
  const panel = (host, spat) => {
    const firmy = window.__dxFirmy || [];
    const zvolene = new Set(vyber || firmy.map((f) => f.id));
    const d = document.createElement("div");
    d.className = "dxv-vyber";
    d.innerHTML =
      '<div class="dxv-vyber__head"><p class="eyebrow">Prezentácia</p><h2>Výber firiem</h2>' +
      "<p>Zaškrtnite firmy, ktoré chcete prezentovať. Spoločné strany (úvod, prečo DAHAX, logistika, výrobcovia, kontakt) ostávajú.</p></div>" +
      '<div class="dxv-vyber__grid">' +
      firmy.map((f) => '<label class="dxv-f"><input type="checkbox" value="' + esc(f.id) + '"' + (zvolene.has(f.id) ? " checked" : "") + '><span class="dxv-f__logo" style="background:' + esc(f.bg) + '"><img alt="" src="' + esc(f.logo) + '"></span><b>' + esc(f.name) + "</b></label>").join("") +
      "</div>" +
      '<div class="dxv-vyber__akcie"><button type="button" class="btn btn--line" data-a="vsetky">Vybrať všetky</button><button type="button" class="btn btn--line" data-a="nic">Zrušiť výber</button>' +
      '<span class="dxv-vyber__pocet"></span>' + (spat ? '<button type="button" class="btn btn--line" data-a="spat">Späť</button>' : "") + '<button type="button" class="btn dxv-vyber__ok" data-a="ok">Prezentovať výber</button></div>' +
      '<p class="dxv-vyber__pozn">Výber platí pre toto zariadenie.</p>';
    const boxy = () => [...d.querySelectorAll("input[type=checkbox]")];
    const pocet = () => {
      const n = boxy().filter((b) => b.checked).length;
      d.querySelector(".dxv-vyber__pocet").textContent = n ? n + " z " + firmy.length : "Vyberte aspoň jednu firmu";
      d.querySelector(".dxv-vyber__ok").disabled = !n;
    };
    d.addEventListener("change", pocet);
    d.addEventListener("click", (e) => {
      const a = e.target.closest("[data-a]");
      if (!a) return;
      if (a.dataset.a === "vsetky") boxy().forEach((b) => (b.checked = true));
      if (a.dataset.a === "nic") boxy().forEach((b) => (b.checked = false));
      if (a.dataset.a === "spat") { d.remove(); spat(); return; }
      if (a.dataset.a === "ok") ulozit(boxy().filter((b) => b.checked).map((b) => b.value));
      pocet();
    });
    pocet();
    host.appendChild(d);
    return d;
  };
  window.__dxVyberPanel = panel;
})();
