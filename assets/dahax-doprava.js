/* DAHAX – strana 2 (Prečo DAHAX): vysokozdvižný vozík vozí palety z malého skladu DAHAX do kamiónu (stále otočený ku kamiónu, do skladu cúva), šofér paletu v návese odtiahne paletákom a na konci nasadne do kabíny; strana 3 (Doprava a sklad): dva rôzne realistické čierne kamióny DAHAX (typ Actros, bez značky výrobcu) idú po ceste dole na snímke.
   Vektorová ilustrácia: lesklý čierny lak s odleskom hrán, rebrá návesu, sklá s odrazom, chróm, svetlá, blatníky,
   pneumatiky s ráfikmi (točia sa), tieň. Skutočné logo DAHAX (img/logo/dahax-white.svg – biele s červeným X)
   len na návese / skrini, malé; súbor zostavuje scripts/zostav-doprava.mjs. 1) ťahač s návesom, 2) solo kamión.
   Idú zľava doprava (zo skladu k zákazníkovi) v kolóne so stálym odstupom. Štýly .dxd v dahax-uvod.css.
   Na zmeny čaká cez setTimeout (requestAnimationFrame v skrytom okne nebeží). */
(function () {
  var LOGO = '<path fill-rule="nonzero" fill="#FFFFFF" fill-opacity="1" d="M 224.410156 244.722656 C 220.574219 243.367188 216.515625 242.011719 212.453125 241.109375 L 212.453125 240.886719 L 212 240.886719 C 203.425781 239.078125 194.625 238.175781 185.824219 238.402344 L 96.695312 238.402344 L 96.695312 251.492188 L 190.113281 251.492188 C 198.460938 251.265625 207.035156 252.84375 214.707031 256.003906 C 221.253906 258.710938 226.667969 263.222656 230.503906 269.089844 C 233.210938 273.605469 235.015625 278.570312 235.695312 283.984375 C 235.921875 286.015625 235.921875 287.820312 235.921875 290.078125 C 235.921875 291.65625 235.921875 293.234375 235.695312 294.816406 C 235.242188 300.230469 233.4375 305.644531 230.503906 310.386719 C 226.667969 316.25 221.253906 320.992188 214.707031 323.472656 C 206.8125 326.632812 198.460938 328.210938 190.113281 327.984375 L 116.324219 327.761719 L 116.324219 259.839844 L 116.101562 260.066406 C 105.269531 260.066406 96.46875 268.867188 96.46875 279.695312 L 96.46875 342.203125 L 185.601562 342.203125 C 198.6875 342.425781 211.777344 340.394531 224.1875 336.109375 C 234.113281 332.722656 242.6875 326.40625 249.007812 318.28125 C 260.289062 301.359375 260.289062 279.246094 249.007812 262.546875 C 242.6875 254.199219 234.113281 248.105469 224.410156 244.722656 Z M 224.410156 244.722656 "/><path fill-rule="nonzero" fill="#FFFFFF" fill-opacity="1" d="M 359.800781 238.402344 L 341.523438 238.402344 C 336.558594 238.402344 331.820312 240.886719 329.113281 245.171875 L 267.511719 342.425781 L 289.625 342.425781 L 303.613281 319.410156 L 365.21875 319.410156 C 374.015625 319.410156 381.011719 312.414062 381.011719 303.617188 L 313.316406 303.617188 L 350.773438 242.238281 L 411.699219 342.652344 L 433.8125 342.652344 L 372.210938 245.398438 C 369.503906 241.109375 364.992188 238.402344 359.800781 238.402344 Z M 359.800781 238.402344 "/><path fill-rule="nonzero" fill="#FFFFFF" fill-opacity="1" d="M 451.722656 238.5 L 471.578125 238.5 L 471.578125 280.019531 L 451.722656 280.019531 Z M 451.722656 238.5 "/><path fill-rule="nonzero" fill="#FFFFFF" fill-opacity="1" d="M 587.335938 287.015625 L 482.183594 287.015625 C 465.261719 287.015625 451.722656 300.777344 451.722656 317.476562 L 451.722656 342.296875 L 471.578125 342.296875 L 471.578125 303.488281 L 587.5625 303.488281 L 587.5625 342.296875 L 607.417969 342.296875 L 607.417969 238.5 L 587.5625 238.5 L 587.5625 287.015625 Z M 587.335938 287.015625 "/><path fill-rule="nonzero" fill="#FFFFFF" fill-opacity="1" d="M 769.128906 342.425781 L 791.242188 342.425781 L 729.640625 245.171875 C 726.933594 240.886719 722.195312 238.402344 717.230469 238.402344 L 698.953125 238.402344 C 693.988281 238.402344 689.25 240.886719 686.542969 245.171875 L 624.9375 342.425781 L 647.054688 342.425781 L 661.042969 319.410156 L 722.644531 319.410156 C 731.445312 319.410156 738.441406 312.414062 738.441406 303.617188 L 670.746094 303.617188 L 708.203125 242.238281 Z M 769.128906 342.425781 "/><path fill-rule="nonzero" fill="#DE1F26" fill-opacity="1" d="M 869.996094 282.855469 C 873.378906 286.015625 873.605469 291.429688 870.21875 295.039062 C 870.21875 295.039062 869.996094 295.265625 869.996094 295.265625 L 821.253906 342.425781 L 794.628906 342.425781 L 852.167969 289.625 L 796.660156 238.628906 L 823.285156 238.628906 Z M 869.996094 282.855469 "/><path fill-rule="nonzero" fill="#DE1F26" fill-opacity="1" d="M 885.5625 282.855469 C 882.179688 286.015625 881.953125 291.429688 885.339844 294.816406 C 885.339844 294.816406 885.5625 295.039062 885.5625 295.039062 C 900.003906 309.03125 934.304688 342.203125 934.304688 342.203125 L 960.929688 342.203125 L 903.390625 289.398438 L 958.898438 238.402344 L 932.273438 238.402344 Z M 885.5625 282.855469 "/>';
  var logo = function (x, y, w) {
    return '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + (w * 107 / 867).toFixed(1) + '" viewBox="95 237 867 107">' + LOGO + "</svg>";
  };

  var DEFS =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    // lesklý čierny lak: svetlá hrana hore, hlboká čierna dole
    '<linearGradient id="dxr-lak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4f57"/><stop offset=".06" stop-color="#26292e"/><stop offset=".5" stop-color="#141518"/><stop offset=".92" stop-color="#08090a"/><stop offset="1" stop-color="#1b1d21"/></linearGradient>' +
    '<linearGradient id="dxr-lak-k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#565b63"/><stop offset=".1" stop-color="#2a2d32"/><stop offset=".55" stop-color="#131417"/><stop offset="1" stop-color="#060607"/></linearGradient>' +
    '<linearGradient id="dxr-odlesk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="dxr-sklo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6c7b8c"/><stop offset=".4" stop-color="#28323e"/><stop offset="1" stop-color="#0b0f14"/></linearGradient>' +
    '<linearGradient id="dxr-chrom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".45" stop-color="#b6bcc4"/><stop offset=".55" stop-color="#8a9099"/><stop offset="1" stop-color="#d9dde2"/></linearGradient>' +
    '<linearGradient id="dxr-cerv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0353c"/><stop offset="1" stop-color="#a8121a"/></linearGradient>' +
    '<radialGradient id="dxr-rafik" cx=".45" cy=".4" r=".62"><stop offset="0" stop-color="#eef1f4"/><stop offset=".55" stop-color="#a7aeb7"/><stop offset=".85" stop-color="#6b727b"/><stop offset="1" stop-color="#3f444b"/></radialGradient>' +
    '<linearGradient id="dxr-luc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff4cc" stop-opacity=".5"/><stop offset="1" stop-color="#fff4cc" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="dxr-tien" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".8"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
    "</defs></svg>";

  var f = function (n) { return n.toFixed(1); };
  // realistické koleso: pneumatika s bokom, chrómový ráfik so skrutkami a nábojom (točí sa .dxd-rot)
  var koleso = function (x, y, r) {
    var s = "";
    for (var i = 0; i < 8; i++) {
      var a = (i * Math.PI) / 4, rr = r * 0.33;
      s += '<circle cx="' + f(x + rr * Math.cos(a)) + '" cy="' + f(y + rr * Math.sin(a)) + '" r="' + f(r * 0.055) + '" fill="#3a3f46"/>';
    }
    return (
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#0c0c0d"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + f(r * 0.86) + '" fill="none" stroke="#1d1f22" stroke-width="' + f(r * 0.1) + '"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + f(r * 0.98) + '" fill="none" stroke="#2c2f34" stroke-width="1"/>' +
      '<g class="dxd-rot" style="transform-origin:' + x + "px " + y + 'px">' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + f(r * 0.6) + '" fill="url(#dxr-rafik)"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + f(r * 0.6) + '" fill="none" stroke="#50565e" stroke-width="1"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + f(r * 0.45) + '" fill="none" stroke="#7d848d" stroke-width=".8"/>' +
      s + '<circle cx="' + x + '" cy="' + y + '" r="' + f(r * 0.17) + '" fill="#2b2f35" stroke="#9aa1aa" stroke-width="1"/>' +
      '<rect x="' + f(x - r * 0.04) + '" y="' + f(y - r * 0.55) + '" width="' + f(r * 0.08) + '" height="' + f(r * 0.2) + '" fill="#fff" opacity=".35"/></g>'
    );
  };
  // blatník nad kolesom
  var blatnik = function (x, y, r) {
    return '<path d="M' + f(x - r - 5) + "," + f(y + 2) + " A" + f(r + 5) + "," + f(r + 5) + " 0 0 1 " + f(x + r + 5) + "," + f(y + 2) + '" fill="none" stroke="#050506" stroke-width="5"/>';
  };

  // mierka 30 px = 1 m (rozmery podľa nákladiakov typu Actros: náves 13,6 m, výška 4 m, kolesá Ø 1,05 m)
  // 1) ťahač 4×2 s návesom – 512 × 132, zem y = 128
  var KAMION =
    '<svg viewBox="0 0 512 132" width="512" height="132">' +
    '<ellipse cx="256" cy="128" rx="254" ry="6" fill="url(#dxr-tien)"/>' +
    '<path d="M503,84 L512,80 L512,96 L503,92 Z" fill="url(#dxr-luc)"/>' +
    // náves
    '<rect x="4" y="8" width="408" height="84" rx="2" fill="url(#dxr-lak)"/>' +
    '<path d="M44,10 V90 M84,10 V90 M124,10 V90 M164,10 V90 M204,10 V90 M244,10 V90 M284,10 V90 M324,10 V90 M364,10 V90" stroke="#000" stroke-width="1.1" opacity=".55"/>' +
    '<path d="M45,10 V90 M85,10 V90 M125,10 V90 M165,10 V90 M205,10 V90 M245,10 V90 M285,10 V90 M325,10 V90 M365,10 V90" stroke="#3a3e45" stroke-width=".7" opacity=".45"/>' +
    '<rect x="4" y="8" width="408" height="84" rx="2" fill="none" stroke="#3c4048" stroke-width="1"/>' +
    '<rect x="8" y="10" width="400" height="2.5" fill="url(#dxr-odlesk)"/>' +
    '<rect x="4" y="8" width="5" height="84" fill="#1e2024"/>' +
    logo(148, 42, 120) +
    '<rect x="4" y="84" width="408" height="2.5" fill="url(#dxr-cerv)"/>' +
    '<rect x="14" y="92" width="398" height="6" fill="#0a0a0b"/>' +
    '<rect x="160" y="96" width="150" height="4" rx="1" fill="url(#dxr-chrom)"/>' +
    '<rect x="328" y="96" width="4" height="20" fill="#26292e"/><rect x="324" y="114" width="12" height="2.5" rx="1" fill="#3a3e45"/>' +
    '<rect x="4" y="90" width="10" height="16" rx="1" fill="#111214"/><rect x="6" y="92" width="5" height="3" fill="#de1f26"/><rect x="6" y="97" width="5" height="2.5" fill="#f5a623"/>' +
    blatnik(60, 112, 16) + blatnik(97, 112, 16) + blatnik(134, 112, 16) +
    koleso(60, 112, 16) + koleso(97, 112, 16) + koleso(134, 112, 16) +
    // ťahač – podvozok, kryt nádrže medzi nápravami
    '<rect x="336" y="96" width="166" height="8" fill="#0a0a0b"/>' +
    '<rect x="384" y="96" width="66" height="18" rx="3" fill="url(#dxr-lak)"/>' +
    '<rect x="384" y="96" width="66" height="18" rx="3" fill="none" stroke="#3c4048" stroke-width="1"/>' +
    '<rect x="388" y="99" width="58" height="1.5" fill="#fff" opacity=".12"/>' +
    // aerodynamická klapka za kabínou
    '<path d="M428,14 L418,18 V90 L428,92 Z" fill="url(#dxr-lak-k)"/>' +
    '<path d="M418,18 V90" stroke="#3c4048" stroke-width="1"/>' +
    // kabína s vysokou strechou
    '<path d="M428,96 V18 Q428,11 436,11 L489,10 Q498,10 499,19 L503,92 V96 Z" fill="url(#dxr-lak-k)"/>' +
    '<path d="M428,96 V18 Q428,11 436,11 L489,10 Q498,10 499,19 L503,92 V96 Z" fill="none" stroke="#3c4048" stroke-width="1"/>' +
    '<path d="M432,14 Q462,11 492,12" fill="none" stroke="#fff" stroke-width="1.6" opacity=".2" stroke-linecap="round"/>' +
    '<rect x="440" y="8" width="5" height="2.5" rx="1" fill="#f5a623"/><rect x="458" y="7.5" width="5" height="2.5" rx="1" fill="#f5a623"/><rect x="476" y="7.5" width="5" height="2.5" rx="1" fill="#f5a623"/>' +
    '<path d="M455,27 Q455,24 459,24 H489 Q493,24 493,28 V57 H455 Z" fill="url(#dxr-sklo)"/>' +
    '<path d="M458,26 L472,26 L457,54 L455,54 Z" fill="#fff" opacity=".14"/>' +
    '<path d="M495,26 L499,26 L501,58 L496,58 Z" fill="url(#dxr-sklo)"/>' +
    '<rect x="487" y="19" width="15" height="4" rx="1" fill="#050506"/>' +
    '<path d="M449,22 V94" stroke="#000" stroke-width="1.2"/><path d="M450,22 V94" stroke="#34383e" stroke-width=".7"/>' +
    '<rect x="480" y="64" width="10" height="2.5" rx="1.2" fill="url(#dxr-chrom)"/>' +
    '<rect x="428" y="80" width="75" height="2.5" fill="url(#dxr-cerv)"/>' +
    '<path d="M500,30 H505" stroke="#0a0a0b" stroke-width="2"/><rect x="504" y="25" width="5" height="22" rx="2" fill="#0a0a0b"/>' +
    '<rect x="456" y="92" width="34" height="3" rx="1" fill="#16181b" stroke="#3c4048" stroke-width=".6"/>' +
    '<rect x="458" y="101" width="30" height="3" rx="1" fill="#16181b" stroke="#3c4048" stroke-width=".6"/>' +
    '<rect x="488" y="92" width="16" height="18" rx="2" fill="#0c0c0d"/>' +
    '<rect x="494" y="84" width="10" height="6" rx="1.5" fill="#fff6d2"/>' +
    '<rect x="495" y="80" width="8" height="1.5" rx=".7" fill="#fff" opacity=".85"/>' +
    blatnik(360, 112, 16) + blatnik(472, 112, 16) +
    koleso(360, 112, 16) + koleso(472, 112, 16) +
    "</svg>";

  // 2) solo kamión 4×2 so skriňou – 300 × 120, zem y = 116 (skriňa 6,8 m, kabína so štandardnou strechou)
  var SOLO =
    '<svg viewBox="0 0 300 120" width="300" height="120">' +
    '<ellipse cx="148" cy="116" rx="146" ry="5" fill="url(#dxr-tien)"/>' +
    '<path d="M288,76 L300,71 L300,88 L288,84 Z" fill="url(#dxr-luc)"/>' +
    '<rect x="4" y="10" width="204" height="74" rx="2" fill="url(#dxr-lak)"/>' +
    '<path d="M44,12 V82 M84,12 V82 M124,12 V82 M164,12 V82" stroke="#000" stroke-width="1.1" opacity=".55"/>' +
    '<rect x="4" y="10" width="204" height="74" rx="2" fill="none" stroke="#3c4048" stroke-width="1"/>' +
    '<rect x="8" y="12" width="196" height="2.5" fill="url(#dxr-odlesk)"/>' +
    logo(61, 40, 90) +
    '<rect x="4" y="76" width="204" height="2.5" fill="url(#dxr-cerv)"/>' +
    '<rect x="4" y="82" width="9" height="14" rx="1" fill="#111214"/><rect x="6" y="84" width="4" height="3" fill="#de1f26"/>' +
    '<rect x="12" y="88" width="274" height="7" fill="#0a0a0b"/>' +
    '<rect x="150" y="88" width="56" height="16" rx="3" fill="url(#dxr-lak)"/>' +
    '<rect x="150" y="88" width="56" height="16" rx="3" fill="none" stroke="#3c4048" stroke-width="1"/>' +
    '<path d="M216,88 V24 Q216,16 224,16 L270,15 Q279,15 280,24 L284,84 V88 Z" fill="url(#dxr-lak-k)"/>' +
    '<path d="M216,88 V24 Q216,16 224,16 L270,15 Q279,15 280,24 L284,84 V88 Z" fill="none" stroke="#3c4048" stroke-width="1"/>' +
    '<path d="M220,19 Q246,16 274,17" fill="none" stroke="#fff" stroke-width="1.5" opacity=".2" stroke-linecap="round"/>' +
    '<path d="M238,31 Q238,28 242,28 H271 Q275,28 275,32 V55 H238 Z" fill="url(#dxr-sklo)"/>' +
    '<path d="M241,30 L253,30 L240,52 L238,52 Z" fill="#fff" opacity=".14"/>' +
    '<path d="M277,30 L281,30 L282,56 L278,56 Z" fill="url(#dxr-sklo)"/>' +
    '<rect x="270" y="23" width="13" height="4" rx="1" fill="#050506"/>' +
    '<path d="M233,24 V86" stroke="#000" stroke-width="1.2"/>' +
    '<rect x="262" y="61" width="9" height="2.5" rx="1.2" fill="url(#dxr-chrom)"/>' +
    '<rect x="216" y="74" width="68" height="2.5" fill="url(#dxr-cerv)"/>' +
    '<path d="M281,32 H286" stroke="#0a0a0b" stroke-width="2"/><rect x="285" y="27" width="5" height="20" rx="2" fill="#0a0a0b"/>' +
    '<rect x="240" y="88" width="28" height="3" rx="1" fill="#16181b" stroke="#3c4048" stroke-width=".6"/>' +
    '<rect x="270" y="84" width="16" height="16" rx="2" fill="#0c0c0d"/>' +
    '<rect x="276" y="76" width="9" height="6" rx="1.5" fill="#fff6d2"/>' +
    blatnik(110, 100, 16) + blatnik(256, 100, 16) +
    koleso(110, 100, 16) + koleso(256, 100, 16) +
    "</svg>";

  var VOZIDLA = [
    ["dxd-v dxd-v--kamion", KAMION],
    ["dxd-v dxd-v--solo", SOLO]
  ];

  // ---------- strana 2 (Prečo DAHAX): vysokozdvižný vozík nakladá 10 paliet do kamiónu, kamión odíde na rozvoz ----------
  // vysokozdvižný vozík DAHAX (červený), 112 × 96, zem y = 92, vidlica vpravo; vidlica (.dxn-vidly) sa zdvíha
  var VOZIK =
    '<svg viewBox="0 0 112 96" width="112" height="96">' +
    '<ellipse cx="56" cy="92" rx="54" ry="4" fill="url(#dxr-tien)"/>' +
    '<rect x="66" y="4" width="7" height="80" rx="1" fill="#2a2d32"/><rect x="67" y="4" width="1.5" height="80" fill="#5a5f67"/>' +
    '<g class="dxn-vidly"><rect x="72" y="62" width="5" height="28" rx="1" fill="#1a1c20"/>' +
    '<rect x="74" y="88" width="35" height="3.5" rx="1" fill="#3a3e45"/><rect x="74" y="88" width="35" height="1" fill="#7a818a"/></g>' +
    '<path d="M6,82 V52 Q6,44 14,44 H52 L61,62 V82 Z" fill="url(#dxr-cerv)"/>' +
    '<path d="M8,50 Q8,46 13,46 H50" fill="none" stroke="#fff" stroke-width="1.5" opacity=".35"/>' +
    '<path d="M6,70 H61" stroke="#7a0b10" stroke-width="1.2"/>' +
    '<path d="M18,44 L24,9 H62 L66,60" fill="none" stroke="#15171a" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<rect x="22" y="6" width="44" height="4" rx="1" fill="#15171a"/><rect x="40" y="2.5" width="6" height="3.5" rx="1" fill="#f5a623"/>' +
    '<path d="M28,44 V34 Q28,30 32,30 H38 V44 Z" fill="#101113"/>' +
    '<circle cx="45" cy="23" r="5.5" fill="#2f3339"/><path d="M40,22 Q45,15 50,22" fill="#de1f26"/>' +
    '<path d="M38,44 V33 Q38,29 42,29 H48 Q51,29 52,33 L55,44 Z" fill="#1f2227"/><rect x="39" y="36" width="14" height="2" fill="#d7dbe0" opacity=".8"/>' +
    '<path d="M52,37 L59,41" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>' +
    '<rect x="58" y="64" width="5" height="4" rx="1" fill="#fff6d2"/>' +
    koleso(18, 84, 8) + koleso(55, 82, 10) +
    "</svg>";
  // paleta s tovarom (kartóny, fólia), 40 × 46, spodok y = 46
  var PALETA =
    '<svg viewBox="0 0 40 46" width="40" height="46">' +
    '<rect x="1" y="39" width="38" height="7" fill="#7b5a34"/><rect x="1" y="39" width="38" height="1.5" fill="#a17a4b"/>' +
    '<rect x="3" y="42" width="6" height="4" fill="#3b2a17"/><rect x="17" y="42" width="6" height="4" fill="#3b2a17"/><rect x="31" y="42" width="6" height="4" fill="#3b2a17"/>' +
    '<rect x="2" y="5" width="36" height="34" fill="#b98b55"/>' +
    '<path d="M2,16 H38 M2,27 H38 M14,5 V16 M26,16 V27 M14,27 V39" stroke="#8c6438" stroke-width="1"/>' +
    '<rect x="2" y="5" width="36" height="3" fill="#d2a46b"/>' +
    '<rect x="2" y="20" width="36" height="2.5" fill="#de1f26" opacity=".85"/>' +
    '<path d="M4,7 L12,37" stroke="#fff" stroke-width="2" opacity=".16"/>' +
    "</svg>";

  // malý sklad DAHAX (bočný pohľad), 300 × 140, zem y = 140; brána vpravo (x 160–285) – vozík do nej cúvne a zmizne vnútri.
  // SKLAD_DNU = tmavý interiér s regálom (za vozíkom), SKLAD = fasáda s otvorom brány (pred vozíkom)
  var SKLAD_DNU =
    '<svg viewBox="0 0 300 140" width="300" height="140">' +
    '<rect x="160" y="34" width="125" height="106" fill="#0a0b0d"/>' +
    '<ellipse cx="222" cy="40" rx="48" ry="10" fill="#fff4cc" opacity=".08"/><rect x="212" y="34" width="20" height="3" rx="1" fill="#fff4cc" opacity=".55"/>' +
    '<path d="M168,52 V140 M206,52 V140" stroke="#3a3e45" stroke-width="3"/><path d="M166,96 H208 M166,138 H208" stroke="#a8121a" stroke-width="3"/>' +
    '<svg x="170" y="58" width="34" height="39" viewBox="0 0 40 46" opacity=".7">' + "__PALETA__" + "</svg>" +
    '<rect x="160" y="136" width="125" height="4" fill="#15171a"/>' +
    "</svg>";
  var SKLAD =
    '<svg viewBox="0 0 300 140" width="300" height="140">' +
    '<defs><linearGradient id="dxr-brana" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".78"/><stop offset=".6" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient></defs>' +
    '<ellipse cx="150" cy="138" rx="160" ry="5" fill="url(#dxr-tien)"/>' +
    // strecha s miernym sklonom a hranou
    '<path d="M0,24 L150,6 L300,24 V30 H0 Z" fill="#1d2025"/><path d="M0,24 L150,6 L300,24" fill="none" stroke="#5a5f67" stroke-width="1.2"/>' +
    // stena z trapézového plechu s otvorom brány
    '<path d="M6,30 H294 V140 H285 V34 H160 V140 H6 Z" fill="url(#dxr-lak)"/>' +
    '<path d="' + (function () { var s = ""; for (var x = 14; x < 160; x += 8) s += "M" + x + ",32 V140 "; for (var y = 290; y > 285; y -= 8) s += "M" + y + ",32 V140 "; return s; })() + '" stroke="#000" stroke-width="1" opacity=".45"/>' +
    '<path d="M6,30 H294" stroke="#fff" stroke-width="1" opacity=".18"/>' +
    // brána: rám, zvinutá rolovacia brána hore, tieň dovnútra
    '<rect x="160" y="34" width="125" height="106" fill="url(#dxr-brana)"/>' +
    '<rect x="157" y="30" width="131" height="6" rx="1" fill="#2a2d32"/><path d="M160,36 V140 M285,36 V140" stroke="#3a3e45" stroke-width="3"/>' +
    '<path d="M160,140 V128 M285,140 V128" stroke="#f5a623" stroke-width="3" stroke-dasharray="3 3"/>' +
    '<rect x="288" y="70" width="4" height="7" rx="1" fill="#de1f26"/>' +
    // logo DAHAX a červená linka
    logo(26, 52, 108) + '<rect x="26" y="74" width="108" height="2" fill="#de1f26"/>' +
    '<text x="80" y="94" fill="#fff" fill-opacity=".7" font-family="Montserrat,Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="3" text-anchor="middle">SKLAD</text>' +
    '<rect x="6" y="132" width="154" height="8" fill="#0b0c0e" opacity=".8"/>' +
    "</svg>";

  // šofér (bočný pohľad, otočený doľava k palete), 50 × 54, spodok y = 54; vľavo oje paletového vozíka (.dxn-oje)
  // vedie k pravej hrane palety – vidlice paletáka sú pod paletou
  var SOFER =
    '<svg viewBox="0 0 50 54" width="50" height="54">' +
    '<path class="dxn-oje" d="M27,28 L2,50" stroke="#3a3e45" stroke-width="2.6" stroke-linecap="round"/>' +
    '<g class="dxn-postava">' +
    '<rect class="dxn-noha" x="36" y="33" width="5" height="19" rx="2" fill="#15171a"/>' +
    '<rect class="dxn-noha dxn-noha--2" x="31" y="33" width="5" height="19" rx="2" fill="#23262b"/>' +
    '<path d="M29,52 H36 V54 H28 Z M34,52 H41 V54 H33 Z" fill="#0b0c0e"/>' +
    '<rect x="29" y="14" width="14" height="21" rx="3" fill="#de1f26"/>' +
    '<rect x="29" y="25" width="14" height="2.4" fill="#d7dbe0"/><rect x="29" y="30" width="14" height="1.6" fill="#d7dbe0" opacity=".7"/>' +
    '<path d="M32,17 L27,28" stroke="#2a2d32" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="36" cy="8" r="5.5" fill="#d9a77f"/>' +
    '<path d="M30.5,7 Q36,0 41.5,7 Z" fill="#15171a"/><path d="M31,7 H26.5" stroke="#15171a" stroke-width="2" stroke-linecap="round"/>' +
    "</g></svg>";

  // geometria scény (px, zem = spodok 6 px): sklad vľavo, kamión hneď vedľa (zadnou časťou k bráne skladu)
  var ZEM = 6, SKLAD_X = 120, KAMION_X = 660, PODLAHA = ZEM + 37;
  var VIDLA = 8;             // vrch vidlice nad spodkom vozíka pri spustenej vidlici (paleta sedí 5 px pod vrchom – vidlica je v medzere palety)
  var POCET = 10;
  var VNUTRI = SKLAD_X + 20;          // vozík celý za stenou skladu (nie je ho vidno)
  var ZADOK = KAMION_X + 4 - 111;     // vozík pri zadných dverách návesu (vidlica končí pri zadnej hrane)
  var CAKA = ZADOK - 40;              // vozík čaká pred kamiónom
  // miesta v návese (súradnice kamiónu): od kabíny dozadu, paleta 40 px, podlaha 40 px nad spodkom kamiónu
  var MIESTO = function (k) { return 408 - 40 * (k + 1); };
  var ZLOZI = ZADOK + 98 - KAMION_X;  // kde vozík položí paletu v návese (pri zadných dverách)
  var STOJI = ZLOZI + 40;             // šofér čaká s paletákom hneď pred ňou (oje pri hrane palety)
  var DVERE = 440;                    // dvere kabíny (súradnice kamiónu)
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function vlozNakladku(sec) {
    if (sec.querySelector(":scope > .dxn")) return;
    var d = document.createElement("div");
    d.className = "dxn";
    d.setAttribute("aria-hidden", "true");
    var vnutri = "";
    for (var k = 0; k < POCET; k++) vnutri += '<div class="dxn-in" style="left:' + MIESTO(k) + 'px">' + PALETA + "</div>";
    d.innerHTML = DEFS + '<div class="dxd-cesta"></div>' +
      '<div class="dxn-sklad dxn-sklad--dnu" style="left:' + SKLAD_X + 'px">' + SKLAD_DNU.replace("__PALETA__", PALETA.replace(/^<svg[^>]*>|<\/svg>$/g, "")) + "</div>" +
      '<div class="dxn-vozik"><div class="dxn-naklad">' + PALETA + "</div>" + VOZIK + "</div>" +
      '<div class="dxn-sklad" style="left:' + SKLAD_X + 'px">' + SKLAD + "</div>" +
      '<div class="dxn-kamion" style="left:' + KAMION_X + 'px">' + vnutri + '<div class="dxn-sofer">' + SOFER + "</div>" + KAMION + "</div>";
    sec.appendChild(d);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) nakladaj(d);
    else {
      d.querySelector(".dxn-vozik").style.left = CAKA + "px";
      d.querySelector(".dxn-sofer").style.left = STOJI + "px";
      [].slice.call(d.querySelectorAll(".dxn-in")).slice(0, 4).forEach(function (q) { q.style.visibility = "visible"; });
    }
  }

  // postup nakladania – riadi ho časovač, prechody (transition) robí CSS; vozík je stále otočený vidlicou ku kamiónu
  // (do skladu cúva, von ide dopredu s paletou), pokojné tempo ~15 s na paletu
  async function nakladaj(d) {
    var voz = d.querySelector(".dxn-vozik"), vidly = voz.querySelector(".dxn-vidly"), naklad = voz.querySelector(".dxn-naklad");
    var kam = d.querySelector(".dxn-kamion");
    var vnutri = [].slice.call(d.querySelectorAll(".dxn-in"));
    var zive = function () { return d.isConnected; };
    // šofér: x = ľavý okraj (oje), hore = v návese / dole na zemi, ide = kráča, taha = drží paleták, vpravo = otočený ku kabíne
    var sof = d.querySelector(".dxn-sofer");
    var krok = function (ms, o) {
      sof.style.transitionDuration = ms + "ms";
      if ("x" in o) sof.style.left = o.x + "px";
      if ("hore" in o) sof.style.bottom = (o.hore ? 40 : 2) + "px";
      ["ide", "taha", "vpravo", "dole"].forEach(function (k) { if (k in o) sof.classList.toggle("is-" + k, !!o[k]); });
      if ("vidno" in o) sof.style.opacity = o.vidno ? 1 : 0;
      return wait(ms + 60);
    };
    // odtiahne paletu q z miesta pri dverách na jej miesto v návese a vráti sa k dverám
    var tahaj = async function (q, ciel) {
      var ms = Math.max(900, (ciel - ZLOZI) * 16);
      await krok(500, { taha: true });
      q.style.transition = "left " + ms + "ms ease-in-out";
      q.style.left = ciel + "px";
      await krok(ms, { x: ciel + 40, ide: true });
      await krok(600, { taha: false, ide: false });
      if (ciel > ZLOZI + 4) await krok(Math.max(700, (ciel - ZLOZI) * 11), { x: STOJI, ide: true });
      await krok(0, { ide: false });
    };
    // vystúpi z kabíny, prejde k zadným dverám a vylezie do návesu
    var nastup = async function () {
      await krok(0, { x: DVERE, hore: false, dole: true, vpravo: false, vidno: false });
      await krok(500, { vidno: true });
      await krok(4200, { x: -6, ide: true });
      await krok(700, { hore: true, ide: false });
      await krok(0, { dole: false });
      await krok(1300, { x: STOJI, ide: true });
      await krok(0, { ide: false });
    };
    // zoskočí z návesu, prejde ku kabíne a nasadne
    var odchod = async function () {
      await krok(1100, { x: -6, ide: true });
      await krok(0, { dole: true });
      await krok(700, { hore: false, ide: false, vpravo: true });
      await krok(4200, { x: DVERE, ide: true });
      await krok(500, { ide: false, vidno: false });
    };
    var sofer = nastup();
    // pohyb vozíka: x = ľavý okraj, zdvih = px
    var stav = { x: CAKA, zdvih: 0 };
    var nastav = function (ms, o) {
      for (var k in o) stav[k] = o[k];
      voz.style.transitionDuration = ms + "ms";
      vidly.style.transitionDuration = naklad.style.transitionDuration = ms + "ms";
      voz.style.left = stav.x + "px";
      vidly.style.transform = "translateY(" + -stav.zdvih + "px)";
      naklad.style.bottom = VIDLA - 5 + stav.zdvih + "px";
      return wait(ms + 80);
    };
    nastav(0, {});
    while (zive()) {
      for (var i = 0; i < POCET && zive(); i++) {
        // cúvne do skladu, vnútri naberie paletu (nie je ho vidno) a vyjde dopredu ku kamiónu
        await nastav(3600, { x: VNUTRI });
        await wait(1400);
        naklad.style.visibility = "visible";
        await nastav(700, { zdvih: 4 });
        await nastav(3800, { x: ZADOK });
        // zdvihnúť na výšku podlahy a zasunúť zadnými dverami do návesu
        await nastav(1200, { zdvih: PODLAHA + 1 - ZEM - (VIDLA - 5) });
        await sofer;   // šofér musí byť späť pri dverách
        await nastav(800, { x: ZADOK + 26 });
        // paleta je v návese (za polopriehľadnou bočnicou), šofér ju odtiahne paletákom na jej miesto
        naklad.style.visibility = "hidden";
        var q = vnutri[i];
        q.style.transition = "none";
        q.style.left = ZLOZI + "px";
        q.style.visibility = "visible";
        void q.offsetWidth;
        await nastav(1100, { x: CAKA });
        sofer = tahaj(q, MIESTO(i));
        await nastav(900, { zdvih: 0 });
      }
      if (!zive()) return;
      // plný kamión odchádza na rozvoz aj s nákladom (pokračuje na snímke 3), vozík čaká v bráne skladu
      await nastav(2600, { x: SKLAD_X + 150 });
      await sofer;
      await odchod();
      kam.classList.add("is-odchod");
      await wait(9600);
      // reset: nový prázdny kamión cúva k skladu
      kam.classList.remove("is-odchod");
      vnutri.forEach(function (q) { q.style.transition = "none"; q.style.visibility = "hidden"; });
      kam.classList.add("is-prichod");
      await wait(8400);
      kam.classList.remove("is-prichod");
      sofer = nastup();
    }
  }

  function vloz(sec) {
    if (sec.querySelector(":scope > .dxd")) return;
    var d = document.createElement("div");
    d.className = "dxd";
    d.setAttribute("aria-hidden", "true");
    var html = DEFS + '<div class="dxd-cesta"></div>';
    VOZIDLA.forEach(function (v) { html += '<div class="' + v[0] + '">' + v[1] + "</div>"; });
    d.innerHTML = html;
    sec.appendChild(d);
  }

  function kontrola() {
    // strana 2: nakladanie s čiernym kamiónom (.dxn); strana 3 má mapu v dahax-uvod.js – scéna .dxd sa nevkladá
    document.querySelectorAll("section.s:has(> .s__in.why)").forEach(vlozNakladku);
    if (window.__dxDopravaScény) document.querySelectorAll("section.s:has(> .s__in.logi)").forEach(vloz);
    setTimeout(kontrola, 400);
  }
  kontrola();
})();
