import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { KeyRound, Mail, Loader2 } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { requestPasswordReset } from "../api/client";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [debugUrl, setDebugUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDebugUrl("");
    setLoading(true);
    try {
      const data = await requestPasswordReset(email);
      setDone(true);
      if (data?.debug_reset_url) setDebugUrl(data.debug_reset_url);
    } catch (err) {
      setError(err.message || t("auth.forgotError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={KeyRound}
      title={t("auth.forgotTitle")}
      subtitle={t("auth.forgotSubtitle")}
      footer={
        <Link
          to="/connexion"
          className="text-[#B8956A] font-medium hover:underline"
        >
          {t("auth.backLogin")}
        </Link>
      }
    >
      {done ? (
        <div className="space-y-4">
          <div className="p-4 rounded-sm bg-[#F5F0E8] border border-[rgba(28,23,20,0.1)] text-sm text-[#1C1714]">
            {t("auth.forgotDone")}
          </div>
          {debugUrl ? (
            <div className="p-3 rounded-sm bg-amber-50 border border-amber-200 text-xs text-amber-900 break-all">
              <p className="font-medium mb-1">{t("auth.devLink")}</p>
              <a href={debugUrl} className="text-[#B8956A] underline">
                {debugUrl}
              </a>
            </div>
          ) : null}
          <Link
            to="/connexion"
            className="inline-flex w-full h-12 items-center justify-center rounded-sm bg-[#1C1714] text-[#F5F0E8] text-sm font-medium hover:bg-[#B8956A] transition-colors"
          >
            {t("auth.backLogin")}
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div
              className="mb-4 p-3 rounded-sm bg-red-50 border border-red-200 text-red-800 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1C1714]"
              >
                {t("common.email")}
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E62]"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-3 rounded-sm border border-[rgba(28,23,20,0.15)] bg-[#EDE7DA] text-[#1C1714] placeholder:text-[#A89B8C] focus:outline-none focus:border-[#B8956A] focus:ring-1 focus:ring-[#B8956A]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-sm bg-[#1C1714] text-[#F5F0E8] text-sm font-medium hover:bg-[#B8956A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("auth.sending")}
                </>
              ) : (
                t("auth.sendLink")
              )}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
