import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  BookOpen,
  User,
  LayoutDashboard,
  Settings,
  Menu,
  ChevronRight,
  ChevronsLeft,
  LogOut,
  Briefcase,
  CalendarPlus,
  PanelLeftOpen,
  ExternalLink,
} from "lucide-react";
import { clearSession, getStoredUser } from "../api/client";
import Footer from "./Footer";

function djangoAdminUrl() {
  const fromEnv = import.meta.env.VITE_DJANGO_ADMIN_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, "") + "/";
  const api = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(
    /\/$/,
    "",
  );
  const base = api.replace(/\/api$/i, "") || "http://localhost:8000";
  return `${base}/admin/`;
}

function DjangoAdminLogo({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="32" height="32" rx="6" fill="#0C4B33" />
      <path
        d="M11.2 8.5c0-.7.2-1.2.5-1.5.4-.4.9-.5 1.6-.5h2.1v11.6c0 1.7-.1 2.8-.4 3.5-.4.9-1 1.5-1.8 2-.8.5-1.9.7-3.3.8l-.4-2.1c.7 0 1.2-.1 1.6-.3.4-.2.6-.4.7-.8.1-.3.2-.9.2-1.7V8.5h-.8zm8.4 7.6c.7 0 1.2-.1 1.5-.2.3-.1.5-.3.5-.6 0-.3-.1-.4-.4-.5-.2-.1-.7-.2-1.3-.2h-1.2v1.5h.9zm-.5-5.8c.6 0 1.1 0 1.3-.1.3-.1.4-.3.4-.6s-.1-.5-.4-.6c-.2-.1-.7-.2-1.3-.2h-1.1v1.5h1.1zm-2.7-3.8h4c1.1 0 1.9.1 2.5.4.6.3 1 .6 1.3 1.1.3.5.4 1 .4 1.7 0 .7-.2 1.2-.5 1.6-.3.4-.8.7-1.5.9v.1c.9.2 1.5.5 1.9 1 .4.5.6 1.1.6 1.9 0 .7-.2 1.4-.5 1.9-.4.5-.9.9-1.5 1.2-.7.3-1.5.4-2.5.4h-4.2V6.5zm2.2 8.8v2.6h1.4c.7 0 1.2-.1 1.5-.4.3-.2.5-.6.5-1.1 0-.5-.2-.8-.5-1-.3-.2-.9-.3-1.6-.3h-1.3z"
        fill="#44B78B"
      />
    </svg>
  );
}

function navClass({ isActive }) {
  return `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all ${
    isActive
      ? "bg-[#B8956A] text-[#F5F0E8]"
      : "text-[#7A6E62] hover:text-[#F5F0E8] hover:bg-[#E4D9C8]/10"
  }`;
}

