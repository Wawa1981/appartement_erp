import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Users,
  X,
  Building2,
  UserCog,
  ChevronRight,
  Clock,
  Star,
  Scissors,
  Sparkles,
  Users2,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { fetchReservations } from "../api/reservations";
import { apiRequest } from "../api/client";

const ALERTS = [];

const POST_META = {
  premium: { color: "#7A4F10", bg: "#FBE9CC", icon: Star },
  classique: { color: "#4A4238", bg: "#EAE3D6", icon: Users2 },
  barbier: { color: "#1C1714", bg: "#E0DAD2", icon: Scissors },
  cabine: { color: "#5A3E80", bg: "#EAE0F5", icon: Sparkles },
};

const STATUT_STYLE = {
  confirmé: { text: "#2E7D32", bg: "#E8F5E9", dot: "#4CAF50" },
  "à venir": { text: "#7A4F10", bg: "#FBE9CC", dot: "#B8956A" },
  "en cours": { text: "#7A4F10", bg: "#FBE9CC", dot: "#B8956A" },
  annulé: { text: "#C62828", bg: "#FFEBEE", dot: "#E57373" },
  terminé: { text: "#4A4238", bg: "#EAE3D6", dot: "#9C8E7E" },
};

function ChartTooltip({ active, payload, label, suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C1714] text-[#F5F0E8] text-xs rounded-sm px-3 py-2 shadow-lg">
      <p className="text-[#C4B89E] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: p.color }}
          />
          {p.name} :{" "}
          <strong>
            {p.value}
            {suffix}
          </strong>
        </p>
      ))}
    </div>
  );
}

