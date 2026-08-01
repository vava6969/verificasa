import React, { useRef } from "react";
import { CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";

/**
 * DateField — wrapper pe `<input type="date">` care:
 *  • ascunde placeholder-ul nativ „dd/mm/yyyy" și arată un text propriu
 *    (`placeholder` când e gol, data formatată când e selectată)
 *  • randează un icon calendar clar pe stânga
 *  • folosește tokens (`bg-background`, `dark:bg-card`) — lizibil pe ambele teme
 *  • deschide programatic picker-ul la click pe oricare zonă a casetei
 *    (înainte, click-ul pe suprafața transparentă nu ajungea mereu pe indicatorul
 *     nativ de calendar și picker-ul nu se deschidea pe unele browsere/touch)
 */
export default function DateField({
  value,
  onChange,
  placeholder = "Selectează o dată",
  className = "",
}) {
  const inputRef = useRef(null);
  const formatted = value ? format(parseISO(value), "dd.MM.yyyy") : "";

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      try { el.showPicker(); return; } catch (_) { /* fall through to focus */ }
    }
    el.focus();
  };

  return (
    <div
      className={`relative flex items-center rounded-lg border border-border bg-background px-3 py-2 dark:bg-card ${className}`}
      style={{ colorScheme: "light dark" }}
      onClick={openPicker}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPicker(); } }}
    >
      <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span
        className={`pointer-events-none select-none pl-2 text-sm ${
          value ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {value ? formatted : placeholder}
      </span>
      <input
        ref={inputRef}
        type="date"
        value={value || ""}
        onChange={onChange}
        aria-label={placeholder}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
      />
    </div>
  );
}