import React, { useEffect, useRef, useState } from "react";

// The 3D scan — VerifiCasa's USP made visible. A LiDAR-style point cloud of a
// house, slowly rotating while a scan plane sweeps through it and lights the
// points it touches. Drawn as an instrument display: dark ground in both
// themes, mono readout in the frame (the one place mono type is allowed).
//
// three.js is loaded lazily (dynamic import) so its weight never touches the
// initial bundle; the scene pauses off-screen and renders a single static
// frame for prefers-reduced-motion.

function buildHousePoints(THREE) {
  const pts = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  // walls: box 2.2 x 1.3 x 1.5 (x, y, z), sampled on the 4 vertical faces
  const W = 2.2, H = 1.3, D = 1.5;
  for (let i = 0; i < 2100; i++) {
    const face = Math.floor(Math.random() * 4);
    if (face === 0) pts.push(rand(-W / 2, W / 2), rand(0, H), D / 2);
    else if (face === 1) pts.push(rand(-W / 2, W / 2), rand(0, H), -D / 2);
    else if (face === 2) pts.push(W / 2, rand(0, H), rand(-D / 2, D / 2));
    else pts.push(-W / 2, rand(0, H), rand(-D / 2, D / 2));
  }
  // roof: prism from wall top (y=H) to ridge (y=H+0.75) along x
  const RH = 0.75;
  for (let i = 0; i < 1300; i++) {
    const x = rand(-W / 2, W / 2);
    const side = Math.random() < 0.5 ? 1 : -1;
    const tRoof = Math.random(); // 0 at eave, 1 at ridge
    const y = H + tRoof * RH;
    const z = side * (D / 2) * (1 - tRoof);
    pts.push(x, y, z);
  }
  // gable ends (triangles at x = ±W/2)
  for (let i = 0; i < 380; i++) {
    const side = Math.random() < 0.5 ? 1 : -1;
    const tRoof = Math.random();
    const y = H + tRoof * RH;
    const zMax = (D / 2) * (1 - tRoof);
    pts.push(side * (W / 2), y, rand(-zMax, zMax));
  }
  // ground scatter around the house
  for (let i = 0; i < 420; i++) {
    const x = rand(-W, W), z = rand(-D, D);
    if (Math.abs(x) > W / 2 + 0.08 || Math.abs(z) > D / 2 + 0.08) pts.push(x, 0, z);
  }
  return new THREE.Float32BufferAttribute(pts, 3);
}

export default function Hero3DScan({ className = "" }) {
  const hostRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let renderer, scene, camera, points, positions, colors, raf = 0;
    let visible = true, reduced = false;
    const host = hostRef.current;
    if (!host) return undefined;

    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch { /* noop */ }

    let observer;

    import("three")
      .then((THREE) => {
        if (disposed || !hostRef.current) return;

        const width = host.clientWidth || 480;
        const height = host.clientHeight || 240;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        host.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
        camera.position.set(0, 1.7, 4.6);
        camera.lookAt(0, 0.75, 0);

        const posAttr = buildHousePoints(THREE);
        positions = posAttr.array;
        const count = positions.length / 3;
        colors = new Float32Array(positions.length);

        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", posAttr);
        geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
          size: 0.028,
          vertexColors: true,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        });
        points = new THREE.Points(geom, mat);
        scene.add(points);

        // base dot: warm paper grey; scanned dot: verde
        const base = new THREE.Color("#8d938d");
        const hot = new THREE.Color("#37A06B");
        const tmp = new THREE.Color();

        const paint = (scanY) => {
          for (let i = 0; i < count; i++) {
            const y = positions[i * 3 + 1];
            const d = Math.abs(y - scanY);
            const k = Math.max(0, 1 - d / 0.22); // 0..1 near the scan plane
            tmp.copy(base).lerp(hot, k * k);
            colors[i * 3] = tmp.r;
            colors[i * 3 + 1] = tmp.g;
            colors[i * 3 + 2] = tmp.b;
          }
          geom.attributes.color.needsUpdate = true;
        };

        const clock = new THREE.Clock();
        const tick = () => {
          if (disposed) return;
          raf = requestAnimationFrame(tick);
          if (!visible) return;
          const t = clock.getElapsedTime();
          points.rotation.y = t * 0.22;
          // scan plane sweeps 0 -> 2.1 and holds a beat at the top
          const cycle = (t % 6) / 6;
          const scanY = cycle < 0.85 ? (cycle / 0.85) * 2.1 : 2.1;
          paint(scanY);
          renderer.render(scene, camera);
        };

        if (reduced) {
          points.rotation.y = 0.6;
          paint(0.9);
          renderer.render(scene, camera);
        } else {
          tick();
        }

        observer = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
        observer.observe(host);

        const onResize = () => {
          if (disposed || !hostRef.current) return;
          const w = host.clientWidth, h = host.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          if (reduced) renderer.render(scene, camera);
        };
        window.addEventListener("resize", onResize);
        host.__vcCleanup = () => window.removeEventListener("resize", onResize);
      })
      .catch(() => { if (!disposed) setFailed(true); });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
      if (host.__vcCleanup) host.__vcCleanup();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement?.parentNode === host) host.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (failed) return null;

  return (
    <div className={`relative overflow-hidden border border-border bg-[#12161F] ${className}`}>
      <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />
      {/* instrument readout — mono lives here, on the instrument, nowhere else */}
      <span className="vc-photomark left-3 top-2.5">SCANARE 3D · ACTIVĂ</span>
      <span className="vc-photomark bottom-2.5 left-3">IS-4471-KMQZ</span>
      <span className="vc-photomark bottom-2.5 right-3">54 MP · ET. 3/4</span>
    </div>
  );
}
