// DAHAX – úvodná strana (28. 10. 2026, text schválený používateľom): pod logom
//   malý nápis (company.uvod.kicker) → nadpis (company.slogan, vykresľuje bundle) → podnadpis → riadok čísel.
// Na nižšej obrazovke (výška pod ~860 px) je nadpis kratší (company.uvod.nadpisKratky), aby sa text nestretol
// s fotkou vpravo ani s kontaktmi dole – prepína CSS (dahax-uvod.css „úvod – nový text“).
// Bundle (React) prvky nepresúvame: len vkladáme vlastné súrodence okolo .title__slogan.
(() => {
  let u = null;
  const el = (tag, cls, text) => { const e = document.createElement(tag); e.className = cls; if (text != null) e.textContent = text; return e; };
  const kontrola = () => {
    const s = u && document.querySelector(".s--title .title__slogan");
    if (!s || s.parentNode.querySelector(".dhx-t-kicker")) return;
    s.classList.add("dhx-t-h");
    s.before(el("p", "dhx-t-kicker", u.kicker));
    const kratky = el("p", "dhx-t-h dhx-t-h--kratky", u.nadpisKratky);
    kratky.setAttribute("aria-hidden", "true");
    const sub = el("p", "dhx-t-sub", u.podnadpis);
    const cisla = el("ul", "dhx-t-cisla");
    for (const c of u.cisla || []) {
      const li = el("li", "");
      li.append(el("b", "", c.value), el("span", "", c.label));
      cisla.append(li);
    }
    s.after(kratky, sub, cisla);
  };
  const start = (c) => { u = c && c.company && c.company.uvod; if (!u) return; new MutationObserver(kontrola).observe(document.documentElement, { childList: true, subtree: true }); kontrola(); };
  if (window.__DAHAX_CONTENT__) start(window.__DAHAX_CONTENT__);
  else fetch("content/content.json", { cache: "no-cache" }).then((r) => r.json()).then(start).catch(() => {});
})();
