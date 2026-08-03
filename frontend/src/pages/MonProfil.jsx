import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  Scissors,
  Star,
  Sparkles,
  Users2,
  Bell,
  Shield,
  CreditCard,
  Check,
  Loader2,
} from "lucide-react";
import AppShell from "../components/AppShell";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { fetchMe, updateMe } from "../api/profile";
import { apiRequest } from "../api/client";

const SPECIALITES = [
  { id: "coiffure", labelKey: "specialties.coiffure", icon: Scissors },
  { id: "esthetique", labelKey: "specialties.esthetique", icon: Sparkles },
  { id: "barbier", labelKey: "specialties.barbier", icon: Users2 },
  { id: "nail", labelKey: "specialties.nail", icon: Star },
];

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-all shrink-0 ${
        on ? "bg-[#1C1714]" : "bg-[#C4B89E]"
      }`}
      aria-pressed={on}
    >
      <div
        className={`w-4 h-4 rounded-full bg-[#EDE7DA] transition-transform ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function MonProfil() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("infos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [specialites, setSpecialites] = useState(new Set());
  const [role, setRole] = useState("");
  const [dateJoined, setDateJoined] = useState("");

  const [notifyReminder, setNotifyReminder] = useState(true);
  const [notifyPayment, setNotifyPayment] = useState(true);
  const [notifySlots, setNotifySlots] = useState(false);
  const [notifyNewsletter, setNotifyNewsletter] = useState(false);

  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  const isAdmin = (role || "").toUpperCase() === "ADMIN";
  const isPro = (role || "").toUpperCase() === "PROFESSIONNEL";

  /** Onglets selon le rôle — admin ≠ coworker */
  const tabs = useMemo(() => {
    const base = [
      { id: "infos", labelKey: "app.tabInfos", icon: User },
      { id: "notifs", labelKey: "app.tabNotifs", icon: Bell },
    ];
    if (isPro) {
      base.push({ id: "paiement", labelKey: "app.tabPayment", icon: CreditCard });
    }
    base.push({ id: "securite", labelKey: "app.tabSecurity", icon: Shield });
    return base;
  }, [isPro]);

  useEffect(() => {
    // si admin arrive sur un onglet pro, revenir à infos
    if (isAdmin && tab === "paiement") setTab("infos");
  }, [isAdmin, tab]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const u = await fetchMe();
      setFirstName(u.first_name || "");
      setLastName(u.last_name || "");
      setEmail(u.email || "");
      setPhone(u.phone || "");
      setBio(u.bio || "");
      setSpecialites(new Set(Array.isArray(u.specialties) ? u.specialties : []));
      setRole(u.role || "");
      setDateJoined(u.date_joined || "");
      setNotifyReminder(!!u.notify_reminder);
      setNotifyPayment(!!u.notify_payment);
      setNotifySlots(!!u.notify_slots);
      setNotifyNewsletter(!!u.notify_newsletter);
    } catch (e) {
      setError(e.message || t("app.errorLoadProfile"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    email ||
    t("shell.user");
  const initials =
    displayName
      .split(/\s+|@/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const roleLabel = isAdmin ? t("shell.roleAdmin") : t("shell.rolePro");

  function toggleSpec(id) {
    setSpecialites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function saveInfos() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: email.trim().toLowerCase(),
        phone,
      };
      // métier beauté = pro uniquement
      if (isPro) {
        payload.bio = bio;
        payload.specialties = [...specialites];
      }
      await updateMe(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message || t("app.errorSave"));
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifs(patch) {
    setError("");
    try {
      await updateMe(patch);
    } catch (e) {
      setError(e.message || t("app.errorUpdate"));
      await load();
    }
  }

  async function changePassword() {
    setPwdMsg("");
    setError("");
    if (pwdNew !== pwdConfirm) {
      setPwdMsg(t("auth.passwordMismatch"));
      return;
    }
    if (pwdNew.length < 8) {
      setPwdMsg(t("auth.passwordMin"));
      return;
    }
    try {
      await apiRequest("/users/me/password/", {
        method: "POST",
        body: JSON.stringify({
          current_password: pwdCurrent,
          password: pwdNew,
          password_confirm: pwdConfirm,
        }),
      });
      setPwdMsg(t("auth.resetDone").split(".")[0] + ".");
      setPwdCurrent("");
      setPwdNew("");
      setPwdConfirm("");
    } catch (e) {
      setPwdMsg(e.message || t("app.errorPassword"));
    }
  }

  const notifItems = useMemo(() => {
    if (isAdmin) {
      return [
        {
          label: t("app.notifAdminOps"),
          sub: t("app.notifAdminOpsSub"),
          key: "notify_reminder",
          value: notifyReminder,
          set: setNotifyReminder,
        },
        {
          label: t("app.notifNewsletter"),
          sub: t("app.notifNewsletterSub"),
          key: "notify_newsletter",
          value: notifyNewsletter,
          set: setNotifyNewsletter,
        },
      ];
    }
    return [
      {
        label: t("app.notifReminder"),
        sub: t("app.notifReminderSub"),
        key: "notify_reminder",
        value: notifyReminder,
        set: setNotifyReminder,
      },
      {
        label: t("app.notifPayment"),
        sub: t("app.notifPaymentSub"),
        key: "notify_payment",
        value: notifyPayment,
        set: setNotifyPayment,
      },
      {
        label: t("app.notifSlots"),
        sub: t("app.notifSlotsSub"),
        key: "notify_slots",
        value: notifySlots,
        set: setNotifySlots,
      },
      {
        label: t("app.notifNewsletter"),
        sub: t("app.notifNewsletterSub"),
        key: "notify_newsletter",
        value: notifyNewsletter,
        set: setNotifyNewsletter,
      },
    ];
  }, [
    isAdmin,
    t,
    notifyReminder,
    notifyPayment,
    notifySlots,
    notifyNewsletter,
  ]);

  return (
    <AppShell>
      <div
        className="p-6 max-w-2xl mx-auto min-h-full bg-[#F5F0E8] text-[#1C1714]"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          backgroundColor: "#F5F0E8",
          color: "#1C1714",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-sm text-[#7A6E62]">
            <Loader2 className="animate-spin" size={18} />{" "}
            {t("app.loadingProfile")}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-full bg-[#1C1714] text-[#B8956A] text-xl font-medium flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1
                  className="text-2xl font-medium"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {displayName}
                </h1>
                <p className="text-sm text-[#7A6E62]">
                  {roleLabel}
                  {dateJoined
                    ? ` · ${t("app.memberSince", {
                        date: new Date(dateJoined).toLocaleDateString(
                          undefined,
                          { month: "long", year: "numeric" },
                        ),
                      })}`
                    : ""}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase tracking-widest text-[#7A6E62]">
                  {t("shell.language")}
                </span>
                <LanguageSwitcher />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-sm">
                {error}
              </div>
            )}

            <div className="flex gap-0 border-b border-[rgba(28,23,20,0.1)] mb-6 overflow-x-auto">
              {tabs.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                      tab === item.id
                        ? "border-[#1C1714] text-[#1C1714]"
                        : "border-transparent text-[#7A6E62] hover:text-[#1C1714]"
                    }`}
                  >
                    <Icon size={13} />
                    <span className="hidden sm:inline">{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </div>

            {tab === "infos" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[#7A6E62]">
                      {t("app.firstName")}
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.15)] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1C1714]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[#7A6E62]">
                      {t("app.lastName")}
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.15)] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1C1714]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#7A6E62]">
                    {t("common.email")}
                  </label>
                  <div className="relative">
                    <Mail
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6E62]"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#EDE7DA] border border-[rgba(28,23,20,0.15)] rounded-sm pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1C1714]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#7A6E62]">
                    {t("app.phone")}
                  </label>
                  <div className="relative">
                    <Phone
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6E62]"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#EDE7DA] border border-[rgba(28,23,20,0.15)] rounded-sm pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1C1714]"
                    />
                  </div>
                </div>

                {/* Pro only : métier beauté */}
                {isPro && (
                  <>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#7A6E62] block mb-3">
                        {t("app.specialties")}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALITES.map((s) => {
                          const Icon = s.icon;
                          const active = specialites.has(s.id);
                          return (
                            <button
                              type="button"
                              key={s.id}
                              onClick={() => toggleSpec(s.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-medium border transition-all ${
                                active
                                  ? "bg-[#1C1714] text-[#F5F0E8] border-[#1C1714]"
                                  : "bg-[#EDE7DA] text-[#7A6E62] border-[rgba(28,23,20,0.15)]"
                              }`}
                            >
                              <Icon size={12} />
                              {t(s.labelKey)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-[#7A6E62]">
                        {t("app.bio")}
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.15)] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1C1714] resize-none"
                      />
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={saveInfos}
                  disabled={saving}
                  className={`w-full py-3 text-sm font-medium rounded-sm transition-colors flex items-center justify-center gap-2 ${
                    saved
                      ? "bg-green-600 text-white"
                      : "bg-[#1C1714] text-[#F5F0E8] hover:bg-[#B8956A]"
                  }`}
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : saved ? (
                    <>
                      <Check size={14} /> {t("app.saved")}
                    </>
                  ) : (
                    t("app.saveChanges")
                  )}
                </button>
              </div>
            )}

            {tab === "notifs" && (
              <div className="flex flex-col gap-4">
                {notifItems.map((n) => (
                  <div
                    key={n.key}
                    className="flex items-center justify-between p-4 bg-[#EDE7DA] rounded-sm"
                  >
                    <div>
                      <div className="text-sm font-medium">{n.label}</div>
                      <div className="text-xs text-[#7A6E62]">{n.sub}</div>
                    </div>
                    <Toggle
                      on={n.value}
                      onChange={(v) => {
                        n.set(v);
                        saveNotifs({ [n.key]: v });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Paiement = pro uniquement (location de poste) */}
            {tab === "paiement" && isPro && (
              <div className="flex flex-col gap-4">
                <p className="text-xs uppercase tracking-widest text-[#7A6E62]">
                  {t("app.cardsRegistered")}
                </p>
                <p className="text-sm text-[#7A6E62] py-10 text-center bg-[#EDE7DA] rounded-sm border border-[rgba(28,23,20,0.08)]">
                  {t("app.noCards")}
                </p>
              </div>
            )}

            {tab === "securite" && (
              <div className="flex flex-col gap-4">
                {pwdMsg && (
                  <p className="text-xs text-[#7A6E62] bg-[#EDE7DA] p-3 rounded-sm">
                    {pwdMsg}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#7A6E62]">
                    {t("app.currentPassword")}
                  </label>
                  <input
                    type="password"
                    value={pwdCurrent}
                    onChange={(e) => setPwdCurrent(e.target.value)}
                    className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.15)] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1C1714]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#7A6E62]">
                    {t("app.newPassword")}
                  </label>
                  <input
                    type="password"
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.15)] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1C1714]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#7A6E62]">
                    {t("app.confirmPassword")}
                  </label>
                  <input
                    type="password"
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    className="bg-[#EDE7DA] border border-[rgba(28,23,20,0.15)] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1C1714]"
                  />
                </div>
                <button
                  type="button"
                  onClick={changePassword}
                  className="w-full py-3 bg-[#1C1714] text-[#F5F0E8] text-sm font-medium rounded-sm hover:bg-[#B8956A] transition-colors"
                >
                  {t("app.updatePassword")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
