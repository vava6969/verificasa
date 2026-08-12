import React, { useEffect, useMemo, useRef, useState } from "react";
import { fixWebmDuration } from "@fix-webm-duration/fix";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { useToast } from "@/components/ui/use-toast";
import { compressImage } from "@/lib/imageUpload";
import { stitchPanorama } from "@/lib/panoramaStitch";
import WalkthroughViewer from "@/components/WalkthroughViewer";
import { useTourOrientation, requestOrientationPermission } from "@/lib/useTourOrientation";
import {
  X, Home, RotateCw, Sparkles, Camera, Check, Trash2, Plus,
  Loader2, ChevronLeft, AlertTriangle, Compass, Video, Box,
} from "lucide-react";

// Tur ghidat: în loc să tragem poze "oarbe" la interval fix, folosim
// senzorii de orientare ai telefonului ca să știm exact unde se uită
// camera și declanșăm captura DOAR când proprietarul e aliniat cu
// următorul reper și stă suficient de nemișcat (fără blur de mișcare).
// Cadre uniform distanțate unghiular => playback mult mai neted în viewer,
// plus o panoramă reală lipită automat din ele (vezi panoramaStitch.js).
// Dacă dispozitivul n-are busolă/giroscop (sau refuză permisiunea pe iOS),
// trecem automat pe modul vechi, cu temporizator.
//
// Pe lângă panoramă, există și un mod "Scanare 3D" (beta): înregistrezi un
// video scurt plimbându-te prin cameră, îl trimitem la Kiri Engine
// (serviciu extern, are nevoie de cont + API key propriu — vezi
// KIRI_ENGINE_API_KEY în Settings → Secrets) și primim înapoi un model 3D
// real, explorabil liber, nu doar dintr-un punct fix.
const TARGET_COUNT = 24; // un cadru la fiecare 15°
const ALIGN_TOLERANCE_DEG = 6;
const MAX_ANGULAR_VELOCITY = 18; // grade/secundă — sub asta considerăm telefonul "nemișcat"
const STABLE_DWELL_MS = 160;
const CAPTURE_INTERVAL_MS = 420; // doar pentru modul fallback (fără senzori)
const MAX_ROOMS = 10;
const MAX_RECORD_SECONDS = 100; // clip scurt și predictibil ca mărime — sub orice limită uzuală de upload
const MAX_SCAN_PAN_VELOCITY_DEG = 45; // prag de "te miști prea repede" în timpul înregistrării video (mai permisiv decât la panoramă, unde stăm pe loc)
const SCAN_ZONE_COUNT = 4; // "colturile" camerei, ghidate live în timpul înregistrării video
const ZONE_COVERAGE_MS = 1800; // cât timp cumulat (filmat relativ stabil) într-o zonă o considerăm "acoperită"
const QUICK_ROOMS = ["Living", "Bucătărie", "Dormitor", "Baie", "Hol", "Balcon / Terasă"];

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// Upload-ul de fișiere vrea un obiect File cu nume + extensie (ca să se construiască
// corect un multipart/form-data) — un Blob simplu (cum iese din canvas.toBlob sau
// MediaRecorder) nu are nume, ceea ce poate produce un "payload invalid" la unele
// integrări de upload.
const extFromMime = (mime) => {
  if (!mime) return "bin";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("png")) return "png";
  return "bin";
};
const toNamedFile = (blob, baseName, fallbackType) => {
  if (typeof File === "undefined" || !(blob instanceof Blob)) return blob;
  const type = blob.type || fallbackType || "";
  return new File([blob], `${baseName}.${extFromMime(type)}`, { type: type || fallbackType });
};

