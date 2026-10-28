/* DAHAX INTERACTIVE – service worker.
   Dve offline pamäte:
   - „dahax-<VERSION>“ – aplikácia, obsah, obrázky (FILES); pri novej verzii sa stiahne celá, je malá,
   - „dahax-media“ – PDF a videá (MEDIA: cesta → [veľkosť, odtlačok]); trvalá, bez verzie. Plní sa len
     v offline režime (nainštalovaná aplikácia alebo tlačidlo „Stiahnuť pre offline“ v nastaveniach)
     a pri aktualizácii sa doťahujú iba nové a zmenené súbory. Na bežnom webe sa PDF a videá otvárajú
     zo siete na požiadanie a nič veľké sa neukladá.
   content.json a index.html: najprv sieť, pri výpadku uložená verzia.
   Písma z Google Fonts sa uložia pri prvom online spustení. */
const VERSION = "2026-10-28-nexler-realne";
const PRECACHE = "dahax-" + VERSION;
const RUNTIME = "dahax-runtime";
const MEDIA_CACHE = "dahax-media";
// OFFLINE_MEDIA = false (27. 10. 2026, aplikácia len z webu): PDF, videá a fotky predajní sa nikdy neukladajú do tabletu –
// idú vždy zo siete, „dahax-media“ sa pri aktivácii zmaže a správa „dahax-offline-on“ sa ignoruje. Vrátiť: true
// (a LEN_WEB = false v assets/dahax-verzia.js). Malá pamäť aplikácie (FILES) ostáva kvôli rýchlemu štartu a aktualizácii.
const OFFLINE_MEDIA = false;
const MODE_KEY = "__dahax-offline"; // značka v dahax-media: offline režim zapnutý
const FILES = ["./","assets/dahax-cislo.js","assets/dahax-doprava.js","assets/dahax-dotyk.js","assets/dahax-katalog.js","assets/dahax-lista.js","assets/dahax-realizacie.js","assets/dahax-stav.js","assets/dahax-upravy-1.css","assets/dahax-upravy-2.css","assets/dahax-upravy-3.css","assets/dahax-uvod.css","assets/dahax-uvod.js","assets/dahax-verzia.js","assets/dahax-video.js","assets/main-DHX26P13.js","assets/main-FOM7FDNB.css","content/content.json","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/icon.svg","img/brand/bauder.webp","img/brand/dkmont-logo-tmave.webp","img/brand/dkmont.webp","img/brand/hoch-xps.webp","img/brand/izovat.webp","img/brand/klimas-35.svg","img/brand/klimas-logo-biele.svg","img/brand/klimas.webp","img/brand/knauf.webp","img/brand/koda.webp","img/brand/nexler.webp","img/brand/paroc.webp","img/brand/polyform.webp","img/brand/saint-gobain.webp","img/brand/styroprofile.webp","img/brand/styrotrade.webp","img/brand/synthos-logo.svg","img/brand/tile-holcim.webp","img/brand/tile-synthos.webp","img/klimas/banery/baner-1.webp","img/klimas/banery/baner-2.webp","img/klimas/banery/baner-3.webp","img/klimas/banery/baner-4.webp","img/klimas/banery/baner-5.webp","img/klimas/banery/baner-6.webp","img/klimas/banery/baner-7.webp","img/klimas/doplnky/panel-drevo-konstrukcie.webp","img/klimas/doplnky/panel-drevo-podklady.webp","img/klimas/doplnky/panel-etics-natlkacie.webp","img/klimas/doplnky/panel-etics-skrutkovacie.webp","img/klimas/doplnky/panel-klinove-kotvy.webp","img/klimas/doplnky/panel-ramove-univerzalne.webp","img/klimas/kategorie/elektricke-upevnovacie-prvky.webp","img/klimas/kategorie/chemicke-kotviace-systemy.webp","img/klimas/kategorie/mechanicke-kotvy.webp","img/klimas/kategorie/metricke-skrutky-skrutky-podlozky.webp","img/klimas/kategorie/nastenne-tepelnoizolacne-fixacne-systemy.webp","img/klimas/kategorie/pasky-a-filmy.webp","img/klimas/kategorie/prislusenstvo-pre-elektricke-naradie.webp","img/klimas/kategorie/ramove-upevnenia.webp","img/klimas/kategorie/skrutky-a-spojovaci-material-pre-drevene-konstrukcie.webp","img/klimas/kategorie/skrutky-a-spojovaci-material-pre-stolarstvo.webp","img/klimas/kategorie/skrutky-do-betonu.webp","img/klimas/kategorie/stavebne-chemikalie.webp","img/klimas/kategorie/upevnovacie-prvky-v-technologii-sadrokartonu.webp","img/klimas/kategorie/upevnovacie-systemy-na-tepelnu-izolaciu-a-hydroizolaciu-plochych-striech.webp","img/klimas/kategorie/upevnovacie-systemy-pre-lahke-byvanie.webp","img/klimas/kategorie/vodovodne-a-sanitarne-zariadenia.webp","img/klimas/produkty/klimas-eco-drive-8.webp","img/klimas/produkty/klimas-kdh.webp","img/klimas/produkty/klimas-kgd.webp","img/klimas/produkty/klimas-kpr-fast-k.webp","img/klimas/produkty/klimas-kps-fast-s.webp","img/klimas/produkty/klimas-le-zn.webp","img/klimas/produkty/klimas-lfmg-10.webp","img/klimas/produkty/klimas-lfn-10.webp","img/klimas/produkty/klimas-lino-13.webp","img/klimas/produkty/klimas-lsi.webp","img/klimas/produkty/klimas-pmpg.webp","img/klimas/produkty/klimas-sfxp.webp","img/klimas/produkty/klimas-thermodrive-v2-8.webp","img/klimas/produkty/klimas-urg.webp","img/klimas/produkty/klimas-wfd.webp","img/klimas/produkty/klimas-wkcp.webp","img/klimas/produkty/klimas-wkch.webp","img/klimas/produkty/klimas-wktherm-s-8.webp","img/klimas/produkty/klimas-ws.webp","img/logo/dahax-ink.svg","img/logo/dahax-mono-white.svg","img/logo/dahax-white.svg","img/photo/dahax-bg-1-linie.webp","img/photo/dahax-bg-2-linie.webp","img/photo/dahax-bg-2.webp","img/photo/dahax-bg-3-linie.webp","img/photo/dahax-bg-3.webp","img/photo/hero-bg.webp","img/photo/holcim-roof.webp","img/photo/regal-01.webp","img/photo/regal-02.webp","img/photo/regal-03.webp","img/photo/regal-04.webp","img/photo/regal-05.webp","img/photo/regal-06.webp","img/product/dkmont-profily.webp","img/product/dkmont-zaves-01.webp","img/product/dkmont-zaves-02.webp","img/product/holcim-pro-facade-35.webp","img/product/izovat-fasad.webp","img/product/izovat-strecha-skladba.webp","img/product/klimas-beton.webp","img/product/klimas-eco-drive-w-8.webp","img/product/klimas-lfmg-10.webp","img/product/klimas-thermodrive-v2-8.webp","img/product/klimas-wkcr.webp","img/product/klimas-wkcs.webp","img/product/klimas-wkpc.webp","img/product/profifix-skrutky.webp","img/product/styro-xps.webp","img/sortiment/bauder-asfaltove-pasy.webp","img/sortiment/holcim-balenie.webp","img/sortiment/izovat-podkrovia-a-pricky.webp","img/sortiment/izovat-podlahy.webp","img/sortiment/klimas-thermodrive-v2.webp","img/sortiment/polyform-spadove-strechy.webp","img/sortiment/polyform-variant-haus.webp","img/sortiment/styrotrade-fasady-etics.webp","img/sortiment/styrotrade-strechy-podlahy.webp","img/sortiment/styrotrade-styro-xps.webp","img/sortiment/styrotrade-styrofloor.webp","img/sortiment/synthos-hrube-dosky-tb.webp","img/sortiment/synthos-pouzitie-a-zataz.webp","manifest.webmanifest","vendor/pdfjs/LICENSE.txt","vendor/pdfjs/pdf.min.mjs","vendor/pdfjs/pdf.worker.min.mjs","img/brand/holcim-biele.svg","img/holcim/holcim-dom-fasada.webp","img/holcim/holcim-hala-strecha.webp","img/holcim/holcim-test-ohen.webp","img/holcim/holcim-test-voda.webp","img/holcim/holcim-vyroba-balenie.webp","img/holcim/holcim-vyroba-kamen.webp","img/holcim/holcim-zavod.webp","img/holcim/holcim-balik-fasada.webp","img/holcim/holcim-paleta-strecha.webp","img/klimas/klimas-logo-cervene.svg","assets/dahax-etics.css","assets/dahax-etics.js","img/klimas/etics/podklad-a.webp","img/klimas/etics/podklad-b.webp","img/klimas/etics/podklad-c.webp","img/klimas/etics/podklad-d.webp","img/klimas/etics/podklad-e.webp","img/klimas/etics-top/foto-lfmg.webp","img/klimas/etics-top/foto-thermodrive.webp","img/klimas/etics-top/foto-wktherm.webp","img/klimas/etics-top/thermodrive-montaz-1.webp","img/klimas/etics-top/thermodrive-montaz-2.webp","img/klimas/etics-top/thermodrive-montaz-3.webp","img/klimas/etics-top/kotva-lfmg-10.webp","img/klimas/etics-top/kotva-thermodrive-v2-8.webp","img/klimas/etics-top/kotva-wktherm-s-8.webp","img/izovat/izovat-fasady-zostava.webp","img/izovat/izovat-strechy-zostava.webp","img/klimas/etics-top/lfmg-10-360/00.webp","img/klimas/etics-top/lfmg-10-360/01.webp","img/klimas/etics-top/lfmg-10-360/02.webp","img/klimas/etics-top/lfmg-10-360/03.webp","img/klimas/etics-top/lfmg-10-360/04.webp","img/klimas/etics-top/lfmg-10-360/05.webp","img/klimas/etics-top/lfmg-10-360/06.webp","img/klimas/etics-top/lfmg-10-360/07.webp","img/klimas/etics-top/lfmg-10-360/08.webp","img/klimas/etics-top/lfmg-10-360/09.webp","img/klimas/etics-top/lfmg-10-360/10.webp","img/klimas/etics-top/lfmg-10-360/11.webp","img/klimas/etics-top/lfmg-10-360/12.webp","img/klimas/etics-top/lfmg-10-360/13.webp","img/klimas/etics-top/lfmg-10-360/14.webp","img/klimas/etics-top/lfmg-10-360/15.webp","img/klimas/etics-top/lfmg-10-360/16.webp","img/klimas/etics-top/lfmg-10-360/17.webp","img/klimas/etics-top/lfmg-10-360/18.webp","img/klimas/etics-top/lfmg-10-360/19.webp","img/klimas/etics-top/lfmg-10-360/20.webp","img/klimas/etics-top/lfmg-10-360/21.webp","img/klimas/etics-top/lfmg-10-360/22.webp","img/klimas/etics-top/lfmg-10-360/23.webp","img/klimas/etics-top/lfmg-10-360/24.webp","img/klimas/etics-top/lfmg-10-360/25.webp","img/klimas/etics-top/lfmg-10-360/26.webp","img/klimas/etics-top/lfmg-10-360/27.webp","img/klimas/etics-top/lfmg-10-360/28.webp","img/klimas/etics-top/lfmg-10-360/29.webp","img/klimas/etics-top/lfmg-10-360/30.webp","img/klimas/etics-top/lfmg-10-360/31.webp","img/klimas/etics-top/lfmg-10-360/32.webp","img/klimas/etics-top/lfmg-10-360/33.webp","img/klimas/etics-top/lfmg-10-360/34.webp","img/klimas/etics-top/lfmg-10-360/35.webp","img/klimas/etics-top/lfmg-10-360/36.webp","img/klimas/etics-top/lfmg-10-360/37.webp","img/klimas/etics-top/lfmg-10-360/38.webp","img/klimas/etics-top/lfmg-10-360/39.webp","img/klimas/etics-top/lfmg-10-360/40.webp","img/klimas/etics-top/lfmg-10-360/41.webp","img/klimas/etics-top/lfmg-10-360/42.webp","img/klimas/etics-top/lfmg-10-360/43.webp","img/klimas/etics-top/lfmg-10-360/44.webp","img/klimas/etics-top/lfmg-10-360/45.webp","img/klimas/etics-top/lfmg-10-360/46.webp","img/klimas/etics-top/lfmg-10-360/47.webp","img/klimas/etics-top/lfmg-10-360/48.webp","img/klimas/etics-top/lfmg-10-360/49.webp","img/klimas/etics-top/lfmg-10-360/50.webp","img/klimas/etics-top/lfmg-10-360/51.webp","img/klimas/etics-top/lfmg-10-360/52.webp","img/klimas/etics-top/lfmg-10-360/53.webp","img/klimas/etics-top/lfmg-10-360/54.webp","img/klimas/etics-top/lfmg-10-360/55.webp","img/klimas/etics-top/lfmg-10-360/56.webp","img/klimas/etics-top/lfmg-10-360/57.webp","img/klimas/etics-top/lfmg-10-360/58.webp","img/klimas/etics-top/lfmg-10-360/59.webp","img/klimas/etics-top/lfmg-10-360/60.webp","img/klimas/etics-top/lfmg-10-360/61.webp","img/klimas/etics-top/lfmg-10-360/62.webp","img/klimas/etics-top/lfmg-10-360/63.webp","img/klimas/etics-top/lfmg-10-360/64.webp","img/klimas/etics-top/lfmg-10-360/65.webp","img/klimas/etics-top/lfmg-10-360/66.webp","img/klimas/etics-top/lfmg-10-360/67.webp","img/klimas/etics-top/lfmg-10-360/68.webp","img/klimas/etics-top/lfmg-10-360/69.webp","img/klimas/etics-top/lfmg-10-360/70.webp","img/klimas/etics-top/lfmg-10-360/71.webp","img/klimas/etics-top/lfmg-10-360/72.webp","img/klimas/etics-top/lfmg-10-360/73.webp","img/klimas/etics-top/lfmg-10-360/74.webp","img/klimas/etics-top/lfmg-10-360/75.webp","img/klimas/etics-top/lfmg-10-360/76.webp","img/klimas/etics-top/lfmg-10-360/77.webp","img/klimas/etics-top/lfmg-10-360/78.webp","img/klimas/etics-top/lfmg-10-360/79.webp","img/brand/synthos-biele.svg","img/synthos/synthos-areal.webp","img/synthos/synthos-mapa-zavody.webp","img/synthos/synthos-xps-prime-d.webp","img/synthos/synthos-xps-prime-g.webp","img/synthos/synthos-xps-prime-s.webp","img/synthos/synthos-xps-rezanie.webp","img/synthos/synthos-xps-zaklady.webp","img/synthos/synthos-zavod.webp","img/styrotrade/styro-xps-zostava.webp","img/holcim/holcim-ikona-a1.svg","img/holcim/holcim-ikona-hydrofobna.svg","img/holcim/holcim-ikona-paropriepustna.svg","img/sortiment/polyform-strechy-zostava.webp","img/brand/polyform-cervene.webp","assets/dahax-plavajuce.css","assets/dahax-plavajuce.js","img/dkmont/hmozdinka-klinova.webp","img/dkmont/hmozdinka-natlkacia.webp","img/dkmont/nonius.webp","img/dkmont/paska-profifix.webp","img/dkmont/profily.webp","img/dkmont/skrutky-profifix.webp","img/dkmont/spojka.webp","img/dkmont/tmel-profifix.webp","img/dkmont/zaves-cd-special.webp","img/dkmont/zaves-cd.webp","img/dkmont/zaves-krokvovy.webp","img/dkmont/plagat-profifix-sdk-system.webp","img/brand/dkmont-logo-biele.webp","img/brand/knauf-biele.webp","img/brand/saint-gobain-weber-biele.webp","img/saint-gobain/saint-gobain-fasada-zeleny-haj.webp","img/saint-gobain/saint-gobain-webertherm-kps.webp","img/saint-gobain/saint-gobain-webertherm-leparm.webp","img/saint-gobain/saint-gobain-vertex-mriezka.webp","img/saint-gobain/saint-gobain-weberpas-omietka.webp","img/brand/bauder-logo-biele.webp","img/bauder/karat.webp","img/bauder/flex-k5e.webp","img/bauder/tec-ksd.webp","img/bauder/thermofol-u.webp","img/bauder/thermofol-d.webp","img/knauf/knauf-uniflott.webp","img/knauf/knauf-fugenfuller-leicht.webp","img/knauf/knauf-white-paleta.webp","img/knauf/knauf-fill-finish-light.webp","img/knauf/knauf-roll-spray-max.webp","img/bauder/pas-a-pvc-folia.webp","img/bauder/bauderpir-fa-te.webp","img/brand/styroprofile-logo-zelene.webp","img/styroprofile/styroprofile-sdk-profily.webp","img/styroprofile/styroprofile-pouzitie-cd.webp","img/styroprofile/styroprofile-pouzitie-ud.webp","img/styroprofile/styroprofile-pouzitie-cw.webp","img/styroprofile/styroprofile-pouzitie-uw.webp","img/brand/hoch-xps-biele.webp","img/brand/koda-biele.webp","img/hoch-xps/hoch-xps-300-l.webp","img/hoch-xps/hoch-xps-500-pw.webp","img/hoch-xps/hoch-xps-700-i.webp","img/hoch-xps/hoch-xps-balik.webp","img/hoch-xps/hoch-xps-doska-voda.webp","img/hoch-xps/hoch-xps-pouzitie-obratena-strecha.webp","img/hoch-xps/hoch-xps-pouzitie-pivnica.webp","img/hoch-xps/hoch-xps-pouzitie-podlaha-na-zemi.webp","img/hoch-xps/hoch-xps-pouzitie-podlaha.webp","img/hoch-xps/hoch-xps-pouzitie-sendvicove-murivo.webp","img/hoch-xps/hoch-xps-pouzitie-tepelne-mosty.webp","img/koda/koda-deliaca-linka.webp","img/koda/koda-hala-kosice.webp","img/koda/koda-hala-vstup.webp","img/koda/koda-odvijac-zvitkov.webp","img/koda/koda-odvijanie-zvitku.webp","img/koda/koda-pas-na-valcovacej-linke.webp","img/koda/koda-profil-cd-60.webp","img/koda/koda-profil-cw.webp","img/koda/koda-profil-ud-28.webp","img/koda/koda-profil-uw.webp","img/koda/koda-sklad-profilov.webp","img/koda/koda-valcovacia-linka.webp","img/koda/koda-valcovanie-profilov.webp","img/brand/paroc-logo-biele.svg","img/brand/nexler-logo-biele.webp","img/paroc/paroc-cgl-20cy.webp","img/paroc/paroc-cgl-paleta.webp","img/paroc/paroc-garaz-cgl.webp","img/paroc/paroc-strop-cgl.webp","img/paroc/paroc-strop-hotovy.webp","img/nexler/medium-pye-g200-s40.webp","img/nexler/medium-pye-pv250-s52h.webp","img/nexler/standard-v60-s30.webp","img/nexler/stick.webp","img/nexler/realizacie/welnopol-1.webp","img/nexler/realizacie/welnopol-2.webp","img/nexler/realizacie/welnopol-3.webp","img/nexler/realizacie/resovia-1.webp","img/nexler/realizacie/resovia-3.webp"];
const MEDIA = {"docs/DAHAX-prezentacia-2026.pdf":[7946815,"a1e2f46991"],"docs/bauder/bauder-cennik-2024-cz.pdf":[16997926,"266a0700f0"],"docs/bauder/bauder-fotovolticke-systemy-cz.pdf":[11290206,"8d83d6277d"],"docs/bauder/bauder-produkty-na-ploche-strechy-2024-cz.pdf":[3919695,"342c955856"],"docs/bauder/bauder-produkty-na-sikme-strechy-2024-cz.pdf":[2026040,"6c5a82c662"],"docs/bauder/bauder-vegetacne-strechy-cz.pdf":[1326929,"d39feee644"],"docs/bauder/baudergreen-dse-20-fv-zelena-strecha-fv-sk.pdf":[361878,"75f2a71492"],"docs/bauder/bauderpir-fa-g20-prospekt-sk.pdf":[1986514,"5d9e91394b"],"docs/bauder/baudertec-dab-letak-03-2026-sk.pdf":[356891,"1a323b2b56"],"docs/bauder/bauderthermoplan-fpo-prospekt-sk.pdf":[720656,"b39ab27651"],"docs/bauder/ploche-strechy-prehlad-vyrobkov-sk.pdf":[5804827,"592a73c940"],"docs/bauder/sikme-strechy-prehlad-vyrobkov-sk.pdf":[2644589,"d79ca669cb"],"docs/bauder/technicky-list-bauder-eva-35-0421-sk.pdf":[1400523,"6727228aa1"],"docs/bauder/technicky-list-bauder-eva-40-0223-sk.pdf":[85170,"2c55f131f9"],"docs/bauder/technicky-list-bauderflex-k5e-0522-sk.pdf":[144822,"48693a6bfa"],"docs/bauder/technicky-list-bauderkarat-05-2026-sk.pdf":[195624,"c3915e8b6f"],"docs/bauder/technicky-list-baudertec-ksd-0421-sk.pdf":[548840,"2b9fc0c3e5"],"docs/bauder/technicky-list-bauderthermofol-d-18-0221-sk.pdf":[312548,"6860881f24"],"docs/bauder/technicky-list-bauderthermofol-u-15-0221-sk.pdf":[339687,"86b4187084"],"docs/bauder/technicky-list-bauderthermofol-u-18-0221-sk.pdf":[339951,"1bab91ee20"],"docs/bauder/technicky-list-bauderthermofol-u-20-0221-sk.pdf":[339685,"c0a985bef0"],"docs/bauder/vegetacne-strechy-prehlad-vyrobkov-sk.pdf":[1744932,"6c3b86dbb3"],"docs/bauder/vyhlasenie-o-parametroch-bauderflex-k5e-2026-sk.pdf":[210223,"c5eb598776"],"docs/hoch-xps/letak-hoch-xps-pl.pdf":[1938881,"7657380f23"],"docs/hoch-xps/technicky-list-hoch-xps-01-2026-pl.pdf":[1170268,"79d64587a7"],"docs/hoch-xps/technicky-list-hoch-xps-300-w-2026-pl.pdf":[1353054,"012bf08237"],"docs/hoch-xps/vyhlasenie-o-parametroch-xps-200-pl.pdf":[34155,"6cac1f1a7e"],"docs/hoch-xps/vyhlasenie-o-parametroch-xps-300-pl.pdf":[37006,"69aff9b1d9"],"docs/hoch-xps/vyhlasenie-o-parametroch-xps-300-w-pl.pdf":[35251,"80d07b344c"],"docs/hoch-xps/vyhlasenie-o-parametroch-xps-500-pl.pdf":[48973,"3b2a8642c0"],"docs/hoch-xps/vyhlasenie-o-parametroch-xps-700-pl.pdf":[33952,"75733ae190"],"docs/holcim/certifikat-1454-cpr-0292-kamenna-vlna.pdf":[91636,"5a662e2cf2"],"docs/holcim/epd-environmentalne-vyhlasenie-kamenna-vlna.pdf":[955187,"5d89f8e5f9"],"docs/holcim/karta-techniczna-holcim-roof-base-30.pdf":[201707,"b7d4f3b8df"],"docs/holcim/karta-techniczna-holcim-roof-tapered-50.pdf":[200613,"8133d5dfb0"],"docs/holcim/karta-techniczna-holcim-roof-top-50.pdf":[200861,"fd8de68c7a"],"docs/holcim/vyhlasenie-o-parametroch-dop-pro-facade-35.pdf":[319160,"8d85d9b021"],"docs/holcim/vyhlasenie-o-parametroch-dop-roof-base-30.pdf":[319547,"e0e469fae4"],"docs/holcim/vyhlasenie-o-parametroch-dop-roof-tapered-50.pdf":[319164,"51f2a10125"],"docs/holcim/vyhlasenie-o-parametroch-dop-roof-top-50.pdf":[319918,"cd6015d3f7"],"docs/izovat/dop-413-izovat-65-100-300mm-sk.pdf":[250179,"f1a3407761"],"docs/izovat/dop-429-izovat-80-100-300mm-sk.pdf":[247302,"b8874a2ebf"],"docs/izovat/dop-431-izovat-80fg-100-300mm-sk.pdf":[248375,"0f4cf85601"],"docs/izovat/dop-441-izovat-90-100-270mm-sk.pdf":[246449,"a7c34ec015"],"docs/izovat/dop-453-izovat-100-100-240mm-sk.pdf":[247209,"3e76ec774f"],"docs/izovat/dop-470-izovat-110-100-220mm-cz.pdf":[242828,"eea45a7917"],"docs/izovat/dop-522-izovat-125-30-190mm-cz.pdf":[241748,"e6481a600b"],"docs/izovat/dop-535-izovat-135-30-180mm-sk.pdf":[248566,"fd8b1d1d0c"],"docs/izovat/dop-550-izovat-160-100-150mm-sk.pdf":[243374,"1a2b7439c0"],"docs/izovat/dop-552-izovat-160-wed-20-150mm-sk.pdf":[239180,"a7f29dc133"],"docs/izovat/dop-553-izovat-160-inc-20-150mm-sk.pdf":[239142,"7e2fba2811"],"docs/izovat/dop-605-izovat-fasad-10-50-90mm-sk.pdf":[242370,"e0cd55a06b"],"docs/izovat/dop-606-izovat-fasad-10-100-240mm-sk.pdf":[245863,"7097a880f5"],"docs/izovat/dop-634-izovat-fasad-cottage-50-90mm-sk.pdf":[241937,"c31f120a22"],"docs/izovat/dop-635-izovat-fasad-cottage-100-270mm-sk.pdf":[247517,"2c5bf7f13b"],"docs/izovat/epd-izovat-light-25-45-kg-m-en-platne-do-2030.pdf":[647659,"b84e6a42e7"],"docs/izovat/technicky-list-izovat-fasad-10-cz.pdf":[1875605,"dd1f89bb45"],"docs/klimas/eta-13-0107-eco-drive-sk.pdf":[1573036,"4b4bf94f2d"],"docs/klimas/eta-13-0724-wktherm-s-sk.pdf":[1406828,"b04b206cc9"],"docs/klimas/eta-17-0450-lfmg-10-sk.pdf":[1547332,"427d3cb164"],"docs/klimas/eta-18-0817-skrutky-do-dreva-sk.pdf":[2364910,"83cd499d9c"],"docs/klimas/eta-20-0641-le-a4-sk.pdf":[967866,"cee8d68907"],"docs/klimas/eta-20-0768-skrutky-do-betonu-sk.pdf":[1103374,"c690584ffa"],"docs/klimas/eta-20-0769-skrutky-do-betonu-sk.pdf":[945691,"e83e1892e4"],"docs/klimas/eta-22-0611-thermodrive-v2-sk.pdf":[2017925,"bc2f6dd5a3"],"docs/klimas/prezentacia-klimas-kotvenie-etics-en.pdf":[2507196,"e9480c3bc4"],"docs/klimas/technicky-list-eco-drive-w-8-sk.pdf":[456133,"55f22d77b0"],"docs/klimas/technicky-list-le-a4-sk.pdf":[566941,"8286ab7e1b"],"docs/klimas/technicky-list-lfmg-10-sk.pdf":[594420,"c1e1f6f041"],"docs/klimas/technicky-list-thermodrive-v2-sk.pdf":[909428,"dc032a18de"],"docs/klimas/technicky-list-wdblp-10-sk.pdf":[423198,"51fa784833"],"docs/klimas/technicky-list-wdbls-10-sk.pdf":[409484,"9a618fc520"],"docs/klimas/technicky-list-wktherm-s-8-sk.pdf":[595029,"c8bf397741"],"docs/klimas/vyhlasenie-o-parametroch-eco-drive-w-sk.pdf":[221323,"7294a5641d"],"docs/klimas/vyhlasenie-o-parametroch-lfmg-10-sk.pdf":[222182,"7b5b4d93d9"],"docs/klimas/vyhlasenie-o-parametroch-thermodrive-v2-sk.pdf":[233353,"c91bffaacb"],"docs/klimas/vyhlasenie-o-parametroch-wkcr-10-sk.pdf":[383944,"8f537ff1d1"],"docs/klimas/vyhlasenie-o-parametroch-wkcr-8-sk.pdf":[384044,"de3e343150"],"docs/klimas/vyhlasenie-o-parametroch-wkcs-6-sk.pdf":[378522,"bacf8e1adc"],"docs/klimas/vyhlasenie-o-parametroch-wkcs-8-sk.pdf":[378339,"0ab1af642d"],"docs/klimas/vyhlasenie-o-parametroch-wkpc-8-sk.pdf":[380483,"4e048e40f2"],"docs/knauf/brozura-knauf-tmelenie-a-strojove-stierkovanie.pdf":[5196084,"4de5759f6a"],"docs/knauf/technicky-list-knauf-fill-finish-light.pdf":[277276,"501b43ee54"],"docs/knauf/technicky-list-knauf-fugenfuller-leicht.pdf":[2588740,"46861192f0"],"docs/knauf/technicky-list-knauf-roll-spray-max.pdf":[119919,"498f6a4fad"],"docs/knauf/technicky-list-knauf-uniflott.pdf":[182487,"46146cbcdd"],"docs/knauf/vyhlasenie-o-parametroch-knauf-white-12-5.pdf":[66524,"f468f2bd82"],"docs/koda/protokol-o-skuske-15-206116-01-uw-cw.pdf":[80697,"96b28a5cde"],"docs/koda/protokol-o-skuske-428-ud-cd.pdf":[516917,"5d5f6a9689"],"docs/koda/protokol-o-skuske-70-06-0040-1-ud-cd.pdf":[218619,"6c946cfa4c"],"docs/koda/protokol-o-skuske-70-06-0040-2-ud-cd.pdf":[163735,"73d0d38f19"],"docs/koda/protokol-o-skuske-70-15-0082-cw-50.pdf":[192782,"a86183a8a1"],"docs/koda/protokol-o-skuske-70-15-0083-cw-75.pdf":[189032,"ad55d59d18"],"docs/koda/protokol-o-skuske-70-15-0084-cw-100.pdf":[187663,"bb80a10b19"],"docs/koda/protokol-o-skuske-70-15-0085-uw-50.pdf":[179532,"8228d31160"],"docs/koda/protokol-o-skuske-70-15-0086-uw-75.pdf":[176538,"39784be910"],"docs/koda/protokol-o-skuske-70-15-0087-uw-100.pdf":[179964,"1a3a4e5a4d"],"docs/koda/vyhlasenie-o-parametroch-cd.pdf":[58623,"62cbd3b59c"],"docs/koda/vyhlasenie-o-parametroch-cw.pdf":[59125,"e3cf62119d"],"docs/koda/vyhlasenie-o-parametroch-ud.pdf":[58442,"e41e7000bb"],"docs/koda/vyhlasenie-o-parametroch-uw.pdf":[59360,"553afb5de0"],"docs/nexler/katalog-asfaltovych-pasov-cz-sk.pdf":[5613979,"5018aadc73"],"docs/paroc/katalog-produktov-pozemne-stavby-2024-de.pdf":[10350413,"73334ffdc2"],"docs/paroc/montazny-navod-paroc-cgl-20-pl.pdf":[1327181,"b144886eaf"],"docs/paroc/navrhovanie-paroc-cgl-20-system-pl.pdf":[509373,"17182b75b1"],"docs/paroc/produktovy-list-paroc-was-25-pl.pdf":[148543,"3afde408d2"],"docs/paroc/technicky-list-paroc-cgl-20cy-pl.pdf":[183145,"a02c5fb164"],"docs/paroc/vyhlasenie-o-parametroch-paroc-cgl-20cy-pl.pdf":[126066,"163af40fc9"],"docs/polyform/balenie-a-doprava-2025.pdf":[35714,"641d5f77ee"],"docs/polyform/katalog-vyrobkov-polyform-04-2024.pdf":[5039750,"c8da4d0cee"],"docs/polyform/odporucane-pouzitie-tepelnych-a-zvukovych-izolacii.pdf":[2523665,"4d336ce80a"],"docs/polyform/technicky-list-eps-100.pdf":[184812,"dfe10504c3"],"docs/polyform/technicky-list-eps-150-neo-sivy.pdf":[184168,"234b40b0e2"],"docs/polyform/technicky-list-eps-70-f-fasada.pdf":[184557,"212e093d69"],"docs/polyform/vyhlasenie-o-parametroch-eps-100.pdf":[110922,"d5d21d4c70"],"docs/saint-gobain/produktovy-cennik-weber-2026-sk-platny-od-15-5-2026.pdf":[11309874,"aaeee9ea0d"],"docs/saint-gobain/vzorkovnik-fasadnych-omietok-a-naterov-colorline.pdf":[188134,"e8888c16c1"],"docs/styroprofile/certifikat-profily-ud-cd-cw-uw-hut-din-18182-cz.pdf":[783969,"a8f6d1c614"],"docs/styroprofile/certifikat-profily-ud-cd-cw-uw-hut-en-14195-cz.pdf":[709526,"616b863eba"],"docs/styroprofile/skuska-pevnost-v-tahu-profily-ud-cd-cw-uw-din-cz.pdf":[873163,"991bd91786"],"docs/styroprofile/skuska-pevnost-v-tahu-profily-ud-cd-cw-uw-en-cz.pdf":[777310,"f8b3ad82e1"],"docs/styroprofile/vyhlasenie-o-parametroch-profily-ua-sk.pdf":[71804,"396841146b"],"docs/styroprofile/vyhlasenie-o-parametroch-profily-ud-cd-cw-uw-hut-2026-cz.pdf":[71371,"956c913ff9"],"docs/styroprofile/vyhlasenie-o-parametroch-profily-ud-cd-cw-uw-sk.pdf":[76851,"ce99638405"],"docs/styrotrade/certifikat-vups-eps-100-cz.pdf":[811655,"6a07a54b1b"],"docs/styrotrade/katalog-produktov-styrotrade-2023-cz.pdf":[8274156,"14a3a439d1"],"docs/styrotrade/vyhlasenie-o-parametroch-styro-eps-100-cz.pdf":[1275324,"d7170a89bf"],"docs/styrotrade/vyhlasenie-o-parametroch-styro-eps-150-cz.pdf":[1281435,"0149cc627b"],"docs/styrotrade/vyhlasenie-o-parametroch-styro-xps-200-sp-i-2025-cz.pdf":[722156,"4f947af31c"],"docs/styrotrade/vyhlasenie-o-parametroch-styro-xps-300-hp-l-2025-cz.pdf":[778918,"f669d2c808"],"docs/styrotrade/vyhlasenie-o-parametroch-styro-xps-300-hp-l-cz.pdf":[778918,"f669d2c808"],"docs/styrotrade/vyhlasenie-o-parametroch-styro-xps-300-sp-i-2025-cz.pdf":[790816,"70e02cd8e7"],"docs/styrotrade/vyhlasenie-o-parametroch-styro-xps-300-sp-i-cz.pdf":[790590,"f169e4c8ad"],"docs/styrotrade/vyhlasenie-o-parametroch-styro-xps-500-hp-l-2025-cz.pdf":[757073,"2a3a6911b9"],"docs/styrotrade/vyhlasenie-o-parametroch-styrotherm-plus-100-cz.pdf":[1270896,"e1d8d5b1c2"],"docs/sucha-vystavba/katalog-produktov-profifix-dk-mont-cz.pdf":[4948353,"a4dda4f5a3"],"docs/sucha-vystavba/katalog-produktov-profifix-en.pdf":[5010957,"4896325e13"],"docs/sucha-vystavba/katalog-profilov-styroprofile-2023-cz.pdf":[3298007,"e15ec60be1"],"docs/sucha-vystavba/priamy-zaves-special-cz.pdf":[417923,"e06009ee9f"],"docs/sucha-vystavba/profifix-novinky-2023-en.pdf":[8560116,"ef7463a36e"],"docs/sucha-vystavba/profifix-produkty-s-ochranou-c5-cz.pdf":[889108,"64960a65a7"],"docs/sucha-vystavba/revizne-dvierka-a-klapky-cz.pdf":[264410,"2332ed7c37"],"docs/synthos/epd-synthos-xps-en.pdf":[919768,"259455e4a1"],"docs/synthos/europske-technicke-posudenie-eta-19-0250-en.pdf":[10323111,"b8c65d22ec"],"docs/synthos/katalog-xps-prime-sk.pdf":[14995109,"29fb88854d"],"docs/synthos/osvedcenie-230833a-xps-prime-g.pdf":[54287,"b8d6f8d8ca"],"docs/synthos/osvedcenie-230833c-xps-prime-d.pdf":[52657,"0ff1085fd0"],"docs/synthos/prirucka-projektanta-xps-prime-pl.pdf":[5820047,"260a1758ab"],"docs/synthos/technicky-list-synthos-xps-prime-s-pl.pdf":[301325,"f4cf7fd265"],"docs/synthos/technicky-list-xps-prime-d-sk-09-2026.pdf":[1029498,"4d42fd5559"],"docs/synthos/technicky-list-xps-prime-g-pl.pdf":[1071171,"16c2f9d85b"],"docs/synthos/technicky-list-xps-prime-s-sk-09-2026.pdf":[1223001,"a573fcbb3b"],"docs/synthos/vyhlasenie-o-parametroch-xps-prime-d-30-pl.pdf":[221726,"d402047426"],"docs/synthos/vyhlasenie-o-parametroch-xps-prime-g-30-pl.pdf":[1028626,"f26ce2c6ef"],"img/klimas/predajne/predajna-01.webp":[208720,"9463a83109"],"img/klimas/predajne/predajna-02.webp":[210682,"bdc24d1f34"],"img/klimas/predajne/predajna-03.webp":[201596,"73983969a5"],"img/klimas/predajne/predajna-04.webp":[169676,"56443e6a96"],"img/klimas/predajne/predajna-05.webp":[166170,"c3083d76c6"],"img/klimas/predajne/predajna-06.webp":[170718,"68f3e0d8aa"],"img/klimas/predajne/predajna-07.webp":[168248,"b82b09189a"],"img/klimas/predajne/predajna-08.webp":[198102,"167595d25d"],"img/klimas/predajne/predajna-09.webp":[188992,"f0e16e399f"],"img/klimas/predajne/predajna-12.webp":[143492,"0e82047730"],"img/klimas/predajne/predajna-14.webp":[175096,"2928112d8b"],"img/klimas/predajne/predajna-15.webp":[149474,"1515f0f8da"],"img/klimas/predajne/predajna-16.webp":[143356,"76ebbabcef"],"img/klimas/predajne/predajna-17.webp":[176748,"fde73e5976"],"img/klimas/predajne/predajna-18.webp":[163616,"f7772d1189"],"img/klimas/predajne/predajna-19.webp":[92668,"ad7927b623"],"img/klimas/predajne/predajna-20.webp":[102378,"4380ca67fa"],"video/bauder/bauder-firma.mp4":[3316174,"f8ed0aa943"],"video/bauder/bauder-firma.webp":[113260,"38534dddec"],"video/hoch-xps/hoch-xps-firma-prezentacia.mp4":[5607234,"63682a6dd4"],"video/hoch-xps/hoch-xps-firma-prezentacia.webp":[81132,"b6b038a2ee"],"video/hoch-xps/hoch-xps-test-nasiakavosti.mp4":[1273321,"c74c221c2c"],"video/hoch-xps/hoch-xps-test-nasiakavosti.webp":[35928,"c0622b1f5d"],"video/hoch-xps/hoch-xps-vyroba.mp4":[1760198,"93f17d9914"],"video/hoch-xps/hoch-xps-vyroba.webp":[15598,"3f3ae31c20"],"video/holcim/holcim-firma-prezentacia.mp4":[5908040,"81b4852df5"],"video/holcim/holcim-firma-prezentacia.webp":[63678,"da2295ad06"],"video/holcim/holcim-ohen-a1.mp4":[1497095,"670951c47b"],"video/holcim/holcim-ohen-a1.webp":[31186,"b8fbc131b1"],"video/holcim/holcim-vyroba.mp4":[10814354,"fc8132347c"],"video/holcim/holcim-vyroba.webp":[22510,"20f307ad3d"],"video/izovat/izovat-firma.mp4":[595870,"838ba602da"],"video/izovat/izovat-firma.webp":[32968,"c872429041"],"video/klimas/klimas-chemicke-kotvy.mp4":[13402455,"779ffccaba"],"video/klimas/klimas-chemicke-kotvy.webp":[56064,"261495f6e0"],"video/klimas/klimas-drevostavba.mp4":[14416018,"73a1fc8893"],"video/klimas/klimas-drevostavba.webp":[41900,"3916827bd4"],"video/klimas/klimas-eco-drive-s.mp4":[4577299,"54670200fc"],"video/klimas/klimas-eco-drive-s.webp":[23372,"faa1b31539"],"video/klimas/klimas-eco-drive-w.mp4":[5758219,"a2b909cd6d"],"video/klimas/klimas-eco-drive-w.webp":[25078,"d8475534c3"],"video/klimas/klimas-firma-logo.mp4":[42706860,"50955b9a53"],"video/klimas/klimas-firma-logo.webp":[5840,"c0498606dc"],"video/klimas/klimas-firma-prezentacia.mp4":[43641705,"378cbdd1b3"],"video/klimas/klimas-firma-prezentacia.webp":[44936,"5d6b110f88"],"video/klimas/klimas-firma.mp4":[29084092,"c41e26def7"],"video/klimas/klimas-firma.webp":[54794,"2d7036538f"],"video/klimas/klimas-fixplug.mp4":[5354854,"b463b77fac"],"video/klimas/klimas-fixplug.webp":[23586,"1992d3a5a8"],"video/klimas/klimas-kpr-kps-fast.mp4":[6444868,"4951770aef"],"video/klimas/klimas-kpr-kps-fast.webp":[23280,"fb97139ae9"],"video/klimas/klimas-le.mp4":[2213571,"2759cd70f6"],"video/klimas/klimas-le.webp":[22484,"2b47f04f64"],"video/klimas/klimas-lino.mp4":[7798380,"29d91f88a4"],"video/klimas/klimas-lino.webp":[17198,"4bfe55328f"],"video/klimas/klimas-sfx.mp4":[8582932,"fef8a775d3"],"video/klimas/klimas-sfx.webp":[49490,"2f6f204f97"],"video/klimas/klimas-skrutky-do-dreva.mp4":[13664474,"cd703dfcc3"],"video/klimas/klimas-skrutky-do-dreva.webp":[19560,"1ac32c73d9"],"video/klimas/klimas-thermodrive-v2-shorts.mp4":[4095513,"425d0cddb2"],"video/klimas/klimas-thermodrive-v2-shorts.webp":[5206,"f43c293316"],"video/klimas/klimas-thermodrive-v2.mp4":[19705849,"f0ebad6944"],"video/klimas/klimas-thermodrive-v2.webp":[40816,"ab0bad6ff5"],"video/klimas/klimas-wfd.mp4":[7113997,"966b6b817c"],"video/klimas/klimas-wfd.webp":[24246,"3ef44b8d1f"],"video/klimas/klimas-wkcp-wkcs.mp4":[20420356,"87d6c8efd3"],"video/klimas/klimas-wkcp-wkcs.webp":[29158,"1449364b67"],"video/klimas/klimas-wkfc-wkfs.mp4":[12358901,"4955f61440"],"video/klimas/klimas-wkfc-wkfs.webp":[10930,"49bf3e5d41"],"video/klimas/klimas-wkss.mp4":[11694836,"3dd44d628d"],"video/klimas/klimas-wkss.webp":[14490,"aaccdf0d03"],"video/klimas/klimas-wktherm-s-montaz.mp4":[3559468,"97cf44fdd3"],"video/klimas/klimas-wktherm-s-montaz.webp":[5428,"784521b83f"],"video/klimas/klimas-wktherm-s.mp4":[5925720,"f5ed895fa6"],"video/klimas/klimas-wktherm-s.webp":[19998,"d1617e6097"],"video/klimas/klimas-ws.mp4":[1973889,"75b0838925"],"video/klimas/klimas-ws.webp":[43714,"254f72ea4b"],"video/knauf/knauf-firma.mp4":[1089651,"96bdc1b5fc"],"video/knauf/knauf-firma.webp":[33344,"ccefc08274"],"video/koda/koda-firma-prezentacia.mp4":[3436818,"d4d5480a76"],"video/koda/koda-firma-prezentacia.webp":[32562,"1dabc17ae3"],"video/nexler/nexler-firma-prezentacia.mp4":[4955471,"0acfb4c80a"],"video/nexler/nexler-firma-prezentacia.webp":[27686,"e39b5fe8dd"],"video/paroc/paroc-firma.mp4":[633193,"6b99d804df"],"video/paroc/paroc-firma.webp":[61392,"f262bdc167"],"video/polyform/polyform-firma.mp4":[2544931,"a8006ac960"],"video/polyform/polyform-firma.webp":[154866,"02bbd0bc07"],"video/saint-gobain/saint-gobain-firma-prezentacia.mp4":[6063417,"29ad27549a"],"video/saint-gobain/saint-gobain-firma-prezentacia.webp":[82950,"708ab19d5e"],"video/styroprofile/styroprofile-firma.mp4":[1061358,"5ac4c4b2b9"],"video/styroprofile/styroprofile-firma.webp":[27706,"2b68b01b2e"],"video/styrotrade/styrotrade-firma.mp4":[1907230,"48db0233a3"],"video/styrotrade/styrotrade-firma.webp":[34606,"503b33107e"],"video/synthos/synthos-akademia-xps.mp4":[3507181,"a2e10180a0"],"video/synthos/synthos-akademia-xps.webp":[70988,"ffbd5fb101"],"video/synthos/synthos-firma-prezentacia.mp4":[6184772,"2f15980a32"],"video/synthos/synthos-firma-prezentacia.webp":[64910,"98cab81174"],"video/synthos/synthos-izolacia-zakladov.mp4":[23966895,"51d285354d"],"video/synthos/synthos-izolacia-zakladov.webp":[82926,"9419b2333d"]};

