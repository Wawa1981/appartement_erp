import { Navigate, useLocation } from "react-router-dom";
import {
  getAccessToken,
  getStoredUser,
  homePathForUser,
  clearSession,
} from "../api/client";

/**
 * Protège une route.
 * - requireAuth (défaut true) : JWT requis
 * - roles : liste optionnelle de rôles autorisés (ex. ["ADMIN"])
 */
export default function RequireAuth({ children, roles }) {
  const location = useLocation();
  const token = getAccessToken();
  const user = getStoredUser();

  if (!token) {
    return (
      <Navigate to="/connexion" replace state={{ from: location.pathname }} />
    );
  }

  // Token présent mais pas de user stocké → session incohérente
  if (!user) {
    clearSession();
    return (
      <Navigate to="/connexion" replace state={{ from: location.pathname }} />
    );
  }

  if (roles?.length) {
    const role = (user.role || "").toUpperCase();
    const allowed = roles.map((r) => r.toUpperCase());
    if (!allowed.includes(role)) {
      return <Navigate to={homePathForUser(user)} replace />;
    }
  }

  return children;
}
