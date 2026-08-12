import React, { useEffect, useMemo, useRef, useState } from "react";
import { RotateCw, ChevronLeft, ChevronRight, X, Move } from "lucide-react";

// Pseudo-360° "privește în jur" viewer. Fiecare cameră e o secvență de poze
// capturate cât timp proprietarul se rotea pe loc (vezi WalkthroughCapture).
// Tragi cu mouse-ul/degetul stânga-dreapta ca să schimbi cadrul — nu e o
// reconstrucție 3D reală, dar simulează convingător senzația de "mers prin casă".
const DRAG_SENSITIVITY = 10; // px per pas de cadru

const mod = (n, m) => ((n % m) + m) % m;

export default function WalkthroughViewer({ rooms = [], initialRoomIndex = 0, onClose, className = "" }) {
  const validRooms = useMemo(() => (rooms || []).filter((r) => r?.frame_urls?.length), [rooms]);
  const [roomIdx, setRoomIdx] = useState(() => Math.min(initialRoomIndex, Math.max(validRooms.length - 1, 0)));
  const [frameIdx, setFrameIdx] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);

  const room = validRooms[roomIdx];
  const frames = room?.frame_urls || [];

  useEffect(() => {
    setFrameIdx(0);
    frames.forEach((url) => { const img = new Image(); img.src = url; });
  }, [roomIdx, room?.frame_urls?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showHint) return;
    const t = setTimeout(() => setShowHint(false), 2600);
    return () => clearTimeout(t);
  }, [showHint, roomIdx]);

  if (!room) return null;

  const onPointerDown = (e) => {
    if (frames.length < 2) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { startX: e.clientX, startFrame: frameIdx };
    setDragging(true);
    setShowHint(false);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const delta = e.clientX - dragRef.current.startX;
    const step = Math.round(-delta / DRAG_SENSITIVITY);
    setFrameIdx(mod(dragRef.current.startFrame + step, frames.length));
  };
  const endDrag = () => { dragRef.current = null; setDragging(false); };
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
        {frames[frameIdx] && (
          <img src={frames[frameIdx]} alt={room.room_name} draggable={false} className="h-full w-full select-none object-cover" />
        )}

        {showHint && frames.length > 1 && (
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
