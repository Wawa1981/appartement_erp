import { apiRequest } from "./client";

/** Map API → UI (libellés FR) */
const STATUT_API_TO_UI = {
  a_venir: "à venir",
  en_cours: "en cours",
  termine: "terminé",
  annule: "annulé",
};

const STATUT_UI_TO_API = {
  "à venir": "a_venir",
  "en cours": "en_cours",
  terminé: "termine",
  annulé: "annule",
};

export function mapReservation(r) {
  if (!r) return null;
  return {
    id: r.id,
    space: r.espace,
    post: r.poste,
    poste_id: r.poste_id,
    type: r.type_poste,
    date: r.date,
    start: (r.start_time || "").slice(0, 5),
    end: (r.end_time || "").slice(0, 5),
    montant: Number(r.montant) || 0,
    statut: STATUT_API_TO_UI[r.statut] || r.statut,
    address: r.address || "",
    client: r.client_name || "",
    client_email: r.client_email || "",
    raw: r,
  };
}

export async function fetchReservations(params = {}) {
  const q = new URLSearchParams();
  if (params.statut) {
    q.set("statut", STATUT_UI_TO_API[params.statut] || params.statut);
  }
  const qs = q.toString();
  const res = await apiRequest(`/reservations/${qs ? `?${qs}` : ""}`);
  const list = Array.isArray(res) ? res : res.results || [];
  return list.map(mapReservation);
}

export async function createReservation(payload) {
  const body = {
    espace: payload.espace || payload.space,
    poste: payload.poste || payload.post,
    poste_id: payload.poste_id || "",
    type_poste: payload.type_poste || payload.type,
    date: payload.date,
    start_time: payload.start_time || payload.start,
    end_time: payload.end_time || payload.end,
    montant: payload.montant ?? 0,
    statut: STATUT_UI_TO_API[payload.statut] || payload.statut || "a_venir",
    address: payload.address || "",
    service_id: payload.service_id || "",
  };
  const r = await apiRequest("/reservations/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapReservation(r);
}

export async function updateReservation(id, patch) {
  const body = { ...patch };
  if (body.statut && STATUT_UI_TO_API[body.statut]) {
    body.statut = STATUT_UI_TO_API[body.statut];
  }
  const r = await apiRequest(`/reservations/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return mapReservation(r);
}

export async function cancelReservation(id) {
  return updateReservation(id, { statut: "annulé" });
}
