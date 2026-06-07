import { clearAuthStorage, getAccessToken, getRememberMe, getUserInfo, parseJwt, roleToPath, saveUserInfo, setTokens, writeAccessToken } from "../../src/lib/authStorage";
import { sum } from "../../src/lib/sum";

describe("api config", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    jest.resetModules();
  });

  it("uses the default backend URL when the env var is not set", () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    jest.resetModules();

    const { API_BASE_URL: fallbackBaseUrl } = require("../../src/lib/api") as typeof import("../../src/lib/api");
    expect(fallbackBaseUrl).toBe("http://localhost:5000/api/v1");
  });

  it("honors NEXT_PUBLIC_API_BASE_URL when provided", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    jest.resetModules();

    const { API_BASE_URL: envBaseUrl } = require("../../src/lib/api") as typeof import("../../src/lib/api");
    expect(envBaseUrl).toBe("https://api.example.com");
  });
});

describe("authStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearAuthStorage();
  });

  it("stores tokens and remember-me state", () => {
    setTokens({ access_token: "token-123", rememberMe: true });
    expect(getAccessToken()).toBe("token-123");
    expect(getRememberMe()).toBe(true);

    writeAccessToken("token-456");
    expect(getAccessToken()).toBe("token-456");
  });

  it("writes user info to localStorage when remember me is enabled", () => {
    setTokens({ access_token: "token-123", rememberMe: true });
    const user = { name: "Adrian", email: "adrian@example.com", role: "Admin" };
    saveUserInfo(user);

    expect(localStorage.getItem("user_info")).toBe(JSON.stringify(user));
    expect(getUserInfo()).toEqual(user);
  });

  it("writes user info to sessionStorage when remember me is disabled", () => {
    setTokens({ access_token: "token-123", rememberMe: false });
    const user = { name: "Maria", email: "maria@example.com", role: "HR Officer" };
    saveUserInfo(user);

    expect(sessionStorage.getItem("user_info")).toBe(JSON.stringify(user));
    expect(getUserInfo()).toEqual(user);
  });

  it("clears legacy storage values", () => {
    localStorage.setItem("access_token", "legacy");
    localStorage.setItem("refresh_token", "legacy");
    localStorage.setItem("user_info", "legacy");
    sessionStorage.setItem("access_token", "legacy");
    sessionStorage.setItem("refresh_token", "legacy");
    sessionStorage.setItem("user_info", "legacy");
    sessionStorage.setItem("welcome_shown", "1");

    clearAuthStorage();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(localStorage.getItem("user_info")).toBeNull();
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
    expect(sessionStorage.getItem("user_info")).toBeNull();
    expect(sessionStorage.getItem("welcome_shown")).toBeNull();
    expect(getRememberMe()).toBe(false);
    expect(getAccessToken()).toBeNull();
  });

  it("parses valid JWT payloads and rejects malformed values", () => {
    const payload = Buffer.from(JSON.stringify({ sub: "user-1", email: "adrian@example.com" }))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

    expect(parseJwt(`header.${payload}.signature`)).toEqual({
      sub: "user-1",
      email: "adrian@example.com",
    });
    expect(parseJwt("not-a-jwt")).toBeNull();
  });
});

describe("roleToPath", () => {
  it.each([
    ["System Admin", "/system-admin"],
    ["Admin", "/admin"],
    ["HR Officer", "/hr"],
    ["HR Recruiter", "/hr"],
    ["HR Interviewer", "/hr"],
    ["Employee", "/employee"],
    ["Applicant", "/applicant"],
    ["Manager", "/manager"],
    ["Group Head", "/manager"],
    ["Unknown", "/login"],
  ])("maps %s to %s", (roleName, expectedPath) => {
    expect(roleToPath(roleName)).toBe(expectedPath);
  });
});

describe("sum", () => {
  it("adds numbers", () => {
    expect(sum(2, 3)).toBe(5);
    expect(sum(-2, 4)).toBe(2);
  });
});
