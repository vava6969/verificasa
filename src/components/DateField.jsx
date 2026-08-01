import React from "react";
import { CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";

/**
 * DateField — wrapper compact pe `<input type="date">` care:
 *  • ascunde placeholder-ul nativ „dd/mm/yyyy" și arată un text propriu
 *    (`placeholder` când e gol, data formatată când e selectată)
 *  • randează un icon calendar clar pe stânga (nu nativ pe dreapta)
 *  • folosește tokens (`bg-background`, `dark:bg-card`) — lizibil pe ambele teme
 *  • padding redus (px-3 py-2) — fără spațiu mort pe telefon
 */
export default function DateField({
  value,
  onChange,
  placeholder = "Selectează o dată",
  className = "",
}) {
  const formatted = value ? format(parseISO(value), "dd.MM.yyyy") : "";
  return (
    <div
      className={`relative flex items-center rounded-lg border border-border bg-background px-3 py-2 dark:bg-card ${className}`}
      style={{ colorScheme: "light dark" }}
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
        type="date"
        value={value || ""}
        onChange={onChange}
        aria-label={placeholder}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
      />
    </div>
  );
}