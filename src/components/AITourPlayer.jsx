import React, { useState, useRef } from "react";
import { Play, Pause, Sparkles, Volume2, Maximize2, BadgeCheck } from "lucide-react";

export default function AITourPlayer({ videoUrl, poster, title }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      v.play();
      setPlaying(true);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-navy-deep shadow-soft">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        loop
        muted
        playsInline
        className="aspect-video w-full object-cover"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-deep/40 transition hover:bg-navy-deep/30"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-mint shadow-glow transition-transform hover:scale-110">
            <Play className="ml-1 h-7 w-7 fill-navy text-navy" />
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-mint" /> AI Walkthrough Experience
          </span>
        </button>
      )}

      <div className="absolute left-3 top-3 flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-[11px] font-semibold text-mint backdrop-blur">
          <BadgeCheck className="h-3 w-3" /> Tur AI Verificat
        </span>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
        <button
          onClick={togglePlay}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy backdrop-blur transition hover:bg-white"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy backdrop-blur transition hover:bg-white">
          <Volume2 className="h-4 w-4" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy backdrop-blur transition hover:bg-white">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3">
        <p className="text-sm font-semibold text-white drop-shadow">{title}</p>
      </div>
    </div>
  );
}