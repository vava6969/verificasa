import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { useToast } from "@/components/ui/use-toast";
import { compressImage } from "@/lib/imageUpload";
import WalkthroughViewer from "@/components/WalkthroughViewer";
import {
  X, Home, RotateCw, Sparkles, Camera, Check, Trash2, Plus,
  Loader2, ChevronLeft, AlertTriangle,
} from "lucide-react";

const FRAMES_PER_ROOM = 16;
const CAPTURE_INTERVAL_MS = 480;
const MAX_ROOMS = 10;
const QUICK_ROOMS = ["Living", "Bucătărie", "Dormitor", "Baie", "Hol", "Balcon / Terasă"];

export default function WalkthroughCapture() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useCountry();
  const { toast } = useToast();
  const en = lang === "en";

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]); // camere deja salvate (DB + sesiunea curentă)
  const [stage, setStage] = useState("intro"); // intro | live | countdown | capturing | review | summary
  const [roomName, setRoomName] = useState("");
  const [cameraError, setCameraError] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [pendingFrames, setPendingFrames] = useState([]);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    document.title = "Tur virtual 360° · VerifiCasa";
    return () => { document.title = "VerifiCasa"; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await base44.entities.Property.get(id);
        if (cancelled) return;
        setProperty(p);
        const existing = await base44.entities.PropertyTourRoom.filter({ property_id: id }, "order_index", 100).catch(() => []);
        if (!cancelled && existing?.length) {
          setRooms(existing.map((r) => ({ id: r.id, room_name: r.room_name, frame_urls: r.frame_urls || [] })));
          setStage("summary");
        }
      } catch (e) {
        if (!cancelled) setProperty(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  useEffect(() => () => stopCamera(), []);

  // Re-atașează stream-ul existent la revenirea pe ecranul de captură (fără a
  // cere din nou permisiunea camerei între camere).
  useEffect(() => {
    if (stage === "live" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [stage]);

  useEffect(() => {
    if (stage !== "countdown") return;
    if (countdown <= 0) { setStage("capturing"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [stage, countdown]);

  useEffect(() => {
    if (stage !== "capturing") return;
    let cancelled = false;
    const frames = [];
    const grab = () => {
      const video = videoRef.current, canvas = canvasRef.current;
      if (cancelled || !video || !canvas || !video.videoWidth) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (cancelled || !blob) return;
        frames.push(blob);
        setCaptureProgress(frames.length);
        if (frames.length >= FRAMES_PER_ROOM) {
          setPendingFrames(frames);
          setStage("review");
        }
      }, "image/jpeg", 0.85);
    };
    const interval = setInterval(grab, CAPTURE_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [stage]);

  const previewUrls = useMemo(() => pendingFrames.map((b) => URL.createObjectURL(b)), [pendingFrames]);
  useEffect(() => () => { previewUrls.forEach((u) => URL.revokeObjectURL(u)); }, [previewUrls]);

  if (loading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-background"><Loader2 className="h-6 w-6 animate-spin text-emerald" /></div>;
  }
  if (!property) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-heading text-xl font-bold text-navy dark:text-foreground">{en ? "Listing not found" : "Anunț negăsit"}</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-emerald hover:underline">{en ? "Back home" : "Înapoi acasă"}</Link>
      </div>
    );
  }
  const isAdmin = user && ["SUPER_ADMIN", "ADMIN"].includes((user.role || "").toUpperCase());
  const canEdit = !!user && (isAdmin || (user.id && property.created_by_id === user.id));
  if (!canEdit) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
        <p className="mt-3 font-heading text-xl font-bold text-navy dark:text-foreground">{en ? "You can't edit this listing" : "Nu poți edita acest anunț"}</p>
        <Link to={`/property/${id}`} className="mt-4 inline-block text-sm font-semibold text-emerald hover:underline">{en ? "Back to listing" : "Înapoi la anunț"}</Link>
      </div>
    );
  }

  const exit = () => { stopCamera(); navigate(`/property/${id}`); };

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(en ? "Your browser doesn't support camera access." : "Browserul tău nu suportă acces la cameră.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setStage("live");
      // videoRef se atașează prin efectul de mai sus, imediat ce elementul se montează
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(() => {});
        }
      }, 0);
    } catch (err) {
      setCameraError(
        err?.name === "NotAllowedError"
          ? (en ? "Camera access was blocked. Allow it in your browser settings and try again." : "Ai blocat accesul la cameră. Permite accesul din setările browserului și încearcă din nou.")
          : (en ? "Couldn't access the camera. Make sure no other app is using it." : "Nu am putut accesa camera. Verifică dacă alt program o folosește.")
      );
    }
  };

  const beginCapture = () => {
    if (!roomName.trim()) return;
    setCaptureProgress(0);
    setCountdown(3);
    setStage("countdown");
  };

  const retake = () => { setPendingFrames([]); setStage("live"); };

  const confirmRoom = async () => {
    setSaving(true);
    try {
      const uploaded = await Promise.all(
        pendingFrames.map(async (blob) => {
          const small = await compressImage(blob, 1000, 0.75);
          const { file_url } = await base44.integrations.Core.UploadFile({ file: small });
          return file_url;
        })
      );
      const order_index = rooms.length;
      const name = roomName.trim();
      const rec = await base44.entities.PropertyTourRoom.create({ property_id: id, room_name: name, order_index, frame_urls: uploaded });
      setRooms((r) => [...r, { id: rec.id, room_name: name, frame_urls: uploaded }]);
      setPendingFrames([]);
      setRoomName("");
      setStage("summary");
      toast({ title: en ? `“${name}” saved` : `Camera „${name}” a fost salvată` });
    } catch (e) {
      toast({ title: en ? "Couldn't save this room" : "Eroare la salvarea camerei", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteRoom = async (roomId, idx) => {
    setRooms((r) => r.filter((_, i) => i !== idx));
    if (roomId) { try { await base44.entities.PropertyTourRoom.delete(roomId); } catch (e) {} }
  };

  const finish = async () => {
    setFinishing(true);
    try {
      await base44.entities.Property.update(id, { has_walkthrough_tour: rooms.length > 0 });
      stopCamera();
      toast({ title: rooms.length ? (en ? "Virtual tour published" : "Tur virtual publicat") : (en ? "No rooms added" : "Nicio cameră adăugată") });
      navigate(`/property/${id}`);
    } catch (e) {
      toast({ title: en ? "Couldn't finish the tour" : "Eroare la finalizarea turului", variant: "destructive" });
    } finally {
      setFinishing(false);
    }
  };

  const cameraStage = ["live", "countdown", "capturing", "review"].includes(stage);

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-background">
      <canvas ref={canvasRef} className="hidden" />

      {cameraStage ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="relative flex-1 overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

            <button type="button" onClick={exit} aria-label={en ? "Close" : "Închide"} className="absolute left-3 top-[calc(0.75rem+env(safe-area-inset-top))] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md">
              <X className="h-5 w-5" />
            </button>
            {rooms.length > 0 && (
              <span className="absolute right-3 top-[calc(0.75rem+env(safe-area-inset-top))] z-10 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                {en ? `${rooms.length} room(s) saved` : `${rooms.length} camere salvate`}
              </span>
            )}

            {stage === "live" && (
              <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-navy-deep/90 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{en ? "Room name" : "Nume cameră"}</p>
                <input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder={en ? "e.g. Living room" : "ex: Living"}
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_ROOMS.map((r) => (
                    <button key={r} type="button" onClick={() => setRoomName(r)} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${roomName === r ? "bg-emerald text-white" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
                      {r}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-white/60">
                  {en ? "Stand in the center of the room, hold the phone at chest height." : "Stai în centrul camerei, ține telefonul la nivelul pieptului."}
                </p>
                <button type="button" onClick={beginCapture} disabled={!roomName.trim()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-emerald py-3 text-sm font-bold text-white transition hover:bg-emerald/90 disabled:cursor-not-allowed disabled:opacity-40">
                  <RotateCw className="h-4 w-4" /> {en ? "Start rotation capture" : "Pornește rotația"}
                </button>
              </div>
            )}

            {stage === "countdown" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50">
                <span className="font-heading text-7xl font-extrabold text-white">{countdown > 0 ? countdown : "!"}</span>
                <p className="text-sm font-medium text-white/80">{en ? "Get ready to slowly turn around" : "Pregătește-te să te rotești încet"}</p>
              </div>
            )}

            {stage === "capturing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35">
                <div className="relative flex h-24 w-24 items-center justify-center text-emerald">
                  <ProgressRing progress={captureProgress / FRAMES_PER_ROOM} />
                  <span className="absolute font-heading text-lg font-bold text-white">{captureProgress}/{FRAMES_PER_ROOM}</span>
                </div>
                <p className="max-w-[220px] text-center text-sm font-medium text-white/85">
                  {en ? "Turn slowly in one full circle" : "Rotește-te încet, o singură tură completă"}
                </p>
              </div>
            )}
          </div>

          {stage === "review" && (
            <div className="flex flex-col bg-navy-deep p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <WalkthroughViewer rooms={[{ room_name: roomName || (en ? "Preview" : "Previzualizare"), frame_urls: previewUrls }]} className="border-white/10" />
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={retake} disabled={saving} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50">
                  <RotateCw className="h-4 w-4" /> {en ? "Retake" : "Reia captura"}
                </button>
                <button type="button" onClick={confirmRoom} disabled={saving} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald py-2.5 text-sm font-bold text-white transition hover:bg-emerald/90 disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {saving ? (en ? "Saving…" : "Se salvează…") : (en ? "Save room" : "Salvează camera")}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <Link to={`/property/${id}`} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-emerald">
              <ChevronLeft className="h-4 w-4" /> {en ? "Back to listing" : "Înapoi la anunț"}
            </Link>
          </div>

          {stage === "intro" && (
            <div className="surface-card rounded-3xl p-6 text-center sm:p-8">
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald">
                <Sparkles className="h-3.5 w-3.5" /> {en ? "New" : "Nou"}
              </span>
              <h1 className="mt-3 font-heading text-2xl font-bold text-navy dark:text-foreground sm:text-3xl">
                {en ? "Add a 360° virtual tour" : "Adaugă un tur virtual 360°"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {en ? "Direct from your browser — no app to install. Follow 3 steps for each room." : "Direct din browser, fără nicio aplicație. Urmează 3 pași pentru fiecare cameră."}
              </p>

              <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
                {[
                  { icon: Home, t: en ? "Pick a room" : "Alege o cameră", d: en ? "Give it a name (e.g. Living room)." : "Dă-i un nume (ex: Living)." },
                  { icon: RotateCw, t: en ? "Turn around slowly" : "Rotește-te încet pe loc", d: en ? "One full circle, phone at chest height." : "O tură completă, telefonul la piept." },
                  { icon: Camera, t: en ? "We auto-capture" : "Captăm automat", d: en ? "16 photos are stitched into a look-around tour." : "16 poze devin un tur pe care vizitatorii îl pot roti." },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-white p-4 dark:bg-card">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-soft text-emerald"><s.icon className="h-4.5 w-4.5" /></span>
                    <p className="mt-2 font-heading text-sm font-bold text-navy dark:text-foreground">{i + 1}. {s.t}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
                  </div>
                ))}
              </div>

              {cameraError && (
                <p className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {cameraError}
                </p>
              )}

              <button type="button" onClick={startCamera} className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-emerald/90">
                <Camera className="h-4 w-4" /> {en ? "Turn on camera" : "Pornesc camera"}
              </button>
            </div>
          )}

          {stage === "summary" && (
            <div className="surface-card rounded-3xl p-6 sm:p-8">
              <h1 className="font-heading text-2xl font-bold text-navy dark:text-foreground">{en ? "Your virtual tour" : "Turul tău virtual"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {en ? "Rooms captured so far. Add more or publish the tour." : "Camerele capturate până acum. Mai adaugă sau publică turul."}
              </p>

              <div className="mt-5 space-y-2.5">
                {rooms.map((r, i) => (
                  <div key={r.id || i} className="flex items-center gap-3 rounded-xl border border-border bg-white p-2.5 dark:bg-card">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {r.frame_urls?.[0] && <img src={r.frame_urls[0]} alt={r.room_name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-bold text-navy dark:text-foreground">{r.room_name}</p>
                      <p className="text-xs text-muted-foreground">{r.frame_urls?.length || 0} {en ? "photos" : "poze"}</p>
                    </div>
                    <button type="button" onClick={() => deleteRoom(r.id, i)} aria-label={en ? "Remove room" : "Șterge camera"} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {rooms.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">{en ? "No rooms yet." : "Nicio cameră adăugată încă."}</p>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => (streamRef.current ? setStage("live") : startCamera())}
                  disabled={rooms.length >= MAX_ROOMS}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-emerald/40 py-2.5 text-sm font-semibold text-emerald transition hover:bg-emerald-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" /> {en ? "Add another room" : "Adaugă altă cameră"}
                </button>
                <button type="button" onClick={finish} disabled={finishing} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald py-2.5 text-sm font-bold text-white transition hover:bg-emerald/90 disabled:opacity-60">
                  {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {en ? "Publish tour" : "Finalizează turul"}
                </button>
              </div>
              {cameraError && (
                <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {cameraError}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressRing({ progress, size = 96, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(Math.max(progress, 0), 1));
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" className="transition-[stroke-dashoffset] duration-200" />
    </svg>
  );
}
