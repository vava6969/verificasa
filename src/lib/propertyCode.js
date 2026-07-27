import { base44 } from "@/api/base44Client";

// Generates a unique 7-digit numeric property code (Cod Proprietate),
// checking existing codes to avoid collisions. Falls back gracefully if
// the list call fails — a collision is then extremely unlikely given the
// 9,000,000 number space at this app's scale.
export async function generateUniquePropertyCode() {
  let existing = new Set();
  try {
    const list = await base44.entities.Property.list("-created_date", 1000);
    (list || []).forEach((p) => {
      if (p.property_code != null) existing.add(Number(p.property_code));
    });
  } catch {
    // ignore — proceed with an empty set
  }
  let code = 0;
  let attempts = 0;
  do {
    code = Math.floor(1000000 + Math.random() * 9000000); // 1,000,000 – 9,999,999
    attempts++;
  } while (existing.has(code) && attempts < 50);
  return code;
}