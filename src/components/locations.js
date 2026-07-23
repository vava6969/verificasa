// Location data restricted to the cities the platform serves.
// VerifiCasa operates ONLY in Iași (Jud. Iași) and Huși (Jud. Vaslui).
export const LOCATIONS = {
  RO: [
    {
      city: "Iași",
      county: "Iași",
      zones: [
        "Copou", "Sărărie", "Păcurari", "Canta", "Alexandru cel Bun", "Dacia",
        "Mircea cel Bătrân", "Nicolina 1", "Nicolina 2", "CUG", "Frumoasa",
        "Tătărași", "Oancea", "Tudor Vladimirescu", "Centru", "Podu Roș", "Palas",
        "Bucium", "Socola", "Galata", "Miroslava/Valea Adâncă", "Moara de Vânt",
        "Târgu Cucu", "Dancu", "Ciurea", "Lunca Cetățuii",
      ],
    },
    {
      city: "Huși",
      county: "Vaslui",
      zones: [
        "Centru", "Corni", "Dobrina", "Dric 1", "Dric 2", "Plopeni",
        "Zona Spital", "Zona Industrială", "Podgorie",
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