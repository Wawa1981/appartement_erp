/**
 * Inventaire officiel — lappartement137.com
 *
 * 137 (16 passage Lemoine, 160 m²) :
 *   2 fauteuils barbier + 8 premium + 7 classiques
 *
 * 80 (80 rue de Cléry, 140 m²) :
 *   1 cabine esthétique + 16 fauteuils
 *
 * Libellés postes / espaces via i18n (clés) — pas de texte FR en dur.
 */

/**
 * Inventaire — libellés via i18n (clés espaces.*)
 * surface = donnée technique unique
 */
export const ESPACES = {
  "137": {
    id: "137",
    nomKey: "espaces.137.nom",
    labelKey: "espaces.137.label",
    adresseKey: "espaces.137.adresse",
    detailKey: "espaces.137.detail",
    surface: "160 m²",
  },
  "80": {
    id: "80",
    nomKey: "espaces.80.nom",
    labelKey: "espaces.80.label",
    adresseKey: "espaces.80.adresse",
    detailKey: "espaces.80.detail",
    surface: "140 m²",
  },
};

/** Résolution affichage espace (nécessite t de i18next) */
export function espaceDisplay(id, t) {
  const e = ESPACES[String(id)];
  if (!e) return { id, nom: id, label: id, adresse: "", detail: "", surface: "" };
  return {
    id: e.id,
    nom: t(e.nomKey),
    label: t(e.labelKey),
    adresse: t(e.adresseKey),
    detail: t(e.detailKey),
    surface: e.surface,
  };
}

/**
 * Tarif à l'heure (book-online) — affichage admin / calendrier.
 * premium 16 · classique 11 · fauteuil 11 · cabine 16 · barbier 16
 */
export const PRIX_HEURE = {
  premium: 16,
  classique: 11,
  barbier: 16,
  fauteuil: 11,
  cabine: 16,
};

/**
 * Libellé poste — clés postes.* + param n
 * premium → n = lettre A… ; autres → n = numéro
 */
export function posteDisplay(p, t) {
  if (!p) return "";
  if (p.type === "cabine") return t("postes.cabine");
  return t(`postes.${p.type}`, { n: p.n });
}

function buildPostes() {
  const list = [];

  // ——— 137 : 8 premium ———
  for (let i = 0; i < 8; i++) {
    const letter = String.fromCharCode(65 + i);
    list.push({
      id: `137-premium-${i + 1}`,
      n: letter,
      espace: "137",
      type: "premium",
      prixH: PRIX_HEURE.premium,
      actif: true,
    });
  }
  // ——— 137 : 7 classiques ———
  for (let i = 1; i <= 7; i++) {
    list.push({
      id: `137-classique-${i}`,
      n: String(i),
      espace: "137",
      type: "classique",
      prixH: PRIX_HEURE.classique,
      actif: true,
    });
  }
  // ——— 137 : 2 barbiers ———
  for (let i = 1; i <= 2; i++) {
    list.push({
      id: `137-barbier-${i}`,
      n: String(i),
      espace: "137",
      type: "barbier",
      prixH: PRIX_HEURE.barbier,
      actif: true,
    });
  }

  // ——— 80 : 16 fauteuils ———
  for (let i = 1; i <= 16; i++) {
    list.push({
      id: `80-fauteuil-${i}`,
      n: String(i),
      espace: "80",
      type: "fauteuil",
      prixH: PRIX_HEURE.fauteuil,
      actif: true,
    });
  }
  // ——— 80 : 1 cabine ———
  list.push({
    id: "80-cabine-1",
    n: "1",
    espace: "80",
    type: "cabine",
    prixH: PRIX_HEURE.cabine,
    actif: true,
  });

  return list;
}

export const POSTES = buildPostes();

export function postesByEspace(espaceId) {
  return POSTES.filter((p) => p.espace === String(espaceId));
}

export function countPostes(espaceId) {
  return postesByEspace(espaceId).length;
}

export function countByType(espaceId) {
  const c = {};
  for (const p of postesByEspace(espaceId)) {
    c[p.type] = (c[p.type] || 0) + 1;
  }
  return c;
}

// Garde-fous
const c137 = countByType("137");
const c80 = countByType("80");
if (
  c137.premium !== 8 ||
  c137.classique !== 7 ||
  c137.barbier !== 2 ||
  countPostes("137") !== 17
) {
  console.error("Inventaire 137 incorrect", c137, countPostes("137"));
}
if (c80.fauteuil !== 16 || c80.cabine !== 1 || countPostes("80") !== 17) {
  console.error("Inventaire 80 incorrect", c80, countPostes("80"));
}
