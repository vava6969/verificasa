import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Curățarea datelor demo. Anunțurile de test au ajuns să arate ca produsul:
// unul intitulat „test" cerea 211.344 lei/lună pentru o cameră pe 345 mp, cu o
// fotografie desenată, și purta insigna „Verificat" pentru că avea un
// trust_score de 52. Frontend-ul îl ascunde deja de la insigne (vezi
// src/lib/listingSanity.js), dar datele rămân greșite până le reparăm aici.
//
// Ce face, în ordine:
//   1. șterge anunțurile-fantomă (titlu „test", „demo", „asdf");
//   2. readuce în intervale credibile prețul, camerele și suprafața;
//   3. înlocuiește fotografiile contului-sămânță cu fotografiile locale reale;
//   4. coboară la „neverificat" orice anunț pe care l-a corectat serios.
//
// Determinist: toate alegerile pleacă dintr-un hash al id-ului, deci o a doua
// rulare produce exact același rezultat. Rulează întâi cu dry_run: true.
//
// Doar admin. Se apelează din panoul de administrare.

const ADMIN_ROLES = new Set(["admin", "ADMIN", "SUPER_ADMIN", "super_admin"]);

const MAX_PRICE_RON = 15000;
const MAX_ROOMS = 8;
const MAX_SQM = 400;
const MAX_SQM_PER_ROOM = 120;

// Cele 19 fotografii reale din public/images/properties/.
const LOCAL_PHOTOS: string[] = [
  ...Array.from({ length: 11 }, (_, i) => `/images/properties/interior-${String(i + 1).padStart(2, "0")}.webp`),
  ...Array.from({ length: 8 }, (_, i) => `/images/properties/exterior-${String(i + 1).padStart(2, "0")}.webp`),
];
const INTERIORS = LOCAL_PHOTOS.filter((p) => p.includes("interior"));
const EXTERIORS = LOCAL_PHOTOS.filter((p) => p.includes("exterior"));

function hashId(id: string): number {
  let h = 0;
  const s = String(id || "");
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Valoare stabilă într-un interval, derivată din id + un „sare" pe câmp.
function pick(id: string, salt: number, min: number, max: number): number {
  const h = hashId(id + ":" + salt);
  return min + (h % (max - min + 1));
}

function isJunkTitle(title: unknown): boolean {
  return /^(test|testing|demo|asdf|aaa+)$/i.test(String(title || "").trim());
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id || !ADMIN_ROLES.has(me.role)) {
      return Response.json({ error: "Doar administratorii pot curăța datele demo." });
    }

    let body: any = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const dryRun = body?.dry_run !== false; // implicit NU scrie nimic
    const replacePhotos = body?.replace_photos !== false;

    const svc = base44.asServiceRole;
    const properties = await svc.entities.Property.list("-created_date", 500);

    const toDelete: any[] = [];
    const toUpdate: any[] = [];

    for (const p of properties as any[]) {
      if (isJunkTitle(p.title)) {
        toDelete.push({ id: p.id, title: p.title, reason: "titlu de test" });
        continue;
      }

      const patch: Record<string, any> = {};
      const reasons: string[] = [];

      const isSale = p.transaction_type === "SALE";
      const price = Number(p.price_monthly);
      if (!isSale && Number.isFinite(price) && price > MAX_PRICE_RON) {
        patch.price_monthly = pick(p.id, 1, 900, 4800);
        reasons.push(`preț ${price} → ${patch.price_monthly}`);
      }

      let rooms = Number(p.rooms);
      if (Number.isFinite(rooms) && rooms > MAX_ROOMS) {
        patch.rooms = pick(p.id, 2, 1, 4);
        reasons.push(`camere ${rooms} → ${patch.rooms}`);
        rooms = patch.rooms;
      }

      const sqm = Number(p.surface_sqm);
      const effectiveRooms = Number.isFinite(rooms) && rooms > 0 ? rooms : 2;
      const implausibleSqm =
        (Number.isFinite(sqm) && sqm > MAX_SQM) ||
        (Number.isFinite(sqm) && sqm > 0 && sqm / effectiveRooms > MAX_SQM_PER_ROOM);
      if (implausibleSqm) {
        // ~34 mp pentru prima cameră, ~18 pentru fiecare următoare, plus variație
        const base = 34 + (effectiveRooms - 1) * 18;
        patch.surface_sqm = base + pick(p.id, 3, 0, 14);
        reasons.push(`suprafață ${sqm} → ${patch.surface_sqm}`);
      }

      // Depozitul urmează chiria, ca să nu rămână o valoare orfană.
      const finalPrice = patch.price_monthly ?? price;
      const deposit = Number(p.deposit);
      if (Number.isFinite(finalPrice) && Number.isFinite(deposit) && deposit > finalPrice * 3) {
        patch.deposit = Math.round(finalPrice);
        reasons.push(`garanție ${deposit} → ${patch.deposit}`);
      }

      // Fotografii: contul-sămânță a încărcat randări desenate.
      if (replacePhotos) {
        const imgs: string[] = Array.isArray(p.images) ? p.images : [];
        const alreadyLocal = imgs.length > 0 && imgs.every((u) => String(u).startsWith("/images/properties/"));
        if (!alreadyLocal) {
          const h = hashId(p.id);
          const next = [
            INTERIORS[h % INTERIORS.length],
            EXTERIORS[(h >> 3) % EXTERIORS.length],
            INTERIORS[(h >> 7) % INTERIORS.length],
          ];
          // fără duplicate în aceeași galerie
          const unique = Array.from(new Set(next));
          if (unique.length < 3) unique.push(INTERIORS[(h >> 11) % INTERIORS.length]);
          patch.images = Array.from(new Set(unique)).slice(0, 3);
          reasons.push("fotografii → set local");
        }
      }

      // Orice anunț corectat pe cifre nu mai are voie să se prezinte ca verificat.
      const correctedNumbers =
        patch.price_monthly !== undefined ||
        patch.rooms !== undefined ||
        patch.surface_sqm !== undefined;
      if (correctedNumbers) {
        if (p.verification_level && p.verification_level !== "unverified") {
          patch.verification_level = "unverified";
          reasons.push("verificare → neverificat");
        }
        if (Number(p.trust_score) > 0) {
          patch.trust_score = 0;
          reasons.push("scor → 0");
        }
        if (p.featured) {
          patch.featured = false;
          reasons.push("promovat → nu");
        }
      }

      if (Object.keys(patch).length > 0) {
        toUpdate.push({ id: p.id, title: p.title, patch, reasons });
      }
    }

    if (dryRun) {
      return Response.json({
        ok: true,
        dry_run: true,
        scanned: properties.length,
        will_delete: toDelete,
        will_update: toUpdate.map((u) => ({ id: u.id, title: u.title, reasons: u.reasons })),
        delete_count: toDelete.length,
        update_count: toUpdate.length,
      });
    }

    let deleted = 0;
    for (const d of toDelete) {
      try { await svc.entities.Property.delete(d.id); deleted += 1; } catch (_) { /* skip */ }
    }

    let updated = 0;
    for (const u of toUpdate) {
      try { await svc.entities.Property.update(u.id, u.patch); updated += 1; } catch (_) { /* skip */ }
    }

    return Response.json({
      ok: true,
      dry_run: false,
      scanned: properties.length,
      deleted,
      updated,
      details: toUpdate.map((u) => ({ id: u.id, title: u.title, reasons: u.reasons })),
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Eroare la curățarea datelor." });
  }
}
