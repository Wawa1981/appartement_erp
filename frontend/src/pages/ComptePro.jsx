import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  FileText,
  FileCheck2,
  IdCard,
  Building2,
  Shield,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import AppShell from "../components/AppShell";
import { getStoredUser } from "../api/client";

/**
 * Documents du Compte pro — alignés CDC (analyse-et-conception).
 * Upload réel backend = sprint documents ; UI centralise les démarches.
 */
const DOC_TYPES = [
  {
    id: "contrat",
    titleKey: "docs.contrat.title",
    descKey: "docs.contrat.desc",
    audienceKey: "docs.contrat.audience",
    icon: FileText,
    group: "juridique",
    required: true,
  },
  {
    id: "micro_contrat",
    titleKey: "docs.micro_contrat.title",
    descKey: "docs.micro_contrat.desc",
    audienceKey: "docs.micro_contrat.audience",
    icon: FileCheck2,
    group: "juridique",
    required: true,
  },
  {
    id: "piece_identite",
    titleKey: "docs.piece_identite.title",
    descKey: "docs.piece_identite.desc",
    audienceKey: "docs.piece_identite.audience",
    icon: IdCard,
    group: "conformite",
    required: true,
  },
  {
    id: "kbis",
    titleKey: "docs.kbis.title",
    descKey: "docs.kbis.desc",
    audienceKey: "docs.kbis.audience",
    icon: Building2,
    group: "conformite",
    required: true,
  },
  {
    id: "assurance_pro",
    titleKey: "docs.assurance_pro.title",
    descKey: "docs.assurance_pro.desc",
    audienceKey: "docs.assurance_pro.audience",
    icon: Shield,
    group: "conformite",
    required: true,
  },
];

const STATUS = {
  manquant: {
    labelKey: "app.statusMissing",
    color: "#C62828",
    bg: "#FFEBEE",
    icon: AlertCircle,
  },
  en_attente: {
    labelKey: "app.statusPending",
    color: "#7A4F10",
    bg: "#FBE9CC",
    icon: Clock,
  },
  valide: {
    labelKey: "app.statusValid",
    color: "#2E7D32",
    bg: "#E8F5E9",
    icon: CheckCircle2,
  },
};

