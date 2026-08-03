import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import GoogleIcon from "../components/GoogleIcon";
import {
  login,
  loginWithGoogle,
  requestGoogleAccessToken,
  homePathForUser,
  GOOGLE_CLIENT_ID,
} from "../api/client";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const goAfterLogin = (user) => {
    // Si on venait d'une page protégée, y retourner ; sinon selon le rôle
    if (from && from !== "/" && from !== "/connexion" && from !== "/inscription") {
      navigate(from, { replace: true });
      return;
    }
    navigate(homePathForUser(user), { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      goAfterLogin(data.user);
    } catch (err) {
      setError(err.message || t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    if (!GOOGLE_CLIENT_ID) {
      setError(t("auth.googleNotConfigured"));
      return;
    }
    setGoogleLoading(true);
    try {
      const { access_token } = await requestGoogleAccessToken();
      const data = await loginWithGoogle({ access_token });
      goAfterLogin(data.user);
    } catch (err) {
      setError(err.message || t("auth.googleError"));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title={t("auth.welcomeBack")}
      subtitle={t("auth.loginSubtitle")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link
            to="/inscription"
            className="text-[#B8956A] font-medium hover:underline"
          >
            {t("auth.createOne")}
          </Link>
        </>
      }
    >
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading || googleLoading}
        className="w-full h-12 text-sm font-medium mb-6 rounded-sm border border-[rgba(28,23,20,0.15)] bg-[#EDE7DA] text-[#1C1714] hover:bg-[#E4D9C8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {googleLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("auth.googleLoading")}
          </>
        ) : (
          <>
            <GoogleIcon className="w-5 h-5" />
            {t("auth.continueGoogle")}
          </>
        )}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[rgba(28,23,20,0.12)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#EDE7DA]/95 px-3 text-[#7A6E62]">{t("common.or")}</span>
        </div>
      </div>

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
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-10 pr-3 rounded-sm border border-[rgba(28,23,20,0.15)] bg-[#EDE7DA] text-[#1C1714] placeholder:text-[#A89B8C] focus:outline-none focus:border-[#B8956A] focus:ring-1 focus:ring-[#B8956A]"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#1C1714]"
            >
              {t("common.password")}
            </label>
            <Link
              to="/mot-de-passe-oublie"
              className="text-xs text-[#B8956A] hover:underline whitespace-nowrap"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E62]"
              aria-hidden="true"
            />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-10 pr-3 rounded-sm border border-[rgba(28,23,20,0.15)] bg-[#EDE7DA] text-[#1C1714] placeholder:text-[#A89B8C] focus:outline-none focus:border-[#B8956A] focus:ring-1 focus:ring-[#B8956A]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-12 mt-2 rounded-sm bg-[#1C1714] text-[#F5F0E8] text-sm font-medium hover:bg-[#B8956A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("auth.loggingIn")}
            </>
          ) : (
            t("auth.loginBtn")
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
