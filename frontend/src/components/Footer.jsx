import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Clock } from "lucide-react";
import { CONTACT, SITE } from "../data/bookingCatalog";

const INSTAGRAM_URL = CONTACT.instagram;

function InstagramLogo({ size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <footer className="bg-[#1C1714] text-[#F5F0E8] shrink-0">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-2">
            <div
              className="text-xl font-semibold mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("brand.name")}
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E62] mb-4">
              {t("brand.tagline")}
            </div>
            <p className="text-sm text-[#C4B89E] font-light leading-relaxed max-w-xs mb-5">
              {t("footer.blurb")}
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-sm text-[#C4B89E] hover:text-[#F5F0E8] transition-colors group"
              aria-label={t("footer.handleIg")}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#F5F0E8] group-hover:border-[#B8956A] group-hover:text-[#B8956A] transition-colors">
                <InstagramLogo size={18} />
              </span>
              <span>
                <span className="block text-[10px] uppercase tracking-widest text-[#7A6E62]">
                  {t("footer.instagram")}
                </span>
                {t("footer.handleIg")}
              </span>
            </a>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E62] mb-4">
              {t("footer.ourSpaces")}
            </p>
            <ul className="flex flex-col gap-2.5 text-sm text-[#C4B89E]">
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/reserver?lieu=137")}
                  className="hover:text-[#F5F0E8] transition-colors text-left"
                >
                  {t("footer.a137")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/reserver?lieu=80")}
                  className="hover:text-[#F5F0E8] transition-colors text-left"
                >
                  {t("footer.a80")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/reserver")}
                  className="hover:text-[#F5F0E8] transition-colors text-left"
                >
                  {t("footer.pricing")}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E62] mb-4">
              {t("footer.contact")}
            </p>
            <ul className="flex flex-col gap-2.5 text-sm text-[#C4B89E]">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="hover:text-[#F5F0E8] transition-colors"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phoneFixeRaw || CONTACT.phoneRaw}`}
                  className="hover:text-[#F5F0E8] transition-colors"
                >
                  {CONTACT.phoneFixe || CONTACT.phone}
                </a>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin
                  size={12}
                  className="mt-0.5 text-[#B8956A] shrink-0"
                />
                {t("footer.addressLemoine")}
              </li>
              <li className="flex items-start gap-1.5">
                <Clock size={12} className="mt-0.5 text-[#B8956A] shrink-0" />
                {t("footer.hours")}
              </li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#F5F0E8] transition-colors"
                >
                  <InstagramLogo size={15} className="text-[#B8956A]" />
                  {t("footer.handleIg")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#7A6E62]">
          <span>{t("footer.rights", { year: SITE.copyrightYear })}</span>
          <div className="flex items-center gap-5 flex-wrap">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[#C4B89E] transition-colors"
              aria-label={t("footer.instagram")}
            >
              <InstagramLogo size={14} className="text-[#B8956A]" />
              {t("footer.instagram")}
            </a>
            <button
              type="button"
              onClick={() => navigate("/mentions-legales")}
              className="hover:text-[#C4B89E] transition-colors"
            >
              {t("footer.legal")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/cgu")}
              className="hover:text-[#C4B89E] transition-colors"
            >
              {t("footer.terms")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/confidentialite")}
              className="hover:text-[#C4B89E] transition-colors"
            >
              {t("footer.privacy")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
