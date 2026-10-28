// DAHAX – panel „Dokumenty“ prehľadne (28. 10. 2026, želanie používateľa):
//  - najprv len zoznam firiem (logo, názov, počet), ponuka firmy sa rozbalí až po ťuknutí (vždy len jedna),
//  - každý dokument len raz (panel zbiera dokumenty firmy, kategórií aj výrobkov – ten istý katalóg bol až 6×),
//  - poradie: slovenské, potom české, až potom iné jazyky (PL, EN, DE …); v rámci jazyka pôvodné poradie.
// Položka KATALÓG v hornom menu je skrytá (duplicitný prehľad výrobkov, ktoré sú pri výrobcoch).
// Bundle (React) prvky nevlastníme: nemažeme ich ani nepresúvame – len style.display / style.order a data-* atribúty.
// Štýly: dahax-upravy-3.css („panel Dokumenty“).
(() => {
  const jazyk = (t) => {
    const k = (t.match(/\(([A-Z]{2}(?:\s*[\/,]\s*[A-Z]{2})*)[^)]*\)/g) || []).join(" "); // „(SK)“, „(CZ/SK)“, „(PL, 2024)“
    if (!k || /\bSK\b/.test(k)) return 0; // bez značky = slovenský dokument
    if (/\bCZ\b/.test(k)) return 1;
    return 2;
  };

  const uprav = (pane) => {
    for (const dg of pane.querySelectorAll(".dgroups > .dg")) {
      const head = dg.querySelector(".dg__head");
      const list = dg.querySelector(".docs__list");
      if (!head || !list) continue;
      const items = [...list.children];
      const podpis = items.map((li) => li.textContent.trim()).join("|");
      if (dg.dataset.dxdPodpis === podpis) continue; // už upravené
      dg.dataset.dxdPodpis = podpis;
      const videne = new Set();
      let n = 0;
      items.forEach((li, i) => {
        const t = (li.querySelector(".doc__t b") || li).textContent.trim();
        const k = t.toLowerCase().replace(/[\s –—\-()·,.:]/g, ""); // „Technický list EPS 100“ = „Technický list – EPS 100“
        const dup = videne.has(k);
        videne.add(k);
        li.style.display = dup ? "none" : "";
        li.style.order = String(jazyk(t) * 1000 + i);
        if (!dup) n++;
      });
      const cislo = head.querySelector(".dg__n");
      if (cislo) cislo.dataset.n = n;
      if (!head.dataset.dxd) {
        head.dataset.dxd = "1";
        head.setAttribute("role", "button");
        head.tabIndex = 0;
        const prepni = () => {
          const otvor = dg.dataset.open !== "1";
          for (const o of pane.querySelectorAll('.dg[data-open="1"]')) o.dataset.open = "0";
          dg.dataset.open = otvor ? "1" : "0";
          head.setAttribute("aria-expanded", otvor);
          if (otvor) requestAnimationFrame(() => head.scrollIntoView({ block: "start", behavior: "smooth" }));
        };
        head.addEventListener("click", prepni);
        head.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); prepni(); } });
      }
    }
    pane.classList.add("dxdok");
  };

  // položka KATALÓG v hornom menu
  const menu = () => {
    for (const b of document.querySelectorAll("header button, nav button"))
      if (b.textContent.trim() === "Katalóg" && !b.closest(".pane, .sheet, .ov") && b.style.display !== "none") b.style.display = "none";
  };

  const kontrola = () => {
    menu();
    for (const p of document.querySelectorAll(".pane")) if (p.querySelector(".dgroups")) uprav(p);
  };
  new MutationObserver(kontrola).observe(document.documentElement, { childList: true, subtree: true });
  kontrola();
})();
