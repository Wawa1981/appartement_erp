import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Clock,
  MapPin,
  Scissors,
  Star,
  Sparkles,
  Users2,
  Plus,
  ChevronRight,
  Loader2,
} from "lucide-react";
import AppShell from "../components/AppShell";
import {
  fetchReservations,
  cancelReservation,
} from "../api/reservations";

const POST_META = {
  premium: { color: "#7A4F10", bg: "#FBE9CC", icon: Star },
  classique: { color: "#4A4238", bg: "#EAE3D6", icon: Users2 },
  barbier: { color: "#1C1714", bg: "#E0DAD2", icon: Scissors },
  fauteuil: { color: "#4A4238", bg: "#EAE3D6", icon: Users2 },
  cabine: { color: "#5A3E80", bg: "#EAE0F5", icon: Sparkles },
};

const STATUT_STYLE = {
  "à venir": { text: "#7A4F10", bg: "#FBE9CC", dot: "#B8956A" },
  "en cours": { text: "#7A4F10", bg: "#FBE9CC", dot: "#B8956A" },
  terminé: { text: "#4A4238", bg: "#EAE3D6", dot: "#9C8E7E" },
  annulé: { text: "#C62828", bg: "#FFEBEE", dot: "#E57373" },
};

const FILTER_KEYS = [
  { id: "tous", key: "app.filterAll" },
  { id: "à venir", key: "app.filterUpcoming" },
  { id: "terminé", key: "app.filterDone" },
  { id: "annulé", key: "app.filterCancelled" },
];

function formatDate(iso, locale) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const STATUT_I18N = {
  "à venir": "status.a_venir",
  "en cours": "status.en_cours",
  terminé: "status.termine",
  annulé: "status.annule",
  confirmé: "status.confirme",
};

export default function MesReservations() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("tous");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const locale = i18n.language?.startsWith("en") ? "en-GB" : "fr-FR";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchReservations();
      setItems(list);
    } catch (e) {
      setError(e.message || t("app.errorLoadBookings"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter(
    (r) => filter === "tous" || r.statut === filter,
  );

  const onCancel = async (id) => {
    if (!window.confirm(t("app.cancelConfirm"))) return;
    try {
      await cancelReservation(id);
      await load();
    } catch (e) {
      setError(e.message || t("app.errorCancel"));
    }
  };

  return (
    <AppShell>
      <div
        className="p-6 max-w-3xl mx-auto min-h-full bg-[#F5F0E8] text-[#1C1714]"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          backgroundColor: "#F5F0E8",
          color: "#1C1714",
        }}
      >
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E62] mb-1">
              {t("app.clientSpace")}
            </p>
            <h1
              className="text-3xl font-medium"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("app.myBookingsTitle")}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/reserver")}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C1714] text-[#F5F0E8] text-xs font-medium rounded-sm hover:bg-[#B8956A] transition-colors"
          >
            <Plus size={13} /> {t("app.newBooking")}
          </button>
        </div>

        <div className="flex gap-1 bg-[#EDE7DA] rounded-sm p-0.5 border border-[rgba(28,23,20,0.1)] mb-6 w-fit flex-wrap">
          {FILTER_KEYS.map((f) => (
            <button
              type="button"
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 text-xs font-medium rounded-sm transition-all capitalize ${
                filter === f.id
                  ? "bg-[#1C1714] text-[#F5F0E8]"
                  : "text-[#7A6E62] hover:text-[#1C1714]"
              }`}
            >
              {t(f.key)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#7A6E62] gap-2 text-sm">
            <Loader2 size={18} className="animate-spin" /> {t("app.loadingBookings")}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((r) => {
              const pm = POST_META[r.type] || POST_META.classique;
              const ss = STATUT_STYLE[r.statut] || STATUT_STYLE.terminé;
              const PostIcon = pm.icon;
              return (
                <div
                  key={r.id}
                  className="bg-[#EDE7DA] rounded-sm border border-[rgba(28,23,20,0.08)] overflow-hidden hover:border-[rgba(28,23,20,0.2)] transition-colors"
                >
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div
                        className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
                        style={{ background: pm.bg }}
                      >
                        <PostIcon size={16} style={{ color: pm.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium">
                            {r.space === "80" ? t("app.short80") : t("app.short137")} — {r.post}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ background: ss.bg, color: ss.text }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: ss.dot }}
                            />
                            {t(STATUT_I18N[r.statut] || "status.a_venir")}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-[#7A6E62]">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {formatDate(r.date, locale)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {r.start} – {r.end}
                          </span>
                          {r.address && (
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {r.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className="text-lg font-medium"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {r.montant} €
                      </div>
                      <div className="text-[10px] text-[#7A6E62] font-mono mt-0.5">
                        #{r.id}
                      </div>
                    </div>
                  </div>
                  {r.statut === "à venir" && (
                    <div className="px-5 pb-4 flex gap-3 border-t border-[rgba(28,23,20,0.06)] pt-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onCancel(r.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        {t("app.cancel")}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/reserver")}
                        className="ml-auto flex items-center gap-1 text-xs font-medium text-[#B8956A] hover:text-[#7A4F10] transition-colors"
                      >
                        {t("app.newResa")} <ChevronRight size={11} />
                      </button>
                    </div>
                  )}
                  {r.statut === "terminé" && (
                    <div className="px-5 pb-4 flex gap-3 border-t border-[rgba(28,23,20,0.06)] pt-3">
                      <button
                        type="button"
                        onClick={() => navigate("/reserver")}
                        className="text-xs text-[#B8956A] hover:text-[#7A4F10] transition-colors font-medium flex items-center gap-1"
                      >
                        {t("app.renew")} <ChevronRight size={11} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-[#7A6E62]">
                <Calendar size={32} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">
                  {filter !== "tous" ? t("app.noBookingsCat") : t("app.noBookings")}.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/reserver")}
                  className="mt-4 text-sm font-medium text-[#B8956A] hover:underline"
                >
                  {t("app.bookAStation")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
