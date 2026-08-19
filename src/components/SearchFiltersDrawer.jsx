import React, { useState } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

// Single "Filters" button that opens a slide-up sheet with every search filter,
// so the results page keeps just one compact row.
export default function SearchFiltersDrawer({
  t, filters, activeFilters, onToggle,
  planOptions, planFilters, onTogglePlan,
  budget, setBudget, roomsMin, setRoomsMin, surfaceMin, setSurfaceMin,
  fairness, setFairness, fairnessOptions, furnished, setFurnished,
  swap, setSwap, sort, setSort, sortOptions, onReset,
}) {
  const [open, setOpen] = useState(false);
  const count =
    activeFilters.size + (planFilters?.size || 0) +
    (budget ? 1 : 0) + (roomsMin ? 1 : 0) + (surfaceMin ? 1 : 0) +
    (fairness ? 1 : 0) + (furnished ? 1 : 0) + (swap ? 1 : 0);

  const field = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-emerald dark:bg-card";
  const chip = (active) =>
    `flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
      active ? "border-emerald bg-emerald text-white shadow-soft" : "border-border bg-background text-foreground/70 hover:border-emerald/50 dark:bg-card"
    }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={chip(count > 0)}
      >
        <SlidersHorizontal className="h-4 w-4" /> {t("sr_advanced")}
        {count > 0 && (
          <span className="ml-1 rounded-full bg-white/25 px-1.5 text-xs">{count}</span>
        )}
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[88vh] rounded-t-3xl border-border px-4 pb-8">
          <DrawerTitle className="mt-4 flex items-center gap-2 px-1 font-heading text-base">
            <SlidersHorizontal className="h-4 w-4 text-emerald" /> {t("sr_advanced")}
          </DrawerTitle>

          <div className="mt-4 space-y-5 overflow-y-auto px-1">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button key={f.key} onClick={() => onToggle(f.key)} className={chip(activeFilters.has(f.key))}>
                  <f.icon className="h-3.5 w-3.5" /> {t(f.labelKey)}
                </button>
              ))}
            </div>

            {planOptions?.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Plan</p>
                <div className="flex flex-wrap gap-2">
                  {planOptions.map((opt) => (
                    <button key={opt.id} type="button" onClick={() => onTogglePlan(opt.id)} className={chip(planFilters?.has(opt.id))}>
                      {opt.icon && <img src={opt.icon} alt="" className="h-4 w-4 object-contain" />} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={t("ph_budget")} className={field} />
              <input type="number" value={surfaceMin} onChange={(e) => setSurfaceMin(e.target.value)} placeholder={t("sr_surface_min")} className={field} />
              <select value={roomsMin} onChange={(e) => setRoomsMin(e.target.value)} className={field}>
                <option value="">{t("sr_rooms_min")}</option>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{t("sr_rooms_option", { n })}</option>)}
              </select>
              <select value={fairness} onChange={(e) => setFairness(e.target.value)} className={field}>
                {fairnessOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={`${field} col-span-2`}>
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setFurnished((v) => !v)} className={chip(furnished)}>{t("furnished")}</button>
              <button type="button" onClick={() => setSwap((v) => !v)} className={chip(swap)}>{t("sr_swap")}</button>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-full" onClick={onReset}>{t("sr_reset_filters")}</Button>
              <Button className="flex-1 gap-1.5 rounded-full bg-emerald text-white hover:bg-emerald/90" onClick={() => setOpen(false)}>
                <Check className="h-4 w-4" /> {t("sb_btn")}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}