// Public image proxy that bypasses browser CORS restrictions.
// Used by the Shareable Story Card (html2canvas) and the PDF brochure
// (jsPDF) to embed listing photos that live on external CDNs which don't
// send `Access-Control-Allow-Origin`. Fetches the bytes server-side and
// returns them as a base64 data URL the browser canvas can use without
// tainting.
Deno.serve(async (req) => {
  try {
    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const url = body.url;
    if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return Response.json({ error: "invalid url" }, { status: 400 });
    }

    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return Response.json({ error: `fetch failed: ${res.status}` }, { status: 502 });

    const contentType = (res.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
    if (!/^image\//i.test(contentType) && contentType !== "application/octet-stream") {
      return Response.json({ error: `unsupported content-type: ${contentType}` }, { status: 415 });
    }

    const buf = await res.arrayBuffer();
    // Reject payloads larger than 8MB to keep the response JSON manageable.
    if (buf.byteLength > 8 * 1024 * 1024) {
      return Response.json({ error: "image too large" }, { status: 413 });
    }

    const bytes = new Uint8Array(buf);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
    }
    const b64 = btoa(binary);

    return Response.json({
      dataUrl: `data:${contentType};base64,${b64}`,
      mime: contentType,
      bytes: bytes.length,
    });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});