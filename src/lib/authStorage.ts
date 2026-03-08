// src/lib/authStorage.ts
export const ACCESS_KEY = "access_token";
export const REFRESH_KEY = "refresh_token";
export const USER_KEY = "user_info";

export interface StoredUser {
  name: string;
  email: string;
  role: string;
}

export function getStorage() {
  // refresh token will exist in either sessionStorage or localStorage
  if (typeof window === "undefined") return null;
  if (sessionStorage.getItem(REFRESH_KEY)) return sessionStorage;
  if (localStorage.getItem(REFRESH_KEY)) return localStorage;
  return sessionStorage; // default
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function setTokens(params: {
  access_token: string;
  refresh_token: string;
  rememberMe: boolean;
}) {
  if (typeof window === "undefined") return;

  clearAuthStorage();

  const storage = params.rememberMe ? localStorage : sessionStorage;
  storage.setItem(ACCESS_KEY, params.access_token);
  storage.setItem(REFRESH_KEY, params.refresh_token);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACCESS_KEY) || localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY);
}

export function writeAccessToken(access_token: string) {
  if (typeof window === "undefined") return;

  // Keep access token in same storage as refresh token
  if (sessionStorage.getItem(REFRESH_KEY)) sessionStorage.setItem(ACCESS_KEY, access_token);
  else if (localStorage.getItem(REFRESH_KEY)) localStorage.setItem(ACCESS_KEY, access_token);
  else sessionStorage.setItem(ACCESS_KEY, access_token);
}

export function saveUserInfo(info: StoredUser) {// stores as "user_info" in storage
  if (typeof window === "undefined") return;
  const storage = getStorage() ?? sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(info));
}

export function getUserInfo(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const data =
    sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as StoredUser;
  } catch {
    return null;
  }
}

export function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}