const isMedia = (path) => /^(docs|video|img\/klimas\/predajne)\//.test(path); // PDF, videá a fotky predajní KLIMAS
const pathOf = (url) => decodeURIComponent(new URL(url).pathname.slice(new URL(self.registration.scope).pathname.length));
const HASH = "X-Dahax-Hash";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(PRECACHE)
      // cache: "reload" – stiahnuť zo siete, nie z krátkodobej pamäte prehliadača (GitHub Pages: max-age 600 s),
      // inak by sa do novej verzie mohol uložiť starý súbor s rovnakým názvom
      .then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

// prechod zo starších verzií: PDF a videá uložené v „dahax-<stará verzia>“ sa presunú do dahax-media
// (súbor rovnakej veľkosti ako v zozname sa považuje za aktuálny), aby sa nesťahovali znova
const migrate = async (keys) => {
  const media = await caches.open(MEDIA_CACHE);
  let moved = 0;
  for (const k of keys) {
    const old = await caches.open(k);
    for (const req of await old.keys()) {
      const p = pathOf(req.url), m = MEDIA[p];
      if (!m || (await media.match(p))) continue;
      const res = await old.match(req);
      const blob = await res.blob();
      if (blob.size !== m[0]) continue;
      await media.put(p, tagged(blob, res.headers, m[1]));
      moved++;
    }
  }
  if (moved) await media.put(MODE_KEY, new Response("1")); // kto mal médiá offline, ostáva v offline režime
  return moved;
};
const tagged = (blob, headers, hash) => {
  const h = new Headers();
  h.set("Content-Type", headers.get("Content-Type") || (blob.type || "application/octet-stream"));
  h.set("Content-Length", String(blob.size));
  h.set(HASH, hash);
  return new Response(blob, { headers: h });
};

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const old = (await caches.keys()).filter((k) => k.startsWith("dahax-") && ![PRECACHE, RUNTIME, MEDIA_CACHE].includes(k));
      await migrate(old).catch(() => 0);
      await Promise.all(old.map((k) => caches.delete(k)));
      // runtime pamäť drží len cudzie súbory (písma); súbory aplikácie, PDF a videá z nej preč – inak by stará
      // kópia (uložená, keď ich predošlá verzia ešte nepoznala) prekryla novú z pamäte aplikácie
      const rt = await caches.open(RUNTIME);
      for (const req of await rt.keys()) if (new URL(req.url).origin === location.origin) await rt.delete(req);
      await self.clients.claim();
      if (!OFFLINE_MEDIA) await caches.delete(MEDIA_CACHE); // len z webu – nič veľké v tablete
      else if (await offlineMode()) sync(); // aktualizácia: dotiahnuť len nové a zmenené médiá
    })()
  );
});

