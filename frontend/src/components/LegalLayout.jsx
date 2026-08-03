import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import Footer from "./Footer";

export default function LegalLayout({ title, children }) {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen bg-[#F5F0E8] text-[#1C1714] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <header className="shrink-0 border-b border-[rgba(28,23,20,0.1)] bg-[#F5F0E8]/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="flex flex-col leading-none">
            <span
              className="text-base font-semibold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("brand.name")}
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#7A6E62]">
              {t("brand.tagline")}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/"
              className="text-xs text-[#7A6E62] hover:text-[#B8956A] transition-colors"
            >
              {t("shell.home")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E62] mb-2">
          {t("legal.kicker")}
        </p>
        <h1
          className="text-3xl font-medium mb-8"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h1>
        <div className="flex flex-col gap-6 text-sm text-[#4A4238] leading-relaxed">
          {children}
        </div>
        <div className="mt-10 flex flex-wrap gap-4 text-xs">
          <Link
            to="/mentions-legales"
            className="text-[#B8956A] hover:text-[#7A4F10] transition-colors"
          >
            {t("footer.legal")}
          </Link>
          <Link
            to="/cgu"
            className="text-[#B8956A] hover:text-[#7A4F10] transition-colors"
          >
            {t("footer.terms")}
          </Link>
          <Link
            to="/confidentialite"
            className="text-[#B8956A] hover:text-[#7A4F10] transition-colors"
          >
            {t("footer.privacy")}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.08)] rounded-sm p-5">
      {title ? (
        <h2 className="text-sm font-medium text-[#1C1714] mb-3">{title}</h2>
      ) : null}
      <div className="flex flex-col gap-2 text-[#4A4238]">{children}</div>
    </section>
  );
}
