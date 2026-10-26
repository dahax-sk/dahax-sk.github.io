// DAHAX – „Načítať novú verziu“ v nastaveniach (scripts/update-2026-10-26-verzia.mjs).
// Pod kartu „Verzia obsahu“ v paneli Správa obsahu pridá kartu Aktualizácia: verzia aplikácie (názov offline pamäte),
// tlačidlo na stiahnutie novej verzie a stav. Robí len update + reload – nemaže IndexedDB (fotky, videá a dokumenty
// nahraté v režime správy), nerobí unregister.
// Druhá karta „Offline“: stav pamäte PDF a videí (dahax-media v sw.js) a tlačidlo „Stiahnuť pre offline“.
// V nainštalovanej aplikácii (display-mode standalone) sa offline režim zapne sám.
(() => {
  const S = {
    work: "Hľadám novú verziu…",
    down: "Sťahujem novú verziu…",
    done: "Nová verzia je pripravená – načítavam…",
    latest: "Máte najnovšiu verziu.",
    offline: "Bez internetu – aktualizácia nie je možná.",
    fail: "Aktualizácia sa nepodarila. Skúste to znova.",
  };
  const appVersion = async () => {
    try {
      const k = (await caches.keys()).find((x) => x.startsWith("dahax-") && x !== "dahax-runtime" && x !== "dahax-media");
      return k ? k.slice(6) : "–";
    } catch { return "–"; }
  };
  const cacheCount = async (name) => {
    try { return (await (await caches.open(name)).keys()).length; } catch { return 0; }
  };

  const run = async (btn, out) => {
    const say = (t) => (out.textContent = t);
    if (!navigator.onLine) return say(S.offline);
    btn.disabled = true;
    say(S.work);
    try {
      // obsah (content.json) sa načítava zo siete – nová verzia obsahu stačí na obnovenie stránky
      const loaded = window.__dxVersion || "";
      const fresh = await fetch("content/content.json", { cache: "no-store" }).then((r) => r.json()).then((c) => c.version).catch(() => "");
      const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
      if (!reg) return fresh && fresh !== loaded ? (say(S.done), location.reload()) : (say(S.latest), (btn.disabled = false));
      const before = await caches.keys();
      await reg.update();
      const w = reg.installing || reg.waiting;
      if (!w) {
        if (fresh && loaded && fresh !== loaded) return say(S.done), location.reload();
        btn.disabled = false;
        return say(S.latest);
      }
      // sťahovanie – priebeh podľa novej offline pamäte (pri videách to môže trvať niekoľko minút)
      const total = await fetch("sw.js", { cache: "no-store" }).then((r) => r.text()).then((t) => (t.match(/const FILES = (\[.*?\]);/s) ? JSON.parse(RegExp.$1).length : 0)).catch(() => 0);
      const tick = setInterval(async () => {
        const nk = (await caches.keys()).find((k) => k.startsWith("dahax-") && k !== "dahax-runtime" && k !== "dahax-media" && !before.includes(k));
        if (nk && total) say(`${S.down} ${Math.min(await cacheCount(nk), total)} / ${total}`);
      }, 1500);
      say(S.down);
      await new Promise((res, rej) => {
        const check = () => {
          if (w.state === "activated") res();
          else if (w.state === "redundant") rej(new Error("redundant"));
        };
        w.addEventListener("statechange", check);
        navigator.serviceWorker.addEventListener("controllerchange", res, { once: true });
        check();
      });
      clearInterval(tick);
      say(S.done);
      location.reload();
    } catch {
      btn.disabled = false;
      say(navigator.onLine ? S.fail : S.offline);
    }
  };

  const decorate = () => {
    for (const card of document.querySelectorAll(".set__card")) {
      const label = card.querySelector(".eyebrow");
      if (!label || label.textContent.trim() !== "Verzia obsahu" || card.nextElementSibling?.classList.contains("dxu")) continue;
      window.__dxVersion = card.querySelector("p:not(.eyebrow)")?.textContent.trim() || "";
      const box = document.createElement("div");
      box.className = "set__card dxu";
      box.innerHTML = `<p class="eyebrow eyebrow--muted">Aktualizácia</p><p class="dxu__v">Verzia aplikácie: <b>…</b></p>` +
        `<button type="button" class="btn btn--line dxu__btn">Načítať novú verziu</button><p class="dxu__s" aria-live="polite"></p>`;
      card.after(box);
      appVersion().then((v) => (box.querySelector("b").textContent = v));
      const btn = box.querySelector("button"), out = box.querySelector(".dxu__s");
      btn.addEventListener("click", () => run(btn, out));
      box.after(offlineCard());
      paint();
    }
  };

  // ---------- offline pamäť PDF a videí ----------
  const MB = (n) => (n / 1e6).toLocaleString("sk-SK", { maximumFractionDigits: 0 }) + " MB";
  const sw = () => navigator.serviceWorker?.controller;
  const ask = (type) => sw()?.postMessage({ type });
  let card = null, last = null;
  const paint = () => {
    if (!card || !card.isConnected) return;
    const st = card.querySelector(".dxu__v"), btn = card.querySelector("button"), out = card.querySelector(".dxu__s");
    if (!sw()) { st.textContent = "Offline pamäť nie je k dispozícii."; btn.disabled = true; return; }
    if (!last) { st.textContent = "Offline: …"; return; }
    st.innerHTML = `Offline: <b>${last.done} z ${last.total}</b> súborov, ${MB(last.bytes)} z ${MB(last.totalBytes)}`;
    const full = last.done === last.total;
    btn.disabled = last.running || full;
    btn.textContent = full ? "Všetko je stiahnuté" : last.running ? "Sťahujem…" : "Stiahnuť pre offline";
    out.textContent = last.running ? "PDF a videá sa ukladajú do tabletu – nechajte aplikáciu otvorenú." : last.failed ? `${last.failed} súborov sa nepodarilo stiahnuť – skúste znova s internetom.` : full ? "Prezentácia ide celá aj bez internetu." : "PDF a videá sa zatiaľ otvárajú z internetu.";
  };
  const offlineCard = () => {
    card = document.createElement("div");
    card.className = "set__card dxu";
    card.innerHTML = `<p class="eyebrow eyebrow--muted">Offline – PDF a videá</p><p class="dxu__v">Offline: …</p>` +
      `<button type="button" class="btn btn--line dxu__btn">Stiahnuť pre offline</button><p class="dxu__s" aria-live="polite"></p>`;
    card.querySelector("button").addEventListener("click", () => {
      if (!navigator.onLine) return (card.querySelector(".dxu__s").textContent = "Bez internetu – sťahovanie nie je možné.");
      ask("dahax-offline-on");
      last = { ...(last || {}), running: true };
      paint();
    });
    ask("dahax-offline-status");
    paint();
    return card;
  };
  navigator.serviceWorker?.addEventListener("message", (e) => {
    if (e.data?.type !== "dahax-offline") return;
    last = e.data;
    paint();
  });
  // nainštalovaná aplikácia na tablete: PDF a videá sa uložia offline samy (doťahujú sa len chýbajúce)
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (standalone && navigator.serviceWorker) navigator.serviceWorker.ready.then(() => setTimeout(() => ask("dahax-offline-on"), 4000));
  let q = false;
  new MutationObserver(() => {
    if (q) return;
    q = true;
    requestAnimationFrame(() => { q = false; decorate(); });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