function isItemActive(to, pathname) {
  if (to === "/") return pathname === "/";
  if (to === "/admin") {
    return pathname === "/admin" || pathname === "/dashboard";
  }
  if (to === "/calendrier") {
    return pathname.startsWith("/calendrier");
  }
  if (to === "/admin/gestion") return pathname.startsWith("/admin/gestion");
  if (to === "/compte-pro") return pathname.startsWith("/compte-pro");
  if (to === "/profil") return pathname.startsWith("/profil");
  if (to === "/reserver") {
    return (
      pathname.startsWith("/reserver") || pathname.startsWith("/book-online")
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function AppShell({ children }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const user = getStoredUser();
  const role = (user?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";
  const isPro = role === "PROFESSIONNEL";

  /**
   * Structure type zip Root.tsx : 2 blocs + border-t
   * Pro  : Dashboard | Compte pro
   * Admin: Dashboard | Administration
   */
  const proSections = useMemo(
    () => [
      {
        titleKey: "shell.dashboard",
        items: [
          { to: "/home", labelKey: "shell.home", icon: Home, end: true },
          {
            to: "/calendrier",
            labelKey: "shell.dashboard",
            icon: LayoutDashboard,
          },
          { to: "/reserver", labelKey: "shell.book", icon: CalendarPlus },
          {
            to: "/reservations",
            labelKey: "shell.myBookings",
            icon: BookOpen,
          },
        ],
      },
      {
        titleKey: "shell.proAccount",
        items: [
          {
            to: "/compte-pro",
            labelKey: "shell.proAccount",
            icon: Briefcase,
          },
          { to: "/profil", labelKey: "shell.profile", icon: User },
        ],
      },
    ],
    [],
  );

  const adminSections = useMemo(
    () => [
      {
        titleKey: "shell.dashboard",
        items: [
          { to: "/home", labelKey: "shell.home", icon: Home, end: true },
          {
            to: "/admin",
            labelKey: "shell.dashboard",
            icon: LayoutDashboard,
          },
        ],
      },
      {
        titleKey: "shell.sectionAdmin",
        items: [
          {
            to: "/admin/gestion",
            labelKey: "shell.administration",
            icon: Settings,
          },
          { to: "/profil", labelKey: "shell.profile", icon: User },
        ],
      },
    ],
    [],
  );

  const sections = isAdmin ? adminSections : proSections;
  const logoTo = isAdmin ? "/admin" : "/calendrier";
  const djangoUrl = djangoAdminUrl();

  const breadcrumb = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/admin/gestion")) return t("shell.administration");
    if (p === "/admin" || p === "/dashboard") return t("shell.dashboard");
    if (p.startsWith("/compte-pro")) return t("shell.proAccount");
    if (p.startsWith("/calendrier")) return t("shell.dashboard");
    if (p.startsWith("/reservations")) return t("shell.myBookings");
    if (p.startsWith("/profil")) return t("shell.profile");
    if (p.startsWith("/reserver") || p.startsWith("/book-online"))
      return t("shell.book");
    if (p === "/home") return t("shell.home");
    if (p === "/") return t("shell.home");
    return p.replace(/^\//, "").replace(/-/g, " ");
  }, [location.pathname, t]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.email ||
    t("shell.user");
  const initials =
    displayName
      .split(/\s+|@/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const roleLabel = isAdmin
    ? t("shell.roleAdmin")
    : isPro
      ? t("shell.rolePro")
      : t("shell.roleAccount");

  const logout = () => {
    clearSession();
    navigate("/connexion", { replace: true });
  };

  return (
    <div
      className="flex h-screen bg-[#F5F0E8] text-[#1C1714]"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: "#F5F0E8",
        color: "#1C1714",
      }}
    >
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#1C1714]/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={[
          "fixed lg:static inset-y-0 left-0 z-40 bg-[#1C1714] flex flex-col shrink-0",
          "w-52 transition-all duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          desktopOpen
            ? "lg:translate-x-0 lg:w-52"
            : "lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none",
        ].join(" ")}
      >
        <div className="relative border-b border-white/10">
          {/* Collapse moderne — coin supérieur droit (chevrons, pas de croix) */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                setMobileOpen(false);
              } else {
                setDesktopOpen(false);
              }
            }}
            title={t("shell.closeMenu")}
            aria-label={t("shell.closeMenu")}
            className="absolute top-3 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-md text-[#7A6E62] hover:text-[#F5F0E8] hover:bg-white/10 transition-colors"
          >
            <ChevronsLeft size={16} strokeWidth={1.75} />
          </button>

          <NavLink
            to={logoTo}
            className="block px-5 py-5 pr-11 hover:opacity-80 transition-opacity"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="text-base font-semibold text-[#F5F0E8]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("brand.name")}
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#7A6E62]">
              {t("brand.tagline")}
            </div>
          </NavLink>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
          {sections.map((section, idx) => (
            <div
              key={section.titleKey}
              className={`px-3 py-4 flex flex-col gap-0.5 ${
                idx > 0 ? "border-t border-white/10" : ""
              }`}
            >
              <p className="text-[9px] uppercase tracking-widest text-[#7A6E62] px-3 mb-2">
                {t(section.titleKey)}
              </p>
              {section.items.map(({ to, labelKey, icon: Icon, end }) => (
                <NavLink
                  key={`${to}-${labelKey}`}
                  to={to}
                  end={!!end}
                  onClick={() => setMobileOpen(false)}
                  className={() =>
                    navClass({
                      isActive: isItemActive(to, location.pathname),
                    })
                  }
                >
                  <Icon size={15} />
                  {t(labelKey)}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="px-3 pb-2">
            <a
              href={djangoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm border border-white/10 bg-[#F5F0E8]/5 hover:bg-[#E4D9C8]/10 transition-all group"
              title={t("shell.openDjango")}
            >
              <DjangoAdminLogo className="w-8 h-8 shrink-0 shadow-sm rounded-md" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#F5F0E8] font-medium leading-tight">
                  {t("shell.djangoAdmin")}
                </div>
                <div className="text-[9px] text-[#7A6E62] truncate group-hover:text-[#9C8E7E]">
                  {t("shell.djangoHint")}
                </div>
              </div>
              <ExternalLink
                size={12}
                className="text-[#7A6E62] group-hover:text-[#B8956A] shrink-0"
              />
            </a>
          </div>
        )}

        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#B8956A] text-[#F5F0E8] text-[11px] font-medium flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#F5F0E8] font-medium truncate">
              {displayName}
            </div>
            <div className="text-[9px] text-[#7A6E62] truncate">{roleLabel}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            title={t("shell.logout")}
            className="text-[#7A6E62] hover:text-[#F5F0E8] transition-colors shrink-0"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F5F0E8] text-[#1C1714]"
        style={{ backgroundColor: "#F5F0E8", color: "#1C1714" }}
      >
        <header
          className="h-12 bg-[#F5F0E8] border-b border-[rgba(28,23,20,0.1)] flex items-center px-4 gap-3 shrink-0"
          style={{ backgroundColor: "#F5F0E8" }}
        >
          {/* Mobile : burger. Desktop : réouvrir seulement si sidebar repliée */}
          <button
            type="button"
            className={`text-[#7A6E62] hover:text-[#1C1714] transition-colors p-1 rounded-sm hover:bg-[#EDE7DA] ${
              desktopOpen ? "lg:hidden" : ""
            }`}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                setMobileOpen((o) => !o);
              } else {
                setDesktopOpen(true);
              }
            }}
            aria-label={t("shell.openMenu")}
            title={t("shell.openMenu")}
          >
            <Menu size={18} className="lg:hidden" />
            <PanelLeftOpen
              size={18}
              className="hidden lg:block"
              strokeWidth={1.5}
            />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-[#7A6E62]">
            <NavLink
              to="/home"
              className="hover:text-[#1C1714] transition-colors"
            >
              {t("shell.home")}
            </NavLink>
            {location.pathname !== "/home" && (
              <>
                <ChevronRight size={10} />
                <span className="text-[#1C1714] font-medium">{breadcrumb}</span>
              </>
            )}
          </div>
          <div className="flex-1" />

          {isAdmin && (
            <a
              href={djangoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-sm border border-[rgba(28,23,20,0.1)] hover:border-[rgba(28,23,20,0.2)] hover:bg-[#EDE7DA] transition-all"
              title={t("shell.djangoAdmin")}
            >
              <DjangoAdminLogo className="w-5 h-5 rounded" />
              <span className="text-[10px] font-medium text-[#1C1714]">
                Django
              </span>
            </a>
          )}
        </header>

        <div
          className="flex-1 overflow-y-auto bg-[#F5F0E8] text-[#1C1714] flex flex-col"
          style={{ backgroundColor: "#F5F0E8", color: "#1C1714" }}
        >
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
