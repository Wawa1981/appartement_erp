import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, Loader2, KeyRound } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { confirmPasswordReset } from "../api/client";

export default function ResetPassword() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const uid = useMemo(() => params.get("uid") || "", [params]);
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const invalidLink = !uid || !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset({
        uid,
        token,
        password,
        password_confirm: passwordConfirm,
      });
      setDone(true);
      setTimeout(() => navigate("/connexion", { replace: true }), 2000);
    } catch (err) {
      setError(err.message || t("auth.resetError"));
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full h-12 pl-10 pr-3 rounded-sm border border-[rgba(28,23,20,0.15)] bg-[#EDE7DA] text-[#1C1714] placeholder:text-[#A89B8C] focus:outline-none focus:border-[#B8956A] focus:ring-1 focus:ring-[#B8956A]";

  return (
    <AuthLayout
      icon={KeyRound}
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSubtitle")}
      footer={
        <Link
          to="/connexion"
          className="text-[#B8956A] font-medium hover:underline"
        >
          {t("auth.backLogin")}
        </Link>
      }
    >
      {invalidLink ? (
        <div className="space-y-4">
          <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-800 text-sm">
            {t("auth.invalidLink")}
          </div>
          <Link
            to="/mot-de-passe-oublie"
            className="inline-flex w-full h-12 items-center justify-center rounded-sm bg-[#1C1714] text-[#F5F0E8] text-sm font-medium hover:bg-[#B8956A]"
          >
            {t("auth.requestLink")}
          </Link>
        </div>
      ) : done ? (
        <div className="p-4 rounded-sm bg-[#F5F0E8] border border-[rgba(28,23,20,0.1)] text-sm text-[#1C1714]">
          {t("auth.resetDone")}
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
              <label htmlFor="password" className="block text-sm font-medium">
                {t("auth.newPassword")}
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E62]"
                  aria-hidden
                />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldClass}
                  placeholder={t("auth.passwordPlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password_confirm"
                className="block text-sm font-medium"
              >
                {t("auth.confirm")}
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E62]"
                  aria-hidden
                />
                <input
                  id="password_confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className={fieldClass}
                  placeholder={t("auth.passwordPlaceholder")}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-sm bg-[#1C1714] text-[#F5F0E8] text-sm font-medium hover:bg-[#B8956A] transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("auth.saving")}
                </>
              ) : (
                t("auth.savePassword")
              )}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
