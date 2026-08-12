import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// Viewer de panoramă reală (Pannellum), încărcat dinamic din CDN — aceeași
// tehnică de lazy-load ca la Google Maps (vezi PropertyGoogleMap.jsx).
// Panorama noastră acoperă tot orizontul (360°) dar doar o bandă pe
// verticală (nu avem date deasupra/dedesubt), deci o tratăm ca o imagine
// equirectangulară parțială — Pannellum suportă nativ acest caz prin
// haov/vaov/vOffset.
const PANNELLUM_JS = "https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.js";
const PANNELLUM_CSS = "https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.css";

let loadPromise = null;
function loadPannellum() {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (window.pannellum) return resolve();
    if (!document.querySelector(`link[href="${PANNELLUM_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = PANNELLUM_CSS;
      document.head.appendChild(link);
    }
    const s = document.createElement("script");
    s.src = PANNELLUM_JS;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("pannellum load failed"));
    document.head.appendChild(s);
  });
  return loadPromise;
}

export default function PanoramaViewer({ src, vfovDeg = 50, className = "" }) {
  const elRef = useRef(null);
  const viewerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    loadPannellum().then(() => {
      if (cancelled || !elRef.current || !window.pannellum) return;
      viewerRef.current?.destroy?.();
      viewerRef.current = window.pannellum.viewer(elRef.current, {
        type: "equirectangular",
        panorama: src,
        haov: 360,
        vaov: vfovDeg,
        vOffset: 0,
        minHfov: 40,
        maxHfov: 110,
        hfov: 90,
        autoLoad: true,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        compass: false,
        friction: 0.12,
        avoidShowingBackground: true,
      });
      viewerRef.current.on("load", () => { if (!cancelled) setReady(true); });
    }).catch(() => {});
    return () => {
      cancelled = true;
      viewerRef.current?.destroy?.();
      viewerRef.current = null;
    };
  }, [src, vfovDeg]);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={elRef} className="h-full w-full" />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy-deep">
          <Loader2 className="h-6 w-6 animate-spin text-white/70" />
        </div>
      )}
    </div>
  );
}
