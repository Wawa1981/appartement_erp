import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Landing } from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Administration from "./pages/Administration";
import Calendar from "./pages/Calendar";
import BookOnline from "./pages/BookOnline";
import ComptePro from "./pages/ComptePro";
import MesReservations from "./pages/MesReservations";
import MonProfil from "./pages/MonProfil";
import MentionsLegales from "./pages/MentionsLegales";
import CGU from "./pages/CGU";
import Confidentialite from "./pages/Confidentialite";
import RequireAuth from "./components/RequireAuth";
import AppShell from "./components/AppShell";

function Placeholder({ titleKey, title }) {
  const { t } = useTranslation();
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F5F0E8] text-[#1C1714]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="text-center px-6">
        <p
          className="text-2xl font-medium mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title || (titleKey ? t(titleKey) : "")}
        </p>
        <p className="text-sm text-[#7A6E62]">{t("common.pageLater")}</p>
        <a href="/" className="inline-block mt-6 text-sm text-[#B8956A]">
          {t("common.backLanding")}
        </a>
      </div>
    </div>
  );
}

function ShellPlaceholder({ title }) {
  return (
    <AppShell>
      <div className="flex min-h-full items-center justify-center p-8 text-center">
        <div>
          <p
            className="text-2xl font-medium mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </p>
          <p className="text-sm text-[#7A6E62]">Page à venir</p>
        </div>
      </div>
    </AppShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/reserver" element={<BookOnline />} />
      <Route path="/book-online" element={<BookOnline />} />
      <Route path="/mentions-legales" element={<MentionsLegales />} />
      <Route path="/cgu" element={<CGU />} />
      <Route path="/confidentialite" element={<Confidentialite />} />
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />

      {/* Pro (+ admin OK) : JWT requis + même sidebar */}
      <Route
        path="/home"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/calendrier"
        element={
          <RequireAuth>
            <Calendar />
          </RequireAuth>
        }
      />
      <Route
        path="/reservations"
        element={
          <RequireAuth>
            <MesReservations />
          </RequireAuth>
        }
      />
      <Route
        path="/profil"
        element={
          <RequireAuth>
            <MonProfil />
          </RequireAuth>
        }
      />
      <Route
        path="/compte-pro"
        element={
          <RequireAuth roles={["PROFESSIONNEL"]}>
            <ComptePro />
          </RequireAuth>
        }
      />
      <Route
        path="/compte-pro/documents"
        element={
          <RequireAuth roles={["PROFESSIONNEL"]}>
            <ComptePro />
          </RequireAuth>
        }
      />

      {/* Admin uniquement */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth roles={["ADMIN"]}>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth roles={["ADMIN"]}>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/gestion"
        element={
          <RequireAuth roles={["ADMIN"]}>
            <Administration />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