// ---------- offline režim a sťahovanie médií ----------
const offlineMode = async () => !!(await (await caches.open(MEDIA_CACHE)).match(MODE_KEY));
let running = null;
const broadcast = async (msg) => (await self.clients.matchAll({ includeUncontrolled: true })).forEach((c) => c.postMessage(msg));
const status = async () => {
  const media = await caches.open(MEDIA_CACHE);
  const have = new Map();
  for (const req of await media.keys()) {
    const p = pathOf(req.url);
    if (!MEDIA[p]) continue;
    const res = await media.match(req);
    have.set(p, res.headers.get(HASH));
  }
  const all = Object.entries(MEDIA);
  const ok = all.filter(([p, [, h]]) => have.get(p) === h);
  const mb = (list) => list.reduce((s, [, [n]]) => s + n, 0);
  return { type: "dahax-offline", mode: await offlineMode(), done: ok.length, total: all.length, bytes: mb(ok), totalBytes: mb(all), running: !!running };
};
const sync = () =>
  (running ??= (async () => {
    const media = await caches.open(MEDIA_CACHE);
    // zmazať, čo už v zozname nie je
    for (const req of await media.keys()) {
      const p = pathOf(req.url);
      if (p !== MODE_KEY && !MEDIA[p]) await media.delete(req);
    }
    const todo = [];
    for (const [p, [, h]] of Object.entries(MEDIA)) {
      const hit = await media.match(p);
      if (!hit || hit.headers.get(HASH) !== h) todo.push(p);
    }
    let failed = 0;
    const one = async (p) => {
      try {
        const res = await fetch(`${p}?v=${MEDIA[p][1]}`, { cache: "no-store" });
        if (!res.ok) throw 0;
        const blob = await res.blob();
        await media.put(p, tagged(blob, res.headers, MEDIA[p][1]));
      } catch {
        failed++;
      }
      broadcast(await status());
    };
    // 3 súbory naraz
    const queue = [...todo];
    await Promise.all([0, 1, 2].map(async () => { while (queue.length) await one(queue.shift()); }));
    running = null;
    broadcast({ ...(await status()), failed });
  })());

