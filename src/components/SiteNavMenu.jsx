import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { useNotifications } from "@/hooks/useNotifications";

const EASE = [0.16, 1, 0.3, 1];

// Site menu, top-right. A solid rounded panel on a round trigger — no glass,
// no icon tiles. The trigger carries the unread badge; the menu includes
// Notificări so the badge leads somewhere. Every row is a 44px rounded target.
//
// Mișcarea: panoul crește din colțul din dreapta-sus, adică fix de sub buton, iar
// rândurile alunecă unul după altul, la 30ms distanță. Scara dinspre trigger
// arată DE UNDE a venit panoul; decalajul dă ochiului timp să prindă lista.
//
// Animația e în CSS (vc-menu-panel / vc-menu-row în index.css), NU pe
// framer-motion. Motivul e măsurat, nu teoretic: cu framer, panoul și toate cele
// opt rânduri stăteau la `opacity: 0` până rula un cadru — la o secundă după
// click, cu bucla de cadre sugrumată, meniul era complet invizibil. Cu CSS,
// starea de repaus e cea vizibilă, deci în cel mai rău caz meniul apare pur și
// simplu, fără animație. Reducerea de mișcare e deja globală în index.css.
//
// Închiderea e instantanee, intenționat: odată ce omul a decis să plece, un
// panou care se stinge lent doar stă în drum.
export default function SiteNavMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { lang } = useCountry();
  const { unreadCount } = useNotifications();
  const reduced = useReducedMotion();
  const en = lang === "en";

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    { label: en ? "My account" : "Contul meu", path: isAuthenticated ? "/account" : "/login" },
    ...(isAuthenticated
      ? [{ label: en ? "Notifications" : "Notificări", path: "/notificari", badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null }]
      : []),
    { label: en ? "3D Tour" : "Tur 3D", path: "/tur-3d" },
    { label: en ? "Plans" : "Planuri", path: "/upgrade" },
    { label: en ? "Search" : "Caută", path: "/search" },
    { label: en ? "Map" : "Hartă", path: "/map" },
    { label: en ? "Partners" : "Parteneri", path: "/parteneri" },
    { label: en ? "Contact" : "Contact", path: "/contact" },
    { label: en ? "About us" : "Despre noi", path: "/about" },
  ];

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-emerald sm:h-9 sm:w-9"
        aria-label={en ? "Menu" : "Meniu"}
        aria-expanded={open}
      >
        {/* Cele două pictograme se rotesc una în alta. Amândouă sunt mereu în
            pagină și se schimbă pe `transition`, nu pe `animation`: o tranziție
            care nu apucă să ruleze sare direct la valoarea finală, deci în cel
            mai rău caz pictograma corectă e pur și simplu acolo. O animație sau
            un `initial` de framer ar fi lăsat butonul gol. */}
        <span className="relative flex h-5 w-5 items-center justify-center">
          <Menu
            className={`absolute h-5 w-5 transition-all duration-200 ease-out ${
              open ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
            }`}
          />
          <X
            className={`absolute h-5 w-5 transition-all duration-200 ease-out ${
              open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-0"
            }`}
          />
        </span>
        {!open && isAuthenticated && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-emerald px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background tnum">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute right-0 top-[calc(100%+8px)] z-50 max-h-[calc(100vh-5rem)] w-60 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-2 shadow-lg ${reduced ? "" : "vc-menu-panel"}`}
          role="menu"
        >
          {items.map((it, i) => (
            <button
              key={it.path + it.label}
              type="button"
              role="menuitem"
              onClick={() => go(it.path)}
              style={reduced ? undefined : { animationDelay: `${0.04 + i * 0.03}s` }}
              className={`group flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl px-3.5 text-left text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-secondary hover:text-emerald active:scale-[0.985] ${reduced ? "" : "vc-menu-row"}`}
            >
              {/* Eticheta alunecă 2px la hover — atât cât să se simtă că rândul
                  răspunde, fără să miște rândurile de deasupra sau dedesubt. */}
              <span className="transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                {it.label}
              </span>
              {it.badge && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald px-1.5 text-[10px] font-bold leading-none text-primary-foreground transition-transform duration-200 group-hover:scale-110 tnum">
                  {it.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
