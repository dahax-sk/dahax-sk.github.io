// DAHAX – kalkulačka mien v hornej lište (6. 11. 2026, želanie používateľa: „kalkulačka meny EUR PLN CZK HUF USD
// ako mám na telefóne Convert Neo, aktuálna“).
//  - tlačidlo „€“ v hornej lište (pred Prehľadom) otvorí panel: zvolíte menu, napíšete sumu, ostatné sa prepočítajú
//  - vlastná klávesnica (na tablete neprekryje obrazovku systémová), funguje aj klávesnica počítača
//  - kurzy: oficiálne referenčné kurzy ECB (api.frankfurter.dev, bez kľúča), záloha open.er-api.com;
//    posledné kurzy sa pamätajú v localStorage „dahax-kurzy“, takže kalkulačka ide aj bez internetu
//  - ECB vydáva kurzy v pracovné dni okolo 16:00 SEČ; cez víkend a sviatky platí posledný kurz
// Štýly: dahax-upravy-3.css („kalkulačka mien“).
(() => {
  if (window.__dxWeb) return; // webový režim (dahax.com): kalkulačka je len pre tablet – žiadne požiadavky na cudzie servery
  const MENY = [
    { k: "EUR", n: "Euro", s: "€", d: 2 },
    { k: "CZK", n: "Česká koruna", s: "Kč", d: 2 },
    { k: "PLN", n: "Poľský zlotý", s: "zł", d: 2 },
    { k: "HUF", n: "Maďarský forint", s: "Ft", d: 0 },
    { k: "USD", n: "Americký dolár", s: "$", d: 2 },
  ];
  // vlajky ako SVG (emoji vlajky Windows nezobrazí); okrúhly výrez cez CSS
  const hviezda = (cx, cy, r) => { let p = ''; for (let i = 0; i < 10; i++) { const u = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r * 0.4 : r; p += (i ? 'L' : 'M') + (cx + q * Math.cos(u)).toFixed(2) + ' ' + (cy + q * Math.sin(u)).toFixed(2); } return p + 'Z'; };
  const VLAJKY = {
    EUR: '<rect width="30" height="30" fill="#039"/><path fill="#fc0" d="' + Array.from({ length: 12 }, (_, i) => hviezda(15 + 9 * Math.cos((i * Math.PI) / 6), 15 + 9 * Math.sin((i * Math.PI) / 6), 1.9)).join('') + '"/>',
    CZK: '<rect width="30" height="15" fill="#fff"/><rect y="15" width="30" height="15" fill="#d7141a"/><path d="M0 0L16 15L0 30Z" fill="#11457e"/>',
    PLN: '<rect width="30" height="15" fill="#fff"/><rect y="15" width="30" height="15" fill="#dc143c"/>',
    HUF: '<rect width="30" height="10" fill="#ce2939"/><rect y="10" width="30" height="10" fill="#fff"/><rect y="20" width="30" height="10" fill="#477050"/>',
    USD: Array.from({ length: 13 }, (_, i) => '<rect y="' + ((i * 30) / 13).toFixed(3) + '" width="30" height="' + (30 / 13 + 0.05).toFixed(3) + '" fill="' + (i % 2 ? '#fff' : '#b22234') + '"/>').join('') +
      '<rect width="15" height="16.15" fill="#3c3b6e"/><g fill="#fff">' + [[3, 3], [7.5, 3], [12, 3], [5.2, 6], [9.8, 6], [3, 9], [7.5, 9], [12, 9], [5.2, 12], [9.8, 12]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="0.9"/>').join('') + '</g>',
  };
  const vlajka = (k) => '<svg viewBox="0 0 30 30" aria-hidden="true">' + VLAJKY[k] + '</svg>';
  const KLUC = "dahax-kurzy", STARE = 60 * 60 * 1000; // po hodine sa skúsi stiahnuť nový kurz
  const ZDROJE = [
    async () => {
      const j = await (await fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=CZK,PLN,HUF,USD", { cache: "no-store" })).json();
      if (!j || !j.rates || !j.date) throw new Error("kurzy");
      return { datum: j.date, kurzy: j.rates, zdroj: "ECB" };
    },
    async () => {
      const j = await (await fetch("https://open.er-api.com/v6/latest/EUR", { cache: "no-store" })).json();
      if (!j || j.result !== "success" || !j.rates) throw new Error("kurzy");
      const k = {}; for (const m of MENY) if (m.k !== "EUR") k[m.k] = j.rates[m.k];
      return { datum: new Date(j.time_last_update_unix * 1000).toISOString().slice(0, 10), kurzy: k, zdroj: "open.er-api.com" };
    },
  ];
  const ok = (d) => d && d.kurzy && MENY.every((m) => m.k === "EUR" || (typeof d.kurzy[m.k] === "number" && d.kurzy[m.k] > 0));
  const citaj = () => { try { const d = JSON.parse(localStorage.getItem(KLUC) || "null"); return ok(d) ? d : null; } catch (e) { return null; } };
  let data = citaj(), stav = "", taham = null;

  const stiahni = async () => {
    if (taham) return taham;
    taham = (async () => {
      for (const z of ZDROJE) {
        try {
          const d = await z();
          if (!ok(d)) continue;
          d.cas = Date.now();
          data = d; stav = "";
          try { localStorage.setItem(KLUC, JSON.stringify(d)); } catch (e) {}
          return;
        } catch (e) {}
      }
      stav = data ? "Bez internetu – platí posledný stiahnutý kurz." : "Kurzy sa nepodarilo stiahnuť. Skontrolujte pripojenie na internet.";
    })().finally(() => { taham = null; vykresli(); });
    return taham;
  };
  const kurz = (k) => (k === "EUR" ? 1 : data ? data.kurzy[k] : 0);

  // ── čísla po slovensky: 1 234,56 ──
  const fmt = (x, d) => (isFinite(x) ? x : 0).toLocaleString("sk-SK", { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtKurz = (x) => x.toLocaleString("sk-SK", { maximumFractionDigits: x >= 100 ? 2 : 4 });
  const pisane = (s) => { // písaný reťazec → zobrazenie (medzery v tisícoch, desatinná čiarka)
    const [c, des] = s.split(",");
    return (c ? Number(c).toLocaleString("sk-SK") : "0") + (des !== undefined ? "," + des : "");
  };
  const datumSk = (iso) => { const [r, m, d] = String(iso).split("-"); return +d + ". " + +m + ". " + r; };

  let aktivna = "EUR", vstup = "100", ov = null;
  try { const p = JSON.parse(localStorage.getItem("dahax-meny") || "null"); if (p && MENY.some((m) => m.k === p.a)) { aktivna = p.a; vstup = String(p.v || ""); } } catch (e) {}
  const pamataj = () => { try { localStorage.setItem("dahax-meny", JSON.stringify({ a: aktivna, v: vstup })); } catch (e) {} };

  const IKONA = '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M17.5 6.5A7 7 0 1 0 17.5 17.5M4 10h9M4 14h9"/></svg>';

  const vykresli = () => {
    if (!ov) return;
    const eur = (parseFloat(vstup.replace(",", ".")) || 0) / (kurz(aktivna) || 1);
    for (const m of MENY) {
      const r = ov.querySelector('[data-m="' + m.k + '"]');
      r.classList.toggle("is-on", m.k === aktivna);
      r.setAttribute("aria-pressed", m.k === aktivna);
      r.querySelector(".dxm-r__v").textContent = !data ? "–" : m.k === aktivna ? pisane(vstup) : fmt(eur * kurz(m.k), m.d);
      const k = r.querySelector(".dxm-r__k");
      if (m.k === aktivna || !data) k.textContent = m.n;
      else { const x = kurz(m.k) / kurz(aktivna), n = x < 0.01 ? 1000 : x < 0.1 ? 100 : 1; k.textContent = n.toLocaleString("sk-SK") + " " + aktivna + " = " + fmtKurz(x * n) + " " + m.k; }
    }
    const p = ov.querySelector(".dxm__info");
    p.classList.toggle("is-chyba", !!stav);
    p.textContent = stav || (taham && !data ? "Sťahujem aktuálne kurzy…" : data
      ? (data.zdroj === "ECB" ? "Oficiálny kurz ECB" : "Kurz " + data.zdroj) + " k " + datumSk(data.datum) + (taham ? " · aktualizujem…" : "")
      : "");
  };

  const pis = (t) => {
    if (t === "C") vstup = "";
    else if (t === "⌫") vstup = vstup.slice(0, -1);
    else if (t === ",") { if (!vstup.includes(",")) vstup = (vstup || "0") + ","; }
    else {
      const [c, des] = vstup.split(",");
      if (des !== undefined ? des.length >= 2 : c.replace(/^0+/, "").length >= 12) return;
      vstup = vstup === "0" ? t : vstup + t;
    }
    pamataj(); vykresli();
  };
  const zvol = (k) => {
    if (k === aktivna) return;
    // prevezme prepočítanú sumu, aby sa dalo hneď pokračovať (ako v Convert Neo)
    if (data && vstup) {
      const m = MENY.find((x) => x.k === k);
      const x = ((parseFloat(vstup.replace(",", ".")) || 0) / kurz(aktivna)) * kurz(k);
      vstup = x ? x.toFixed(m.d).replace(/\.?0+$/, "").replace(".", ",") : "";
    }
    aktivna = k; pamataj(); vykresli();
  };

  const zavri = () => { if (!ov) return; ov.remove(); ov = null; document.querySelector(".dxm-btn")?.classList.remove("is-on"); };
  const otvor = () => {
    if (ov) return zavri();
    ov = document.createElement("div");
    ov.className = "dxm";
    ov.innerHTML =
      '<div class="dxm__p" role="dialog" aria-label="Kalkulačka mien">' +
      '<div class="dxm__h"><b>Kalkulačka mien</b><button type="button" class="dxm__obnov" data-a="obnov" aria-label="Aktualizovať kurzy" title="Aktualizovať kurzy"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg></button>' +
      '<button type="button" class="dxm__x" data-a="zavri" aria-label="Zavrieť">×</button></div>' +
      '<div class="dxm__meny">' + MENY.map((m) =>
        '<button type="button" class="dxm-r" data-m="' + m.k + '"><span class="dxm-r__s">' + vlajka(m.k) + '</span><span class="dxm-r__t"><b>' + m.k +
        '</b><small class="dxm-r__k"></small></span><span class="dxm-r__c"><span class="dxm-r__v"></span><span class="dxm-r__z">' + m.s + '</span></span></button>').join("") + "</div>" +
      '<div class="dxm__kl">' + ["7", "8", "9", "C", "4", "5", "6", "⌫", "1", "2", "3", ",", "0", "000"].map((t) =>
        '<button type="button" data-t="' + t + '"' + (t === "0" || t === "000" ? ' class="dxm__0"' : t === "C" || t === "⌫" ? ' class="dxm__f"' : "") +
        (t === "⌫" ? ' aria-label="Zmazať číslicu"' : t === "C" ? ' aria-label="Zmazať všetko"' : "") + ">" + t + "</button>").join("") + "</div>" +
      '<p class="dxm__info" aria-live="polite"></p></div>';
    ov.addEventListener("click", (e) => {
      if (e.target === ov) return zavri();
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.m) zvol(b.dataset.m);
      else if (b.dataset.t) [...b.dataset.t].forEach(pis);
      else if (b.dataset.a === "zavri") zavri();
      else if (b.dataset.a === "obnov") { stav = ""; stiahni(); vykresli(); }
    });
    document.body.appendChild(ov);
    poloha();
    document.querySelector(".dxm-btn")?.classList.add("is-on");
    if (!data || Date.now() - (data.cas || 0) > STARE) stiahni();
    vykresli();
  };

  // klávesnica počítača – kým je kalkulačka otvorená, šípky ani čísla neprepínajú snímky
  addEventListener("keydown", (e) => {
    if (!ov) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) pis(k);
    else if (k === "," || k === "." || k === "Decimal") pis(",");
    else if (k === "Backspace") pis("⌫");
    else if (k === "Delete") pis("C");
    else if (k === "Escape" || k === "Enter") zavri();
    else if (k === "ArrowDown" || k === "ArrowUp") {
      const i = MENY.findIndex((m) => m.k === aktivna);
      zvol(MENY[(i + (k === "ArrowDown" ? 1 : MENY.length - 1)) % MENY.length].k);
    } else if (k !== "Tab") return;
    if (k !== "Tab") { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  // panel vždy priamo pod tlačidlom € (aj keď je snímka v okne inej veľkosti posunutá)
  const poloha = () => {
    const b = document.querySelector(".dxm-btn"), p = ov && ov.querySelector(".dxm__p");
    if (!b || !p) return;
    const r = b.getBoundingClientRect(), top = Math.round(r.bottom + 8);
    p.style.top = top + "px";
    p.style.right = Math.max(16, Math.round(innerWidth - r.right)) + "px";
    p.style.maxHeight = "calc(100vh - " + (top + 16) + "px)";
  };
  addEventListener("resize", () => { requestAnimationFrame(poloha); setTimeout(poloha, 250); });
  addEventListener("hashchange", zavri);

  const tlacidlo = () => {
    const r = document.querySelector(".top .top__right");
    if (!r || r.querySelector(".dxm-btn")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ibtn ibtn--ink dxm-btn" + (ov ? " is-on" : "");
    b.setAttribute("aria-label", "Kalkulačka mien");
    b.title = "Kalkulačka mien";
    b.innerHTML = IKONA;
    b.addEventListener("click", (e) => { e.stopPropagation(); otvor(); });
    const pred = [...r.querySelectorAll(".ibtn")].find((x) => !x.classList.contains("dxp-btn"));
    r.insertBefore(b, pred || null);
  };
  new MutationObserver(tlacidlo).observe(document.documentElement, { childList: true, subtree: true });
  tlacidlo();
  // kurzy sa stiahnu aj na pozadí, aby boli po otvorení hneď aktuálne (a uložené pre prácu bez internetu)
  const naPozadi = () => { if (navigator.onLine !== false && (!data || Date.now() - (data.cas || 0) > STARE)) stiahni(); };
  if (document.readyState === "complete") setTimeout(naPozadi, 2500); else addEventListener("load", () => setTimeout(naPozadi, 2500));
  window.__dxMeny = { otvor, zavri, stiahni, data: () => data };
})();