self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "dahax-offline-on" && OFFLINE_MEDIA) {
    e.waitUntil((async () => { await (await caches.open(MEDIA_CACHE)).put(MODE_KEY, new Response("1")); await sync(); })());
  } else if (d.type === "dahax-offline-status") {
    e.waitUntil(status().then((s) => e.source && e.source.postMessage(s)));
  }
});

// ---------- odpovede ----------
const networkFirst = async (req) => {
  const cache = await caches.open(PRECACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req, { ignoreSearch: true })) || (await cache.match("./")) || Response.error();
  }
};

// video z pamäte: prehliadač pýta časti súboru (Range) – bez odpovede 206 sa offline nespustí
const rangeResponse = async (req, hit) => {
  const blob = await hit.blob(); // blob.slice nekopíruje celé video do pamäte
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") || "");
  const size = blob.size;
  let start = m && m[1] ? +m[1] : 0, end = m && m[2] ? +m[2] : size - 1;
  if (m && !m[1] && m[2]) (start = Math.max(0, size - +m[2])), (end = size - 1);
  end = Math.min(end, size - 1);
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: { "Content-Type": hit.headers.get("Content-Type") || "video/mp4", "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" },
  });
};

// PDF a video: z dahax-media, inak zo siete bez ukladania (aj časti videa – Range – idú priamo zo siete)
const mediaResponse = async (req, path) => {
  if (!OFFLINE_MEDIA) return fetch(req); // len z webu – dahax-media sa ani nevytvára
  const hit = await (await caches.open(MEDIA_CACHE)).match(path);
  if (!hit) return fetch(req);
  return req.headers.has("range") ? rangeResponse(req, hit) : hit;
};

// najprv pamäť aplikácie tejto verzie, až potom runtime pamäť
const cacheFirst = async (req) => {
  const hit = (await (await caches.open(PRECACHE)).match(req, { ignoreSearch: true })) || (await (await caches.open(RUNTIME)).match(req, { ignoreSearch: true }));
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) (await caches.open(RUNTIME)).put(req, res.clone());
  return res;
};

const staleWhileRevalidate = async (req) => {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(req);
  const net = fetch(req)
    .then((res) => {
      if (res.ok || res.type === "opaque") cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || net;
};

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }
  if (url.origin !== location.origin) return;
  if (req.mode === "navigate" || url.pathname.endsWith("/content/content.json")) {
    e.respondWith(networkFirst(req));
    return;
  }
  const path = pathOf(req.url);
  if (path === "stav.json") return; // vypínač aplikácie (assets/dahax-stav.js) – vždy priamo zo siete, nikdy z pamäte
  if (isMedia(path)) {
    e.respondWith(mediaResponse(req, path));
    return;
  }
  e.respondWith(cacheFirst(req));
});
