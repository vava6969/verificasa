import { useEffect, useRef, useState } from "react";

// Urmărește rotația telefonului pe orizontală (heading) folosind senzorii de
// orientare ai dispozitivului, ca să putem ghida proprietarul spre fiecare
// cadru al turului 360°, fără să presupunem vreo convenție de busolă:
// unele browsere raportează alpha crescător la rotație spre dreapta, altele
// invers — deci nu ne bazăm pe nord magnetic, ci calibrăm direcția "pozitivă"
// empiric, din primele grade de mișcare reală ale utilizatorului.
const shortestDiff = (from, to) => {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
};

const DETECT_TIMEOUT_MS = 1500;
const LOCK_DIRECTION_AFTER_DEG = 8;

export function useTourOrientation({ active }) {
  const [supported, setSupported] = useState(null); // null = se verifică, apoi true/false
  const [heading, setHeading] = useState(0); // grade cumulate, mereu pozitive în direcția în care s-a rotit utilizatorul
  const [velocity, setVelocity] = useState(0); // grade/secundă (magnitudine)
  const stateRef = useRef(null);

  useEffect(() => {
    if (!active) { setSupported(null); return; }
    if (typeof window === "undefined" || (!("DeviceOrientationEvent" in window) && !("ondeviceorientationabsolute" in window))) {
      setSupported(false);
      return;
    }

    let cancelled = false;
    let detected = false;
    stateRef.current = { base: null, last: null, lastTs: 0, cumulative: 0, sign: 0 };

    const handle = (e) => {
      const raw = typeof e.webkitCompassHeading === "number" ? e.webkitCompassHeading : e.alpha;
      if (raw == null || Number.isNaN(raw)) return;
      detected = true;
      if (cancelled) return;
      const st = stateRef.current;
      const now = performance.now();
      if (st.base == null) {
        st.base = raw; st.last = raw; st.lastTs = now;
        setSupported(true);
        return;
      }
      const delta = shortestDiff(st.last, raw);
      const dt = Math.max(now - st.lastTs, 1) / 1000;
      st.cumulative += delta;
      st.last = raw; st.lastTs = now;
      if (st.sign === 0 && Math.abs(st.cumulative) > LOCK_DIRECTION_AFTER_DEG) {
        st.sign = Math.sign(st.cumulative) || 1;
      }
      const oriented = st.sign !== 0 ? st.cumulative * st.sign : Math.abs(st.cumulative);
      setHeading(oriented);
      setVelocity(Math.abs(delta) / dt);
    };

    const evName = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(evName, handle);
    const timeout = setTimeout(() => { if (!detected && !cancelled) setSupported(false); }, DETECT_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.removeEventListener(evName, handle);
      clearTimeout(timeout);
    };
  }, [active]);

  return { supported, heading, velocity };
}

// Trebuie apelat direct dintr-un gest al utilizatorului (tap pe buton), altfel
// iOS Safari refuză silențios cererea de permisiune pentru senzori.
export async function requestOrientationPermission() {
  try {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      const res = await DeviceOrientationEvent.requestPermission();
      return res === "granted";
    }
  } catch (e) { /* dispozitivul nu cere permisiune explicită — continuăm normal */ }
  return true;
}
