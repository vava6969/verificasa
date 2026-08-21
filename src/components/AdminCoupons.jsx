import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Stamp } from "@/components/fisa";

// Managerul de cupoane — cererea clientului: coduri pe care le dă oamenilor,
// iar codul acordă X boost-uri bonus. Entitatea Coupon e admin-only la citire,
// deci lista asta e singurul loc unde codurile sunt vizibile.
export default function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(null);
  const [form, setForm] = useState({ code: "", bonus_boosts: 3, max_uses: 0, expires_date: "", notes: "" });

  const load = async () => {
    try {
      const [cs, rs] = await Promise.all([
        base44.entities.Coupon.list("-created_date", 100).catch(() => []),
        base44.entities.CouponRedemption.list("-created_date", 200).catch(() => []),
      ]);
      setCoupons(cs || []);
      setRedemptions(rs || []);
    } catch (e) {
      setCoupons([]);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    const code = form.code.trim().toUpperCase().replace(/\s+/g, "");
    if (!code) { toast({ title: "Adaugă un cod", variant: "destructive" }); return; }
    if (!form.bonus_boosts || form.bonus_boosts < 1) {
      toast({ title: "Codul trebuie să acorde cel puțin un boost", variant: "destructive" });
      return;
    }
    if ((coupons || []).some((c) => c.code === code)) {
      toast({ title: "Codul există deja", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      // Câmpurile noi sunt ignorate silențios la create până la publish, deci
      // creăm întâi și ștampilăm restul cu un update imediat.
      const created = await base44.entities.Coupon.create({ code, bonus_boosts: Number(form.bonus_boosts) });
      await base44.entities.Coupon.update(created.id, {
        bonus_boosts: Number(form.bonus_boosts),
        max_uses: Number(form.max_uses) || 0,
        uses_count: 0,
        active: true,
        expires_date: form.expires_date ? new Date(form.expires_date).toISOString() : "",
        notes: form.notes || "",
      });
      toast({ title: "Cod creat", description: code });
      setForm({ code: "", bonus_boosts: 3, max_uses: 0, expires_date: "", notes: "" });
      load();
    } catch (err) {
      toast({ title: "Eroare la creare", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivating) return;
    try {
      await base44.entities.Coupon.update(deactivating.id, { active: false });
      toast({ title: "Cod dezactivat" });
      setDeactivating(null);
      load();
    } catch (e) {
      toast({ title: "Eroare", variant: "destructive" });
    }
  };

  const usedBy = (couponId) => redemptions.filter((r) => r.coupon_id === couponId).length;
  const input = "min-h-[42px] rounded border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-emerald";

  return (
    <section className="border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Coduri bonus</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Fiecare cod acordă boost-uri bonus, o singură dată per utilizator.
        </p>
      </div>

      <form onSubmit={create} className="grid gap-2 border-b border-border p-4 sm:grid-cols-6">
        <input
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          placeholder="COD"
          aria-label="Cod"
          className={`${input} uppercase sm:col-span-2`}
        />
        <input
          type="number" min="1"
          value={form.bonus_boosts}
          onChange={(e) => setForm((f) => ({ ...f, bonus_boosts: e.target.value }))}
          placeholder="Boost-uri"
          aria-label="Boost-uri acordate"
          className={input}
        />
        <input
          type="number" min="0"
          value={form.max_uses}
          onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
          placeholder="Max (0=∞)"
          aria-label="Utilizări maxime"
          className={input}
        />
        <input
          type="date"
          value={form.expires_date}
          onChange={(e) => setForm((f) => ({ ...f, expires_date: e.target.value }))}
          aria-label="Expiră la"
          className={input}
        />
        <Button type="submit" disabled={saving} className="min-h-[42px] rounded bg-emerald text-primary-foreground hover:bg-emerald/90">
          {saving ? "Se creează" : "Creează"}
        </Button>
      </form>

      {coupons === null ? (
        <div className="p-4 text-sm text-muted-foreground">Se încarcă…</div>
      ) : coupons.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">Niciun cod creat încă.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                {["Cod", "Boost-uri", "Folosit", "Expiră", "Stare", ""].map((h) => (
                  <th key={h} className="border-b border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired = c.expires_date && new Date(c.expires_date).getTime() < Date.now();
                const maxed = c.max_uses > 0 && (c.uses_count || 0) >= c.max_uses;
                const live = c.active !== false && !expired && !maxed;
                return (
                  <tr key={c.id}>
                    <td className="border-b border-border px-4 py-2.5 font-mono font-semibold text-foreground">{c.code}</td>
                    <td className="border-b border-border px-4 py-2.5 tnum">{c.bonus_boosts}</td>
                    <td className="border-b border-border px-4 py-2.5 tnum">
                      {usedBy(c.id)}{c.max_uses > 0 ? ` / ${c.max_uses}` : ""}
                    </td>
                    <td className="border-b border-border px-4 py-2.5 text-muted-foreground">
                      {c.expires_date ? new Date(c.expires_date).toLocaleDateString("ro-RO") : "—"}
                    </td>
                    <td className="border-b border-border px-4 py-2.5">
                      <Stamp tone={live ? "verde" : "ink"}>
                        {live ? "activ" : expired ? "expirat" : maxed ? "epuizat" : "oprit"}
                      </Stamp>
                    </td>
                    <td className="border-b border-border px-4 py-2.5 text-right">
                      {c.active !== false && (
                        <button
                          onClick={() => setDeactivating(c)}
                          className="text-xs font-semibold text-destructive hover:underline"
                        >
                          Dezactivează
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!deactivating} onOpenChange={(v) => !v && setDeactivating(null)}>
        <AlertDialogContent className="rounded-none border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl font-semibold">
              Dezactivezi codul {deactivating?.code}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Nu va mai putea fi revendicat. Boost-urile deja acordate rămân în conturile
              utilizatorilor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px] rounded border-border">Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDeactivate(); }}
              className="min-h-[44px] rounded bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Dezactivează
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