// Împarte cei 360° în SCAN_ZONE_COUNT "colțuri" și spune în care se află telefonul acum.
const zoneIndexFor = (heading) => {
  const norm = ((heading % 360) + 360) % 360;
  return Math.floor(norm / (360 / SCAN_ZONE_COUNT));
};

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
  const [stage, setStage] = useState("intro"); // intro | live | aiming | review | recording | review3d | summary
  const [captureMode, setCaptureMode] = useState("panorama"); // panorama | scan3d
  const [roomName, setRoomName] = useState("");
  const [cameraError, setCameraError] = useState(null);
  const [pendingFrames, setPendingFrames] = useState([]);
  const [pendingVideo, setPendingVideo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [capturedMask, setCapturedMask] = useState(() => Array(TARGET_COUNT).fill(false));
  const [flash, setFlash] = useState(false);
  const [timerCountdown, setTimerCountdown] = useState(3);
  const [timerPhase, setTimerPhase] = useState("countdown"); // countdown | shooting (doar mod fallback)
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [scanBusyRoomId, setScanBusyRoomId] = useState(null);
  const [scanZonesCovered, setScanZonesCovered] = useState(() => Array(SCAN_ZONE_COUNT).fill(false));
  const [scanZoneThumbs, setScanZoneThumbs] = useState(() => Array(SCAN_ZONE_COUNT).fill(null));

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const framesRef = useRef([]);
  const baseGrabbedRef = useRef(false);
  const anchorRef = useRef(0);
  const dwellTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const recordStartRef = useRef(0);
  const zoneCoveredRef = useRef(Array(SCAN_ZONE_COUNT).fill(false));
  const zoneDwellMsRef = useRef(Array(SCAN_ZONE_COUNT).fill(0));
  const headingRef = useRef(0);
  const velRef = useRef(0);

  // Senzorii pornesc de cum ajungem pe ecranul cu camera (nu doar în timpul
  // capturii), ca detecția "suportat / nesuportat" să se rezolve din timp.
  const sensorsActive = stage === "live" || stage === "aiming" || stage === "recording";
  const { supported: orientationSupported, heading, velocity } = useTourOrientation({ active: sensorsActive });
  const mode = orientationSupported === null ? "detecting" : orientationSupported ? "orientation" : "timer";
  const relHeading = heading - anchorRef.current;

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
          setRooms(existing.map((r) => ({
            id: r.id, room_name: r.room_name, frame_urls: r.frame_urls || [],
            panorama_url: r.panorama_url, panorama_vfov_deg: r.panorama_vfov_deg,
            model_3d_status: r.model_3d_status, model_3d_serial: r.model_3d_serial, model_3d_url: r.model_3d_url,
            capture_video_url: r.capture_video_url,
          })));
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
  useEffect(() => () => {
    stopCamera();
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  }, []);

  // Re-atașează stream-ul existent la revenirea pe ecranul de captură (fără a
  // cere din nou permisiunea camerei între camere).
  useEffect(() => {
    if (stage === "live" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [stage]);

  const grabFrameFor = (idx) => {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      framesRef.current[idx] = blob;
      setCapturedMask((m) => { if (m[idx]) return m; const n = [...m]; n[idx] = true; return n; });
      setFlash(true);
      if (navigator.vibrate) { try { navigator.vibrate(20); } catch (e) {} }
      setTimeout(() => setFlash(false), 140);
    }, "image/jpeg", 0.88);
  };

  // Modul ghidat: capturăm cadrul 0 imediat, apoi așteptăm alinierea +
  // nemișcarea pentru fiecare reper următor.
  useEffect(() => {
    if (stage !== "aiming" || mode !== "orientation") return;
    const nextIdx = capturedMask.findIndex((c) => !c);
    if (nextIdx === -1) return;
    if (nextIdx === 0) {
      if (!baseGrabbedRef.current) { baseGrabbedRef.current = true; grabFrameFor(0); }
      return;
    }
    const target = nextIdx * (360 / TARGET_COUNT);
    const diff = target - relHeading;
    const aligned = Math.abs(diff) < ALIGN_TOLERANCE_DEG;
    const slow = velocity < MAX_ANGULAR_VELOCITY;
    if (aligned && slow) {
      if (!dwellTimerRef.current) {
        dwellTimerRef.current = setTimeout(() => { grabFrameFor(nextIdx); dwellTimerRef.current = null; }, STABLE_DWELL_MS);
      }
    } else if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  }, [relHeading, velocity, stage, mode, capturedMask]);

  // Mod fallback (fără senzori): countdown, apoi captură la interval fix.
  useEffect(() => {
    if (stage !== "aiming" || mode !== "timer") return;
    setTimerPhase("countdown");
    setTimerCountdown(3);
  }, [stage, mode]);

  useEffect(() => {
    if (stage !== "aiming" || mode !== "timer" || timerPhase !== "countdown") return;
    if (timerCountdown <= 0) { setTimerPhase("shooting"); return; }
    const t = setTimeout(() => setTimerCountdown((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [stage, mode, timerPhase, timerCountdown]);

  useEffect(() => {
    if (stage !== "aiming" || mode !== "timer" || timerPhase !== "shooting") return;
    let cancelled = false;
    let i = 0;
    const interval = setInterval(() => {
      if (cancelled || i >= TARGET_COUNT) return;
      grabFrameFor(i);
      i += 1;
    }, CAPTURE_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [stage, mode, timerPhase]);

  // Comun ambelor moduri de panoramă: când toate cadrele sunt gata, trecem la previzualizare.
  useEffect(() => {
    if (stage === "aiming" && capturedMask.length && capturedMask.every(Boolean)) {
      setPendingFrames(framesRef.current.slice(0, TARGET_COUNT));
      setStage("review");
    }
  }, [capturedMask, stage]);

  // Oprește automat înregistrarea video dacă atinge durata maximă.
  useEffect(() => {
    if (stage === "recording" && recording && recordSeconds >= MAX_RECORD_SECONDS) {
      stopRecording();
    }
  }, [recordSeconds, stage, recording]);

  // Ținem mereu la zi ultima orientare/viteză în refs, ca bucla de mai jos să le
  // citească fără să se re-creeze de fiecare dată când senzorul trimite un update.
  useEffect(() => { headingRef.current = relHeading; velRef.current = velocity; }, [relHeading, velocity]);

  const grabZoneThumb = (zoneIdx) => {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setScanZoneThumbs((prev) => {
        const next = [...prev];
        next[zoneIdx] = URL.createObjectURL(blob);
        return next;
      });
    }, "image/jpeg", 0.6);
    if (navigator.vibrate) { try { navigator.vibrate(15); } catch (e) {} }
  };

  // Ghidare live "colț cu colț" cât timp filmezi: împărțim rotația în
  // SCAN_ZONE_COUNT zone, acumulăm timp petrecut (relativ stabil) în zona
  // curentă și o marcăm "acoperită" + salvăm un cadru-martor când trece pragul.
  useEffect(() => {
    if (stage !== "recording" || mode !== "orientation") return;
    const TICK_MS = 200;
    const id = setInterval(() => {
      if (velRef.current >= MAX_SCAN_PAN_VELOCITY_DEG) return;
      const zoneIdx = zoneIndexFor(headingRef.current);
      if (zoneCoveredRef.current[zoneIdx]) return;
      zoneDwellMsRef.current[zoneIdx] += TICK_MS;
      if (zoneDwellMsRef.current[zoneIdx] >= ZONE_COVERAGE_MS) {
        zoneCoveredRef.current[zoneIdx] = true;
        grabZoneThumb(zoneIdx);
        setScanZonesCovered([...zoneCoveredRef.current]);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [stage, mode]);

  // Verificare periodică, silențioasă, cât o cameră e încă în procesare la Kiri
  // Engine — poate dura de la câteva minute până la 20-30 min, după coadă. Așa
  // nu mai trebuie să apsăm manual "Verifică" din 2 în 2 minute.
  useEffect(() => {
    if (stage !== "summary") return;
    const pendingIds = rooms
      .filter((r) => r.model_3d_serial && !["success", "failed", "expired"].includes(r.model_3d_status))
      .map((r) => r.id);
    if (!pendingIds.length) return;
    const id = setInterval(() => {
      pendingIds.forEach((rid) => {
        base44.functions.invoke("CheckKiriScanStatus", { tour_room_id: rid })
          .then((res) => {
            const data = res?.data || res || {};
            if (data.error) return;
            setRooms((cur) => cur.map((room) => room.id === rid ? { ...room, model_3d_status: data.status, model_3d_url: data.model_3d_url || room.model_3d_url, model_3d_detail: data.detail || room.model_3d_detail } : room));
            if (data.status === "success") toast({ title: en ? "3D model ready!" : "Modelul 3D e gata!" });
            if (data.status === "failed") {
              toast({
                variant: "destructive",
                title: en ? "3D scan failed" : "Scanarea 3D a eșuat",
                description: data.detail || (en ? "Kiri Engine could not build a model from this video." : "Kiri Engine nu a putut construi un model din acest video."),
              });
            }
          })
          .catch(() => {});
      });
    }, 15000);
    return () => clearInterval(id);
  }, [stage, rooms]);

  const previewUrls = useMemo(() => pendingFrames.map((b) => URL.createObjectURL(b)), [pendingFrames]);
  useEffect(() => () => { previewUrls.forEach((u) => URL.revokeObjectURL(u)); }, [previewUrls]);

  const pendingVideoUrl = useMemo(() => (pendingVideo ? URL.createObjectURL(pendingVideo) : null), [pendingVideo]);
  useEffect(() => () => { if (pendingVideoUrl) URL.revokeObjectURL(pendingVideoUrl); }, [pendingVideoUrl]);

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
    // Cererea de permisiune pentru senzori TREBUIE pornită sincron, în același gest
    // de tap — dacă mai așteptăm un `await` (ex: getUserMedia) înainte s-o pornim,
    // se rupe lanțul de "user activation" și iOS Safari o refuză silențios, fără
    // să mai arate vreun prompt. De-asta o pornim AICI, înainte de orice await.
    const orientationPromise = requestOrientationPermission().catch(() => false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // max 1920x1080 — limita documentată de Kiri Engine pentru upload video
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280, max: 1920 }, height: { ideal: 960, max: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      await orientationPromise;
      setStage("live");
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
    if (captureMode === "scan3d") {
      setStage("recording");
      startRecording();
      return;
    }
    anchorRef.current = heading;
    baseGrabbedRef.current = false;
    framesRef.current = [];
    setCapturedMask(Array(TARGET_COUNT).fill(false));
    setStage("aiming");
  };

  const retake = () => {
    framesRef.current = [];
    baseGrabbedRef.current = false;
    setCapturedMask(Array(TARGET_COUNT).fill(false));
    setPendingFrames([]);
    setStage("live");
  };

  const confirmRoom = async () => {
    setSaving(true);
    try {
      const [uploaded, panorama] = await Promise.all([
        Promise.all(
          pendingFrames.map(async (blob, i) => {
            const small = await compressImage(blob, 1000, 0.75);
            const { file_url } = await base44.integrations.Core.UploadFile({ file: toNamedFile(small, `frame-${i}`, "image/jpeg") });
            return file_url;
          })
        ),
        stitchPanorama(pendingFrames),
      ]);
      let panorama_url, panorama_vfov_deg;
      if (panorama) {
        try {
          const up = await base44.integrations.Core.UploadFile({ file: toNamedFile(panorama.blob, "panorama", "image/jpeg") });
          panorama_url = up.file_url;
          panorama_vfov_deg = panorama.vfovDeg;
        } catch (e) { /* panorama e un bonus — dacă upload-ul eșuează, rămânem pe pozele individuale */ }
      }
      const order_index = rooms.length;
      const name = roomName.trim();
      const rec = await base44.entities.PropertyTourRoom.create({ property_id: id, room_name: name, order_index, frame_urls: uploaded, panorama_url, panorama_vfov_deg });
      setRooms((r) => [...r, { id: rec.id, room_name: name, frame_urls: uploaded, panorama_url, panorama_vfov_deg }]);
      setPendingFrames([]);
      setRoomName("");
      setStage("summary");
      toast({ title: en ? `“${name}” saved` : `Camera „${name}” a fost salvată` });
    } catch (e) {
      toast({ title: en ? "Couldn't save this room" : "Eroare la salvarea camerei", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const pickVideoMimeType = () => {
    const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
    return candidates.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";
  };

  const startRecording = () => {
    if (!streamRef.current || !window.MediaRecorder) {
      setCameraError(en ? "Video recording isn't supported on this device." : "Înregistrarea video nu e suportată pe acest dispozitiv.");
      setStage("live");
      return;
    }
    recordedChunksRef.current = [];
    zoneCoveredRef.current = Array(SCAN_ZONE_COUNT).fill(false);
    zoneDwellMsRef.current = Array(SCAN_ZONE_COUNT).fill(0);
    setScanZonesCovered(Array(SCAN_ZONE_COUNT).fill(false));
    setScanZoneThumbs((prev) => { prev.forEach((u) => u && URL.revokeObjectURL(u)); return Array(SCAN_ZONE_COUNT).fill(null); });
    const mimeType = pickVideoMimeType();
    // Limităm bitrate-ul ca fișierul să rămână mic și upload-ul rapid/fiabil —
    // Kiri Engine nu are nevoie de calitate maximă, doar de cadre destul de clare.
    const recOpts = mimeType ? { mimeType, videoBitsPerSecond: 1_500_000 } : { videoBitsPerSecond: 1_500_000 };
    let rec;
    try {
      rec = new MediaRecorder(streamRef.current, recOpts);
    } catch (e) {
      setCameraError(en ? "Couldn't start video recording." : "Nu am putut porni înregistrarea video.");
      setStage("live");
      return;
    }
    rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data); };
    rec.onstop = async () => {
      const rawBlob = new Blob(recordedChunksRef.current, { type: rec.mimeType || "video/webm" });
      const durationMs = Math.max(1000, Date.now() - recordStartRef.current);
      // Chrome (MediaRecorder) scrie fișiere webm FĂRĂ durata în metadate (bug cunoscut) —
      // multe servicii (inclusiv Kiri Engine) resping un asemenea video ca "nu îndeplinește
      // cerințele". Petic-uim durata direct în blob înainte de upload.
      let finalBlob = rawBlob;
      if ((rec.mimeType || "").includes("webm")) {
        try {
          finalBlob = await fixWebmDuration(rawBlob, durationMs);
        } catch (err) {
          finalBlob = rawBlob;
        }
      }
      setPendingVideo(finalBlob);
      setStage("review3d");
    };
    mediaRecorderRef.current = rec;
    rec.start();
    recordStartRef.current = Date.now();
    setRecording(true);
    setRecordSeconds(0);
    recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
    setRecording(false);
    try { mediaRecorderRef.current?.stop(); } catch (e) {}
  };

  const retakeScan3d = () => {
    setPendingVideo(null);
    setStage("live");
  };

  const confirmScan3d = async () => {
    if (!pendingVideo) return;
    const MAX_VIDEO_BYTES = 40 * 1024 * 1024; // 40MB — sub limitele tipice de upload ale platformelor serverless
    if (pendingVideo.size > MAX_VIDEO_BYTES) {
      toast({
        title: en ? "Video too large" : "Video prea mare",
        description: `${Math.round(pendingVideo.size / 1024 / 1024)}MB — ` + (en ? "please retake a shorter recording." : "reia cu o înregistrare mai scurtă."),
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file: toNamedFile(pendingVideo, `scan-${Date.now()}`, "video/webm") });
      const file_url = uploadRes?.file_url;
      if (!file_url) throw new Error(en ? "Upload succeeded but returned no file URL." : "Upload-ul a reușit dar nu a returnat un URL de fișier.");
      const order_index = rooms.length;
      const name = roomName.trim();
      const rec = await base44.entities.PropertyTourRoom.create({
        property_id: id, room_name: name, order_index, frame_urls: [],
        capture_video_url: file_url, model_3d_status: "uploading",
      });
      setRooms((r) => [...r, { id: rec.id, room_name: name, frame_urls: [], capture_video_url: file_url, model_3d_status: "uploading" }]);
      setPendingVideo(null);
      setRoomName("");
      setStage("summary");
      toast({ title: en ? "Uploading for 3D scan…" : "Se trimite pentru scanare 3D…" });
      base44.functions.invoke("StartKiriScan", { tour_room_id: rec.id, video_url: file_url })
        .then((res) => {
          const data = res?.data || res || {};
          setRooms((cur) => cur.map((room) => room.id === rec.id ? { ...room, model_3d_status: data.error ? "failed" : "processing", model_3d_serial: data.serial } : room));
          if (data.error) toast({ title: data.error, variant: "destructive" });
        })
        .catch((err) => {
          // O eroare/timeout AICI nu înseamnă neapărat că scanarea a eșuat — request-ul poate
          // fi reușit pe server (Kiri Engine a primit video-ul) chiar dacă răspunsul n-a
          // mai ajuns la timp în browser. În loc să presupunem eșec, verificăm statusul real.
          toast({ title: en ? "Couldn't confirm the scan started — checking real status…" : "Nu am putut confirma pornirea — verificăm statusul real…", description: err?.message });
          checkScanStatus(rec.id);
        });
    } catch (e) {
      toast({ title: en ? "Couldn't upload the scan video" : "Eroare la încărcarea video-ului de scanare", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const checkScanStatus = async (roomId) => {
    setScanBusyRoomId(roomId);
    try {
      const res = await base44.functions.invoke("CheckKiriScanStatus", { tour_room_id: roomId });
      const data = res?.data || res || {};
      if (data.error) { toast({ title: data.error, variant: "destructive" }); return; }
      setRooms((cur) => cur.map((room) => room.id === roomId ? { ...room, model_3d_status: data.status, model_3d_url: data.model_3d_url || room.model_3d_url, model_3d_detail: data.detail || room.model_3d_detail } : room));
      if (data.status === "success") toast({ title: en ? "3D model ready!" : "Modelul 3D e gata!" });
      if (data.status === "failed") {
        toast({
          variant: "destructive",
          title: en ? "3D scan failed" : "Scanarea 3D a eșuat",
          description: data.detail || (en ? "Kiri Engine could not build a model from this video. Try again with slower, more overlapping coverage of every corner." : "Kiri Engine nu a putut construi un model din acest video. Încearcă din nou, mai lent, acoperind fiecare colț cu suprapunere."),
        });
      }
    } catch (e) {
      toast({ title: en ? "Couldn't check status" : "Eroare la verificarea statusului", description: e?.message, variant: "destructive" });
    } finally {
      setScanBusyRoomId(null);
    }
  };

  // Pentru o cameră care nu are încă model_3d_serial (StartKiriScan n-a apucat să
  // pornească scanarea cu succes) — retrimitem video-ul deja încărcat, fără să mai
  // cerem o nouă filmare.
  const retryScan3d = async (room) => {
    if (!room.capture_video_url) return;
    setScanBusyRoomId(room.id);
    try {
      const res = await base44.functions.invoke("StartKiriScan", { tour_room_id: room.id, video_url: room.capture_video_url });
      const data = res?.data || res || {};
      setRooms((cur) => cur.map((r) => r.id === room.id ? { ...r, model_3d_status: data.error ? "failed" : "processing", model_3d_serial: data.serial } : r));
      if (data.error) toast({ title: data.error, variant: "destructive" });
      else toast({ title: en ? "Scan restarted" : "Scanare retrimisă" });
    } catch (e) {
      toast({ title: en ? "Couldn't retry" : "Nu am putut retrimite scanarea", description: e?.message, variant: "destructive" });
    } finally {
      setScanBusyRoomId(null);
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

  const cameraStage = ["live", "aiming", "review", "recording", "review3d"].includes(stage);
  const nextTargetIdx = capturedMask.findIndex((c) => !c);
  const capturedCount = capturedMask.filter(Boolean).length;

  let aimStatus = null;
  if (mode === "orientation" && nextTargetIdx > 0) {
    const target = nextTargetIdx * (360 / TARGET_COUNT);
    const diff = target - relHeading;
    const aligned = Math.abs(diff) < ALIGN_TOLERANCE_DEG;
    const slow = velocity < MAX_ANGULAR_VELOCITY;
    if (aligned && slow) aimStatus = en ? "Hold still…" : "Perfect, ține telefonul nemișcat…";
    else if (aligned && !slow) aimStatus = en ? "Almost — slow down" : "Aproape! Încetinește puțin";
    else if (diff < 0) aimStatus = en ? "You passed the mark — go back a little" : "Ai trecut de reper — revino puțin";
    else aimStatus = en ? "Keep turning slowly" : "Continuă să te rotești încet";
  }

  const nextUncoveredZoneIdx = scanZonesCovered.findIndex((c) => !c);
  let scanHint = en ? "Walk slowly, cover every corner and wall" : "Mergi încet, acoperă fiecare colț și perete";
  if (mode === "orientation") {
    if (nextUncoveredZoneIdx === -1) {
      scanHint = en ? "Full coverage! Stop whenever you're ready." : "Acoperire completă! Poți opri când vrei.";
    } else if (!scanZonesCovered[zoneIndexFor(relHeading)]) {
      scanHint = en ? "Filming this corner — hold it steady" : "Filmezi acest colț — ține telefonul stabil";
    } else {
      scanHint = en ? "Now rotate slowly to the next corner" : "Acum rotește-te încet spre următorul colț";
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-background">
      <canvas ref={canvasRef} className="hidden" />

      {cameraStage ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="relative flex-1 overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            {flash && <div className="pointer-events-none absolute inset-0 bg-white/25" />}

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
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setCaptureMode("panorama")} className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${captureMode === "panorama" ? "bg-emerald text-white" : "bg-white/10 text-white/60"}`}>
                    {en ? "360° panorama" : "Panoramă 360°"}
                  </button>
                  <button type="button" onClick={() => setCaptureMode("scan3d")} className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${captureMode === "scan3d" ? "bg-emerald text-white" : "bg-white/10 text-white/60"}`}>
                    {en ? "3D scan (beta)" : "Scanare 3D (beta)"}
                  </button>
                </div>
                <p className="mt-2.5 text-xs font-semibold uppercase tracking-wide text-white/60">{en ? "Room name" : "Nume cameră"}</p>
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
                <p className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
                  {captureMode === "scan3d" ? (
                    <>
                      <Video className="h-3.5 w-3.5 shrink-0" />
                      {en ? "We'll guide you corner by corner while you film — walk slowly (under 2 minutes)." : "Te ghidăm colț cu colț cât filmezi — mergi încet (sub 2 minute)."}
                    </>
                  ) : (
                    <>
                      <Compass className="h-3.5 w-3.5 shrink-0" />
                      {mode === "orientation"
                        ? (en ? "Motion sensors ready — we'll guide you to each frame." : "Senzori de mișcare gata — te ghidăm spre fiecare cadru.")
                        : mode === "timer"
                        ? (en ? "No compass sensor found — using simple timed capture." : "Nu am găsit senzor de busolă — folosim captura simplă, cu temporizator.")
                        : (en ? "Checking your device's motion sensors…" : "Verificăm senzorii de mișcare ai telefonului…")}
                    </>
                  )}
                </p>
                <button type="button" onClick={beginCapture} disabled={!roomName.trim()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-emerald py-3 text-sm font-bold text-white transition hover:bg-emerald/90 disabled:cursor-not-allowed disabled:opacity-40">
                  {captureMode === "scan3d" ? (<><Video className="h-4 w-4" /> {en ? "Start recording" : "Pornește înregistrarea"}</>) : (<><RotateCw className="h-4 w-4" /> {en ? "Start rotation capture" : "Pornește rotația"}</>)}
                </button>
              </div>
            )}

            {stage === "aiming" && mode === "orientation" && (
              <div className="absolute inset-0 flex flex-col justify-between">
                <div className="mt-[calc(3.5rem+env(safe-area-inset-top))] px-4">
                  <CompassTape heading={relHeading} targetCount={TARGET_COUNT} capturedMask={capturedMask} nextIndex={nextTargetIdx} />
                </div>
                <div className="mb-8 flex flex-col items-center gap-3 px-6">
                  <div className="relative flex h-20 w-20 items-center justify-center text-emerald">
                    <ProgressRing progress={capturedCount / TARGET_COUNT} />
                    <span className="absolute font-heading text-sm font-bold text-white">{capturedCount}/{TARGET_COUNT}</span>
                  </div>
                  <p className="max-w-[260px] text-center text-sm font-semibold text-white">{aimStatus}</p>
                </div>
              </div>
            )}

            {stage === "aiming" && mode === "timer" && timerPhase === "countdown" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50">
                <span className="font-heading text-7xl font-extrabold text-white">{timerCountdown > 0 ? timerCountdown : "!"}</span>
                <p className="text-sm font-medium text-white/80">{en ? "Get ready to slowly turn around" : "Pregătește-te să te rotești încet"}</p>
              </div>
            )}
            {stage === "aiming" && mode === "timer" && timerPhase === "shooting" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35">
                <div className="relative flex h-24 w-24 items-center justify-center text-emerald">
                  <ProgressRing progress={capturedCount / TARGET_COUNT} />
                  <span className="absolute font-heading text-lg font-bold text-white">{capturedCount}/{TARGET_COUNT}</span>
                </div>
                <p className="max-w-[220px] text-center text-sm font-medium text-white/85">
                  {en ? "Turn slowly in one full circle" : "Rotește-te încet, o singură tură completă"}
                </p>
              </div>
            )}
            {stage === "aiming" && mode === "detecting" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
                <Loader2 className="h-7 w-7 animate-spin text-white" />
                <p className="text-sm font-medium text-white/80">{en ? "Calibrating…" : "Calibrăm…"}</p>
              </div>
            )}

            {stage === "recording" && (
              <div className="absolute inset-0 flex flex-col items-center justify-between p-6">
                <div className="mt-[calc(3rem+env(safe-area-inset-top))] flex flex-col items-center gap-2">
                  <span className="flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" /> REC {fmtTime(recordSeconds)}
                  </span>
                  {mode === "orientation" && (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md transition-colors ${velocity > MAX_SCAN_PAN_VELOCITY_DEG ? "bg-amber-500/90 text-white" : "bg-white/15 text-white/75"}`}>
                      {velocity > MAX_SCAN_PAN_VELOCITY_DEG ? (en ? "Slow down — moving too fast" : "Încetinește — te miști prea repede") : (en ? "Good pace" : "Ritm bun")}
                    </span>
                  )}
                </div>

                {mode === "orientation" && (
                  <div className="w-full max-w-md px-4">
                    <CompassTape heading={relHeading} targetCount={SCAN_ZONE_COUNT} capturedMask={scanZonesCovered} nextIndex={nextUncoveredZoneIdx} />
                  </div>
                )}

                <div className="mb-8 flex flex-col items-center gap-3">
                  {scanZoneThumbs.some(Boolean) && (
                    <div className="flex gap-1.5">
                      {scanZoneThumbs.map((url, i) => url && (
                        <div key={i} className="h-10 w-10 overflow-hidden rounded-lg border-2 border-emerald shadow">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="max-w-[260px] text-center text-sm font-semibold text-white drop-shadow">
                    {scanHint}
                  </p>
                  <button type="button" onClick={stopRecording} aria-label={en ? "Stop recording" : "Oprește înregistrarea"} className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                    <span className="h-6 w-6 rounded-md bg-rose-600" />
                  </button>
                </div>
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

          {stage === "review3d" && (
            <div className="flex flex-col bg-navy-deep p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              {pendingVideoUrl && (
                <video src={pendingVideoUrl} controls playsInline className="aspect-[16/10] w-full rounded-2xl bg-black object-contain" />
              )}
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={retakeScan3d} disabled={saving} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50">
                  <RotateCw className="h-4 w-4" /> {en ? "Retake" : "Reia"}
                </button>
                <button type="button" onClick={confirmScan3d} disabled={saving} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald py-2.5 text-sm font-bold text-white transition hover:bg-emerald/90 disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Box className="h-4 w-4" />} {saving ? (en ? "Uploading…" : "Se încarcă…") : (en ? "Send for 3D scan" : "Trimite pentru scanare 3D")}
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
                {en ? "Direct from your browser — no app to install. We guide you to every frame, like a compass." : "Direct din browser, fără nicio aplicație. Te ghidăm spre fiecare cadru, ca o busolă."}
              </p>

              <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
                {[
                  { icon: Home, t: en ? "Pick a room" : "Alege o cameră", d: en ? "Give it a name (e.g. Living room)." : "Dă-i un nume (ex: Living)." },
                  { icon: Compass, t: en ? "Follow the guide" : "Urmărește ghidul", d: en ? "A marker shows exactly where to aim next." : "Un reper îți arată exact unde să ochești." },
                  { icon: Camera, t: en ? "We auto-capture" : "Captăm automat", d: en ? "24 precisely-aimed photos become a smooth look-around tour." : "24 de cadre aliniate precis devin un tur pe care vizitatorii îl pot roti lin." },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-white p-4 dark:bg-card">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-soft text-emerald"><s.icon className="h-4.5 w-4.5" /></span>
                    <p className="mt-2 font-heading text-sm font-bold text-navy dark:text-foreground">{i + 1}. {s.t}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                {en ? "There's also a beta " : "Există și un mod beta de "}<span className="font-semibold text-navy dark:text-foreground">{en ? "3D scan mode" : "„Scanare 3D”"}</span>{en ? " once you start — records a short walkthrough video for a real, explorable 3D model." : " odată ce pornești — înregistrează un video scurt pentru un model 3D real, explorabil."}
              </p>

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
                    <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                      {r.frame_urls?.[0] ? (
                        <img src={r.frame_urls[0]} alt={r.room_name} className="h-full w-full object-cover" />
                      ) : r.capture_video_url ? (
                        <Video className="h-5 w-5 text-muted-foreground" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-bold text-navy dark:text-foreground">{r.room_name}</p>
                      {r.frame_urls?.length ? (
                        <p className="text-xs text-muted-foreground">
                          {r.frame_urls.length} {en ? "photos" : "poze"}{r.panorama_url ? ` · ${en ? "panorama" : "panoramă"}` : ""}
                        </p>
                      ) : r.model_3d_status && r.model_3d_status !== "none" ? (
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-semibold ${r.model_3d_status === "success" ? "text-emerald" : r.model_3d_status === "failed" ? "text-rose-600" : "text-muted-foreground"}`}>
                            {r.model_3d_status === "success" ? (en ? "3D model ready" : "Model 3D gata")
                              : r.model_3d_status === "failed" ? (en ? "Scan failed" : "Scanare eșuată")
                              : r.model_3d_status === "expired" ? (en ? "Expired" : "Expirat")
                              : (en ? "Processing 3D scan…" : "Se procesează scanarea 3D…")}
                          </p>
                          {r.model_3d_status !== "success" && r.model_3d_serial && (
                            <button type="button" onClick={() => checkScanStatus(r.id)} disabled={scanBusyRoomId === r.id} className="text-[11px] font-bold text-emerald underline disabled:opacity-50">
                              {scanBusyRoomId === r.id ? "…" : (en ? "Check" : "Verifică")}
                            </button>
                          )}
                          {r.model_3d_status !== "success" && !r.model_3d_serial && r.capture_video_url && (
                            <button type="button" onClick={() => retryScan3d(r)} disabled={scanBusyRoomId === r.id} className="text-[11px] font-bold text-emerald underline disabled:opacity-50">
                              {scanBusyRoomId === r.id ? "…" : (en ? "Retry" : "Retrimite")}
                            </button>
                          )}
                        </div>
                      ) : null}
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

// Bandă orizontală tip busolă: fiecare reper e poziționat după diferența
// unghiulară față de direcția curentă, ca într-un HUD de navigație — reperele
// "alunecă" spre centru pe măsură ce te rotești spre ele.
function CompassTape({ heading, targetCount, capturedMask, nextIndex }) {
  const stepDeg = 360 / targetCount;
  const PX_PER_DEG = 3;
  const marks = [];
  for (let i = 0; i < targetCount; i++) {
    const targetDeg = i * stepDeg;
    const diff = targetDeg - heading;
    if (Math.abs(diff) <= 80) marks.push({ i, diff, captured: capturedMask[i] });
  }
  return (
    <div className="relative mx-auto h-16 max-w-md overflow-hidden rounded-2xl bg-black/30 backdrop-blur-sm">
      <div className="absolute left-1/2 top-0 z-10 h-full w-0.5 -translate-x-1/2 bg-emerald" />
      <div className="absolute left-1/2 top-0.5 z-10 -translate-x-1/2 text-[10px] font-bold text-emerald">▼</div>
      {marks.map(({ i, diff, captured }) => (
        <div
          key={i}
          className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center transition-[left] duration-100 ease-linear"
          style={{ left: `calc(50% + ${diff * PX_PER_DEG}px)` }}
        >
          <span
            className={`flex h-3 w-3 items-center justify-center rounded-full border-2 transition-colors ${
              captured ? "border-emerald bg-emerald" : i === nextIndex ? "scale-125 border-white bg-white/30" : "border-white/40 bg-transparent"
            }`}
          />
        </div>
      ))}
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
