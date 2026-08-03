const API_BASE =
  (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(
    /\/$/,
    ""
  );

const ACCESS_KEY = "appartement_access";
const REFRESH_KEY = "appartement_refresh";
const USER_KEY = "appartement_user";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession({ access, refresh, user }) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

/** Redirection post-login selon le rôle */
export function homePathForUser(user) {
  const role = (user?.role || getStoredUser()?.role || "").toUpperCase();
  if (role === "ADMIN") return "/dashboard";
  if (role === "PROFESSIONNEL") return "/calendrier";
  return "/";
}

async function parseError(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* */
  }
  if (!data) return `Erreur ${res.status}`;

  if (typeof data === "string") return data;
  if (data.detail) return String(data.detail);
  if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
    return String(data.non_field_errors[0]);
  }
  // DRF field errors
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    if (Array.isArray(val)) return `${firstKey}: ${val[0]}`;
    if (typeof val === "string") return val;
  }
  return "Une erreur est survenue.";
}

function currentLang() {
  try {
    const raw = localStorage.getItem("appartement_lang") || "";
    const lng = raw.split("-")[0];
    if (lng === "en" || lng === "fr") return lng;
  } catch {
    /* */
  }
  if (typeof navigator !== "undefined") {
    const n = (navigator.language || "fr").split("-")[0];
    if (n === "en") return "en";
  }
  return "fr";
}

export async function apiRequest(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": currentLang(),
    ...(options.headers || {}),
  };
  const token = getAccessToken();
  if (token && !options.skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 204) return null;

  if (!res.ok) {
    const message = await parseError(res);
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

/** US02 — Connexion email + password → JWT */
export async function login(email, password) {
  const data = await apiRequest("/auth/login/", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });
  setSession({
    access: data.access,
    refresh: data.refresh,
    user: data.user,
  });
  return data;
}

/** US01 — Inscription pro */
export async function register({ email, password, password_confirm, first_name, last_name }) {
  const data = await apiRequest("/auth/register/", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      password_confirm,
      first_name: first_name || "",
      last_name: last_name || "",
    }),
  });
  return data;
}

/** Demande de reset password (email) */
export async function requestPasswordReset(email) {
  return apiRequest("/auth/password-reset/", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

/** Confirme le nouveau mot de passe (uid + token du lien) */
export async function confirmPasswordReset({
  uid,
  token,
  password,
  password_confirm,
}) {
  return apiRequest("/auth/password-reset/confirm/", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ uid, token, password, password_confirm }),
  });
}

/** Connexion Google — id_token (credential GIS) ou access_token OAuth */
export async function loginWithGoogle({ credential, id_token, access_token }) {
  const body = {};
  if (credential) body.credential = credential;
  if (id_token) body.id_token = id_token;
  if (access_token) body.access_token = access_token;

  const data = await apiRequest("/auth/google/", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(body),
  });
  setSession({
    access: data.access,
    refresh: data.refresh,
    user: data.user,
  });
  return data;
}

/** Profil connecté */
export async function fetchMe() {
  const user = await apiRequest("/users/me/");
  setSession({
    access: getAccessToken(),
    refresh: getRefreshToken(),
    user,
  });
  return user;
}

export async function logout() {
  clearSession();
}

export const GOOGLE_CLIENT_ID = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID || ""
).trim();

export { API_BASE };

/** Charge le script Google Identity Services (une seule fois). */
let gsiLoadPromise = null;
export function loadGoogleScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window indisponible"));
  }
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google);
  }
  if (gsiLoadPromise) return gsiLoadPromise;

  gsiLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", () =>
        reject(new Error("Impossible de charger Google"))
      );
      // déjà chargé
      if (window.google?.accounts) resolve(window.google);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.google);
    s.onerror = () => reject(new Error("Impossible de charger Google"));
    document.head.appendChild(s);
  });
  return gsiLoadPromise;
}

/**
 * Ouvre le flux Google (popup token) et renvoie { access_token }.
 * Nécessite VITE_GOOGLE_CLIENT_ID.
 */
export async function requestGoogleAccessToken() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Google non configuré (VITE_GOOGLE_CLIENT_ID manquant)."
    );
  }
  const google = await loadGoogleScript();
  return new Promise((resolve, reject) => {
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: (resp) => {
          if (resp.error) {
            reject(new Error(resp.error_description || resp.error));
            return;
          }
          if (!resp.access_token) {
            reject(new Error("Aucun token Google reçu."));
            return;
          }
          resolve({ access_token: resp.access_token });
        },
        error_callback: (err) => {
          reject(
            new Error(
              err?.message || "Connexion Google annulée ou impossible."
            )
          );
        },
      });
      client.requestAccessToken({ prompt: "" });
    } catch (e) {
      reject(e);
    }
  });
}
