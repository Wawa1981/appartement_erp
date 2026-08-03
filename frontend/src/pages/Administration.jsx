import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  Power,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  LayoutGrid,
  Users,
  CalendarDays,
  FileText,
  MapPin,
  Mail,
  Phone,
  Star,
  Scissors,
  Sparkles,
  Users2,
  Loader2,
} from "lucide-react";
import { apiRequest } from "../api/client";
import { fetchReservations } from "../api/reservations";
import { POSTES, ESPACES, countPostes, espaceDisplay, posteDisplay } from "../data/inventory";
import AdminLayout from "../components/AdminLayout";

const PAGE_SIZE = 6;

const POST_META = {
  premium: { color: "#7A4F10", bg: "#FBE9CC", icon: Star },
  classique: { color: "#4A4238", bg: "#EAE3D6", icon: Users2 },
  barbier: { color: "#1C1714", bg: "#E0DAD2", icon: Scissors },
  fauteuil: { color: "#4A4238", bg: "#EAE3D6", icon: Users2 },
  cabine: { color: "#5A3E80", bg: "#EAE0F5", icon: Sparkles },
};

// Source : lappartement137.com/book-online
// 137 : 8 premium + 7 classiques + 2 barbiers
// 80  : 16 fauteuils + 1 cabine
// prixH = tarif à l'heure officiel
const POSTES_DATA = POSTES.map((p) => ({
  id: p.id,
  n: p.n,
  espace: p.espace,
  type: p.type,
  prixH: p.prixH,
  actif: p.actif,
}));

const ESPACES_SEED = [
  {
    id: "E1",
    spaceId: "137",
    surface: ESPACES["137"].surface,
    postes: countPostes("137"),
    actif: true,
    tauxOccup: 76,
  },
  {
    id: "E2",
    spaceId: "80",
    surface: ESPACES["80"].surface,
    postes: countPostes("80"),
    actif: true,
    tauxOccup: 68,
  },
];

const FACTURES_DATA = [];

function mapApiUser(u) {
  const nom =
    [u.first_name, u.last_name].filter(Boolean).join(" ").trim() ||
    u.username ||
    u.email;
  const role =
    u.role === "ADMIN"
      ? "admin"
      : u.role === "PROFESSIONNEL"
        ? "professionnel"
        : (u.role || "").toLowerCase();
  let inscrit = "—";
  if (u.date_joined) {
    try {
      inscrit = new Date(u.date_joined).toLocaleDateString(undefined);
    } catch {
      inscrit = String(u.date_joined).slice(0, 10);
    }
  }
  return {
    id: u.id,
    nom,
    email: u.email || "",
    tel: "—",
    role,
    actif: Boolean(u.is_active),
    inscrit,
    reservations: "—",
    _raw: u,
  };
}

const SR = {
  "confirmé":  { text:"#2E7D32", bg:"#E8F5E9", dot:"#4CAF50" },
  "à venir":   { text:"#7A4F10", bg:"#FBE9CC", dot:"#B8956A" },
  "en cours":  { text:"#7A4F10", bg:"#FBE9CC", dot:"#B8956A" },
  "annulé":    { text:"#C62828", bg:"#FFEBEE", dot:"#E57373" },
  "terminé":   { text:"#4A4238", bg:"#EAE3D6", dot:"#9C8E7E" },
  "payée":     { text:"#2E7D32", bg:"#E8F5E9", dot:"#4CAF50" },
  "en attente":{ text:"#7A4F10", bg:"#FBE9CC", dot:"#B8956A" },
  "retard":    { text:"#C62828", bg:"#FFEBEE", dot:"#E57373" },
};

const STATUS_I18N = {
  confirmé: "status.confirme",
  "à venir": "status.a_venir",
  "en cours": "status.en_cours",
  annulé: "status.annule",
  terminé: "status.termine",
  payée: "status.confirmee",
  "en attente": "status.en_cours",
  retard: "status.annulee",
};

