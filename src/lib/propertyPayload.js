import { getCounty } from "@/components/locations";

export const MAX_PHOTOS = 20;
export const MIN_PHOTOS = 3;

export const onlyPhoneDigits = (v) => {
  const clean = String(v || "").replace(/[^0-9+]/g, "");
  if (clean.startsWith("+")) return "+" + clean.slice(1).replace(/\+/g, "");
  return clean.replace(/\+/g, "");
};
export const onlyDigits = (v, max) => String(v || "").replace(/[^0-9]/g, "").slice(0, max ?? 4);

export const EMPTY_FORM = {
  title: "", description: "", price_monthly: "", city: "", zone: "", landmark: "", property_type: "Garsonieră",
  rooms: "1", surface_sqm: "", floor: "", deposit: "", available_from: "", images: "",
  latitude: "", longitude: "", owner_name: "",
  transaction_type: "RENT", building_year: "", total_floors: "", phone: "", whatsapp_phone: "",
  seller_role: "Proprietar",
  parking: false, pet_friendly: false, commission_free: false, guarantee: false,
};

export const CHIP_OPTS = [
  { key: "wifi", emoji: "📶", label: "Internet / Wi-Fi", feature: "📶 Internet / Wi-Fi" },
  { key: "noise", emoji: "🔊", label: "Zonă liniștită", feature: "🔊 Zonă liniștită" },
  { key: "light", emoji: "☀️", label: "Orientare / Luminozitate", feature: "☀️ Orientare Sud" },
  { key: "water", emoji: "💧", label: "Presiune apă verificată", feature: "💧 Presiune apă OK" },
];

export const FACILITY_OPTS = [
  { key: "ac", emoji: "❄️", label: "Aer Condiționat" },
  { key: "balcon", emoji: "🌇", label: "Balcon" },
  { key: "lift", emoji: "🛗", label: "Lift" },
  { key: "centrala", emoji: "🔥", label: "Centrală proprie" },
  { key: "termopan", emoji: "🪟", label: "Geamuri Termopan" },
  { key: "mobilat", emoji: "🛋️", label: "Mobilat complet" },
  { key: "bucatarie", emoji: "🍽️", label: "Bucătărie utilată" },
  { key: "tv", emoji: "📺", label: "Smart TV" },
  { key: "masina_spalat", emoji: "🧺", label: "Mașină de spălat" },
  { key: "terasa", emoji: "🌿", label: "Terasă / Grădină" },
];

export const OPTION_OPTS = [
  { key: "parking", emoji: "🅿️", label: "Parcare" },
  { key: "pet_friendly", emoji: "🐾", label: "Pet Friendly" },
  { key: "commission_free", emoji: "🆓", label: "Fără Comision" },
  { key: "guarantee", emoji: "🛡️", label: "Garanție 0 (VerifiCasa)" },
];

// Builds the Property entity payload from wizard/form state.
export function buildPropertyPayload({ form, chips, facilities, country, user, isAdmin, property_code }) {
  return {
    property_code,
    title: form.title,
    description: form.description,
    price_monthly: Number(form.price_monthly),
    currency: "EUR",
    country,
    county: getCounty(form.city),
    city: form.city,
    zone: form.zone,
    landmark: form.landmark || "",
    property_type: form.property_type,
    rooms: Number(form.rooms),
    surface_sqm: Number(form.surface_sqm) || null,
    floor: form.floor || "",
    deposit: Number(form.deposit) || null,
    transaction_type: form.transaction_type || "RENT",
    building_year: form.building_year ? Number(form.building_year) : null,
    total_floors: form.total_floors ? Number(form.total_floors) : null,
    phone: form.phone || "",
    whatsapp_phone: form.whatsapp_phone || "",
    seller_role: form.seller_role || "Proprietar",
    approval_status: isAdmin ? "APPROVED" : "PENDING",
    ...(isAdmin ? {
      approved_by_id: user.id,
      approved_by_name: user.full_name || user.email,
      approved_date: new Date().toISOString(),
    } : {}),
    furnished: true,
    pet_friendly: form.pet_friendly,
    parking: form.parking,
    commission_free: form.commission_free,
    deposit_option: form.guarantee ? "verificasa_guarantee" : "standard",
    available_from: form.available_from || null,
    images: form.images ? form.images.split(",").filter(Boolean) : [],
    ai_video_url: "",
    latitude: form.latitude ? Number(form.latitude) : null,
    longitude: form.longitude ? Number(form.longitude) : null,
    owner_name: form.owner_name || "Proprietar",
    posted_by_name: user?.full_name || form.owner_name || "VerifiCasa",
    owner_verified: false,
    ai_tour_verified: false,
    status: "Activ",
    featured: false,
    views_count: 0,
    internet_speed_mbps: chips.wifi ? 100 : null,
    noise_db: chips.noise ? 35 : null,
    light_orientation: chips.light ? "Sud" : "",
    water_pressure_ok: !!chips.water,
    features: [
      ...CHIP_OPTS.filter((c) => chips[c.key]).map((c) => c.feature),
      ...FACILITY_OPTS.filter((f) => facilities[f.key]).map((f) => `${f.emoji} ${f.label}`),
    ],
  };
}