/**
 * Catalogue réservation — source : lappartement137.com/book-online
 *
 * TARIFS (nombres uniquement ici) — libellés via i18n (services.*, duration.*)
 *
 * Premium (137)     demi-h 8 · h 16 · demi-j 59 · j 99
 * Classique (137)   demi-h 6 · h 11 · demi-j 49 · j 79
 * Fauteuil (80)     demi-h 6 · h 11 · demi-j 49 · j 79
 * Cabine (80)       demi-h 8 · h 16 · demi-j 69 · j 119
 */

import { ESPACES } from "./inventory.js";

/** Libellés via i18n : nomKey/labelKey/detailKey */
export const LOCATIONS = [
  {
    id: "137",
    nomKey: ESPACES["137"].nomKey,
    labelKey: ESPACES["137"].labelKey,
    detailKey: ESPACES["137"].detailKey,
    shortKey: "espaces.137.short",
    surface: ESPACES["137"].surface,
  },
  {
    id: "80",
    nomKey: ESPACES["80"].nomKey,
    labelKey: ESPACES["80"].labelKey,
    detailKey: ESPACES["80"].detailKey,
    shortKey: "espaces.80.short",
    surface: ESPACES["80"].surface,
  },
];

/**
 * Formules — nameKey / durationKey pour t()
 * 137 → premium + classique
 * 80  → fauteuil + cabine
 */
export const SERVICES = [
  // —— Premium (137) ——
  {
    id: "premium-demi-heure",
    nameKey: "services.premium-demi-heure",
    type: "premium",
    durationMin: 30,
    durationKey: "duration.30",
    price: 8,
    locations: ["137"],
  },
  {
    id: "premium-heure",
    nameKey: "services.premium-heure",
    type: "premium",
    durationMin: 60,
    durationKey: "duration.60",
    price: 16,
    locations: ["137"],
  },
  {
    id: "premium-demi-journee",
    nameKey: "services.premium-demi-journee",
    type: "premium",
    durationMin: 300,
    durationKey: "duration.300",
    price: 59,
    locations: ["137"],
  },
  {
    id: "premium-journee",
    nameKey: "services.premium-journee",
    type: "premium",
    durationMin: 660,
    durationKey: "duration.660",
    price: 99,
    locations: ["137"],
  },

  // —— Classique (137) ——
  {
    id: "classique-demi-heure",
    nameKey: "services.classique-demi-heure",
    type: "classique",
    durationMin: 30,
    durationKey: "duration.30",
    price: 6,
    locations: ["137"],
  },
  {
    id: "classique-heure",
    nameKey: "services.classique-heure",
    type: "classique",
    durationMin: 60,
    durationKey: "duration.60",
    price: 11,
    locations: ["137"],
  },
  {
    id: "classique-demi-journee",
    nameKey: "services.classique-demi-journee",
    type: "classique",
    durationMin: 300,
    durationKey: "duration.300",
    price: 49,
    locations: ["137"],
  },
  {
    id: "classique-journee",
    nameKey: "services.classique-journee",
    type: "classique",
    durationMin: 660,
    durationKey: "duration.660",
    price: 79,
    locations: ["137"],
  },

  // —— Fauteuil (80) ——
  {
    id: "location-demi-heure",
    nameKey: "services.location-demi-heure",
    type: "fauteuil",
    durationMin: 30,
    durationKey: "duration.30",
    price: 6,
    locations: ["80"],
  },
  {
    id: "location-heure",
    nameKey: "services.location-heure",
    type: "fauteuil",
    durationMin: 60,
    durationKey: "duration.60",
    price: 11,
    locations: ["80"],
  },
  {
    id: "location-demi-journee",
    nameKey: "services.location-demi-journee",
    type: "fauteuil",
    durationMin: 300,
    durationKey: "duration.300",
    price: 49,
    locations: ["80"],
  },
  {
    id: "location-journee",
    nameKey: "services.location-journee",
    type: "fauteuil",
    durationMin: 660,
    durationKey: "duration.660",
    price: 79,
    locations: ["80"],
  },

  // —— Cabine (80) ——
  {
    id: "cabine-demi-heure",
    nameKey: "services.cabine-demi-heure",
    type: "cabine",
    durationMin: 30,
    durationKey: "duration.30",
    price: 8,
    locations: ["80"],
  },
  {
    id: "cabine-heure",
    nameKey: "services.cabine-heure",
    type: "cabine",
    durationMin: 60,
    durationKey: "duration.60",
    price: 16,
    locations: ["80"],
  },
  {
    id: "cabine-demi-journee",
    nameKey: "services.cabine-demi-journee",
    type: "cabine",
    durationMin: 300,
    durationKey: "duration.300",
    price: 69,
    locations: ["80"],
  },
  {
    id: "cabine-journee",
    nameKey: "services.cabine-journee",
    type: "cabine",
    durationMin: 660,
    durationKey: "duration.660",
    price: 119,
    locations: ["80"],
  },
];

export { CONTACT, SITE, LEGAL } from "./siteConfig";

/** Métadonnées type — labels via i18n keys (types.*) */
export const TYPE_META = {
  premium: { labelKey: "types.premium", color: "#7A4F10", bg: "#FBE9CC" },
  classique: { labelKey: "types.classique", color: "#4A4238", bg: "#EAE3D6" },
  barbier: { labelKey: "types.barbier", color: "#1C1714", bg: "#E0DAD2" },
  fauteuil: { labelKey: "types.fauteuil", color: "#4A4238", bg: "#EAE3D6" },
  cabine: { labelKey: "types.cabine", color: "#5A3E80", bg: "#EAE0F5" },
};

/** Affichage service (nécessite t) */
export function serviceDisplay(s, t) {
  if (!s) return { name: "", duration: "" };
  return {
    name: t(s.nameKey),
    duration: t(s.durationKey),
  };
}

/** Affichage lieu (nécessite t) */
export function locationDisplay(loc, t) {
  if (!loc) return { nom: "", label: "", detail: "", surface: "" };
  return {
    nom: t(loc.nomKey),
    label: t(loc.labelKey),
    detail: t(loc.detailKey),
    surface: loc.surface,
  };
}
