// Location data restricted to the cities the platform serves.
// VerifiCasa operates ONLY in Iași (Județul Iași) and Huși (Județul Vaslui).
// All other cities/counties are intentionally excluded.
export const LOCATIONS = {
  RO: [
    {
      city: "Iași",
      county: "Iași",
      zones: [
        "Copou", "Sărărie", "Carol I",
        "Păcurari", "Canta",
        "Alexandru cel Bun", "Dacia", "Mircea cel Bătrân",
        "Nicolina 1", "Nicolina 2", "CUG", "Frumoasa",
        "Tătărași Nord", "Tătărași Sud", "Oancea", "Ciurchi",
        "Tudor Vladimirescu", "Baza 3",
        "Centru", "Podu Roș", "Cantemir", "Palas", "Sf. Lazăr",
        "Bucium", "Socola", "Trei Ierarhi",
        "Galata", "Miroslava",
        "Moara de Vânt", "Aviației", "Târgu Cucu",
        "Dancu", "Ciurea", "Lunca Cetățuii",
      ],
    },
    {
      city: "Huși",
      county: "Vaslui",
      zones: [
        "Centru",
        "Corni",
        "Dobrina",
        "Dric 1",
        "Dric 2",
        "Plopeni",
        "Zona Spital / Calea Basarabiei",
        "Zona Industrială / Gară",
        "Podgorie / Brodoc",
      ],
    },
  ],
};

export function getCities(country) {
  return (LOCATIONS[country] || []).map((c) => c.city);
}

export function getZones(country, city) {
  const found = (LOCATIONS[country] || []).find((c) => c.city === city);
  return found ? found.zones : [];
}

export function getCounty(city) {
  const found = (LOCATIONS.RO || []).find((c) => c.city === city);
  return found ? found.county : "";
}