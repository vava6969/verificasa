// Limitele de cont, server-side. Trebuie să rămână identice cu ENTITLEMENTS din
// src/lib/plans.js — verificarea din client e doar curtoazie de interfață,
// aceasta e cea care contează.
//
// ATENȚIE: shared/ e copiat în fiecare funcție la deploy, deci funcțiile care
// importă de aici se deployează împreună.
//
// Matricea cerută de client pe 22.08.2026. Ce e impus de aici:
//   activeListings, photosPerListing — CheckListingAllowance, la publicare.
//   boostsIncluded — VerifyCheckoutSession creditează registrul BoostCredit la
//                    activarea abonamentului.
//   tours3d, verifications — deocamdată doar afișaj (nu există contor de tururi
//                    și nici de verificări; verificarea o face manual un admin).

export const ENTITLEMENTS = {
  none:  { activeListings: 1,  photosPerListing: 8,    tours3d: 0,  boostsIncluded: 0,  verifications: 1, priorityWeight: 0 },
  basic: { activeListings: 2,  photosPerListing: 15,   tours3d: 2,  boostsIncluded: 2,  verifications: 1, priorityWeight: 1 },
  pro:   { activeListings: 3,  photosPerListing: 30,   tours3d: 3,  boostsIncluded: 3,  verifications: 1, priorityWeight: 2 },
  agent: { activeListings: 30, photosPerListing: null, tours3d: 30, boostsIncluded: 45, verifications: 1, priorityWeight: 3 },
};

export function getEntitlements(planId) {
  return ENTITLEMENTS[planId] || ENTITLEMENTS.none;
}

// Planul activ al unui utilizator, citit cu rol de serviciu (Subscription are
// read blocat la owner/admin).
export async function getActivePlan(svc, userId) {
  try {
    const rows = await svc.entities.Subscription.filter(
      { user_id: userId, status: "active" }, "-started_date", 1
    );
    return rows?.[0]?.plan_id || null;
  } catch (_) {
    return null;
  }
}

// Câte anunțuri active are deja utilizatorul, excluzând opțional unul anume
// (cel pe care tocmai îl editează).
export async function countActiveListings(svc, userId, excludeId) {
  try {
    const rows = await svc.entities.Property.filter(
      { created_by_id: userId, status: "Activ" }, "-created_date", 200
    );
    return (rows || []).filter(
      (p) => p.id !== excludeId && p.approval_status !== "REJECTED"
    ).length;
  } catch (_) {
    return 0;
  }
}
