import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import SearchBar from "@/components/SearchBar";
import { useCountry } from "@/components/CountryContext";

export default function HeroSearch() {
  const { t } = useCountry();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile: compact trigger pill → swipe-down sheet */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass-panel flex w-full items-center gap-3 rounded-md px-4 py-3 text-left md:hidden"
      >
        <Search className="h-4 w-4 shrink-0 text-emerald" />
        <span className="flex-1 truncate text-sm font-medium text-foreground/70">{t("sb_city")} · {t("sb_zone")}</span>
        <span aria-hidden="true" className="font-semibold text-emerald">→</span>
      </button>

      {/* Desktop: full inline form */}
      <div className="hidden md:block">
        <SearchBar />
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="rounded-t-3xl border-border px-4 pb-8 md:hidden">
          <DrawerTitle className="mt-4 flex items-center gap-2 px-1 font-heading text-base">
            <SlidersHorizontal className="h-4 w-4 text-emerald" /> {t("sb_btn")}
          </DrawerTitle>
          <div className="mt-4">
            <SearchBar onSubmitted={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}