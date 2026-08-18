import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

function apply(theme) {
  if (theme === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}

export default function ThemeToggle({ withLabel = false }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("vc_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("vc_theme", theme);
    apply(theme);
  }, [theme]);

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold transition hover:border-emerald/50"
      )}
      aria-label="Comută temă"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {withLabel ? (isDark ? "Tema deschisă" : "Tema întunecată") : <span className="hidden md:inline">{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}