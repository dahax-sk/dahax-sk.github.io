// DAHAX – webový režim (dahax.com): firemné údaje a texty, ktoré používa assets/dahax-web.js, dahax-web-mobil.js
// a zostava scripts/zostav-web.mjs (statická stránka Ochrana osobných údajov). Prázdne údaje sa ukážu ako „doplniť“.
// Pred zverejnením: doplniť FIRMA (IČO, sídlo, OR …) a dať text OCHRANA skontrolovať právnikovi.
window.__dxWebUdaje = {
  domena: "https://dahax.com",
  firma: {
    nazov: "DAHAX SK s.r.o.",
    ico: "", // IČO
    dic: "", // DIČ
    icdph: "", // IČ DPH
    sidlo: "", // sídlo spoločnosti
    register: "", // napr. Obchodný register Okresného súdu Prešov, odd. Sro, vl. č. …
  },
  seo: {
    titul: "DAHAX – dovozca a distribútor izolácií a stavebných systémov",
    popis: "DAHAX SK – dovozca a distribútor izolácií, kotvenia, hydroizolácií a suchej výstavby pre Slovensko a Česko. 15 európskych výrobcov, sklady v Prešove a pri Leviciach.",
  },
  // Ochrana osobných údajov – {nazov}, {sidlo}, {ico}, {register}, {email}, {telefon} sa doplnia (prázdne = „doplniť“)
  ochrana: [
    ["p", "<span class=\"dxw-todo\">NÁVRH – pred zverejnením dať skontrolovať právnikovi a doplniť firemné údaje.</span>"],
    ["h2", "Prevádzkovateľ"],
    ["p", "{nazov}, sídlo: {sidlo}, IČO: {ico}, zapísaná v {register}. Kontakt: <a href=\"mailto:{email}\">{email}</a>, {telefon}."],
    ["h2", "Aké údaje spracúvame a prečo"],
    ["ul", [
      "<b>Dopyty a komunikácia</b> – meno, firma, telefón, e-mail a obsah správy, ktoré nám pošlete e-mailom alebo cez formulár. Účel: odpoveď na dopyt a príprava ponuky. Právny základ: opatrenia pred uzavretím zmluvy a oprávnený záujem (čl. 6 ods. 1 písm. b) a f) GDPR).",
      "<b>Obchodný vzťah</b> – údaje potrebné na dodanie tovaru a fakturáciu. Právny základ: plnenie zmluvy a zákonné povinnosti (účtovníctvo).",
    ]],
    ["h2", "Cookies a sledovanie"],
    ["p", "Tento web nepoužíva cookies, reklamné ani analytické nástroje tretích strán a písma má uložené na vlastnom serveri. Výnimkou sú videá YouTube v galérii niektorých výrobcov: ich náhľady sa načítajú zo servera i.ytimg.com a video sa spustí až po kliknutí cez youtube-nocookie.com (Google). Prevádzkovateľ hostingu môže viesť technické záznamy prístupov (IP adresa, čas) na zabezpečenie prevádzky."],
    ["h2", "Ako dlho údaje uchovávame"],
    ["p", "Dopyty bez následnej objednávky najviac 2 roky, údaje z obchodného vzťahu po dobu stanovenú zákonom (napr. účtovné doklady 10 rokov). <span class=\"dxw-todo\">overiť</span>"],
    ["h2", "Príjemcovia"],
    ["p", "Poskytovateľ hostingu a e-mailu <span class=\"dxw-todo\">doplniť (napr. WebSupport, s. r. o.)</span>, prípadne dopravca pri doručení tovaru. Údaje neodovzdávame do krajín mimo EÚ."],
    ["h2", "Vaše práva"],
    ["p", "Máte právo na prístup k údajom, opravu, vymazanie, obmedzenie spracúvania, prenosnosť, namietať proti spracúvaniu a podať sťažnosť na Úrad na ochranu osobných údajov SR (dataprotection.gov.sk). Žiadosti posielajte na <a href=\"mailto:{email}\">{email}</a>."],
  ],
};
// pomocník: firemné údaje → HTML (aj pre zostavu v Node)
window.__dxWebUdaje.html = (co) => {
  const U = window.__dxWebUdaje, F = U.firma;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const T = (v) => (v ? esc(v) : '<span class="dxw-todo">doplniť</span>');
  const sub = (s) => s.replace(/\{(\w+)\}/g, (_, k) => ({ nazov: esc(F.nazov), sidlo: T(F.sidlo), ico: T(F.ico), register: T(F.register), email: esc(co.email), telefon: esc(co.phone) })[k] || "");
  return {
    ochrana: U.ochrana.map(([t, v]) => (t === "ul" ? "<ul>" + v.map((x) => "<li>" + sub(x) + "</li>").join("") + "</ul>" : "<" + t + ">" + sub(v) + "</" + t + ">")).join(""),
    riadok: esc(F.nazov) + " · IČO " + T(F.ico) + " · DIČ / IČ DPH " + (F.dic || F.icdph ? esc([F.dic, F.icdph].filter(Boolean).join(" / ")) : T("")) + " · sídlo " + T(F.sidlo) + " · zápis " + T(F.register),
  };
};
