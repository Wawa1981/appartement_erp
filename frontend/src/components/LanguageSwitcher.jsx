import { useTranslation } from "react-i18next";
import { setAppLanguage, getAppLanguage, SUPPORTED } from "../i18n";

/**
 * Switch FR / EN — style d'origine (landing header).
 * Ne pas casser le look de la landing.
 */
export default function LanguageSwitcher({ className = "" }) {
  const { t, i18n } = useTranslation();
  const current = getAppLanguage();
  void i18n.language;

  return (
    <div
      className={`inline-flex items-center rounded-sm border border-[rgba(28,23,20,0.15)] overflow-hidden ${className}`}
      role="group"
      aria-label={t("nav.language")}
    >
      {SUPPORTED.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => setAppLanguage(lng)}
          className={`px-2.5 py-1 text-[11px] font-medium tracking-wide transition-colors ${
            current === lng
              ? "bg-[#1C1714] text-[#F5F0E8]"
              : "bg-transparent text-[#7A6E62] hover:text-[#1C1714]"
          }`}
          aria-pressed={current === lng}
        >
          {t(`lang.${lng}`)}
        </button>
      ))}
    </div>
  );
}
