/* DAHAX – strany 1 – 3: „tok informácií“ po líniách pozadia.
   Do snímky vloží vrstvu .dhx-tok (štýly v dahax-uvod.css) s impulzmi, ktoré bežia po dráhach
   v súradniciach obrázka pozadia (1920 × 1080) a mierkou sa prispôsobia ako object-fit: cover.
   Na zmeny čaká cez setTimeout (requestAnimationFrame v skrytom okne nebeží). */
(function () {
  // Dráhy línií titulky [dráha, trvanie s, oneskorenie s] – všetky smerujú do stredu „X“.
  var LAVE = [
    ["M0,148 L520,148 L880,496 L1030,500 L1170,630", 11, 0],
    ["M0,476 L120,476 L190,540 L360,544 L670,800 L1000,800 L1170,630", 13, -5],
    ["M900,50 L1020,176 L1024,436 L1210,632", 9, -2],
    ["M430,866 L976,866 L1210,632", 10, -7]
  ];
  var PRAVE = [
    ["M1920,996 L1650,996 L1240,630", 9, -4],
    ["M1920,230 L1730,230 L1250,630", 10, -8],
    ["M1920,796 L1440,796 L1270,630", 12, -1]
  ];

  // Prepočet dráhy na pozadie strany 2 (zrkadlo) a 3 (výrez vľavo dole) – rovnako ako podklady/uvod/pozadia.py.
  function prepocet(tok, f) {
    return tok.map(function (t) {
      var d = t[0].replace(/(-?[\d.]+),(-?[\d.]+)/g, function (_, x, y) {
        var p = f(+x, +y);
        return Math.round(p[0]) + "," + Math.round(p[1]);
      });
      return [d, t[1], t[2]];
    });
  }
  var ZOOM3 = 1.55;
  function zrkadlo(x, y) { return [1920 - x, y]; }
  function vyrez(x, y) { return [x * ZOOM3, (y - (1080 - 1080 / ZOOM3)) * ZOOM3]; }

  var STRANY = [
    { sel: "section.s--title", maska: "img/photo/dahax-bg-1-linie.webp", tok: LAVE.concat(PRAVE) },
    // strana 2: tok sa zbieha za kartu 01 (priame zastúpenie výrobcov)
    { sel: "section.s:has(> .s__in.why)", maska: "img/photo/dahax-bg-2-linie.webp", tok: prepocet(LAVE.concat(PRAVE), zrkadlo) },
    // strana 3: tok zľava doprava – zo skladu k zákazníkovi
    { sel: "section.s:has(> .s__in.logi)", maska: "img/photo/dahax-bg-3-linie.webp", tok: prepocet(LAVE, vyrez) }
  ];

  function vloz(sec, s) {
    var v = sec.querySelector(":scope > .dhx-tok");
    if (!v) {
      v = document.createElement("div");
      v.className = "dhx-tok";
      v.setAttribute("aria-hidden", "true");
      // celá adresa – relatívna by sa v štýle počítala od assets/
      v.style.setProperty("--dhx-tok-maska", "url(" + new URL(s.maska, document.baseURI).href + ")");
      s.tok.forEach(function (t) {
        var i = document.createElement("i");
        i.style.setProperty("--p", "path('" + t[0] + "')");
        i.style.setProperty("--t", t[1] + "s");
        i.style.setProperty("--d", t[2] + "s");
        v.appendChild(i);
      });
      var bg = sec.querySelector(":scope > .s__bg");
      sec.insertBefore(v, bg ? bg.nextSibling : sec.firstChild);
    }
    var m = Math.max(sec.offsetWidth / 1920, sec.offsetHeight / 1080) || 1;
    if (v.__m !== m) { v.__m = m; v.style.setProperty("--dhx-tok-s", m); }
  }

  function kontrola() {
    STRANY.forEach(function (s) {
      document.querySelectorAll(s.sel).forEach(function (sec) { vloz(sec, s); });
    });
    setTimeout(kontrola, 400);
  }
  kontrola();
})();
