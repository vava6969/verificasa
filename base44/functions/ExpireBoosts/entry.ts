import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Stinge boost-urile expirate și curăță câmpurile denormalizate de pe anunț.
// De rulat pe program (sau manual din Admin). Idempotent.
const ADMIN_ROLES = new Set(["admin", "ADMIN", "SUPER_ADMIN", "super_admin"]);

// BOOST-URILE NU MAI EXPIRĂ (decizia clientului, 22.08). Funcția rămâne în
// aplicație pentru că e posibil să fie încă prinsă într-un cron sau chemată de
// undeva; nu mai stinge nimic și răspunde ca și cum n-ar fi avut ce face.
// Codul vechi stă mai jos, în istoricul git, dacă se răzgândește cineva.
export default async function () {
  return Response.json({ ok: true, expired: 0, disabled: "boosts do not expire" });
}
