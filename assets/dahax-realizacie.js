// DAHAX – snímka Realizácie ako galéria našich predajní vybavených sortimentom KLIMAS (scripts/update-2026-10-26-realizacie-galeria.mjs).
// Videá výrobkov sem nepatria (sú pri produktoch); neskôr pribudnú referencie stavieb aj od iných firiem.
// Údaje: content.json → realizations.galeria [{typ: foto|video, src, plagat, popis, nazov, firma}], realizations.firmy.
//  - hore filter podľa firmy (Fotky / Videá len vtedy, keď sú v údajoch aj videá), pod ním mriežka náhľadov (roluje sa vo vnútri snímky),
//  - ťuknutie otvorí prehliadač na celú obrazovku: listovanie potiahnutím prstom, šípkami alebo klávesmi, popis dole,
//    video so zvukom vypnutým a ovládaním (zvuk sa dá zapnúť),
//  - fotky nahraté v tablete v režime správy (IndexedDB „dahax-interactive“, sklad „media“) sú v galérii tiež.
// Offline: fotky predajní a videá sú v trvalej pamäti médií (sw.js MEDIA).
// Ďalej: snímky kategórií s rozložením „media“ (veľká fotka vľavo, zoznam vpravo), ktoré majú v content.json pole gallery
// (zatiaľ IZOVAT Fasády a Ploché strechy) – pod zoznamom rad náhľadov „Fotografie“ a „Všetky fotografie (N)“,
// ťuknutie na náhľad alebo hlavnú fotku otvorí ten istý prehliadač na celú obrazovku.
(() => {
  let data = null;
  const kat = new Map(); // "#/<firma>/<kategória>" → { titul, fotky: [{ typ, src, popis, biele }] }
  let miestne = []; // nahraté v tablete
  const stav = { typ: "vsetko", firma: "" };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const stop = (e) => e.stopPropagation();

  // médiá z režimu správy (rovnaká databáza ako aplikácia; ak neexistuje, nič sa nevytvára)
  const nacitajMiestne = () => new Promise((ok) => {
    try {
      const r = indexedDB.open("dahax-interactive");
      r.onupgradeneeded = () => { r.transaction.abort(); ok([]); };
      r.onerror = () => ok([]);
      r.onsuccess = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains("media")) { db.close(); return ok([]); }
        const q = db.transaction("media", "readonly").objectStore("media").getAll();
        q.onsuccess = () => {
          db.close();
          ok((q.result || []).filter((m) => m.kind === "image" && m.blob).map((m) => {
            const url = URL.createObjectURL(m.blob);
            const firma = /^(brand|cat):([^/:]+)/.exec(m.target || "");
            return { typ: m.kind === "image" ? "foto" : "video", src: url, plagat: m.kind === "image" ? url : "", popis: m.title || "Nahraté v tablete", firma: firma ? firma[2] : "", miestne: true };
          }));
        };
        q.onerror = () => { db.close(); ok([]); };
      };
    } catch (e) { ok([]); }
  });

  const vsetky = () => (data ? data.galeria.concat(miestne) : []);
  const vybrane = () => vsetky().filter((g) =>
    (stav.typ === "vsetko" || (stav.typ === "foto" ? g.typ === "foto" : stav.typ === "video" ? g.typ === "video" : g.miestne)) &&
    (!stav.firma || g.firma === stav.firma));

  const IKONA_PLAY = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="rgba(10,11,13,.62)" stroke="#fff" stroke-width="1.5"/><path d="M19 15.5v17l14-8.5z" fill="#fff"/></svg>';

  const filtre = (box) => {
    const f = el("div", "dxr-filtre");
    const v = vsetky();
    const tlac = (skupina, kluc, text, n) => {
      const b = el("button", "dxr-f" + (stav[skupina] === kluc ? " is-on" : ""));
      b.type = "button";
      b.append(el("span", "", text), el("b", "", String(n)));
      b.addEventListener("click", () => { stav[skupina] = stav[skupina] === kluc && skupina === "firma" ? "" : kluc; vykresli(box); });
      return b;
    };
    const typy = el("div", "dxr-f__sk");
    const videa = v.filter((g) => g.typ === "video").length;
    if (videa || miestne.length) typy.append(tlac("typ", "vsetko", "Všetko", v.length));
    if (videa) typy.append(tlac("typ", "foto", "Fotky", v.length - videa), tlac("typ", "video", "Videá", videa));
    if (miestne.length) typy.append(tlac("typ", "miestne", "Nahraté v tablete", miestne.length));
    const firmy = el("div", "dxr-f__sk dxr-f__sk--firmy");
    firmy.append(tlac("firma", "", "Všetky firmy", v.length));
    for (const [id, meno] of Object.entries(data.firmy || {})) firmy.append(tlac("firma", id, meno, v.filter((g) => g.firma === id).length));
    if (typy.children.length) f.append(typy);
    f.append(firmy);
    return f;
  };

  const mriezka = (zoznam) => {
    const m = el("div", "dxr-grid");
    zoznam.forEach((g, i) => {
      const b = el("button", "dxr-t dxr-t--" + g.typ);
      b.type = "button";
      const img = el("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = g.popis;
      if (g.plagat || g.typ === "foto") img.src = g.plagat || g.src;
      b.append(img);
      if (g.typ === "video") {
        const p = el("span", "dxr-t__play");
        p.innerHTML = IKONA_PLAY;
        b.append(p, el("span", "dxr-t__znak", "Video"));
      }
      b.append(el("span", "dxr-t__popis", g.typ === "video" && g.nazov ? g.nazov : g.popis));
      b.addEventListener("click", () => otvor(zoznam, i));
      m.append(b);
    });
    if (!zoznam.length) m.append(el("p", "dxr-prazdne", "V tomto výbere nie je nič."));
    return m;
  };

  const vykresli = (box) => {
    box.textContent = "";
    box.append(filtre(box), mriezka(vybrane()));
  };

  // prehliadač na celú obrazovku
  let ov = null;
  const otvor = (zoznam, i) => {
    zavri();
    ov = el("div", "ov dxr-ov");
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-label", "Fotky a videá");
    const scena = el("div", "dxr-ov__scena");
    const pop = el("p", "dxr-ov__popis");
    const cis = el("p", "dxr-ov__cislo");
    const x = el("button", "dxr-ov__x", "×");
    x.type = "button";
    x.setAttribute("aria-label", "Zavrieť");
    const pred = el("button", "dxr-ov__sip dxr-ov__sip--l", "‹");
    const dalej = el("button", "dxr-ov__sip dxr-ov__sip--r", "›");
    pred.type = dalej.type = "button";
    pred.setAttribute("aria-label", "Predošlá");
    dalej.setAttribute("aria-label", "Ďalšia");
    ov.append(scena, pred, dalej, x, cis, pop);
    const ukaz = (n) => {
      i = (n + zoznam.length) % zoznam.length;
      const g = zoznam[i];
      scena.textContent = "";
      if (g.typ === "video") {
        const v = el("video");
        v.src = g.src;
        if (g.plagat) v.poster = g.plagat;
        v.muted = true;
        v.playsInline = true;
        v.controls = true;
        v.autoplay = true;
        v.setAttribute("controlslist", "nodownload");
        scena.append(v);
        v.play().catch(() => {});
      } else {
        const img = el("img");
        img.src = g.src;
        img.alt = g.popis;
        scena.append(img);
      }
      pop.textContent = g.popis;
      cis.textContent = i + 1 + " / " + zoznam.length;
    };
    pred.addEventListener("click", () => ukaz(i - 1));
    dalej.addEventListener("click", () => ukaz(i + 1));
    x.addEventListener("click", zavri);
    // potiahnutie prstom
    let sx = null, sy = 0;
    ov.addEventListener("touchstart", (e) => { if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive: true });
    ov.addEventListener("touchend", (e) => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) ukaz(dx < 0 ? i + 1 : i - 1);
    }, { passive: true });
    ["pointerdown", "pointerup", "touchstart", "touchmove", "touchend", "wheel"].forEach((t) => ov.addEventListener(t, stop, { passive: true }));
    ov._kl = (e) => {
      if (e.key === "Escape") zavri();
      else if (e.key === "ArrowRight") ukaz(i + 1);
      else if (e.key === "ArrowLeft") ukaz(i - 1);
      else return;
      e.stopPropagation();
      e.preventDefault();
    };
    addEventListener("keydown", ov._kl, true);
    document.body.append(ov);
    ukaz(i);
    x.focus({ preventScroll: true });
  };
  const zavri = () => {
    if (!ov) return;
    removeEventListener("keydown", ov._kl, true);
    const v = ov.querySelector("video");
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
    ov.remove();
    ov = null;
  };

  const ozdob = () => {
    if (!data) return;
    document.querySelectorAll(".s__in.real").forEach((s) => {
      if (s.querySelector(":scope > .dxr")) return;
      const box = el("div", "dxr");
      // ťuknutie a rolovanie v galérii nemá prepínať snímky ani otvárať galériu aplikácie
      ["pointerdown", "pointerup", "wheel"].forEach((t) => box.addEventListener(t, stop, { passive: true }));
      vykresli(box);
      s.append(box);
    });
  };

  // galéria na snímke kategórie (rozloženie „media“)
  const ozdobMedia = () => {
    const kluc = location.hash.split("?")[0], d = kat.get(kluc);
    document.querySelectorAll(".s__in.media").forEach((s) => {
      const cur = s.querySelector(".dxg");
      if (cur && cur.dataset.k === kluc) return;
      if (cur) cur.remove();
      const text = s.querySelector(":scope > .media__text"), fig = s.querySelector(":scope > .media__img");
      if (!d || !text) return;
      const box = el("div", "dxg" + (d.fotky.length === 2 ? " dxg--jeden" : ""));
      box.dataset.k = kluc;
      ["pointerdown", "pointerup"].forEach((t) => box.addEventListener(t, stop));
      box.append(el("p", "eyebrow dxg__h", "Fotografie"));
      const grid = el("div", "dxg__grid");
      d.fotky.slice(1, 5).forEach((g, n) => {
        const b = el("button", "dxg__t" + (g.vyrez ? " is-vyrez" : g.biele ? " is-white" : ""));
        b.type = "button";
        const img = el("img");
        img.src = g.src;
        img.alt = g.popis || "";
        img.loading = "lazy";
        b.append(img);
        b.setAttribute("aria-label", "Otvoriť fotografiu – " + (g.popis || ""));
        b.addEventListener("click", () => otvor(d.fotky, n + 1));
        grid.append(b);
      });
      box.append(grid);
      if (d.fotky.length > 2) {
        const v = el("button", "dxg__all", "Všetky fotografie (" + d.fotky.length + ")");
        v.type = "button";
        v.addEventListener("click", () => otvor(d.fotky, 0));
        box.append(v);
      }
      text.append(box);
      if (fig && fig.dataset.dxg !== kluc) {
        fig.dataset.dxg = kluc;
        fig.classList.add("dxg-fig");
        ["pointerdown", "pointerup"].forEach((t) => fig.addEventListener(t, stop));
        fig.addEventListener("click", () => { const k = kat.get(location.hash.split("?")[0]); if (k) otvor(k.fotky, 0); });
      }
    });
  };

  let q = false;
  new MutationObserver(() => {
    if (q) return;
    q = true;
    setTimeout(() => { q = false; ozdob(); ozdobMedia(); }, 40);
  }).observe(document.documentElement, { childList: true, subtree: true });
  // po odchode zo snímky zatvoriť prehliadač
  addEventListener("hashchange", () => { zavri(); setTimeout(() => { ozdob(); ozdobMedia(); }, 60); });

  const nacitaj = (c) => {
    kat.clear();
    for (const m of (c && c.manufacturers) || []) for (const k of m.categories || []) {
      if (!Array.isArray(k.gallery) || !k.gallery.length) continue;
      const fotky = (k.image ? [{ typ: "foto", src: k.image, popis: k.imageCaption || k.title || "", biele: true }] : [])
        .concat(k.gallery.filter((g) => g && g.src && g.kind !== "video").map((g) => ({ typ: "foto", src: g.src, popis: g.caption || "", biele: !!g.onWhite, vyrez: !!g.bezPozadia })));
      kat.set("#/" + m.id + "/" + k.id, { titul: k.title, fotky });
    }
    ozdobMedia();
    const r = c && c.realizations;
    if (!r || !Array.isArray(r.galeria)) return;
    data = { galeria: r.galeria, firmy: r.firmy || {} };
    nacitajMiestne().then((m) => { miestne = m; document.querySelectorAll(".dxr").forEach((b) => b.remove()); ozdob(); });
    ozdob();
  };
  if (window.__DAHAX_CONTENT__) nacitaj(window.__DAHAX_CONTENT__);
  else fetch("content/content.json", { cache: "no-cache" }).then((r) => r.json()).then(nacitaj).catch(() => {});
})();
