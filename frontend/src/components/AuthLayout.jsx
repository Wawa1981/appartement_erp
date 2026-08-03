import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen bg-[#F5F0E8] text-[#1C1714] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <header className="shrink-0 border-b border-[rgba(28,23,20,0.1)] bg-[#F5F0E8]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex flex-col leading-none">
            <span
              className="text-lg font-semibold text-[#1C1714]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("brand.name")}
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#7A6E62] mt-0.5">
              {t("brand.tagline")}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/"
              className="text-sm text-[#7A6E62] hover:text-[#B8956A] transition-colors"
            >
              {t("nav.home")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-[#EDE7DA]/95 border border-[rgba(28,23,20,0.08)] rounded-sm shadow-[0_8px_40px_rgba(28,23,20,0.06)] p-8 sm:p-10">
            <div className="text-center">
              {Icon ? (
                <div className="w-12 h-12 rounded-sm bg-[#1C1714] text-[#F5F0E8] flex items-center justify-center mb-6 mx-auto">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
              ) : null}
              <h1
                className="text-2xl sm:text-3xl font-medium text-[#1C1714] mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {title}
              </h1>
              {subtitle ? (
                <p className="text-sm text-[#7A6E62] mb-8">{subtitle}</p>
              ) : (
                <div className="mb-8" />
              )}
            </div>
            {children}
          </div>
          {footer ? (
            <p className="text-center text-sm text-[#7A6E62] mt-6">{footer}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
