import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Model 3D real (reconstruit din video via Kiri Engine), afișat cu
// <model-viewer> — componenta web open-source a Google (modelviewer.dev).
// Chiar poți "orbita" liber în jurul camerei, nu doar privi dintr-un punct
// fix ca la panoramă — cel mai aproape ajungem de senzația Matterport,
// construit integral din browser.
const SCRIPT_SRC = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

let loadPromise = null;
function loadModelViewer() {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (customElements.get("model-viewer")) return resolve();
    const s = document.createElement("script");
    s.type = "module";
    s.src = SCRIPT_SRC;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("model-viewer load failed"));
    document.head.appendChild(s);
  });
  return loadPromise;
}

export default function Model3DViewer({ src, className = "" }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadModelViewer().then(() => { if (!cancelled) setReady(true); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!ready) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-navy-deep ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-white/70" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line react/no-unknown-property
    <model-viewer
      src={src}
      camera-controls="true"
      touch-action="pan-y"
      auto-rotate="true"
      rotation-per-second="8deg"
      shadow-intensity="0.6"
      exposure="1"
      environment-image="neutral"
      style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
      className={className}
    />
  );
}
