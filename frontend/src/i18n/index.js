import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import fr from "./locales/fr.json";
import en from "./locales/en.json";

const SUPPORTED = ["fr", "en"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    supportedLngs: SUPPORTED,
    fallbackLng: "fr",
    lng: undefined,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "appartement_lang",
    },
  });

export function setAppLanguage(lng) {
  const next = SUPPORTED.includes(lng) ? lng : "fr";
  i18n.changeLanguage(next);
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
  }
  return next;
}

export function getAppLanguage() {
  const lng = (i18n.language || "fr").split("-")[0];
  return SUPPORTED.includes(lng) ? lng : "fr";
}

export { SUPPORTED };
export default i18n;
