/* DAHAX INTERACTIVE – service worker (generovaný pri builde).
   Precache: aplikácia, obsah, obrázky → prezentácia ide aj bez internetu.
   content.json a index.html: najprv sieť, pri výpadku uložená verzia.
   Písma z Google Fonts sa uložia pri prvom online spustení. */
const VERSION = "2026-10-26-verzia";
const PRECACHE = "dahax-" + VERSION;
const RUNTIME = "dahax-runtime";
const FILES = ["./","assets/dahax-dotyk.js","assets/dahax-upravy-1.css","assets/dahax-upravy-2.css","assets/dahax-upravy-3.css","assets/dahax-verzia.js","assets/dahax-video.js","assets/main-DHX26P11.js","assets/main-FOM7FDNB.css","content/content.json","docs/bauder/bauder-cennik-2024-cz.pdf","docs/bauder/bauder-fotovolticke-systemy-cz.pdf","docs/bauder/bauder-produkty-na-ploche-strechy-2024-cz.pdf","docs/bauder/bauder-produkty-na-sikme-strechy-2024-cz.pdf","docs/bauder/bauder-vegetacne-strechy-cz.pdf","docs/bauder/baudergreen-dse-20-fv-zelena-strecha-fv-sk.pdf","docs/bauder/bauderpir-fa-g20-prospekt-sk.pdf","docs/bauder/baudertec-dab-letak-03-2026-sk.pdf","docs/bauder/bauderthermoplan-fpo-prospekt-sk.pdf","docs/bauder/ploche-strechy-prehlad-vyrobkov-sk.pdf","docs/bauder/sikme-strechy-prehlad-vyrobkov-sk.pdf","docs/bauder/technicky-list-bauderkarat-05-2026-sk.pdf","docs/bauder/vegetacne-strechy-prehlad-vyrobkov-sk.pdf","docs/bauder/vyhlasenie-o-parametroch-bauderflex-k5e-2026-sk.pdf","docs/DAHAX-prezentacia-2026.pdf","docs/hoch-xps/letak-hoch-xps-pl.pdf","docs/hoch-xps/technicky-list-hoch-xps-01-2026-pl.pdf","docs/hoch-xps/technicky-list-hoch-xps-300-w-2026-pl.pdf","docs/hoch-xps/vyhlasenie-o-parametroch-xps-300-pl.pdf","docs/hoch-xps/vyhlasenie-o-parametroch-xps-500-pl.pdf","docs/hoch-xps/vyhlasenie-o-parametroch-xps-700-pl.pdf","docs/holcim/certifikat-1454-cpr-0292-kamenna-vlna.pdf","docs/holcim/epd-environmentalne-vyhlasenie-kamenna-vlna.pdf","docs/holcim/karta-techniczna-holcim-roof-base-30.pdf","docs/holcim/karta-techniczna-holcim-roof-tapered-50.pdf","docs/holcim/karta-techniczna-holcim-roof-top-50.pdf","docs/holcim/vyhlasenie-o-parametroch-dop-pro-facade-35.pdf","docs/holcim/vyhlasenie-o-parametroch-dop-roof-base-30.pdf","docs/holcim/vyhlasenie-o-parametroch-dop-roof-tapered-50.pdf","docs/holcim/vyhlasenie-o-parametroch-dop-roof-top-50.pdf","docs/izovat/epd-izovat-light-25-45-kg-m-en-platne-do-2030.pdf","docs/klimas/eta-13-0107-eco-drive-sk.pdf","docs/klimas/eta-17-0450-lfmg-10-sk.pdf","docs/klimas/eta-18-0817-skrutky-do-dreva-sk.pdf","docs/klimas/eta-20-0641-le-a4-sk.pdf","docs/klimas/eta-20-0768-skrutky-do-betonu-sk.pdf","docs/klimas/eta-20-0769-skrutky-do-betonu-sk.pdf","docs/klimas/eta-22-0611-thermodrive-v2-sk.pdf","docs/klimas/prezentacia-klimas-kotvenie-etics-en.pdf","docs/klimas/technicky-list-eco-drive-w-8-sk.pdf","docs/klimas/technicky-list-le-a4-sk.pdf","docs/klimas/technicky-list-lfmg-10-sk.pdf","docs/klimas/technicky-list-thermodrive-v2-sk.pdf","docs/klimas/technicky-list-wdblp-10-sk.pdf","docs/klimas/technicky-list-wdbls-10-sk.pdf","docs/klimas/vyhlasenie-o-parametroch-eco-drive-w-sk.pdf","docs/klimas/vyhlasenie-o-parametroch-lfmg-10-sk.pdf","docs/klimas/vyhlasenie-o-parametroch-thermodrive-v2-sk.pdf","docs/klimas/vyhlasenie-o-parametroch-wkcr-10-sk.pdf","docs/klimas/vyhlasenie-o-parametroch-wkcr-8-sk.pdf","docs/klimas/vyhlasenie-o-parametroch-wkcs-6-sk.pdf","docs/klimas/vyhlasenie-o-parametroch-wkcs-8-sk.pdf","docs/klimas/vyhlasenie-o-parametroch-wkpc-8-sk.pdf","docs/nexler/katalog-asfaltovych-pasov-cz-sk.pdf","docs/paroc/katalog-produktov-pozemne-stavby-2024-de.pdf","docs/paroc/produktovy-list-paroc-was-25-pl.pdf","docs/polyform/balenie-a-doprava-2025.pdf","docs/polyform/katalog-vyrobkov-polyform-04-2024.pdf","docs/polyform/odporucane-pouzitie-tepelnych-a-zvukovych-izolacii.pdf","docs/polyform/technicky-list-eps-100.pdf","docs/polyform/technicky-list-eps-150-neo-sivy.pdf","docs/polyform/technicky-list-eps-70-f-fasada.pdf","docs/polyform/vyhlasenie-o-parametroch-eps-100.pdf","docs/saint-gobain/produktovy-cennik-weber-2026-sk-platny-od-15-5-2026.pdf","docs/saint-gobain/vzorkovnik-fasadnych-omietok-a-naterov-colorline.pdf","docs/styroprofile/vyhlasenie-o-parametroch-profily-ua-sk.pdf","docs/styroprofile/vyhlasenie-o-parametroch-profily-ud-cd-cw-uw-sk.pdf","docs/styrotrade/certifikat-vups-eps-100-cz.pdf","docs/styrotrade/katalog-produktov-styrotrade-2023-cz.pdf","docs/styrotrade/vyhlasenie-o-parametroch-styro-eps-100-cz.pdf","docs/styrotrade/vyhlasenie-o-parametroch-styro-eps-150-cz.pdf","docs/styrotrade/vyhlasenie-o-parametroch-styro-xps-300-hp-l-cz.pdf","docs/styrotrade/vyhlasenie-o-parametroch-styro-xps-300-sp-i-cz.pdf","docs/styrotrade/vyhlasenie-o-parametroch-styrotherm-plus-100-cz.pdf","docs/sucha-vystavba/katalog-produktov-profifix-dk-mont-cz.pdf","docs/sucha-vystavba/katalog-produktov-profifix-en.pdf","docs/sucha-vystavba/katalog-profilov-styroprofile-2023-cz.pdf","docs/sucha-vystavba/priamy-zaves-special-cz.pdf","docs/sucha-vystavba/profifix-novinky-2023-en.pdf","docs/sucha-vystavba/profifix-produkty-s-ochranou-c5-cz.pdf","docs/sucha-vystavba/revizne-dvierka-a-klapky-cz.pdf","docs/synthos/epd-synthos-xps-en.pdf","docs/synthos/europske-technicke-posudenie-eta-19-0250-en.pdf","docs/synthos/katalog-xps-prime-sk.pdf","docs/synthos/osvedcenie-230833a-xps-prime-g.pdf","docs/synthos/osvedcenie-230833c-xps-prime-d.pdf","docs/synthos/prirucka-projektanta-xps-prime-pl.pdf","docs/synthos/technicky-list-synthos-xps-prime-s-pl.pdf","docs/synthos/technicky-list-xps-prime-d-sk-09-2026.pdf","docs/synthos/technicky-list-xps-prime-g-pl.pdf","docs/synthos/technicky-list-xps-prime-s-sk-09-2026.pdf","docs/synthos/vyhlasenie-o-parametroch-xps-prime-d-30-pl.pdf","docs/synthos/vyhlasenie-o-parametroch-xps-prime-g-30-pl.pdf","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/icon.svg","img/brand/bauder.webp","img/brand/dkmont.webp","img/brand/hoch-xps.webp","img/brand/izovat.webp","img/brand/klimas-35.svg","img/brand/klimas.webp","img/brand/knauf.webp","img/brand/koda.webp","img/brand/nexler.webp","img/brand/paroc.webp","img/brand/polyform.webp","img/brand/saint-gobain.webp","img/brand/styroprofile.webp","img/brand/styrotrade.webp","img/brand/tile-holcim.webp","img/brand/tile-synthos.webp","img/klimas/produkty/klimas-eco-drive-8.webp","img/klimas/produkty/klimas-kdh.webp","img/klimas/produkty/klimas-kgd.webp","img/klimas/produkty/klimas-kpr-fast-k.webp","img/klimas/produkty/klimas-kps-fast-s.webp","img/klimas/produkty/klimas-le-zn.webp","img/klimas/produkty/klimas-lfn-10.webp","img/klimas/produkty/klimas-lino-13.webp","img/klimas/produkty/klimas-lsi.webp","img/klimas/produkty/klimas-pmpg.webp","img/klimas/produkty/klimas-thermodrive-v2-8.webp","img/klimas/produkty/klimas-urg.webp","img/klimas/produkty/klimas-wkcp.webp","img/klimas/produkty/klimas-wkch.webp","img/klimas/produkty/klimas-ws.webp","img/logo/dahax-ink.svg","img/logo/dahax-mono-white.svg","img/logo/dahax-white.svg","img/photo/hero-bg.webp","img/photo/holcim-roof.webp","img/photo/regal-01.webp","img/photo/regal-02.webp","img/photo/regal-03.webp","img/photo/regal-04.webp","img/photo/regal-05.webp","img/photo/regal-06.webp","img/product/dkmont-profily.webp","img/product/dkmont-zaves-01.webp","img/product/dkmont-zaves-02.webp","img/product/holcim-pro-facade-35.webp","img/product/izovat-fasad.webp","img/product/izovat-strecha-skladba.webp","img/product/klimas-beton.webp","img/product/klimas-eco-drive-w-8.webp","img/product/klimas-lfmg-10.webp","img/product/klimas-thermodrive-v2-8.webp","img/product/klimas-wkcr.webp","img/product/klimas-wkcs.webp","img/product/klimas-wkpc.webp","img/product/polyform-eps.webp","img/product/profifix-skrutky.webp","img/product/styro-xps.webp","img/product/synthos-xps-prime-d.webp","img/product/synthos-xps-prime-g.webp","img/product/synthos-xps-prime-s.webp","img/sortiment/bauder-asfaltove-pasy.webp","img/sortiment/bauder-fpo-folie.webp","img/sortiment/bauder-pir-izolacie.webp","img/sortiment/hoch-xps-200-300.webp","img/sortiment/hoch-xps-500-700.webp","img/sortiment/holcim-balenie.webp","img/sortiment/izovat-podkrovia-a-pricky.webp","img/sortiment/izovat-podlahy.webp","img/sortiment/klimas-thermodrive-v2.webp","img/sortiment/koda-profily-cw.webp","img/sortiment/koda-profily-uw-ud-cd.webp","img/sortiment/nexler-podkladove-pasy.webp","img/sortiment/nexler-specialne-pasy.webp","img/sortiment/nexler-vrchne-pasy.webp","img/sortiment/paroc-etics.webp","img/sortiment/paroc-odvetravane-fasady.webp","img/sortiment/paroc-ploche-strechy.webp","img/sortiment/paroc-stropy-a-konstrukcie.webp","img/sortiment/polyform-spadove-strechy.webp","img/sortiment/polyform-variant-haus.webp","img/sortiment/styroprofile-profily-etics.webp","img/sortiment/styroprofile-rohy-omietky.webp","img/sortiment/styroprofile-sadrokarton.webp","img/sortiment/styrotrade-fasady-etics.webp","img/sortiment/styrotrade-strechy-podlahy.webp","img/sortiment/styrotrade-styro-xps.webp","img/sortiment/styrotrade-styrofloor.webp","img/sortiment/synthos-hrube-dosky-tb.webp","img/sortiment/synthos-pouzitie-a-zataz.webp","img/sortiment/weber-fasadne-omietky.webp","img/sortiment/weber-lepiace-malty-etics.webp","img/sortiment/weber-lepidla-obklady.webp","manifest.webmanifest","vendor/pdfjs/LICENSE.txt","vendor/pdfjs/pdf.min.mjs","vendor/pdfjs/pdf.worker.min.mjs","video/klimas/klimas-drevostavba.mp4","video/klimas/klimas-drevostavba.webp","video/klimas/klimas-eco-drive-s.mp4","video/klimas/klimas-eco-drive-s.webp","video/klimas/klimas-eco-drive-w.mp4","video/klimas/klimas-eco-drive-w.webp","video/klimas/klimas-firma.mp4","video/klimas/klimas-firma.webp","video/klimas/klimas-fixplug.mp4","video/klimas/klimas-fixplug.webp","video/klimas/klimas-chemicke-kotvy.mp4","video/klimas/klimas-chemicke-kotvy.webp","video/klimas/klimas-kpr-kps-fast.mp4","video/klimas/klimas-kpr-kps-fast.webp","video/klimas/klimas-le.mp4","video/klimas/klimas-le.webp","video/klimas/klimas-lino.mp4","video/klimas/klimas-lino.webp","video/klimas/klimas-sfx.mp4","video/klimas/klimas-sfx.webp","video/klimas/klimas-skrutky-do-dreva.mp4","video/klimas/klimas-skrutky-do-dreva.webp","video/klimas/klimas-thermodrive-v2.mp4","video/klimas/klimas-thermodrive-v2.webp","video/klimas/klimas-wfd.mp4","video/klimas/klimas-wfd.webp","video/klimas/klimas-wkcp-wkcs.mp4","video/klimas/klimas-wkcp-wkcs.webp","video/klimas/klimas-wkfc-wkfs.mp4","video/klimas/klimas-wkfc-wkfs.webp","video/klimas/klimas-wkss.mp4","video/klimas/klimas-wkss.webp","video/klimas/klimas-wktherm-s.mp4","video/klimas/klimas-wktherm-s.webp","video/klimas/klimas-ws.mp4","video/klimas/klimas-ws.webp"];

self.addEventListener("install", (e) => {
  // Katalógy výrobcov (docs/<firma>/) sa ukladajú po jednom – jeden zlyhaný PDF nezablokuje inštaláciu.
  const isCatalog = (f) => /^(docs\/[^/]+|video)\//.test(f);
  e.waitUntil(
    caches
      .open(PRECACHE)
      .then(async (c) => {
        await c.addAll(FILES.filter((f) => !isCatalog(f)));
        await Promise.allSettled(FILES.filter(isCatalog).map((f) => c.add(f)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== PRECACHE && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

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

// video z cache: prehliadač pýta časti súboru (Range) – bez odpovede 206 sa offline nespustí
const rangeResponse = async (req) => {
  const hit = await caches.match(req.url, { ignoreSearch: true });
  if (!hit) return fetch(req);
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

const cacheFirst = async (req) => {
  const hit = await caches.match(req, { ignoreSearch: true });
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
  if (req.headers.has("range")) {
    e.respondWith(rangeResponse(req));
    return;
  }
  e.respondWith(cacheFirst(req));
});