function Pill({ label }) {
  const { t } = useTranslation();
  const s = SR[label] || { text: "#4A4238", bg: "#EAE3D6", dot: "#9C8E7E" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.dot }}
      />
      {t(STATUS_I18N[label] || "status.a_venir")}
    </span>
  );
}
function ActiveBadge({ actif }) {
  const { t } = useTranslation();
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{
        background: actif ? "#E8F5E9" : "#EDE7DA",
        color: actif ? "#2E7D32" : "#9E9E9E",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: actif ? "#4CAF50" : "#C4B89E" }}
      />
      {actif ? t("status.actif") : t("status.inactif")}
    </span>
  );
}
function Th({ children }) {
  return (
    <th className="text-left text-[10px] uppercase tracking-widest text-[#7A6E62] px-4 py-3 font-medium whitespace-nowrap">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>;
}
function ActionBtns({ onToggle, actif }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title={t("app.edit")}
        className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-[#E4D9C8] text-[#7A6E62] hover:text-[#1C1714] transition-colors"
      >
        <Edit2 size={12} />
      </button>
      {onToggle && (
        <button
          type="button"
          title={actif ? t("app.disable") : t("app.enable")}
          onClick={onToggle}
          className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-[#E4D9C8] transition-colors"
          style={{ color: actif ? "#FFB74D" : "#4CAF50" }}
        >
          <Power size={12} />
        </button>
      )}
      <button
        type="button"
        title={t("app.delete")}
        className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-[#FFEBEE] text-[#7A6E62] hover:text-[#C62828] transition-colors"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
function Pages({ page, pages, setPage, total, n }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(28,23,20,0.08)] text-xs text-[#7A6E62]">
      <span>
        {t("app.results", { count: n })}
        {n < total ? ` ${t("app.resultsOf", { total })}` : ""}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-[#EDE7DA] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={12} />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setPage(p)}
            className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs transition-colors ${
              p === page
                ? "bg-[#1C1714] text-[#F5F0E8]"
                : "hover:bg-[#EDE7DA]"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={page === pages}
          onClick={() => setPage(page + 1)}
          className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-[#EDE7DA] disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1714]/50 backdrop-blur-sm">
      <div className="bg-[#F5F0E8] w-full max-w-lg rounded-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(28,23,20,0.12)]">
          <h3
            className="text-base font-medium"
            style={{ fontFamily: "'Playfair Display',serif" }}
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#7A6E62] hover:text-[#1C1714] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, defaultValue = "", type = "text", options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-widest text-[#7A6E62]">
        {label}
      </label>
      {options ? (
        <select className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.15)] rounded-sm px-3 py-2.5 text-sm text-[#1C1714] outline-none">
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          defaultValue={defaultValue}
          className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.15)] rounded-sm px-3 py-2.5 text-sm text-[#1C1714] outline-none focus:border-[#1C1714] transition-colors"
        />
      )}
    </div>
  );
}
function exportCSV(rows, filename) {
  if (!rows?.length) return;
  const keys = Object.keys(rows[0]);
  const lines = [
    keys.join(","),
    ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-2 bg-[#EDE7DA] border border-[rgba(28,23,20,0.1)] rounded-sm px-3 py-2">
      <Search size={13} className="text-[#7A6E62]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent text-sm text-[#1C1714] outline-none placeholder:text-[#C4B89E] w-40"
      />
    </div>
  );
}
function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.1)] rounded-sm px-3 py-2 text-sm text-[#1C1714] outline-none"
    >
      {children}
    </select>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────
function TabEspaces() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [data, setData] = useState(ESPACES_SEED);
  const rows = useMemo(
    () =>
      data.map((e) => {
        const d = espaceDisplay(e.spaceId, t);
        return { ...e, nom: d.nom, adresse: d.adresse, detail: d.detail };
      }),
    [data, t],
  );
  const filtered = useMemo(
    () => rows.filter((e) => e.nom.toLowerCase().includes(search.toLowerCase())),
    [rows, search],
  );
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t("app.adminTabs.espaces")} />
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1C1714] text-[#F5F0E8] text-xs rounded-sm hover:bg-[#B8956A] transition-colors">
          <Plus size={13} /> {t("app.adminTabs.espaces")}
        </button>
      </div>
      <div className="bg-[#EDE7DA] rounded-sm border border-[rgba(28,23,20,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[rgba(28,23,20,0.08)]">
                <Th>{t("app.fieldSpace")}</Th>
                <Th>{t("app.fieldAddress")}</Th>
                <Th>{t("common.surface")}</Th>
                <Th>{t("app.adminTabs.postes")}</Th>
                <Th>{t("app.kpiOccup")}</Th>
                <Th>{t("app.fieldStatus")}</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {paged.map((e, i) => (
                <tr key={e.id} className={`border-b border-[rgba(28,23,20,0.06)] hover:bg-[#E4D9C8] transition-colors ${i === paged.length - 1 ? "border-b-0" : ""}`}>
                  <Td>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{e.nom}</span>
                      {e.detail && (
                        <span className="text-[10px] text-[#7A6E62]">{e.detail}</span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <span className="text-[#7A6E62] text-xs flex items-center gap-1">
                      <MapPin size={10} />
                      {e.adresse}
                    </span>
                  </Td>
                  <Td>{e.surface}</Td>
                  <Td>
                    <span className="font-medium">{e.postes}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#DDD4C0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${e.tauxOccup}%`,
                            background:
                              e.tauxOccup > 80
                                ? "#4CAF50"
                                : e.tauxOccup > 50
                                  ? "#B8956A"
                                  : "#E57373",
                          }}
                        />
                      </div>
                      <span className="text-xs">{e.tauxOccup}%</span>
                    </div>
                  </Td>
                  <Td>
                    <ActiveBadge actif={e.actif} />
                  </Td>
                  <Td>
                    <ActionBtns
                      onToggle={() =>
                        setData((d) =>
                          d.map((x) =>
                            x.id === e.id ? { ...x, actif: !x.actif } : x,
                          ),
                        )
                      }
                      actif={e.actif}
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pages page={page} pages={pages} setPage={setPage} total={data.length} n={filtered.length} />
      </div>
      {modal && (
        <Modal title={t("app.adminTabs.espaces")} onClose={() => setModal(false)}>
          <Field label={t("app.fieldSpaceName")} />
          <Field label={t("app.fieldAddress")} />
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("app.fieldSurface")} type="number" />
            <Field
              label={t("app.fieldStatus")}
              options={[t("status.actif"), t("status.inactif")]}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-[rgba(28,23,20,0.15)] rounded-sm text-sm hover:bg-[#EDE7DA] transition-colors">
              {t("app.cancel")}
            </button>
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 bg-[#1C1714] text-[#F5F0E8] rounded-sm text-sm hover:bg-[#B8956A] transition-colors">
              {t("app.saved")}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function TabPostes() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [fe, setFe] = useState("tous");
  const [ft, setFt] = useState("tous");
  const [modal, setModal] = useState(false);
  const [data, setData] = useState(POSTES_DATA);
  const filtered = useMemo(
    () =>
      data.filter((p) => {
        const q = search.toLowerCase();
        const label = posteDisplay(p, t).toLowerCase();
        return (
          (label.includes(q) || p.id.toLowerCase().includes(q)) &&
          (fe === "tous" || p.espace === fe) &&
          (ft === "tous" || p.type === ft)
        );
      }),
    [data, search, fe, ft, t],
  );
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t("common.loading")} />
          <Select value={fe} onChange={(v) => { setFe(v); setPage(1); }}>
            <option value="tous">{t("app.all")}</option>
            <option value="137">{t("app.short137")}</option>
            <option value="80">{t("app.short80")}</option>
          </Select>
          <Select value={ft} onChange={(v) => { setFt(v); setPage(1); }}>
            <option value="tous">{t("app.allTypes")}</option>
            {["premium", "classique", "barbier", "fauteuil", "cabine"].map((typ) => (
              <option key={typ} value={typ}>
                {t(`types.${typ}`)}
              </option>
            ))}
          </Select>
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1C1714] text-[#F5F0E8] text-xs rounded-sm hover:bg-[#B8956A] transition-colors">
          <Plus size={13} /> {t("app.adminTabs.postes")}
        </button>
      </div>
      <div className="bg-[#EDE7DA] rounded-sm border border-[rgba(28,23,20,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-[rgba(28,23,20,0.08)]">
                <Th>ID</Th>
                <Th>{t("app.adminTabs.postes")}</Th>
                <Th>{t("app.fieldSpace")}</Th>
                <Th>{t("app.fieldType")}</Th>
                <Th>{t("app.fieldPriceH")}</Th>
                <Th>{t("app.fieldStatus")}</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p, i) => {
                const pm = POST_META[p.type];
                const Icon = pm?.icon || Users2;
                return (
                  <tr key={p.id} className={`border-b border-[rgba(28,23,20,0.06)] hover:bg-[#E4D9C8] transition-colors ${i === paged.length - 1 ? "border-b-0" : ""}`}>
                    <Td>
                      <span className="text-xs font-mono text-[#7A6E62]">{p.id}</span>
                    </Td>
                    <Td>
                      <span className="font-medium">{posteDisplay(p, t)}</span>
                    </Td>
                    <Td>
                      <span className="text-xs px-2 py-0.5 bg-[#F5F0E8] rounded-sm">
                        {p.espace === "80" ? t("app.short80") : t("app.short137")}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
                        style={{ background: pm?.bg, color: pm?.color }}
                      >
                        <Icon size={9} />
                        {t(`types.${p.type}`)}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-medium">{p.prixH} €</span>
                    </Td>
                    <Td>
                      <ActiveBadge actif={p.actif} />
                    </Td>
                    <Td>
                      <ActionBtns
                        onToggle={() =>
                          setData((d) =>
                            d.map((x) =>
                              x.id === p.id ? { ...x, actif: !x.actif } : x,
                            ),
                          )
                        }
                        actif={p.actif}
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pages page={page} pages={pages} setPage={setPage} total={data.length} n={filtered.length} />
      </div>
      {modal && (
        <Modal title={t("app.adminTabs.postes")} onClose={() => setModal(false)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("app.fieldLabel")} />
            <Field
              label={t("app.fieldSpace")}
              options={[t("app.short137"), t("app.short80")]}
            />
            <Field
              label={t("app.fieldType")}
              options={[
                t("types.classique"),
                t("types.premium"),
                t("types.barbier"),
                t("types.fauteuil"),
                t("types.cabine"),
              ]}
            />
            <Field label={t("app.fieldPriceH")} type="number" defaultValue={11} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-[rgba(28,23,20,0.15)] rounded-sm text-sm hover:bg-[#EDE7DA] transition-colors">
              {t("app.cancel")}
            </button>
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 bg-[#1C1714] text-[#F5F0E8] rounded-sm text-sm hover:bg-[#B8956A] transition-colors">
              {t("app.saved")}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function TabUtilisateurs() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [fr2, setFr2] = useState("tous");
  const [modal, setModal] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("/users/");
      const list = Array.isArray(res) ? res : res.results || [];
      setData(list.map(mapApiUser));
    } catch (e) {
      setError(e.message || t("app.errorLoadUsers"));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(
    () =>
      data.filter((u) => {
        const q = search.toLowerCase();
        return (
          (u.nom.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)) &&
          (fr2 === "tous" || u.role === fr2)
        );
      }),
    [data, search, fr2]
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleUser = async (u) => {
    try {
      await apiRequest(`/users/${u.id}/toggle-active/`, { method: "POST" });
      await loadUsers();
    } catch (e) {
      setError(e.message || t("app.errorAction"));
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder={t("common.email")}
          />
          <Select
            value={fr2}
            onChange={(v) => {
              setFr2(v);
              setPage(1);
            }}
          >
            <option value="tous">{t("app.allRoles")}</option>
            <option value="professionnel">Professionnel</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              exportCSV(
                data.map(({ nom, email, role, actif, inscrit }) => ({
                  nom,
                  email,
                  role,
                  actif,
                  inscrit,
                })),
                "utilisateurs.csv"
              )
            }
            disabled={!data.length}
            className="flex items-center gap-2 px-4 py-2 border border-[rgba(28,23,20,0.15)] text-[#7A6E62] text-xs rounded-sm hover:bg-[#EDE7DA] transition-colors disabled:opacity-40"
          >
            <Download size={13} /> {t("app.exportCsv")}
          </button>
          <button
            type="button"
            onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C1714] text-[#F5F0E8] text-xs rounded-sm hover:bg-[#B8956A] transition-colors"
          >
            <Plus size={13} /> Inviter
          </button>
        </div>
      </div>
      {error && (
        <div className="mb-3 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-sm">
          {error}
        </div>
      )}
      <div className="bg-[#EDE7DA] rounded-sm border border-[rgba(28,23,20,0.08)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[#7A6E62] text-sm">
            <Loader2 size={16} className="animate-spin" /> {t("common.loading")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[660px]">
                <thead>
                  <tr className="border-b border-[rgba(28,23,20,0.08)]">
                    <Th>Utilisateur</Th>
                    <Th>Contact</Th>
                    <Th>Rôle</Th>
                    <Th>Inscrit</Th>
                    <Th>{t("app.colStatus")}</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-[#7A6E62]"
                      >
                        Aucun utilisateur
                      </td>
                    </tr>
                  )}
                  {paged.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`border-b border-[rgba(28,23,20,0.06)] hover:bg-[#E4D9C8] transition-colors ${
                        i === paged.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#DDD4C0] text-[#7A6E62] text-[10px] font-medium flex items-center justify-center shrink-0">
                            {u.nom
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase() || "?"}
                          </div>
                          <span className="font-medium whitespace-nowrap">
                            {u.nom}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs flex items-center gap-1 text-[#7A6E62]">
                            <Mail size={9} />
                            {u.email}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <span className="text-xs px-2 py-0.5 bg-[#F5F0E8] rounded-sm capitalize">
                          {u.role}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-xs text-[#7A6E62]">
                          {u.inscrit}
                        </span>
                      </Td>
                      <Td>
                        <ActiveBadge actif={u.actif} />
                      </Td>
                      <Td>
                        <ActionBtns
                          onToggle={() => toggleUser(u)}
                          actif={u.actif}
                        />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pages
              page={page}
              pages={pages}
              setPage={setPage}
              total={data.length}
              n={filtered.length}
            />
          </>
        )}
      </div>
      {modal && (
        <Modal title={t("app.inviteUser")} onClose={() => setModal(false)}>
          <p className="text-xs text-[#7A6E62]">
            {t("app.inviteHint")}
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="flex-1 py-2.5 border border-[rgba(28,23,20,0.15)] rounded-sm text-sm hover:bg-[#EDE7DA] transition-colors"
            >
              Fermer
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function TabReservations() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [fe, setFe] = useState("tous");
  const [fs, setFs] = useState("tous");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await fetchReservations();
        if (!ok) return;
        setData(
          list.map((r) => ({
            id: String(r.id),
            client: r.client || r.client_email || "—",
            espace: r.space,
            poste: r.post,
            type: r.type,
            date: r.date,
            debut: r.start,
            fin: r.end,
            montant: r.montant,
            statut: r.statut,
          })),
        );
      } catch (e) {
        if (ok) {
          setError(e.message || t("app.errorLoadGeneric"));
          setData([]);
        }
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [t]);

  const filtered = useMemo(
    () =>
      data.filter((r) => {
        const q = search.toLowerCase();
        return (
          (r.client.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q)) &&
          (fe === "tous" || r.espace === fe) &&
          (fs === "tous" || r.statut === fs)
        );
      }),
    [data, search, fe, fs],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder={t("app.searchClientRef")}
          />
          <Select
            value={fe}
            onChange={(v) => {
              setFe(v);
              setPage(1);
            }}
          >
            <option value="tous">{t("app.allSpaces")}</option>
            <option value="137">{t("app.short137")}</option>
            <option value="80">{t("app.short80")}</option>
          </Select>
          <Select
            value={fs}
            onChange={(v) => {
              setFs(v);
              setPage(1);
            }}
          >
            <option value="tous">{t("app.allStatuses")}</option>
            {["à venir", "en cours", "annulé", "terminé"].map((s) => (
              <option key={s} value={s}>
                {t(STATUS_I18N[s] || "status.a_venir")}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="button"
          onClick={() => exportCSV(data, "reservations.csv")}
          disabled={!data.length}
          className="flex items-center gap-2 px-4 py-2 border border-[rgba(28,23,20,0.15)] text-[#7A6E62] text-xs rounded-sm hover:bg-[#EDE7DA] transition-colors disabled:opacity-40"
        >
          <Download size={13} /> {t("app.exportCsv")}
        </button>
      </div>
      {error && (
        <div className="mb-3 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#7A6E62] py-12 justify-center">
          <Loader2 size={16} className="animate-spin" /> {t("common.loading")}
        </div>
      ) : (
        <div className="bg-[#EDE7DA] rounded-sm border border-[rgba(28,23,20,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-[rgba(28,23,20,0.08)]">
                  <Th>{t("app.colRef")}</Th>
                  <Th>{t("app.colClient")}</Th>
                  <Th>{t("app.colSpacePost")}</Th>
                  <Th>{t("app.colSchedule")}</Th>
                  <Th>{t("app.colSchedule")}</Th>
                  <Th>{t("app.colAmount")}</Th>
                  <Th>{t("app.colStatus")}</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-[#7A6E62]"
                    >
                      {t("app.noResaDb")}
                    </td>
                  </tr>
                )}
                {paged.map((r, i) => {
                  const pm = POST_META[r.type] || POST_META.classique;
                  const Icon = pm.icon;
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-[rgba(28,23,20,0.06)] hover:bg-[#E4D9C8] transition-colors ${
                        i === paged.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <Td>
                        <span className="text-[10px] font-mono text-[#7A6E62]">
                          #{r.id}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-medium whitespace-nowrap">
                          {r.client}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-sm flex items-center justify-center"
                            style={{ background: pm.bg }}
                          >
                            <Icon size={9} style={{ color: pm.color }} />
                          </span>
                          <span className="text-xs whitespace-nowrap">
                            {r.espace === "80" ? t("app.short80") : t("app.short137")} · {r.poste}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <span className="text-xs text-[#7A6E62]">{r.date}</span>
                      </Td>
                      <Td>
                        <span className="text-xs text-[#7A6E62] whitespace-nowrap">
                          {r.debut}–{r.fin}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-medium">{r.montant} €</span>
                      </Td>
                      <Td>
                        <Pill label={r.statut} />
                      </Td>
                      <Td>
                        <ActionBtns />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pages
            page={page}
            pages={pages}
            setPage={setPage}
            total={data.length}
            n={filtered.length}
          />
        </div>
      )}
    </>
  );
}

function TabFactures() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [fs, setFs] = useState("tous");
  const filtered = useMemo(()=>FACTURES_DATA.filter(f=>{
    const q=search.toLowerCase();
    return (f.client.toLowerCase().includes(q)||f.id.toLowerCase().includes(q)) && (fs==="tous"||f.statut===fs);
  }),[search,fs]);
  const [page,setPage]=useState(1);
  const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const paged=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  const totalCA=FACTURES_DATA.reduce((s,f)=>s+f.montant,0);
  const totalPayé=FACTURES_DATA.filter(f=>f.statut==="payée").reduce((s,f)=>s+f.montant,0);
  const totalRetard=FACTURES_DATA.filter(f=>f.statut==="retard").reduce((s,f)=>s+f.montant,0);
  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[{ label:t("app.totalBilled"), val:`${totalCA} €`, color:"#1C1714" }, { label:t("app.collected"), val:`${totalPayé} €`, color:"#2E7D32" }, { label:t("app.overdue"), val:`${totalRetard} €`, color:"#C62828" }].map(k=>(
          <div key={k.label} className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.08)] rounded-sm p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#7A6E62] mb-1">{k.label}</div>
            <div className="text-xl font-medium" style={{ fontFamily:"'Playfair Display',serif", color:k.color }}>{k.val}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <SearchBar value={search} onChange={v=>{setSearch(v);setPage(1);}} placeholder={t("app.searchInvoice")}/>
          <Select value={fs} onChange={v=>{setFs(v);setPage(1);}}><option value="tous">{t("app.allStatuses")}</option>{["payée","en attente","retard"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</Select>
        </div>
        <button onClick={()=>exportCSV(FACTURES_DATA,"factures.csv")} className="flex items-center gap-2 px-4 py-2 border border-[rgba(28,23,20,0.15)] text-[#7A6E62] text-xs rounded-sm hover:bg-[#EDE7DA] transition-colors"><Download size={13}/> {t("app.exportCsv")}</button>
      </div>
      <div className="bg-[#EDE7DA] rounded-sm border border-[rgba(28,23,20,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead><tr className="border-b border-[rgba(28,23,20,0.08)]"><Th>N° Facture</Th><Th>{t("app.colClient")}</Th><Th>Émission</Th><Th>Échéance</Th><Th>HT</Th><Th>TVA</Th><Th>TTC</Th><Th>{t("app.colStatus")}</Th><Th></Th></tr></thead>
            <tbody>
              {paged.map((f,i)=>(
                <tr key={f.id} className={`border-b border-[rgba(28,23,20,0.06)] hover:bg-[#E4D9C8] transition-colors ${i===paged.length-1?"border-b-0":""}`}>
                  <Td><span className="text-[10px] font-mono text-[#7A6E62]">{f.id}</span></Td>
                  <Td><span className="font-medium whitespace-nowrap">{f.client}</span></Td>
                  <Td><span className="text-xs text-[#7A6E62]">{f.date}</span></Td>
                  <Td><span className={`text-xs ${f.statut==="retard"?"text-red-500 font-medium":"text-[#7A6E62]"}`}>{f.echeance}</span></Td>
                  <Td><span className="text-xs">{(f.montant-f.tva).toFixed(2)} €</span></Td>
                  <Td><span className="text-xs text-[#7A6E62]">{f.tva.toFixed(2)} €</span></Td>
                  <Td><span className="font-medium">{f.montant.toFixed(2)} €</span></Td>
                  <Td><Pill label={f.statut}/></Td>
                  <Td><ActionBtns/></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pages page={page} pages={pages} setPage={setPage} total={FACTURES_DATA.length} n={filtered.length}/>
      </div>
    </>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: "espaces", labelKey: "app.adminTabs.espaces", icon: Building2 },
  { id: "postes", labelKey: "app.adminTabs.postes", icon: LayoutGrid },
  { id: "utilisateurs", labelKey: "app.adminTabs.utilisateurs", icon: Users },
  { id: "reservations", labelKey: "app.adminTabs.reservations", icon: CalendarDays },
  { id: "factures", labelKey: "app.adminTabs.factures", icon: FileText },
];

export default function Administration() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab") || "espaces";
  const tab = TABS.some((t) => t.id === raw) ? raw : "espaces";

  const setTab = (id) => {
    setParams(id === "espaces" ? {} : { tab: id });
  };

  return (
    <AdminLayout>
      <div
        className="min-h-full bg-[#F5F0E8] text-[#1C1714]"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          backgroundColor: "#F5F0E8",
          color: "#1C1714",
        }}
      >
        {/* Tab bar — mêmes couleurs design */}
        <div
          className="border-b border-[rgba(28,23,20,0.08)] bg-[#F5F0E8] flex overflow-x-auto"
          style={{ backgroundColor: "#F5F0E8" }}
        >
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                  tab === item.id
                    ? "border-[#1C1714] text-[#1C1714]"
                    : "border-transparent text-[#7A6E62] hover:text-[#1C1714]"
                }`}
              >
                <Icon size={13} />
                {t(item.labelKey)}
              </button>
            );
          })}
        </div>
        <div className="p-5 bg-[#F5F0E8]" style={{ backgroundColor: "#F5F0E8" }}>
          {tab === "espaces" && <TabEspaces />}
          {tab === "postes" && <TabPostes />}
          {tab === "utilisateurs" && <TabUtilisateurs />}
          {tab === "reservations" && <TabReservations />}
          {tab === "factures" && <TabFactures />}
        </div>
      </div>
    </AdminLayout>
  );
}