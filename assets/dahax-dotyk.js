// DAHAX – prepínanie snímok potiahnutím prsta (scripts/update-2026-10-26-dotyk-2.mjs).
// Sleduje dotyk na celom dokumente (nezávisle od prvku, na ktorom ťah začal, aj keď si prehliadač pohyb vezme
// ako posúvanie) a ťah doľava/doprava premení na šípku → aplikácia prepne snímku rovnako ako pri klávesnici.
// Katalóg, dokumenty, detail produktu a galéria majú vlastné ovládanie, tam sa ťah neprekladá.
(() => {
  let s = null;
  const off = (t) => !t || !t.closest || !t.closest(".screen") || t.closest(".ov, .pane, .sheet, .pdf, .dxk-car, input, textarea, select");
  const pos = (e) => (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
  addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1 || off(e.target) || e.touches[0].clientX >= innerWidth - (window.__dxListaOkraj || 150)) return void (s = null); // v páse pri pravom okraji (~4 cm) sa vysúva lišta firiem (dahax-lista.js)
    const p = e.touches[0];
    s = { x: p.clientX, y: p.clientY, lx: p.clientX, ly: p.clientY, t: Date.now() };
  }, { passive: true });
  addEventListener("touchmove", (e) => {
    if (!s) return;
    if (e.touches.length !== 1) return void (s = null);
    s.lx = e.touches[0].clientX;
    s.ly = e.touches[0].clientY;
  }, { passive: true });
  const end = (e) => {
    if (!s) return;
    const p = pos(e), x = p ? p.clientX : s.lx, y = p ? p.clientY : s.ly;
    const dx = x - s.x, dy = y - s.y, dt = Date.now() - s.t;
    s = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2 || dt > 1500) return;
    dispatchEvent(new KeyboardEvent("keydown", { key: dx < 0 ? "ArrowRight" : "ArrowLeft", bubbles: true }));
  };
  addEventListener("touchend", end, { passive: true });
  addEventListener("touchcancel", end, { passive: true });
})();
