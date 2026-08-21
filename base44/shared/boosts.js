// Helpers partajați pentru sistemul de boost-uri.
//
// ATENȚIE (regulă de platformă): directorul shared/ e copiat în FIECARE funcție
// la deploy, deci publicarea unei singure funcții împrospătează doar copia ei.
// Funcțiile care importă de aici (CreateBoostCheckout, VerifyBoostCheckout,
// RedeemCoupon, ApplyBoost, ExpireBoosts) se deployează ÎMPREUNĂ, altfel unele
// rulează cu o copie veche fără niciun mesaj de eroare.

export const BOOST_DURATION_DAYS = 7;

// Trebuie să rămână identic cu BOOST_PACKS din src/lib/plans.js.
export const BOOST_PACKS = {
  b1: { boosts: 1, priceRon: 14.99, label: "1 boost" },
  b3: { boosts: 3, priceRon: 31.99, label: "3 boost-uri" },
  b6: { boosts: 6, priceRon: 58.99, label: "6 boost-uri" },
  b12: { boosts: 12, priceRon: 80.99, label: "12 boost-uri" },
};

// Soldul curent de credite al unui utilizator, din registrul BoostCredit.
// Registrul e append-only: fiecare rând e o mișcare, soldul e suma lor.
export async function getBalance(svc, userId) {
  try {
    const rows = await svc.entities.BoostCredit.filter({ user_id: userId }, "-created_date", 500);
    return (rows || []).reduce((sum, r) => sum + (Number(r.delta) || 0), 0);
  } catch (_) {
    return 0;
  }
}

// Scrie o mișcare în registru și întoarce noul sold.
export async function addCredits(svc, { userId, delta, reason, sourceId, note }) {
  const before = await getBalance(svc, userId);
  const after = before + delta;
  await svc.entities.BoostCredit.create({
    user_id: userId,
    delta,
    reason,
    source_id: sourceId || "",
    balance_after: after,
    note: (note || "").slice(0, 300),
  });
  return after;
}

export function normaliseCode(code) {
  return String(code || "").trim().toUpperCase().replace(/\s+/g, "");
}