function DocCard({ doc, status, fileName, onPick, t }) {
  const Icon = doc.icon;
  const st = STATUS[status] || STATUS.manquant;
  const StIcon = st.icon;

  return (
    <div className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.08)] rounded-sm p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-sm bg-[#F5F0E8] flex items-center justify-center shrink-0">
          <Icon size={18} className="text-[#B8956A]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-medium text-[#1C1714]">{t(doc.titleKey)}</h3>
            {doc.required && (
              <span className="text-[9px] uppercase tracking-wider text-[#7A6E62] bg-[#F5F0E8] px-1.5 py-0.5 rounded-sm">
                {t("app.required")}
              </span>
            )}
          </div>
          <p className="text-xs text-[#7A6E62] mt-1 leading-relaxed">
            {t(doc.descKey)}
          </p>
          <p className="text-[10px] text-[#9C8E7E] mt-1">{t(doc.audienceKey)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
          style={{ background: st.bg, color: st.color }}
        >
          <StIcon size={11} />
          {t(st.labelKey)}
        </span>
        {fileName && (
          <span className="text-[10px] text-[#7A6E62] truncate max-w-[12rem]">
            {fileName}
          </span>
        )}
      </div>

      <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1C1714] text-[#F5F0E8] text-xs font-medium rounded-sm hover:bg-[#B8956A] transition-colors cursor-pointer">
        <Upload size={13} />
        {status === "manquant" ? t("app.upload") : t("app.replace")}
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(doc.id, f);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

export default function ComptePro() {
  const { t } = useTranslation();
  const location = useLocation();
  const user = getStoredUser();
  const docsOnly = location.pathname.includes("/documents");
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.email ||
    t("shell.rolePro");

  /** État local (API upload à brancher) */
  const [docs, setDocs] = useState(() =>
    Object.fromEntries(
      DOC_TYPES.map((d) => [d.id, { status: "manquant", fileName: null }]),
    ),
  );

  const progress = useMemo(() => {
    const vals = Object.values(docs);
    const ok = vals.filter((d) => d.status === "valide").length;
    const pending = vals.filter((d) => d.status === "en_attente").length;
    return {
      ok,
      pending,
      total: vals.length,
      pct: Math.round((ok / vals.length) * 100),
    };
  }, [docs]);

  const onPick = (id, file) => {
    setDocs((prev) => ({
      ...prev,
      [id]: { status: "en_attente", fileName: file.name },
    }));
  };

  const juridique = DOC_TYPES.filter((d) => d.group === "juridique");
  const conformite = DOC_TYPES.filter((d) => d.group === "conformite");

  return (
    <AppShell>
      <div
        className="min-h-full bg-[#F5F0E8] text-[#1C1714] max-w-[900px] mx-auto px-5 py-6"
        style={{ backgroundColor: "#F5F0E8", color: "#1C1714" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A6E62] mb-1">
              {t("shell.proAccount")}
            </p>
            <h1
              className="text-2xl sm:text-3xl font-medium"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {docsOnly ? t("app.docsCompliance") : t("app.proSpace")}
            </h1>
            <p className="text-sm text-[#7A6E62] mt-1">
              {displayName} — centralisez contrats, identité et assurances pour
              la couverture juridique.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/compte-pro"
              className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                !docsOnly
                  ? "bg-[#1C1714] text-[#F5F0E8] border-transparent"
                  : "border-[rgba(28,23,20,0.15)] text-[#7A6E62] hover:bg-[#EDE7DA]"
              }`}
            >
              {t("app.overview")}
            </Link>
            <Link
              to="/compte-pro/documents"
              className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                docsOnly
                  ? "bg-[#1C1714] text-[#F5F0E8] border-transparent"
                  : "border-[rgba(28,23,20,0.15)] text-[#7A6E62] hover:bg-[#EDE7DA]"
              }`}
            >
              {t("app.documents")}
            </Link>
          </div>
        </div>

        {/* Progression */}
        <div className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.08)] rounded-sm p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-sm bg-[#F5F0E8] flex items-center justify-center">
              <Briefcase size={16} className="text-[#B8956A]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{t("app.dossierTitle")}</div>
              <div className="text-xs text-[#7A6E62]">
                {progress.ok}/{progress.total} {t("app.validated")} ·{" "}
                {progress.pending} {t("app.pending")}
              </div>
            </div>
            <div
              className="text-lg font-medium tabular-nums"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {progress.pct}&nbsp;%
            </div>
          </div>
          <div className="h-1.5 bg-[#DDD4C0] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#B8956A] transition-all"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          <p className="text-[11px] text-[#9C8E7E] mt-3">
            Référence CDC :{" "}
            <code className="text-[10px] bg-[#F5F0E8] px-1 rounded-sm">
              docs/analyse-et-conception/CDC-compte-pro-documents.md
            </code>
          </p>
        </div>

        {!docsOnly && (
          <div className="mb-8">
            <Link
              to="/compte-pro/documents"
              className="flex items-center gap-4 p-5 bg-[#EDE7DA] border border-[rgba(28,23,20,0.08)] rounded-sm hover:border-[rgba(28,23,20,0.2)] hover:bg-[#E4D9C8] transition-all"
            >
              <div className="w-10 h-10 rounded-sm bg-[#F5F0E8] flex items-center justify-center shrink-0">
                <FileCheck2 size={18} className="text-[#B8956A]" />
              </div>
              <div>
                <div className="text-sm font-medium">{t("app.depositDocs")}</div>
                <div className="text-xs text-[#7A6E62] mt-0.5">
                  {t("app.depositDocsSub")}
                </div>
              </div>
            </Link>
          </div>
        )}

        <section className="mb-8">
          <h2
            className="text-lg font-medium mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("app.legalCover")}
          </h2>
          <p className="text-xs text-[#7A6E62] mb-4">
            {t("app.legalCoverSub")}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {juridique.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                status={docs[doc.id].status}
                fileName={docs[doc.id].fileName}
                onPick={onPick}
                t={t}
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2
            className="text-lg font-medium mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("app.identityStruct")}
          </h2>
          <p className="text-xs text-[#7A6E62] mb-4">
            {t("app.identityStructSub")}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {conformite.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                status={docs[doc.id].status}
                fileName={docs[doc.id].fileName}
                onPick={onPick}
                t={t}
              />
            ))}
          </div>
        </section>

        <p className="text-[11px] text-[#9C8E7E] text-center pb-4">
          {t("app.formatsHint")}
        </p>
      </div>
    </AppShell>
  );
}
