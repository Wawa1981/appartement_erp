import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserPlus, Mail, Lock, User, Loader2 } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import GoogleIcon from "../components/GoogleIcon";
import {
  login,
  register,
  loginWithGoogle,
  requestGoogleAccessToken,
  homePathForUser,
  GOOGLE_CLIENT_ID,
} from "../api/client";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      await register({
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
      });
      const data = await login(email, password);
      navigate(homePathForUser(data.user), { replace: true });
    } catch (err) {
      setError(err.message || t("auth.registerError"));
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
      navigate(homePathForUser(data.user), { replace: true });
    } catch (err) {
      setError(err.message || t("auth.googleError"));
    } finally {
      setGoogleLoading(false);
    }
  };

  const fieldClass =
    "w-full h-12 pl-10 pr-3 rounded-sm border border-[rgba(28,23,20,0.15)] bg-[#EDE7DA] text-[#1C1714] placeholder:text-[#A89B8C] focus:outline-none focus:border-[#B8956A] focus:ring-1 focus:ring-[#B8956A]";

  return (
    <AuthLayout
      icon={UserPlus}
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSubtitle")}
      footer={
        <>
          {t("auth.hasAccount")}{" "}
          <Link
            to="/connexion"
            className="text-[#B8956A] font-medium hover:underline"
          >
            {t("auth.signIn")}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="first_name" className="block text-sm font-medium">
              {t("auth.firstName")}
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E62]"
                aria-hidden
              />
              <input
                id="first_name"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="last_name" className="block text-sm font-medium">
              {t("auth.lastName")}
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E62]"
                aria-hidden
              />
              <input
                id="last_name"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            {t("common.email")}
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E62]"
              aria-hidden
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder={t("auth.emailPlaceholder")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            {t("common.password")}
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
              placeholder={t("auth.passwordMin")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password_confirm" className="block text-sm font-medium">
            {t("auth.confirmPassword")}
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
          className="w-full h-12 mt-2 rounded-sm bg-[#1C1714] text-[#F5F0E8] text-sm font-medium hover:bg-[#B8956A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("auth.creating")}
            </>
          ) : (
            t("auth.createAccount")
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
