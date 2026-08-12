import React, { useEffect, useMemo, useRef, useState } from "react";
import { RotateCw, ChevronLeft, ChevronRight, X, Move } from "lucide-react";

// Pseudo-360° "privește în jur" viewer. Fiecare cameră e o secvență de poze
// aliniate unghiular (vezi WalkthroughCapture + useTourOrientation). Tragi cu
// mouse-ul/degetul stânga-dreapta ca să schimbi cadrul, cu inerție la eliberare
// și crossfade între cadre — nu e o reconstrucție 3D reală, dar apropiată de
// senzația "smooth" a unui tur ghidat, în întregime din browser.
const DRAG_SENSITIVITY = 10; // px per pas de cadru
const FRICTION = 0.93;
const AUTO_SPIN_MS = 2600;

const mod = (n, m) => ((n % m) + m) % m;

export default function WalkthroughViewer({ rooms = [], initialRoomIndex = 0, onClose, className = "" }) {
  const validRooms = useMemo(() => (rooms || []).filter((r) => r?.frame_urls?.length), [rooms]);
  const [roomIdx, setRoomIdx] = useState(() => Math.min(initialRoomIndex, Math.max(validRooms.length - 1, 0)));
  const [frameIdx, setFrameIdx] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const dragRef = useRef(null);
  const velocityRef = useRef(0);
  const lastMoveRef = useRef({ t: 0, x: 0 });
  const inertiaRafRef = useRef(null);
  const autoSpinRafRef = useRef(null);

  const room = validRooms[roomIdx];
  const frames = room?.frame_urls || [];

  const cancelInertia = () => {
    if (inertiaRafRef.current) { cancelAnimationFrame(inertiaRafRef.current); inertiaRafRef.current = null; }
  };
  const cancelAutoSpin = () => {
    if (autoSpinRafRef.current) { cancelAnimationFrame(autoSpinRafRef.current); autoSpinRafRef.current = null; }
    setAutoSpin(false);
  };

  // La schimbarea camerei: preîncărcăm + decodăm cadrele, apoi rulăm o
  // "tură" demonstrativă automată (ca un pan de intrare în cameră gen
  // Matterport), dacă utilizatorul n-a cerut mișcare redusă.
  useEffect(() => {
    cancelInertia();
    cancelAutoSpin();
    setFrameIdx(0);
    frames.forEach((url) => {
      const img = new Image();
      img.src = url;
      if (img.decode) img.decode().catch(() => {});
    });

    const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (frames.length > 2 && !reduceMotion) {
      setAutoSpin(true);
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / AUTO_SPIN_MS, 1);
        const eased = 1 - Math.pow(1 - t, 2);
        setFrameIdx(Math.round(eased * (frames.length - 1)));
        if (t < 1) {
          autoSpinRafRef.current = requestAnimationFrame(tick);
        } else {
          autoSpinRafRef.current = null;
          setAutoSpin(false);
        }
      };
      autoSpinRafRef.current = requestAnimationFrame(tick);
    }
    return () => { cancelInertia(); cancelAutoSpin(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomIdx, room?.frame_urls?.length]);

  useEffect(() => {
    if (!showHint) return;
    const t = setTimeout(() => setShowHint(false), 2600);
    return () => clearTimeout(t);
  }, [showHint, roomIdx]);

  useEffect(() => () => { cancelInertia(); cancelAutoSpin(); }, []);

  if (!room) return null;

  const onPointerDown = (e) => {
    if (frames.length < 2) return;
    cancelAutoSpin();
    cancelInertia();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const now = performance.now();
    dragRef.current = { startX: e.clientX, startFrame: frameIdx };
    lastMoveRef.current = { t: now, x: e.clientX };
    velocityRef.current = 0;
    setDragging(true);
    setShowHint(false);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const now = performance.now();
    const dt = now - lastMoveRef.current.t;
    if (dt > 0) velocityRef.current = (e.clientX - lastMoveRef.current.x) / dt;
    lastMoveRef.current = { t: now, x: e.clientX };
    const delta = e.clientX - dragRef.current.startX;
    const step = Math.round(-delta / DRAG_SENSITIVITY);
    setFrameIdx(mod(dragRef.current.startFrame + step, frames.length));
  };
  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
    const v = velocityRef.current;
    if (Math.abs(v) > 0.05 && frames.length > 1) {
      let vel = v;
      let acc = 0;
      const step = () => {
        vel *= FRICTION;
        acc += (-vel * 16) / DRAG_SENSITIVITY;
        if (Math.abs(acc) >= 1) {
          const whole = Math.trunc(acc);
          acc -= whole;
          setFrameIdx((i) => mod(i + whole, frames.length));
        }
        if (Math.abs(vel) > 0.015) {
          inertiaRafRef.current = requestAnimationFrame(step);
        } else {
          inertiaRafRef.current = null;
        }
      };
      inertiaRafRef.current = requestAnimationFrame(step);
    }
  };
  const goRoom = (dir) => setRoomIdx((i) => mod(i + dir, validRooms.length));

  return (
    <div className={`relative select-none overflow-hidden rounded-2xl border border-border bg-navy-deep shadow-soft ${className}`}>
      <div
        className={`relative aspect-[16/10] w-full touch-none ${dragging ? "cursor-grabbing" : frames.length > 1 ? "cursor-grab" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <CrossfadeStage src={frames[frameIdx]} alt={room.room_name} />

        {showHint && !autoSpin && frames.length > 1 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy-deep/25">
            <span className="flex items-center gap-2 rounded-full bg-navy-deep/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
              <Move className="h-3.5 w-3.5" /> Trage pentru a privi în jur
            </span>
          </div>
        )}

        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-navy-deep/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          <RotateCw className="h-3.5 w-3.5" /> {room.room_name}
        </span>

        {onClose && (
          <button type="button" onClick={onClose} aria-label="Închide" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-navy-deep/70 text-white backdrop-blur transition hover:bg-navy-deep/90">
            <X className="h-4 w-4" />
          </button>
        )}

        {frames.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-navy-deep/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {frameIdx + 1}/{frames.length}
          </span>
        )}

        {validRooms.length > 1 && (
          <>
            <button type="button" onClick={(e) => { e.stopPropagation(); goRoom(-1); }} aria-label="Camera anterioară" className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); goRoom(1); }} aria-label="Camera următoare" className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {validRooms.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto bg-navy-deep p-2.5">
          {validRooms.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRoomIdx(i)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${i === roomIdx ? "bg-emerald text-white" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
            >
              {r.room_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Două straturi de imagine: cel de jos rămâne fix pe ultimul cadru "stabilit",
// cel de sus intră cu fade-in pe cadrul nou — evită tăietura seacă între poze
// consecutive și dă senzația de tranziție netedă.
function CrossfadeStage({ src, alt }) {
  const [bottomSrc, setBottomSrc] = useState(src);
  const [topSrc, setTopSrc] = useState(null);
  const [topVisible, setTopVisible] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!src || src === bottomSrc) return;
    setTopSrc(src);
    setTopVisible(false);
    const raf = requestAnimationFrame(() => setTopVisible(true));
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setBottomSrc(src);
      setTopSrc(null);
      setTopVisible(false);
    }, 150);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <>
      {bottomSrc && <img src={bottomSrc} alt={alt} draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" />}
      {topSrc && (
        <img
          src={topSrc}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-150 ease-out"
          style={{ opacity: topVisible ? 1 : 0 }}
        />
      )}
    </>
  );
}
