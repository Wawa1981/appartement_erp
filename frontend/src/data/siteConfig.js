/**
 * Source unique des données site (pas de chaînes métier dans les composants).
 * Surcharge possible via .env (VITE_*).
 *
 * Identité légale : L'APPARTEMENT — sources publiques
 * societe.com / annuaire-entreprises / pappers (SIREN 949 833 537).
 * Création INSEE 24/02/2023 · RCS Paris 31/03/2023.
 */
const env = import.meta.env;

export const SITE = {
  brandName: env.VITE_BRAND_NAME || "L'Appartement",
  email: env.VITE_CONTACT_EMAIL || "contact@lappartement137.com",
  phone: env.VITE_CONTACT_PHONE || "06 21 32 15 96",
  phoneRaw: env.VITE_CONTACT_PHONE_RAW || "0621321596",
  phoneFixe: env.VITE_CONTACT_PHONE_FIXE || "01 71 50 60 64",
  phoneFixeRaw: env.VITE_CONTACT_PHONE_FIXE_RAW || "0171506064",
  instagramUrl:
    env.VITE_INSTAGRAM_URL ||
    "https://www.instagram.com/lappartement137?igsh=MXJpZm8wOHh1MnBtaA%3D%3D&utm_source=qr",
  instagramHandle: env.VITE_INSTAGRAM_HANDLE || "@lappartement137",
  /** Année d'existence / copyright public (pas de fausse année) */
  copyrightYear: Number(env.VITE_COPYRIGHT_YEAR) || 2024,
  /** clés i18n pour affichage (traduction / libellés) */
  i18n: {
    addressLemoine: "footer.addressLemoine",
    addressClery: "footer.addressClery",
    hours: "footer.hours",
    tagline: "footer.blurb",
    brandSpaces: "footer.brandSpaces",
  },
};

/**
 * Entité juridique éditrice — données registre (INSEE / RNE / RCS).
 * Siège social ≠ adresses d'exploitation (Lemoine / Cléry).
 */
export const LEGAL = {
  raisonSociale: env.VITE_LEGAL_NAME || "L'APPARTEMENT",
  formeJuridique: env.VITE_LEGAL_FORM || "SAS",
  formeJuridiqueKey: "legal.ml.formeSas",
  capital: env.VITE_LEGAL_CAPITAL || "10 000 €",
  siren: env.VITE_LEGAL_SIREN || "949833537",
  sirenDisplay: env.VITE_LEGAL_SIREN_DISPLAY || "949 833 537",
  siret: env.VITE_LEGAL_SIRET || "94983353700010",
  siretDisplay: env.VITE_LEGAL_SIRET_DISPLAY || "949 833 537 00010",
  tva: env.VITE_LEGAL_TVA || "FR08949833537",
  rcs: env.VITE_LEGAL_RCS || "Paris",
  rcsDisplay: env.VITE_LEGAL_RCS_DISPLAY || "949 833 537 R.C.S. Paris",
  naf: env.VITE_LEGAL_NAF || "6820B",
  nafLabelKey: "legal.ml.nafLabel",
  /** Siège social officiel (registre) */
  siege: env.VITE_LEGAL_SIEGE || "67 rue d'Aboukir, 75002 Paris",
  dateCreation: env.VITE_LEGAL_CREATED || "2023-03-31",
  dateCreationDisplay: env.VITE_LEGAL_CREATED_DISPLAY || "31/03/2023",
  /** Président / directeur de la publication */
  president: env.VITE_LEGAL_PRESIDENT || "David LAFRANQUE",
  directeurGeneral: env.VITE_LEGAL_DG || "Dylan DUCHESNE",
  directeurPublication:
    env.VITE_LEGAL_PUBLICATION || "David LAFRANQUE",
};

/** Compat : ancien nom CONTACT */
export const CONTACT = {
  email: SITE.email,
  phone: SITE.phone,
  phoneRaw: SITE.phoneRaw,
  phoneFixe: SITE.phoneFixe,
  phoneFixeRaw: SITE.phoneFixeRaw,
  adressePubliqueKey: SITE.i18n.addressLemoine,
  adresse80Key: SITE.i18n.addressClery,
  hoursKey: SITE.i18n.hours,
  instagram: SITE.instagramUrl,
  instagramHandle: SITE.instagramHandle,
  taglineKey: SITE.i18n.tagline,
};
