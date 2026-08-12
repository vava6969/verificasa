// Compune cadrele capturate în rotație (unghi cunoscut, interval uniform —
// vezi WalkthroughCapture + useTourOrientation) într-o singură imagine
// panoramică 360° continuă, afișabilă cu un viewer de panoramă real
// (vezi PanoramaViewer.jsx), în loc să "sară" între poze individuale.
//
// Nu facem o deformare cilindrică pe pixel (ar necesita distanța focală
// exactă a lentilei, pe care API-ul camerei din browser nu o expune) —
// folosim doar fâșia centrală, cu cea mai mică distorsiune, din fiecare
// poză, așezată la unghiul ei, cu o zonă de estompare (feather) între
// fâșii vecine ca să nu se vadă cusătura. Cu destule cadre dense, diferența
// față de o proiecție "corectă" e greu de observat.
//
// Onest: fără trepied/punct nodal, la interior pot rămâne mici artefacte
// pe obiecte foarte apropiate de cameră (paralaxă) — e o limitare fizică,
// nu una de algoritm.
const ASSUMED_HFOV_DEG = 68; // FOV orizontal tipic pt. camera principală a unui telefon
const ASSUMED_VFOV_DEG = 50; // FOV vertical aproximativ corespunzător
const FEATHER_RATIO = 0.35; // cât din lățimea unei "felii" e zonă de tranziție, pe fiecare margine

function avgLuma(img, sampleSize = 24) {
  const c = document.createElement("canvas");
  c.width = sampleSize; c.height = sampleSize;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  return sum / (data.length / 4);
}

// Desenează o felie sursă pe canvas-ul destinație cu o mască alfa în trapez
// (transparentă la margini, opacă în centru), ca marginile ei să se topească
// peste feliile vecine în loc de o tăietură dreaptă. destX poate fi negativ
// sau poate depăși lățimea canvas-ului — caller-ul se ocupă de wraparound.
function drawFeatheredSlice(destCtx, img, srcX, srcW, srcH, destX, destW, destH, featherPx, brightness) {
  const w = Math.max(1, Math.round(destW));
  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = Math.round(destH);
  const tctx = tmp.getContext("2d");
  tctx.filter = `brightness(${brightness})`;
  tctx.drawImage(img, srcX, 0, srcW, srcH, 0, 0, w, tmp.height);
  tctx.filter = "none";
  tctx.globalCompositeOperation = "destination-in";
  const f = Math.min(0.49, featherPx / w);
  const grad = tctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(f, "rgba(0,0,0,1)");
  grad.addColorStop(1 - f, "rgba(0,0,0,1)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  tctx.fillStyle = grad;
  tctx.fillRect(0, 0, w, tmp.height);
  destCtx.drawImage(tmp, Math.round(destX), 0);
}

/**
 * @param {Blob[]} frameBlobs cadre în ordinea capturii, uniform distanțate pe 360°
 * @returns {Promise<{blob: Blob, hfovDeg: number, vfovDeg: number}|null>}
 */
export async function stitchPanorama(frameBlobs) {
  const blobs = (frameBlobs || []).filter(Boolean);
  if (blobs.length < 6) return null; // prea puține cadre ca să merite o panoramă

  const objectUrls = [];
  try {
    const imgs = [];
    for (const b of blobs) {
      const url = URL.createObjectURL(b);
      objectUrls.push(url);
      imgs.push(await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      }));
    }

    const n = imgs.length;
    const stepDeg = 360 / n;
    const srcW = imgs[0].naturalWidth;
    const srcH = imgs[0].naturalHeight;
    const pxPerDeg = srcW / ASSUMED_HFOV_DEG; // aceeași scară folosită la decupaj și la plasare

    const outW = Math.round(pxPerDeg * 360);
    const outH = srcH;
    const tileW = outW / n; // lățime exactă (fracțională) a unei felii, fără estompare
    const sliceSrcW = Math.min(srcW, Math.round(tileW));
    const sliceSrcX = Math.round((srcW - sliceSrcW) / 2);
    const featherPx = Math.round(tileW * FEATHER_RATIO);
    const wideSrcW = Math.min(srcW, sliceSrcW + featherPx * 2);
    const wideSrcX = Math.round((srcW - wideSrcW) / 2);

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");

    const lums = imgs.map((img) => avgLuma(img));
    const targetLum = lums.reduce((a, b) => a + b, 0) / lums.length;
    const brightnessFor = (i) => Math.max(0.6, Math.min(1.6, targetLum / Math.max(lums[i], 1)));

    // Trecere 1: felii lipite cap la cap, fără estompare — acoperă tot
    // canvas-ul fără goluri (+1px suprapunere ca să ascundem rotunjirile).
    for (let i = 0; i < n; i++) {
      const destX = Math.round(i * tileW);
      const destW = Math.ceil(tileW) + 1;
      ctx.save();
      ctx.filter = `brightness(${brightnessFor(i)})`;
      ctx.drawImage(imgs[i], sliceSrcX, 0, sliceSrcW, srcH, destX, 0, destW, outH);
      ctx.restore();
    }

    // Trecere 2: felii mai late, cu estompare pe margini, suprapuse peste
    // trecerea 1 ca să ascundă cusăturile. destCenterX poate cădea în afara
    // canvas-ului lângă 0°/360° — desenăm și copia "înfășurată".
    const wideDestW = wideSrcW; // aceeași scară (pxPerDeg) peste tot, deci 1:1
    for (let i = 0; i < n; i++) {
      const destCenterX = (i + 0.5) * tileW - tileW / 2 + tileW / 2; // = i*tileW + tileW/2, scris explicit pt. claritate
      const destX = destCenterX - wideDestW / 2;
      const brightness = brightnessFor(i);
      drawFeatheredSlice(ctx, imgs[i], wideSrcX, wideSrcW, srcH, destX, wideDestW, outH, featherPx, brightness);
      if (destX < 0) drawFeatheredSlice(ctx, imgs[i], wideSrcX, wideSrcW, srcH, destX + outW, wideDestW, outH, featherPx, brightness);
      if (destX + wideDestW > outW) drawFeatheredSlice(ctx, imgs[i], wideSrcX, wideSrcW, srcH, destX - outW, wideDestW, outH, featherPx, brightness);
    }

    const blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.87));
    if (!blob) return null;
    return { blob, hfovDeg: 360, vfovDeg: ASSUMED_VFOV_DEG };
  } catch (e) {
    return null; // panorama e un bonus — dacă eșuează, rămânem pe viewer-ul cu cadre discrete
  } finally {
    objectUrls.forEach((u) => URL.revokeObjectURL(u));
  }
}
