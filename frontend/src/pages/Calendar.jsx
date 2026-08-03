import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Armchair,
  CalendarDays,
  TrendingUp,
  Clock,
  MapPin,
  Loader2,
} from "lucide-react";
import { CONTACT } from "../data/bookingCatalog";
import {
  POSTES as INV_POSTES,
  espaceDisplay,
  posteDisplay,
  countPostes,
} from "../data/inventory";
import AppShell from "../components/AppShell";
import { fetchReservations } from "../api/reservations";

const ESPACE_IMAGES = {
  "137":
    "https://static.wixstatic.com/media/95a7b9_03317c6f11dc4ff7a8595d89cb0bbaa6~mv2.jpg/v1/fill/w_800,h_500,al_c,q_85/PHOTO-2026-02-24-16-55-40.jpg",
  "80":
    "https://static.wixstatic.com/media/95a7b9_0301817b4f4b4691baf5844c25277884~mv2.png/v1/fill/w_800,h_500,al_c,q_90/ChatGPT-Image-17-30-50.png",
};

const STATUS_STYLE = {
  disponible: { bg: "#E8F5E9", text: "#2E7D32", labelKey: "status.disponible" },
  occupé: { bg: "#FBE9CC", text: "#7A4F10", labelKey: "status.occupe" },
  confirmée: { bg: "#E8F5E9", text: "#2E7D32", labelKey: "status.confirmee" },
  "en cours": { bg: "#FBE9CC", text: "#7A4F10", labelKey: "status.en_cours" },
  annulée: { bg: "#FFEBEE", text: "#C62828", labelKey: "status.annulee" },
  terminée: { bg: "#EAE3D6", text: "#4A4238", labelKey: "status.terminee" },
};

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const s = STATUS_STYLE[status] || {
    bg: "#EAE3D6",
    text: "#4A4238",
    labelKey: null,
  };
  return (
    <span
      className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium"
      style={{ background: s.bg, color: s.text }}
    >
      {s.labelKey ? t(s.labelKey) : status || "—"}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, subtitle }) {
  return (
    <div className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.08)] rounded-sm p-4 flex flex-col gap-3">
      <div className="w-9 h-9 rounded-sm bg-[#F5F0E8] flex items-center justify-center">
        <Icon size={16} className="text-[#B8956A]" />
      </div>
      <div>
        <div
          className="text-2xl font-medium text-[#1C1714]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {value}
        </div>
        <div className="text-xs text-[#7A6E62] mt-0.5">{label}</div>
        {subtitle ? (
          <div className="text-[10px] text-[#9C8E7E] mt-1">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

function EspaceFilter({ value, onChange, allLabel, labels }) {
  const options = [
    { id: "all", label: allLabel },
    { id: "137", label: labels["137"] },
    { id: "80", label: labels["80"] },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
            value === o.id
              ? "bg-[#1C1714] text-[#F5F0E8] border-transparent"
              : "border-[rgba(28,23,20,0.15)] text-[#7A6E62] hover:text-[#1C1714]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Calendar() {
  const { t, i18n } = useTranslation();
  const [espace, setEspace] = useState("all");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const locale = i18n.language?.startsWith("en") ? "en-GB" : "fr-FR";

  const postes = useMemo(
    () =>
      INV_POSTES.map((p) => ({
        id: p.id,
        name: posteDisplay(p, t),
        espace: p.espace,
        type: p.type,
        status: "disponible",
      })),
    [t],
  );

  const spaceLabels = useMemo(
    () => ({
      "137": espaceDisplay("137", t).nom,
      "80": espaceDisplay("80", t).nom,
    }),
    [t],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchReservations();
      setReservations(
        list.map((r) => ({
          ...r,
          espace: r.space === "80" ? "80" : "137",
          poste_name: r.post,
          start_time: r.start,
          end_time: r.end,
          status:
            r.statut === "à venir"
              ? "confirmée"
              : r.statut === "terminé"
                ? "terminée"
                : r.statut === "annulé"
                  ? "annulée"
                  : r.statut,
        })),
      );
    } catch (e) {
      setError(e.message || t("app.errorLoadBookings"));
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const filterByEspace = (items) => {
    if (espace === "all") return items;
    return items.filter((i) => i.espace === espace);
  };

  const today = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const filteredPostes = filterByEspace(postes);
  const filteredReservations = filterByEspace(reservations);
  const todayReservations = filteredReservations.filter((r) => r.date === today);
  const postesDisponibles = filteredPostes.filter(
    (p) => p.status === "disponible",
  );
  const revenuPotentiel = filteredReservations
    .filter((r) => r.status === "confirmée" || r.statut === "à venir")
    .reduce((sum, r) => sum + (r.montant || 0), 0);
  const recentReservations = filteredReservations.slice(0, 6);
  const confirmedToday = todayReservations.filter(
    (r) => r.status === "confirmée",
  ).length;

  return (
    <AppShell>
      <div
        className="min-h-full bg-[#F5F0E8] text-[#1C1714] max-w-[1100px] mx-auto px-5 py-6"
        style={{ backgroundColor: "#F5F0E8", color: "#1C1714" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-medium"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("app.dashTitle")}
            </h1>
            <p className="text-sm text-[#7A6E62] mt-1">{t("app.dashSub")}</p>
          </div>
          <EspaceFilter
            value={espace}
            onChange={setEspace}
            allLabel={t("app.all")}
            labels={spaceLabels}
          />
        </div>
        {error && (
          <div className="mb-4 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-sm">
            {error}
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-[#7A6E62] mb-4">
            <Loader2 size={14} className="animate-spin" /> {t("common.loading")}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard
            icon={Armchair}
            label={t("app.postesDispo")}
            value={`${postesDisponibles.length}/${filteredPostes.length}`}
          />
          <StatCard
            icon={CalendarDays}
            label={t("app.resaToday")}
            value={todayReservations.length}
            subtitle={t("app.includingToday", { n: confirmedToday })}
          />
          <StatCard
            icon={Clock}
            label={t("app.resaTotal")}
            value={filteredReservations.length}
          />
          <StatCard
            icon={TrendingUp}
            label={t("app.revenue")}
            value={`${revenuPotentiel.toLocaleString(locale)} €`}
          />
        </div>

        <div className="bg-[#EDE7DA] rounded-sm border border-[rgba(28,23,20,0.08)] overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-[rgba(28,23,20,0.08)] flex items-center justify-between">
            <h3
              className="text-lg font-medium"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("app.todayResas")}
            </h3>
            <Link
              to="/reserver"
              className="text-xs text-[#7A6E62] hover:text-[#1C1714] transition-colors"
            >
              {t("app.bookCta")}
            </Link>
          </div>
          <div className="divide-y divide-[rgba(28,23,20,0.06)]">
            {recentReservations.length === 0 ? (
              <p className="p-8 text-sm text-[#7A6E62] text-center">
                {t("app.noBookings")}
              </p>
            ) : (
              recentReservations.map((r) => (
                <div
                  key={r.id}
                  className="px-5 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {r.client_name || t("shell.rolePro")}
                    </p>
                    <p className="text-xs text-[#7A6E62]">
                      {r.poste_name} · {r.date} · {r.start_time}–{r.end_time}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {["137", "80"].map((espId) => {
            const espPostes = postes.filter((p) => p.espace === espId);
            const dispo = espPostes.filter(
              (p) => p.status === "disponible",
            ).length;
            const meta = espaceDisplay(espId, t);
            return (
              <Link
                key={espId}
                to={`/reserver?lieu=${espId}`}
                className="relative rounded-sm overflow-hidden group border border-[rgba(28,23,20,0.08)]"
              >
                <img
                  src={ESPACE_IMAGES[espId]}
                  alt={meta.nom}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex items-end p-5">
                  <div>
                    <h3
                      className="text-xl text-white font-medium"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {meta.nom}
                    </h3>
                    <p className="text-white/75 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {meta.label} ·{" "}
                      {t("app.postsAvailableShort", {
                        dispo,
                        total: espPostes.length || countPostes(espId),
                      })}
                    </p>
                    <p className="text-white/55 text-[10px] mt-1">
                      {meta.detail}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="text-[11px] text-[#9C8E7E] text-center pb-4">
          {t(CONTACT.hoursKey)} · {CONTACT.email} · {CONTACT.phone}
        </p>
      </div>
    </AppShell>
  );
}
