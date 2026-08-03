import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Clock,
  Users,
  Star,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Scissors,
  Sparkles,
  Coffee,
  Calendar,
  Box,
} from "lucide-react";
import ImmersiveViewer from "../components/ImmersiveViewer";
import LanguageSwitcher from "../components/LanguageSwitcher";
import {
  isAuthenticated,
  homePathForUser,
  getStoredUser,
} from "../api/client";
import { SITE } from "../data/siteConfig";

export function Landing() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewerEspace, setViewerEspace] = useState(null);
  const navigate = useNavigate();

  const openVisite = (viewerId, mode = "photos") =>
    setViewerEspace({ id: viewerId, mode });

  /** Connexion / espace : si déjà loggé → dashboard, sinon → connexion (sans déco) */
  const goEspace = () => {
    if (isAuthenticated()) {
      navigate(homePathForUser(getStoredUser()));
      return;
    }
    navigate("/connexion");
  };

  const spaces = useMemo(
    () => [
      {
        id: "137",
        viewerId: "le137",
        name: "L'Appartement 137",
        address: "16 passage Lemoine, 75002 Paris",
        surface: "160 m²",
        tag: t("spaces.137.tag"),
        tagColor: "#B8956A",
        equipment: [
          { label: t("spaces.137.eq1"), icon: Scissors },
          { label: t("spaces.137.eq2"), icon: Star },
          { label: t("spaces.137.eq3"), icon: Users },
        ],
        highlight: t("spaces.137.highlight"),
        img: "/espaces/le137/01-open-space.jpg",
        dispo: t("spaces.137.dispo"),
      },
      {
        id: "80",
        viewerId: "le80",
        name: "L'Appartement 80",
        address: "80 rue de Cléry, 75002 Paris",
        surface: "140 m²",
        tag: t("spaces.80.tag"),
        tagColor: "#7A6E62",
        equipment: [
          { label: t("spaces.80.eq1"), icon: Sparkles },
          { label: t("spaces.80.eq2"), icon: Users },
          { label: t("spaces.80.eq3"), icon: Coffee },
        ],
        highlight: t("spaces.80.highlight"),
        img: "/espaces/le80/01-postes.jpg",
        dispo: t("spaces.80.dispo"),
      },
    ],
    [t]
  );

  const steps = useMemo(
    () => [
      { num: "01", title: t("how.s1title"), desc: t("how.s1desc") },
      { num: "02", title: t("how.s2title"), desc: t("how.s2desc") },
      { num: "03", title: t("how.s3title"), desc: t("how.s3desc") },
      { num: "04", title: t("how.s4title"), desc: t("how.s4desc") },
    ],
    [t]
  );

  const testimonials = useMemo(
    () => [
      {
        name: "Camille Rousseau",
        role: t("testimonials.t1role"),
        since: t("testimonials.t1since"),
        quote: t("testimonials.t1quote"),
        avatar: "CR",
      },
      {
        name: "Sofia Andrés",
        role: t("testimonials.t2role"),
        since: t("testimonials.t2since"),
        quote: t("testimonials.t2quote"),
        avatar: "SA",
      },
      {
        name: "Théo Marchand",
        role: t("testimonials.t3role"),
        since: t("testimonials.t3since"),
        quote: t("testimonials.t3quote"),
        avatar: "TM",
      },
    ],
    [t]
  );

  const amenities = useMemo(
    () => [
      { icon: Coffee, label: t("spacesSection.amenityCoffee") },
      { icon: Users, label: t("spacesSection.amenityRest") },
      { icon: Star, label: t("spacesSection.amenityWelcome") },
      { icon: Calendar, label: t("spacesSection.amenityFlex") },
    ],
    [t]
  );

  return (
    <div
      className="min-h-screen bg-[#F5F0E8] text-[#1C1714] pb-20"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {viewerEspace && (
        <ImmersiveViewer
          key={`${viewerEspace.id}-${viewerEspace.mode || "photos"}`}
          espace={{ id: viewerEspace.id }}
          initialMode={viewerEspace.mode || "photos"}
          onClose={() => setViewerEspace(null)}
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-40 bg-[#F5F0E8]/90 backdrop-blur-sm border-b border-[rgba(28,23,20,0.1)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span
              className="text-lg font-semibold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("brand.name")}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E62]">
              {t("brand.tagline")}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#7A6E62]">
            <a href="#espaces" className="hover:text-[#1C1714] transition-colors">
              {t("nav.spaces")}
            </a>
            <a
              href="#fonctionnement"
              className="hover:text-[#1C1714] transition-colors"
            >
              {t("nav.how")}
            </a>
            <a
              href="#temoignages"
              className="hover:text-[#1C1714] transition-colors"
            >
              {t("nav.testimonials")}
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={goEspace}
              className="px-4 py-2 text-sm text-[#1C1714] hover:text-[#B8956A] transition-colors"
            >
              {t("nav.login")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/inscription")}
              className="px-5 py-2 text-sm bg-[#1C1714] text-[#F5F0E8] rounded-sm hover:bg-[#B8956A] transition-colors"
            >
              {t("nav.register")}
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#F5F0E8] border-t border-[rgba(28,23,20,0.1)] px-6 py-6 flex flex-col gap-5">
            <a
              href="#espaces"
              className="text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {t("nav.spaces")}
            </a>
            <a
              href="#fonctionnement"
              className="text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {t("nav.how")}
            </a>
            <a
              href="#temoignages"
              className="text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {t("nav.testimonials")}
            </a>
            <div className="flex gap-3 pt-2 border-t border-[rgba(28,23,20,0.1)]">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/connexion");
                }}
                className="flex-1 py-2 text-sm border border-[rgba(28,23,20,0.2)] rounded-sm"
              >
                {t("nav.login")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/inscription");
                }}
                className="flex-1 py-2 text-sm bg-[#1C1714] text-[#F5F0E8] rounded-sm"
              >
                {t("nav.register")}
              </button>
            </div>
          </div>
        )}
      </header>

      <section className="relative min-h-screen flex items-end overflow-hidden bg-[#1C1714] pt-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1743364971090-a555f8aea2b0?w=1800&h=1200&fit=crop&auto=format"
            alt={t("hero.heroAlt")}
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1714] via-[#1C1714]/55 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">
          <div className="max-w-3xl">
            <p className="text-[#B8956A] text-xs uppercase tracking-[0.25em] mb-6 font-light">
              {t("hero.kicker")}
            </p>
            <h1
              className="text-5xl md:text-7xl font-medium text-[#F5F0E8] leading-[1.05] mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("hero.title1")}
              <br />
              <em className="not-italic text-[#B8956A]">{t("hero.titleEm")}</em>
              <br />
              {t("hero.title2")}
            </h1>
            <p className="text-[#C4B89E] text-lg font-light leading-relaxed mb-10 max-w-xl">
              {t("hero.lead")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => navigate("/calendrier")}
                className="group flex items-center gap-3 px-7 py-4 bg-[#B8956A] text-[#F5F0E8] text-sm font-medium rounded-sm hover:bg-[#A07B55] transition-colors"
              >
                {t("hero.ctaExplore")}{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <button
                type="button"
                onClick={() => openVisite("le137", "3d")}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-[#F5F0E8]/30 text-[#F5F0E8] text-sm font-light rounded-sm hover:border-[#F5F0E8]/60 transition-colors"
              >
                <Box size={16} className="text-[#B8956A] shrink-0" strokeWidth={2} />
                {t("common.visit3d")}
              </button>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg">
            {[
              { val: "2", label: t("hero.statSpaces") },
              { val: "300 m²", label: t("hero.statTotal") },
              { val: "75002", label: t("hero.statCity") },
            ].map((s) => (
              <div key={s.label}>
                <div
                  className="text-2xl font-medium text-[#F5F0E8]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {s.val}
                </div>
                <div className="text-xs text-[#7A6E62] uppercase tracking-widest mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="espaces" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <p className="text-[#7A6E62] text-xs uppercase tracking-[0.2em] mb-3">
              {t("spacesSection.kicker")}
            </p>
            <h2
              className="text-4xl md:text-5xl font-medium leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("spacesSection.title1")}
              <br />
              {t("spacesSection.title2")}
            </h2>
          </div>
          <p className="text-[#7A6E62] text-sm font-light max-w-xs leading-relaxed md:text-right">
            {t("spacesSection.lead")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {spaces.map((space) => (
            <div
              key={space.id}
              className="group bg-[#EDE7DA] rounded-sm overflow-hidden"
            >
              <div className="relative h-72 overflow-hidden bg-[#DDD4C0]">
                <button
                  type="button"
                  className="absolute inset-0 w-full h-full cursor-pointer border-0 p-0"
                  onClick={() => openVisite(space.viewerId, "photos")}
                  aria-label={t("spacesSection.seePhotos", { name: space.name })}
                >
                  <img
                    src={space.img}
                    alt={space.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#EDE7DA]/60 to-transparent pointer-events-none" />
                </button>
                <span
                  className="absolute top-4 left-4 text-[#F5F0E8] text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm pointer-events-none z-10"
                  style={{ background: space.tagColor }}
                >
                  {space.tag}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openVisite(space.viewerId, "3d");
                  }}
                  className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#F5F0E8]/90 text-[#1C1714] text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm hover:bg-[#F5F0E8] transition-colors"
                >
                  <Box size={12} className="text-[#B8956A] shrink-0" strokeWidth={2.25} />
                  {t("common.visit3d")}
                </button>
              </div>
              <div className="p-7">
                <h3
                  className="text-2xl font-medium mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {space.name}
                </h3>
                <div className="flex items-center gap-1.5 text-[#7A6E62] text-xs mb-5">
                  <MapPin size={11} />
                  {space.address}
                </div>
                <p className="text-sm text-[#7A6E62] font-light leading-relaxed mb-6">
                  {space.highlight}
                </p>
                <ul className="flex flex-col gap-2.5 mb-7">
                  {space.equipment.map((eq) => (
                    <li
                      key={eq.label}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <eq.icon
                        size={13}
                        className="text-[#B8956A] flex-shrink-0"
                      />
                      {eq.label}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-5 border-t border-[rgba(28,23,20,0.1)]">
                  <div className="flex gap-5">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[#7A6E62] mb-0.5">
                        {t("common.surface")}
                      </div>
                      <div className="text-sm font-medium">{space.surface}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[#7A6E62] mb-0.5">
                        {t("common.from")}
                      </div>
                      <div className="text-sm font-medium">{space.dispo}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/calendrier")}
                    className="group/btn flex items-center gap-2 text-sm font-medium hover:text-[#B8956A] transition-colors"
                  >
                    {t("common.book")}{" "}
                    <ChevronRight
                      size={14}
                      className="group-hover/btn:translate-x-0.5 transition-transform"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-[#EDE7DA] rounded-sm px-8 py-6 flex flex-wrap gap-8 items-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7A6E62] shrink-0">
            {t("spacesSection.bothSpaces")}
          </p>
          {amenities.map((a) => (
            <div
              key={a.label}
              className="flex items-center gap-2 text-sm text-[#7A6E62]"
            >
              <a.icon size={14} className="text-[#B8956A]" />
              {a.label}
            </div>
          ))}
        </div>
      </section>

      <section id="fonctionnement" className="bg-[#EDE7DA] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-[#7A6E62] text-xs uppercase tracking-[0.2em] mb-3">
              {t("how.kicker")}
            </p>
            <h2
              className="text-4xl md:text-5xl font-medium"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("how.title")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[rgba(28,23,20,0.1)]">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="bg-[#EDE7DA] px-8 py-10 flex flex-col gap-5"
              >
                <span
                  className="text-5xl font-medium text-[rgba(28,23,20,0.15)] leading-none"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {step.num}
                </span>
                <div>
                  <h3 className="text-base font-medium mb-3 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#7A6E62] font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight
                    size={14}
                    className="text-[#B8956A] hidden lg:block mt-auto"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 border border-[rgba(28,23,20,0.12)] rounded-sm">
            <div>
              <p
                className="text-lg font-medium mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t("how.readyTitle")}
              </p>
              <p className="text-sm text-[#7A6E62] font-light">
                {t("how.readyLead")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/calendrier")}
              className="shrink-0 flex items-center gap-2 px-6 py-3 bg-[#1C1714] text-[#F5F0E8] text-sm font-medium rounded-sm hover:bg-[#B8956A] transition-colors"
            >
              {t("how.ctaStart")} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      <section id="temoignages" className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-16">
          <p className="text-[#7A6E62] text-xs uppercase tracking-[0.2em] mb-3">
            {t("testimonials.kicker")}
          </p>
          <h2
            className="text-4xl md:text-5xl font-medium"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("testimonials.titleBefore")}{" "}
            <em className="not-italic text-[#B8956A]">
              {t("testimonials.titleEm")}
            </em>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <div
              key={item.name}
              className={`p-8 rounded-sm flex flex-col gap-6 ${
                i === 1 ? "bg-[#1C1714]" : "bg-[#EDE7DA]"
              }`}
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    size={12}
                    className="fill-[#B8956A] text-[#B8956A]"
                  />
                ))}
              </div>
              <p
                className={`text-sm font-light leading-relaxed flex-1 ${
                  i === 1 ? "text-[#C4B89E]" : "text-[#7A6E62]"
                }`}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <div
                className={`flex items-center gap-3 pt-4 border-t ${
                  i === 1 ? "border-white/10" : "border-[rgba(28,23,20,0.1)]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium ${
                    i === 1
                      ? "bg-[#B8956A] text-[#F5F0E8]"
                      : "bg-[#DDD4C0] text-[#1C1714]"
                  }`}
                >
                  {item.avatar}
                </div>
                <div>
                  <div
                    className={`text-sm font-medium ${
                      i === 1 ? "text-[#F5F0E8]" : ""
                    }`}
                  >
                    {item.name}
                  </div>
                  <div className="text-xs text-[#7A6E62]">
                    {item.role} · {item.since}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#1C1714] text-[#F5F0E8]">
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
              <p className="text-sm text-[#C4B89E] font-light leading-relaxed max-w-xs">
                {t("footer.blurb")}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E62] mb-4">
                {t("footer.ourSpaces")}
              </p>
              <ul className="flex flex-col gap-2.5 text-sm text-[#C4B89E]">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/calendrier")}
                    className="hover:text-[#F5F0E8] transition-colors text-left"
                  >
                    {t("footer.a137")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/calendrier")}
                    className="hover:text-[#F5F0E8] transition-colors text-left"
                  >
                    {t("footer.a80")}
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F5F0E8] transition-colors">
                    {t("footer.pricing")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E62] mb-4">
                {t("footer.contact")}
              </p>
              <ul className="flex flex-col gap-2.5 text-sm text-[#C4B89E]">
                <li>contact@lappartement137.com</li>
                <li className="flex items-start gap-1.5">
                  <MapPin
                    size={12}
                    className="mt-0.5 text-[#B8956A] shrink-0"
                  />
                  16 passage Lemoine, 75002 Paris
                </li>
                <li className="flex items-start gap-1.5">
                  <Clock size={12} className="mt-0.5 text-[#B8956A] shrink-0" />
                  {t("footer.hours")}
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#7A6E62]">
            <span>{t("footer.rights", { year: SITE.copyrightYear })}</span>
            <div className="flex gap-5">
              <button type="button" onClick={() => navigate("/mentions-legales")} className="hover:text-[#C4B89E] transition-colors">{t("footer.legal")}</button>
              <button type="button" onClick={() => navigate("/cgu")} className="hover:text-[#C4B89E] transition-colors">{t("footer.terms")}</button>
              <button type="button" onClick={() => navigate("/confidentialite")} className="hover:text-[#C4B89E] transition-colors">{t("footer.privacy")}</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