function KpiCard({ label, value, sub, trend, icon: Icon, accent = false }) {
  const up = trend >= 0;
  return (
    <div
      className={`rounded-sm p-5 flex flex-col gap-4 border ${
        accent
          ? "bg-[#1C1714] border-transparent"
          : "bg-[#EDE7DA] border-[rgba(28,23,20,0.08)]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-9 h-9 rounded-sm flex items-center justify-center ${
            accent ? "bg-[#B8956A]" : "bg-[#F5F0E8]"
          }`}
        >
          <Icon size={16} style={{ color: accent ? "#F5F0E8" : "#B8956A" }} />
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
            up ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFEBEE] text-[#C62828]"
          }`}
        >
          {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div>
        <div
          className={`text-2xl font-medium mb-0.5 ${
            accent ? "text-[#F5F0E8]" : "text-[#1C1714]"
          }`}
          style={{ fontFamily: "'Playfair Display',serif" }}
        >
          {value}
        </div>
        <div className={`text-xs ${accent ? "text-[#C4B89E]" : "text-[#7A6E62]"}`}>
          {label}
        </div>
      </div>
      <div
        className={`text-[10px] pt-3 border-t ${
          accent
            ? "border-white/10 text-[#7A6E62]"
            : "border-[rgba(28,23,20,0.1)] text-[#7A6E62]"
        }`}
      >
        {sub}
      </div>
    </div>
  );
}

const STATUT_I18N = {
  confirmé: "status.confirme",
  "à venir": "status.a_venir",
  "en cours": "status.en_cours",
  annulé: "status.annule",
  terminé: "status.termine",
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language?.startsWith("en") ? "en-GB" : "fr-FR";
  const [dismissed, setDismissed] = useState(new Set());
  const [reservations, setReservations] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const visible = ALERTS.filter((a) => !dismissed.has(a.id));

  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      try {
        const [resas, users] = await Promise.all([
          fetchReservations(),
          apiRequest("/users/").catch(() => []),
        ]);
        if (!ok) return;
        setReservations(resas);
        const ulist = Array.isArray(users) ? users : users.results || [];
        setUserCount(ulist.length);
      } catch {
        if (ok) {
          setReservations([]);
          setUserCount(0);
        }
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, []);

  const todayIso = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  const todayBookings = useMemo(
    () =>
      reservations
        .filter((r) => r.date === todayIso && r.statut !== "annulé")
        .map((r) => ({
          id: r.id,
          client: r.client,
          space: r.space,
          post: r.post,
          type: r.type,
          start: r.start,
          end: r.end,
          amount: r.montant,
          statut: r.statut === "à venir" ? "confirmé" : r.statut,
        })),
    [reservations, todayIso],
  );

  const caMois = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return reservations
      .filter((r) => {
        if (r.statut === "annulé") return false;
        const d = new Date(r.date + "T12:00:00");
        return d.getFullYear() === y && d.getMonth() === m;
      })
      .reduce((s, r) => s + (r.montant || 0), 0);
  }, [reservations]);

  const resaMois = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return reservations.filter((r) => {
      if (r.statut === "annulé") return false;
      const d = new Date(r.date + "T12:00:00");
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;
  }, [reservations]);

  /** Squelette 6 mois (échelle UX) — rempli par l'API, sinon 0 */
  const CA_DATA = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months.push({
        key,
        mois: d.toLocaleDateString(locale, { month: "short" }),
        ca: 0,
        prev: 0,
      });
    }
    const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
    for (const r of reservations) {
      if (r.statut === "annulé") continue;
      const d = new Date(r.date + "T12:00:00");
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (byKey[key]) byKey[key].ca += r.montant || 0;
      const prevKey = `${d.getFullYear() - 1}-${d.getMonth()}`;
      // prev reste 0 tant qu'on n'a pas d'historique N-1
      void prevKey;
    }
    return months.map(({ mois, ca, prev }) => ({ mois, ca, prev }));
  }, [reservations, locale]);

  /** Camembert : toujours les 4 types visibles, valeur 0 si vide */
  const REPARTITION_DATA = useMemo(() => {
    const base = [
      { key: "classique", name: t("types.classique"), value: 0, color: "#9C8E7E" },
      { key: "premium", name: t("types.premium"), value: 0, color: "#B8956A" },
      { key: "barbier", name: t("types.barbier"), value: 0, color: "#1C1714" },
      { key: "cabine", name: t("types.cabine"), value: 0, color: "#8A7B9A" },
    ];
    const counts = { classique: 0, premium: 0, barbier: 0, cabine: 0, fauteuil: 0 };
    for (const r of reservations) {
      if (r.statut === "annulé") continue;
      const typ = r.type || "";
      if (typ === "fauteuil") counts.classique += 1;
      else if (counts[typ] !== undefined) counts[typ] += 1;
    }
    const total =
      counts.classique + counts.premium + counts.barbier + counts.cabine;
    return base.map((b) => ({
      ...b,
      raw: counts[b.key] || 0,
      value: total === 0 ? 0 : Math.round(((counts[b.key] || 0) / total) * 100),
    }));
  }, [reservations, t]);

  /** Occupation semaine : axes Lun–Sam, 0 % sans données */
  const OCCUP_DATA = useMemo(() => {
    const days = [
      t("days.mon"),
      t("days.tue"),
      t("days.wed"),
      t("days.thu"),
      t("days.fri"),
      t("days.sat"),
    ];
    const row = days.map((day) => ({ day, apt137: 0, apt80: 0 }));
    void reservations;
    return row;
  }, [reservations, t]);

  const TODAY_BOOKINGS = todayBookings;

  /** Pie : Recharts n'aime pas que du 0 — injecte un placeholder invisible si tout à 0 */
  const pieData =
    REPARTITION_DATA.every((d) => d.raw === 0)
      ? [{ name: "—", value: 1, color: "#F5F0E8", raw: 0 }]
      : REPARTITION_DATA.map((d) => ({
          ...d,
          value: d.raw > 0 ? d.raw : 0,
        })).filter((d) => d.value > 0);

  return (
    <AdminLayout>
      <div
        className="min-h-full bg-[#F5F0E8] text-[#1C1714] p-5 flex flex-col gap-5"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          backgroundColor: "#F5F0E8",
          color: "#1C1714",
        }}
      >
        {loading && (
          <div className="flex items-center gap-2 text-sm text-[#7A6E62]">
            <Loader2 size={14} className="animate-spin" /> {t("app.loadingApi")}
          </div>
        )}
        {visible.length > 0 && (
          <div className="flex flex-col gap-2">
            {visible.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 px-4 py-3 rounded-sm border text-xs"
                style={{ background: a.bg, borderColor: `${a.color}30` }}
              >
                <span
                  className="w-2 h-2 rounded-full mt-0.5 shrink-0"
                  style={{ background: a.color }}
                />
                <span className="flex-1 text-[#1C1714] leading-relaxed">
                  {a.text}
                </span>
                <span className="text-[#7A6E62] whitespace-nowrap shrink-0">
                  {a.time}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDismissed((p) => new Set([...p, a.id]))
                  }
                  className="text-[#7A6E62] hover:text-[#1C1714] transition-colors shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label={t("app.kpiOccup")}
            value="0 %"
            sub={t("app.weekAvg")}
            trend={0}
            icon={TrendingUp}
            accent
          />
          <KpiCard
            label={t("app.kpiCa")}
            value={`${caMois.toLocaleString(locale)} €`}
            sub={t("app.fromApi")}
            trend={0}
            icon={TrendingUp}
          />
          <KpiCard
            label={t("app.kpiResaMonth")}
            value={String(resaMois)}
            sub={t("app.includingToday", { n: todayBookings.length })}
            trend={0}
            icon={CalendarDays}
          />
          <KpiCard
            label={t("app.kpiClients")}
            value={String(userCount)}
            sub={t("app.accountsInDb")}
            trend={0}
            icon={Users}
          />
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          <div className="bg-[#EDE7DA] rounded-sm p-5 border border-[rgba(28,23,20,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-base font-medium"
                style={{ fontFamily: "'Playfair Display',serif" }}
              >
                {t("app.chartCa")}
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart
                data={CA_DATA}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              >
                <defs>
                  <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B8956A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#B8956A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(28,23,20,0.1)"
                  vertical={false}
                />
                <XAxis
                  dataKey="mois"
                  tick={{ fontSize: 10, fill: "#7A6E62" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#7A6E62" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, (max) => Math.max(100, max || 0)]}
                />
                <Tooltip content={<ChartTooltip suffix=" €" />} />
                <Area
                  type="monotone"
                  dataKey="prev"
                  name={t("app.chartPrevYear")}
                  stroke="#9C8E7E"
                  strokeWidth={1.5}
                  fill="none"
                  strokeDasharray="4 2"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="ca"
                  name={t("app.chartCaSeries")}
                  stroke="#B8956A"
                  strokeWidth={2}
                  fill="url(#caGrad)"
                  dot={{ r: 3, fill: "#B8956A", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#EDE7DA] rounded-sm p-5 border border-[rgba(28,23,20,0.08)]">
            <h2
              className="text-base font-medium mb-4"
              style={{ fontFamily: "'Playfair Display',serif" }}
            >
              {t("app.chartRepart")}
            </h2>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={54}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1">
                {REPARTITION_DATA.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-[#7A6E62] flex-1">{d.name}</span>
                    <span className="font-medium">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#EDE7DA] rounded-sm p-5 border border-[rgba(28,23,20,0.08)]">
          <h2
            className="text-base font-medium mb-4"
            style={{ fontFamily: "'Playfair Display',serif" }}
          >
            {t("app.chartOccup")}
          </h2>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              data={OCCUP_DATA}
              barGap={4}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(28,23,20,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#7A6E62" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#7A6E62" }}
                axisLine={false}
                tickLine={false}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip content={<ChartTooltip suffix="%" />} />
              <Bar
                dataKey="apt137"
                name={t("app.chartApt137")}
                fill="#B8956A"
                radius={[3, 3, 0, 0]}
                maxBarSize={26}
              />
              <Bar
                dataKey="apt80"
                name={t("app.chartApt80")}
                fill="#8A7B9A"
                radius={[3, 3, 0, 0]}
                maxBarSize={26}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                formatter={(v) => (
                  <span style={{ fontSize: 10, color: "#7A6E62" }}>{v}</span>
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#EDE7DA] rounded-sm border border-[rgba(28,23,20,0.08)] overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h2
              className="text-base font-medium"
              style={{ fontFamily: "'Playfair Display',serif" }}
            >
              {t("app.todayResas")}
            </h2>
            <button
              type="button"
              onClick={() => navigate("/calendrier")}
              className="text-xs text-[#7A6E62] hover:text-[#1C1714] flex items-center gap-1 transition-colors"
            >
              {t("app.seeCalendar")} <ChevronRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-y border-[rgba(28,23,20,0.08)]">
                  {[
                    t("app.colClient"),
                    t("app.colSpacePost"),
                    t("app.colSchedule"),
                    t("app.colStatus"),
                    t("app.colAmount"),
                    "",
                  ].map((h, idx) => (
                    <th
                      key={h || `actions-${idx}`}
                      className="text-left text-[10px] uppercase tracking-widest text-[#7A6E62] px-5 py-3 font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TODAY_BOOKINGS.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-[#7A6E62]"
                    >
                      {t("app.noResaToday")}
                    </td>
                  </tr>
                )}
                {TODAY_BOOKINGS.map((b, i) => {
                  const pm = POST_META[b.type] || POST_META.classique;
                  const ss =
                    STATUT_STYLE[b.statut] || STATUT_STYLE.confirmé;
                  const PostIcon = pm.icon;
                  return (
                    <tr
                      key={b.id}
                      className={`border-b border-[rgba(28,23,20,0.06)] hover:bg-[#E4D9C8] transition-colors ${
                        i === TODAY_BOOKINGS.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#DDD4C0] text-[#7A6E62] text-[10px] font-medium flex items-center justify-center shrink-0">
                            {b.client
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="font-medium whitespace-nowrap">
                            {b.client}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0"
                            style={{ background: pm.bg }}
                          >
                            <PostIcon size={9} style={{ color: pm.color }} />
                          </span>
                          <span className="text-xs whitespace-nowrap">
                            {b.space === "80" ? t("app.short80") : t("app.short137")} · {b.post}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#7A6E62] whitespace-nowrap">
                        <Clock size={11} className="inline mr-1 -mt-0.5" />
                        {b.start}–{b.end}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap"
                          style={{ background: ss.bg, color: ss.text }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: ss.dot }}
                          />
                          {t(STATUT_I18N[b.statut] || "status.confirme")}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium">{b.amount} €</td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          className="text-[#7A6E62] hover:text-[#1C1714] transition-colors"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              icon: Building2,
              label: t("app.manageSpaces"),
              sub: t("app.manageSpacesSub"),
              color: "#B8956A",
              to: "/admin/gestion?tab=espaces",
            },
            {
              icon: UserCog,
              label: t("app.manageUsers"),
              sub: t("app.manageUsersSub"),
              color: "#8A7B9A",
              to: "/admin/gestion?tab=utilisateurs",
            },
          ].map((a) => {
            const AIcon = a.icon;
            return (
              <button
                key={a.label}
                type="button"
                onClick={() => navigate(a.to)}
                className="flex items-center gap-4 p-5 bg-[#EDE7DA] border border-[rgba(28,23,20,0.08)] rounded-sm hover:border-[rgba(28,23,20,0.2)] hover:bg-[#E4D9C8] transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-sm bg-[#F5F0E8] flex items-center justify-center shrink-0">
                  <AIcon size={18} style={{ color: a.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{a.label}</div>
                  <div className="text-xs text-[#7A6E62] mt-0.5">{a.sub}</div>
                </div>
                <ChevronRight
                  size={14}
                  className="text-[#C4B89E] group-hover:text-[#1C1714] group-hover:translate-x-0.5 transition-all"
                />
              </button>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
