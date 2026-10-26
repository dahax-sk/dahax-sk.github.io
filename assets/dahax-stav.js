// DAHAX – vypínač aplikácie na diaľku (27. 10. 2026, želanie používateľa: „apka na plochu, aby bežala na celom displeji,
// a keď sa rozhodnem off, tak len zakliknem a nepôjde“). Aplikácia beží len z webu.
//  - stav.json na webe (len v repozitári webu dahax-sk.github.io, nie v aplikacia/): { "aktivna": true, "sprava": "" };
//    načíta sa pri spustení, pri návrate do popredia a každých 5 minút – vždy zo siete (no-store, service worker ho obchádza),
//  - kým nie je stav známy, obsah sa neukáže; "aktivna": false → celá obrazovka „Aplikácia nie je dostupná“ (+ text
//    zo „sprava“) a vymažú sa uložené súbory okrem pamäte aplikácie, ktorá je potrebná na túto hlášku,
//  - stav sa nedá načítať (bez internetu) → „Pripojte sa na internet“, obsah zo staršej uloženej verzie sa nezobrazí.
// Na počítači (prezentácia zo súboru, localhost) sa vypínač nekontroluje; v náhľade sa dá zapnúť ?stav=1.
(() => {
  const web = /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (!web && !/[?&]stav=1\b/.test(location.search)) return;
  const html = document.documentElement;
  html.classList.add("dx-stav-cakam");
  const st = document.createElement("style");
  st.textContent =
    "html.dx-stav-cakam body>*:not(.dx-stav),html.dx-stav-blok body>*:not(.dx-stav){visibility:hidden!important}" +
    ".dx-stav{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;" +
    "padding:40px;background:#0b0c0e;color:#fff;font:600 18px/1.5 Barlow,Arial,sans-serif;text-align:center}" +
    ".dx-stav h1{margin:0;font:800 44px/1.1 'Barlow Condensed',Arial,sans-serif;letter-spacing:.02em;text-transform:uppercase}" +
    ".dx-stav p{margin:0;max-width:640px;color:rgba(255,255,255,.75)}" +
    ".dx-stav i{display:block;width:72px;height:3px;background:#de1f26}" +
    ".dx-stav button{margin-top:10px;height:48px;padding:0 24px;border:1.5px solid rgba(255,255,255,.3);background:#15171b;color:#fff;" +
    "font:700 14px/1 'Barlow Condensed',Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}";
  document.head.appendChild(st);

  let box = null;
  const ukaz = (nadpis, text, tlacidlo) => {
    html.classList.remove("dx-stav-cakam");
    html.classList.add("dx-stav-blok");
    if (!box) {
      box = document.createElement("div");
      box.className = "dx-stav";
      box.setAttribute("role", "alert");
      (document.body || html).appendChild(box);
    }
    box.innerHTML = '<img src="img/logo/dahax-white.svg" alt="DAHAX" width="220"><i></i><h1></h1><p></p>';
    box.querySelector("h1").textContent = nadpis;
    box.querySelector("p").textContent = text;
    if (tlacidlo) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = "Skúsiť znova";
      b.addEventListener("click", over);
      box.appendChild(b);
    }
    // video a zvuk na pozadí zastaviť
    document.querySelectorAll("video").forEach((v) => { try { v.pause(); } catch (e) {} });
  };
  const pusti = () => {
    html.classList.remove("dx-stav-cakam", "dx-stav-blok");
    if (box) { box.remove(); box = null; }
  };
  // vypnutá aplikácia: preč všetko uložené okrem pamäte aplikácie (dahax-<verzia>), ktorá zobrazí túto hlášku
  const vycisti = async () => {
    try {
      for (const k of await caches.keys()) if (k === "dahax-media" || k === "dahax-runtime" || !k.startsWith("dahax-")) await caches.delete(k);
    } catch (e) {}
  };

  let bezi = false;
  async function over() {
    if (bezi) return;
    bezi = true;
    try {
      const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch("stav.json?t=" + Date.now(), { cache: "no-store", signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error(r.status);
      const s = await r.json();
      if (s && s.aktivna === false) {
        ukaz("Aplikácia nie je dostupná", (s.sprava || "").trim() || "Aplikáciu DAHAX Interactive dočasne vypol jej správca.", false);
        vycisti();
      } else pusti();
    } catch (e) {
      ukaz("Pripojte sa na internet", "DAHAX Interactive beží len z webu – pripojte tablet na internet a skúste to znova.", true);
    } finally {
      bezi = false;
    }
  }
  over();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") over(); });
  addEventListener("online", over);
  addEventListener("offline", () => ukaz("Pripojte sa na internet", "DAHAX Interactive beží len z webu – pripojte tablet na internet a skúste to znova.", true));
  setInterval(() => { if (document.visibilityState === "visible") over(); }, 5 * 60 * 1000);
})();
