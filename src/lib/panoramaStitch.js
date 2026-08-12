// Compune cadrele capturate în rotație (unghi cunoscut, interval uniform —
// vezi WalkthroughCapture + useTourOrientation) într-o singură imagine
// panoramică 360° continuă, afișabilă cu un viewer de panoramă real
// (vezi PanoramaViewer.jsx), în loc să "sară" între poze individuale.
//
// Nu facem o deformare cilindrică pe pixel (ar necesita distanța focală
// exactă a lentilei, pe care API-ul camerei din browser nu o expune) —
// folosim doar fâșia centrală, cu cea mai mică distorsiune, din fiecare
// poză, așezată la unghiul ei, cu o zonă de estompare (feather) între
// fâșii vecine ca să nu se vadă cusătura. Cu destule cadre dense,
// diferența față de o proiecție "corectă" e greu de observat.
//
// Onest: fără trepied/punct nodal, la interior pot rămâne mici artefacte
// pe obiecte foarte apropiate de cameră (paralaxă) — e o limitare fizică,
// nu una de algoritm.
const ASSUMED_HFOV_DEG = 68; // FOV orizontal tipic pt. camera principală a unui telefon
const ASSUMED_VFOV_DEG = 50; // FOV vertical aproximativ corespunzător
const FEATHER_RATIO = 0.32; // cât din lățimea unei fâșii e zonă de tranziție (pe fiecare margine)

function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

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

// Desenează o fâșie sursă pe canvas-ul destinație, cu o mască alfa în trapez
// (transparent la margini, opac în centru) ca marginile ei să se topească
// peste fâșiile vecine în loc de o tăietură dreaptă.
function drawFeatheredStrip(destCtx, img, srcX, srcCropW, srcH, destX, destW, destH, featherPx, brightness) {
  const tmp = document.createElement("canvas");
  tmp.width = Math.max(1, Math.round(destW));
  tmp.height = Math.round(destH);
  const tctx = tmp.getContext("2d");
  tctx.filter = `brightness(${brightness})`;
  tctx.drawImage(img, srcX, 0, srcCropW, srcH, 0, 0, tmp.width, tmp.height);
  tctx.filter = "none";
  tctx.globalCompositeOperation = "destination-in";
  const f = Math.min(0.49, featherPx / tmp.width);
  const grad = tctx.createLinearGradient(0, 0, tmp.width, 0);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(f, "rgba(0,0,0,1)");
  grad.addColorStop(1 - f, "rgba(0,0,0,1)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  tctx.fillStyle = grad;
  tctx.fillRect(0, 0, tmp.width, tmp.height);
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
    const srcW = imgs[0].naturalWidth, srcH = imgs[0].naturalHeight;
    const pxPerDegSrc = srcW / ASSUMED_HFOV_DEG;
    const stripDeg = stepDeg * (1 + FEATHER_RATIO);
    const stripSrcW = Math.min(srcW, Math.round(stripDeg * pxPerDegSrc));
    const outH = srcH;
    const pxPerDegOut = stripSrcW / stripDeg;
    const outW = Math.round(pxPerDegOut * 360);

    const canvas = document.createElement("canvas");
    canvas.width = outW; canvas.height = outH;
    const ctx = canvas.getContext("2d");

    const lums = imgs.map((img) => avgLuma(img));
    const targetLum = lums.reduce((a, b) => a + b, 0) / lums.length;
    const srcCropX = Math.round((srcW - stripSrcW) / 2);
    const featherPx = Math.round(pxPerDegOut * stepDeg * FEATHER_RATIO);

    // Trecere 1: umplere completă, fâșii lipite cap la cap, fără estompare —
    // garantează că nu rămân goluri pe canvas.
    for (let i = 0; i < n; i++) {
      const angle = i * stepDeg;
      const destCenterX = (angle / 360) * outW;
      const tileW = (outW / n) + 1;
      const destX = Math.round(destCenterX - tileW / 2);
      const brightness = Math.max(0.6, Math.min(1.6, targetLum / Math.max(lums[i], 1)));
      ctx.save();
      ctx.filter = `brightness(${brightness})`;
      ctx.drawImage(imgs[i], srcCropX + (stripSrcW - Math.round((stripSrcW / stripDeg) * stepDeg)) / 2, 0, Math.round((stripSrcW / stripDeg) * stepDeg), srcH, destX, 0, tileW, outH);
      ctx.restore();
      // copie "înfășurată" la celălalt capăt al canvas-ului, ca panorama să treacă lin prin 0°/360°
      if (destX < 0) ctx.drawImage(canvas, 0, 0, outW, outH, outW, 0, outW, outH);
    }

    // Trecere 2: suprapunem fâșii mai late, cu estompare pe margini, ca să
    // ascundem cusăturile trecerii 1.
    for (let i = 0; i < n; i++) {
      const angle = i * stepDeg;
      const destCenterX = (angle / 360) * outW;
      const destX = destCenterX - (stripSrcW / stripDeg) * stepDeg * ((1 + FEATHER_RATIO) / 2) * (pxPerDegOut / pxPerDegOut);
      const destW = (stripSrcW / pxPerDegSrc) * pxPerDegOut;
      const brightness = Math.max(0.6, Math.min(1.6, targetLum / Math.max(lums[i], 1)));
      drawFeatheredStrip(ctx, imgs[i], srcCropX, stripSrcW, srcH, destCenterX - destW / 2, destW, outH, featherPx, brightness);
      if (destCenterX - destW / 2 < 0) {
        drawFeatheredStrip(ctx, imgs[i], srcCropX, stripSrcW, srcH, destCenterX - destW / 2 + outW, destW, outH, featherPx, brightness);
      }
      if (destCenterX + destW / 2 > outW) {
        drawFeatheredStrip(ctx, imgs[i], srcCropX, stripSrcW, srcH, destCenterX - destW / 2 - outW, destW, outH, featherPx, brightness);
      }
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
