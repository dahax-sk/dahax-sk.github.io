/* DAHAX – strany 1 – 3: „tok informácií“ po líniách pozadia.
   Do snímky vloží vrstvu .dhx-tok (štýly v dahax-uvod.css) s impulzmi, ktoré bežia po dráhach
   v súradniciach obrázka pozadia (1920 × 1080) a mierkou sa prispôsobia ako object-fit: cover.
   Strana 1: výzva „Potiahnite“ (.dhx-dalej). Strana 3: líniová mapa SK a CZ (.dhx-mapa) so skladmi
   z content.json (company.warehouses – číta ich z vykresleného .logi__wh), trasami a jedným kamiónom.
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

  // ---- strana 1: nenápadná výzva na posun ----
  function vyzva(sec) {
    if (sec.querySelector(":scope > .dhx-dalej")) return;
    var a = document.createElement("div");
    a.className = "dhx-dalej";
    a.setAttribute("aria-hidden", "true");
    a.innerHTML = "<span>Potiahnite</span><i></i><i></i><i></i>";
    sec.appendChild(a);
  }

  // ---- strana 3: líniová mapa Slovenska a Česka so skladmi, trasami a jedným kamiónom ----
  // Hranice: zjednodušené z hlavných bodov hraníc [zemepisná dĺžka, šírka], spoločná hranica SK – CZ je v oboch.
  var SK_CZ = [[16.94, 48.62], [17.2, 48.75], [17.45, 48.84], [17.65, 48.87], [17.9, 48.98], [18.1, 49.07], [18.17, 49.28], [18.4, 49.39], [18.55, 49.5], [18.85, 49.52]];
  var SK = SK_CZ.concat([[19.0, 49.4], [19.2, 49.41], [19.45, 49.6], [19.8, 49.2], [20.05, 49.18], [20.35, 49.4], [20.6, 49.4], [20.9, 49.35], [21.25, 49.45],
    [21.6, 49.43], [22.0, 49.23], [22.56, 49.08], [22.48, 48.8], [22.15, 48.4], [21.75, 48.33], [21.4, 48.56], [21.1, 48.5], [20.8, 48.57], [20.45, 48.47],
    [20.25, 48.27], [19.95, 48.15], [19.62, 48.23], [19.48, 48.1], [19.05, 48.07], [18.8, 47.85], [18.6, 47.77], [18.0, 47.75], [17.75, 47.75], [17.48, 47.88],
    [17.16, 48.01], [17.06, 48.1], [16.95, 48.27], [16.85, 48.45]]);
  var CZ = SK_CZ.concat([[18.57, 49.92], [18.35, 49.95], [18.03, 50.05], [17.6, 50.16], [17.72, 50.3], [17.25, 50.32], [17.0, 50.42],
    [16.85, 50.2], [16.55, 50.17], [16.2, 50.43], [16.45, 50.58], [16.3, 50.65], [16.1, 50.66], [15.8, 50.74], [15.4, 50.8], [15.2, 50.98], [15.0, 51.0],
    [14.82, 50.87], [14.5, 51.05], [14.4, 51.02], [14.3, 50.88], [13.9, 50.79], [13.55, 50.7], [13.3, 50.58], [12.95, 50.45], [12.5, 50.4], [12.32, 50.18],
    [12.09, 50.32], [12.2, 50.1], [12.45, 49.8], [12.55, 49.6], [12.9, 49.35], [13.15, 49.15], [13.5, 48.95], [13.82, 48.77], [14.05, 48.6], [14.3, 48.56],
    [14.7, 48.58], [14.95, 48.78], [15.0, 49.0], [15.4, 48.99], [15.8, 48.87], [16.1, 48.75], [16.4, 48.74], [16.65, 48.78]]);
  var MESTA = { ba: [17.11, 48.15, "Bratislava"], za: [18.74, 49.22, "Žilina"], bb: [19.15, 48.74, "Banská Bystrica"], ke: [21.26, 48.72, "Košice"],
    bn: [16.61, 49.2, "Brno"], os: [18.29, 49.83, "Ostrava"], ph: [14.42, 50.08, "Praha"], pl: [13.38, 49.75, "Plzeň"] };
  var SKLADY = { po: [21.24, 49.0], cj: [18.65, 48.29] };
  var MW = 620, MK = MW / ((22.7 - 11.95) * 0.65), MH = Math.round((51.15 - 47.65) * MK);
  function xy(b) { return [((b[0] - 11.95) * 0.65 * MK).toFixed(1), ((51.15 - b[1]) * MK).toFixed(1)]; }
  function obrys(body) { return "M" + body.map(function (b) { return xy(b).join(","); }).join("L") + "Z"; }
  // trasa ako jemný oblúk cez body
  function trasa(body) {
    var p = body.map(xy), d = "M" + p[0].join(",");
    for (var i = 1; i < p.length; i++) {
      var ax = +p[i - 1][0], ay = +p[i - 1][1], bx = +p[i][0], by = +p[i][1];
      d += " Q" + ((ax + bx) / 2 + (by - ay) * 0.12).toFixed(1) + "," + ((ay + by) / 2 - (bx - ax) * 0.12).toFixed(1) + " " + bx + "," + by;
    }
    return d;
  }
  var TRASY = [
    [[SKLADY.cj, MESTA.ba, MESTA.bn, MESTA.ph, MESTA.pl], 14, 0],
    [[SKLADY.po, MESTA.ke], 5, -1],
    [[SKLADY.po, MESTA.za, MESTA.os], 9, -3],
    [[SKLADY.cj, MESTA.bb, MESTA.za], 7, -5]
  ];
  var KAMION = '<svg viewBox="0 0 46 20" width="46" height="20"><path d="M1 3h28v12H1z" fill="#0b0c0e" stroke="#fff" stroke-width="1.3"/>' +
    '<path d="M29 7h9l5 5v3H29z" fill="#0b0c0e" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/><path d="M32 8.5h5l3 3h-8z" fill="none" stroke="#fff" stroke-width=".9"/>' +
    '<path d="M3 12.5h24" stroke="#de1f26" stroke-width="1.6"/><circle cx="8" cy="16.5" r="2.6" fill="#0b0c0e" stroke="#fff" stroke-width="1.2"/>' +
    '<circle cx="23" cy="16.5" r="2.6" fill="#0b0c0e" stroke="#fff" stroke-width="1.2"/><circle cx="37" cy="16.5" r="2.6" fill="#0b0c0e" stroke="#fff" stroke-width="1.2"/></svg>';

  function mapa(sec) {
    if (sec.querySelector(":scope > .dhx-mapa")) return;
    var wh = [].slice.call(sec.querySelectorAll(".logi__wh > div")).map(function (el) {
      var b = el.querySelector("b"), s = el.querySelector("span");
      return { nazov: b ? b.textContent : "", adresa: s ? s.textContent : "" };
    });
    if (!wh.length) return; // sklady ešte nie sú vykreslené – skúsi sa pri ďalšej kontrole
    var del = sec.querySelector(".logi__del");
    var svg = '<svg class="dhx-mapa__svg" viewBox="0 0 ' + MW + " " + MH + '" width="' + MW + '" height="' + MH + '">' +
      '<path class="dhx-mapa__krajina" d="' + obrys(CZ) + '"/><path class="dhx-mapa__krajina dhx-mapa__krajina--sk" d="' + obrys(SK) + '"/>';
    var c = xy([15.3, 49.85]), s = xy([19.55, 48.62]);
    svg += '<text class="dhx-mapa__stat" x="' + c[0] + '" y="' + c[1] + '">ČESKO</text><text class="dhx-mapa__stat" x="' + s[0] + '" y="' + s[1] + '">SLOVENSKO</text>';
    TRASY.forEach(function (t) {
      svg += '<path class="dhx-mapa__trasa" d="' + trasa(t[0]) + '"/><path class="dhx-mapa__tok" style="--t:' + t[1] + "s;--d:" + t[2] + 's" pathLength="100" d="' + trasa(t[0]) + '"/>';
    });
    Object.keys(MESTA).forEach(function (k) {
      var p = xy(MESTA[k]);
      svg += '<circle class="dhx-mapa__mesto" cx="' + p[0] + '" cy="' + p[1] + '" r="3"/>';
    });
    Object.keys(SKLADY).forEach(function (k) {
      var p = xy(SKLADY[k]);
      svg += '<circle class="dhx-mapa__vlna" cx="' + p[0] + '" cy="' + p[1] + '" r="7"/><circle class="dhx-mapa__sklad" cx="' + p[0] + '" cy="' + p[1] + '" r="6"/>';
    });
    svg += "</svg>";
    var m = document.createElement("div");
    m.className = "dhx-mapa";
    m.style.width = MW + "px";
    m.style.height = MH + "px";
    var popis = function (i, k, cls) {
      var p = xy(SKLADY[k]);
      return wh[i] ? '<p class="dhx-mapa__popis ' + cls + '" style="left:' + p[0] + "px;top:" + p[1] + 'px"><b>' + wh[i].nazov + "</b><span>" + wh[i].adresa + "</span></p>" : "";
    };
    if (del) { var t = document.createElement("p"); t.className = "dhx-mapa__titul"; t.textContent = del.textContent; sec.appendChild(t); }
    m.innerHTML = svg +
      popis(0, "po", "dhx-mapa__popis--po") + popis(1, "cj", "dhx-mapa__popis--cj") +
      '<div class="dhx-mapa__kamion" style="offset-path:path(\'' + trasa(TRASY[0][0]) + "')\">" + KAMION + "</div>";
    sec.appendChild(m);
  }

  // ---- strana 2: líniová kresba (biela + červený akcent) – vozík vozí palety zo skladu do kamiónu ----
  var L = 'fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
  var LT = 'fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"';
  var R = 'fill="none" stroke="#de1f26" stroke-width="2" stroke-linecap="round"';
  function krabica(x, y) {
    return '<rect x="' + x + '" y="' + y + '" width="34" height="26" ' + L + '/><path d="M' + (x + 17) + "," + y + 'v26" ' + R + "/>";
  }
  function paleta(x, y) { return '<path d="M' + x + "," + y + "h80M" + x + "," + (y + 6) + "h80M" + (x + 4) + "," + y + "v6M" + (x + 40) + "," + y + "v6M" + (x + 76) + "," + y + 'v6" ' + L + "/>"; }
  function scena2() {
    // scéna len vľavo (šírka 940) – vpravo dole je na pozadí fotka s ľuďmi
    var s = '<svg class="dhx-nak__svg" viewBox="0 0 940 140" width="940" height="140">';
    // sklad: dva stohy paliet
    [20, 110].forEach(function (x) {
      s += paleta(x, 124) + krabica(x + 2, 98) + krabica(x + 42, 98) + krabica(x + 2, 72) + krabica(x + 42, 72);
    });
    s += krabica(112, 46);
    // kamión: náves s otvorenými dverami vzadu (vľavo), kabína vpravo
    s += '<g transform="translate(540,0)">' +
      '<rect x="0" y="22" width="300" height="92" ' + L + '/>' +
      '<path d="M0,22l-18,10v74l18,8" ' + L + '/>' +
      '<path d="M50,22v92M100,22v92M150,22v92M200,22v92M250,22v92" ' + LT + '/>' +
      '<path d="M8,104h284" ' + R + '/>' +
      '<text x="165" y="74" class="dhx-nak__logo">DAHA<tspan fill="#de1f26">X</tspan></text>' +
      krabica(14, 76) + krabica(14, 48) +
      '<path d="M300,40h44l26,30v44h-70" ' + L + '/><path d="M312,48h28l18,22h-46z" ' + L + '/>' +
      [44, 78, 214, 246, 346].map(function (cx) {
        return '<circle cx="' + cx + '" cy="122" r="12" fill="#0b0c0e" stroke="#fff" stroke-width="1.5"/><circle cx="' + cx + '" cy="122" r="4" ' + L + "/>";
      }).join("") + "</g>";
    // vozík (pohybuje sa medzi skladom a kamiónom)
    s += '<g class="dhx-nak__vozik">' +
      '<path d="M0,112v-34h46l10,-26h22v60" ' + L + '/>' +
      '<path d="M46,52v-30h36v30" ' + L + '/>' +
      '<path d="M88,18v104M94,18v104" ' + L + '/>' +
      '<path d="M94,120h40" ' + R + '/>' +
      '<g class="dhx-nak__naklad">' + krabica(98, 92) + "</g>" +
      '<circle cx="16" cy="120" r="10" fill="#0b0c0e" stroke="#fff" stroke-width="1.5"/><circle cx="64" cy="120" r="10" fill="#0b0c0e" stroke="#fff" stroke-width="1.5"/>' +
      "</g>";
    s += '<path d="M0,133H940" class="dhx-nak__cesta"/></svg>';
    return s;
  }
  function nakladka(sec) {
    if (sec.querySelector(":scope > .dhx-nak")) return;
    var n = document.createElement("div");
    n.className = "dhx-nak";
    n.setAttribute("aria-hidden", "true");
    n.innerHTML = scena2();
    sec.appendChild(n);
  }

  function kontrola() {
    STRANY.forEach(function (s) {
      document.querySelectorAll(s.sel).forEach(function (sec) { vloz(sec, s); });
    });
    document.querySelectorAll("section.s--title").forEach(vyzva);
    document.querySelectorAll("section.s:has(> .s__in.why)").forEach(nakladka);
    document.querySelectorAll("section.s:has(> .s__in.logi)").forEach(mapa);
    setTimeout(kontrola, 400);
  }
  kontrola();
})();
