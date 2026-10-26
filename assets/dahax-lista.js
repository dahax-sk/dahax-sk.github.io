// DAHAX – pravá lišta firiem sa vysúva len na požiadanie (scripts/update-2026-10-26-lista.mjs).
// Lišta (.rail) je skrytá za pravým okrajom a snímky majú celú šírku. Vysunie sa:
//  - myšou: kurzor pri pravom okraji obrazovky; zasunie sa, keď kurzor lištu opustí,
//  - prstom: ťah od pravého okraja doľava; zasunie sa ťuknutím mimo lišty alebo po výbere firmy.
// Na okraji ostáva tenká značka, aby bolo vidno, kde lišta je.
(() => {
  const EDGE = 28; // px od pravého okraja obrazovky
  const deck = () => document.querySelector(".deck");
  const rail = () => document.querySelector(".rail");
  let timer = null;
  const open = () => { clearTimeout(timer); deck()?.classList.add("dxr-open"); };
  const close = (ms = 0) => { clearTimeout(timer); timer = setTimeout(() => deck()?.classList.remove("dxr-open"), ms); };
  const isOpen = () => deck()?.classList.contains("dxr-open");
  const inRail = (t) => t && t.closest && t.closest(".rail");

  // myš
  addEventListener("mousemove", (e) => {
    if (e.clientX >= innerWidth - EDGE) return open();
    if (isOpen() && !inRail(e.target)) close(450);
    else if (isOpen()) clearTimeout(timer);
  }, { passive: true });
  document.addEventListener("mouseleave", () => isOpen() && close(450));

  // dotyk – ťah od okraja (dahax-dotyk.js ťahy pri okraji neprekladá na prepnutie snímky)
  let s = null;
  addEventListener("touchstart", (e) => {
    const p = e.touches[0];
    s = e.touches.length === 1 && p.clientX >= innerWidth - EDGE ? { x: p.clientX, y: p.clientY } : null;
    if (isOpen() && !inRail(e.target)) close();
  }, { passive: true, capture: true });
  addEventListener("touchmove", (e) => {
    if (!s) return;
    const p = e.touches[0];
    if (s.x - p.clientX > 24 && Math.abs(p.clientY - s.y) < 60) { open(); s = null; }
  }, { passive: true });
  // výber firmy v lište → lišta sa zasunie
  addEventListener("click", (e) => { if (inRail(e.target) && e.target.closest("button")) close(250); }, true);
})();
