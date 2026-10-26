// DAHAX – „Načítať novú verziu“ v nastaveniach (scripts/update-2026-10-26-verzia.mjs).
// Pod kartu „Verzia obsahu“ v paneli Správa obsahu pridá kartu Aktualizácia: verzia aplikácie (názov offline pamäte),
// tlačidlo na stiahnutie novej verzie a stav. Robí len update + reload – nemaže IndexedDB (fotky, videá a dokumenty
// nahraté v režime správy), nerobí unregister.
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
      const k = (await caches.keys()).find((x) => x.startsWith("dahax-") && x !== "dahax-runtime");
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
        const nk = (await caches.keys()).find((k) => k.startsWith("dahax-") && k !== "dahax-runtime" && !before.includes(k));
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
    }
  };
  let q = false;
  new MutationObserver(() => {
    if (q) return;
    q = true;
    requestAnimationFrame(() => { q = false; decorate(); });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
