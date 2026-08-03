import { apiRequest, getStoredUser, setSession, getAccessToken, getRefreshToken } from "./client";

export async function fetchMe() {
  return apiRequest("/users/me/");
}

export async function updateMe(patch) {
  const user = await apiRequest("/users/me/", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  // garde la session locale à jour
  setSession({
    access: getAccessToken(),
    refresh: getRefreshToken(),
    user: { ...(getStoredUser() || {}), ...user },
  });
  return user;
}
