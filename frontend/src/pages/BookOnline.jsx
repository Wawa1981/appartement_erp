import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, MapPin, Mail, Phone, ChevronRight } from "lucide-react";
import {
  LOCATIONS,
  SERVICES,
  CONTACT,
  TYPE_META,
  locationDisplay,
} from "../data/bookingCatalog";
import { isAuthenticated } from "../api/client";
import AppShell from "../components/AppShell";
import Footer from "../components/Footer";

const TYPE_ORDER = ["premium", "classique", "barbier", "fauteuil", "cabine"];

export default function BookOnline() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const lieuParam = params.get("lieu");
  const initial =
    lieuParam === "80" || lieuParam === "137" ? lieuParam : null;
  const [location, setLocation] = useState(initial);
  const loggedIn = isAuthenticated();

  useEffect(() => {
    if (lieuParam === "80" || lieuParam === "137") {
      setLocation(lieuParam);
    }
  }, [lieuParam]);

  const selectLocation = (id) => {
    setLocation(id);
    setParams(id ? { lieu: id } : {});
  };

  const locationMeta = LOCATIONS.find((l) => l.id === location);
  const locationView = locationMeta ? locationDisplay(locationMeta, t) : null;

  const servicesByType = useMemo(() => {
    if (!location) return [];
    const list = SERVICES.filter((s) => s.locations.includes(location));
    return TYPE_ORDER.map((type) => ({
      type,
      meta: TYPE_META[type],
      items: list
        .filter((s) => s.type === type)
        .slice()
        .sort((a, b) => a.durationMin - b.durationMin),
    })).filter((g) => g.items.length > 0);
  }, [location]);

  const onReserve = (service) => {
    const lieu = location || service.locations[0];
    if (!isAuthenticated()) {
      navigate("/connexion", {
        state: { from: `/reserver?service=${service.id}&lieu=${lieu}` },
      });
      return;
    }
    navigate(`/calendrier?service=${service.id}&lieu=${lieu}`);
  };

  const spaces = LOCATIONS.filter((l) => l.id === "137" || l.id === "80");

  const content = (
      <main
        className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-6 bg-[#F5F0E8] text-[#1C1714] min-h-full"
        style={{ backgroundColor: "#F5F0E8", color: "#1C1714" }}
      >
        <div>
          <h1
            className="text-3xl font-medium mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("app.chooseCoworking")}
          </h1>
          <p className="text-sm text-[#7A6E62]">
            {t("app.selectPlace")}
          </p>
        </div>

        {/* Choix du lieu — 2 cartes, pas de liste unique */}
        <div className="grid sm:grid-cols-2 gap-3">
          {spaces.map((loc) => {
            const v = locationDisplay(loc, t);
            return (
            <button
              key={loc.id}
              type="button"
              onClick={() => selectLocation(loc.id)}
              className={`text-left rounded-sm border p-4 transition-all ${
                location === loc.id
                  ? "bg-[#1C1714] border-transparent text-[#F5F0E8]"
                  : "bg-[#EDE7DA] border-[rgba(28,23,20,0.08)] hover:border-[rgba(28,23,20,0.2)]"
              }`}
            >
              <div
                className="text-lg font-medium mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {v.nom}
              </div>
              <div
                className={`text-xs flex items-center gap-1 mb-1 ${
                  location === loc.id ? "text-[#C4B89E]" : "text-[#7A6E62]"
                }`}
              >
                <MapPin size={11} />
                {v.label} · {v.surface}
              </div>
              <div
                className={`text-[11px] ${
                  location === loc.id ? "text-[#9C8E7E]" : "text-[#7A6E62]"
                }`}
              >
                {v.detail}
              </div>
            </button>
            );
          })}
        </div>

        {/* Texte privatisation site — à la place du message « choisissez un coworking » */}
        {!location && (
          <div className="py-6 flex flex-col gap-3 text-center max-w-xl mx-auto">
            <p
              className="text-sm text-[#1C1714] leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t("app.privatisationBody", {
                phone: CONTACT.phoneFixe || "01 71 50 60 64",
                email: CONTACT.email,
              })}
            </p>
            <p
              className="text-sm text-[#1C1714] leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t("app.privatisationHours")}
            </p>
            <p
              className="text-base text-[#1C1714] leading-relaxed mt-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("app.privatisationTagline")}
            </p>
          </div>
        )}

        {/* Services du lieu, groupés par type */}
        {location && locationView && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E62]">
                  {t("app.formulas")}
                </p>
                <h2
                  className="text-xl font-medium"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {locationView.nom}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => selectLocation(null)}
                className="text-xs text-[#7A6E62] hover:text-[#1C1714] underline-offset-2 hover:underline"
              >
                {t("app.changePlace")}
              </button>
            </div>

            {servicesByType.map((group) => (
              <section key={group.type} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 sticky top-14 z-20 bg-[#F5F0E8] py-2 border-b border-[rgba(28,23,20,0.08)]">
                  <span
                    className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm font-medium"
                    style={{
                      background: group.meta.bg,
                      color: group.meta.color,
                    }}
                  >
                    {t(group.meta.labelKey)}
                  </span>
                  <span className="text-[11px] text-[#7A6E62]">
                    {t("app.formulaCount", { count: group.items.length })}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {group.items.map((s) => (
                    <div
                      key={s.id}
                      className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.08)] rounded-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium leading-snug">
                          {t(s.nameKey)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-[#7A6E62]">
                          <Clock size={11} />
                          {t(s.durationKey)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div
                          className="text-xl font-medium tabular-nums"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {s.price} €
                        </div>
                        <button
                          type="button"
                          onClick={() => onReserve(s)}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-[#1C1714] text-[#F5F0E8] text-xs font-medium rounded-sm hover:bg-[#B8956A] transition-colors"
                        >
                          {t("common.book")} <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Bloc 1 — locations mensuelles (inchangé) */}
        <div className="bg-[#1C1714] text-[#F5F0E8] rounded-sm p-6">
          <h2
            className="text-lg font-medium mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("app.monthlyRentals")}
          </h2>
          <p className="text-sm text-[#C4B89E] mb-4">
            {t("app.monthlyContact")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 text-sm">
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex items-center gap-2 text-[#B8956A] hover:text-[#F5F0E8]"
            >
              <Mail size={14} />
              {CONTACT.email}
            </a>
            <a
              href={`tel:${CONTACT.phoneRaw}`}
              className="inline-flex items-center gap-2 text-[#B8956A] hover:text-[#F5F0E8]"
            >
              <Phone size={14} />
              {CONTACT.phone}
            </a>
          </div>
        </div>

      </main>
  );

  if (loggedIn) {
    return <AppShell>{content}</AppShell>;
  }

  return (
    <div
      className="min-h-screen bg-[#F5F0E8] text-[#1C1714] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <header className="sticky top-0 z-30 bg-[#F5F0E8]/95 backdrop-blur-sm border-b border-[rgba(28,23,20,0.1)]">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex flex-col leading-none text-left"
          >
            <span
              className="text-base font-semibold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              L&apos;Appartement
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#7A6E62]">
              {t("app.reservation")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xs text-[#7A6E62] hover:text-[#B8956A]"
          >
            {t("shell.home")}
          </button>
        </div>
      </header>
      <div className="flex-1">{content}</div>
      <Footer />
    </div>
  );
}
