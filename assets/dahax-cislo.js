// DAHAX – číslo snímky v rohu („12 / 72“), aby sa dalo dohovárať podľa čísla (scripts/update-2026-10-26-cislo-snimky.mjs).
// Bundle pri každom vykreslení zapíše window.__dxSlide = { i: poradie od 0, n: počet snímok, key }.
(() => {
  let box = null, last = "";
  const paint = () => {
    const s = window.__dxSlide, deck = document.querySelector(".deck");
    if (!s || !deck) return;
    if (!box || !box.isConnected) {
      box = document.createElement("div");
      box.className = "dxc";
      box.setAttribute("aria-hidden", "true");
      deck.appendChild(box);
      last = "";
    }
    const t = `${s.i + 1} / ${s.n}`;
    if (t !== last) box.textContent = last = t;
  };
  let q = false;
  new MutationObserver(() => {
    if (q) return;
    q = true;
    setTimeout(() => { q = false; paint(); }, 40);
  }).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("hashchange", () => setTimeout(paint, 60));
})();
