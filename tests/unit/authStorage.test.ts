describe("authStorage", () => {
  const loadModule = async () => import("../../src/lib/authStorage");

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("stores remember-me flag when token is set", async () => {
    const mod = await loadModule();

    mod.setTokens({ access_token: "abc", rememberMe: true });

    expect(mod.getAccessToken()).toBe("abc");
    expect(mod.getRememberMe()).toBe(true);
    expect(localStorage.getItem("rm")).toBe("1");
  });

  it("stores user info in session storage when remember-me is false", async () => {
    const mod = await loadModule();

    mod.setTokens({ access_token: "abc", rememberMe: false });
    mod.saveUserInfo({ name: "Angelo", email: "a@example.com", role: "Admin" });

    expect(sessionStorage.getItem(mod.USER_KEY)).toContain("Angelo");
    expect(localStorage.getItem(mod.USER_KEY)).toBeNull();
    expect(mod.getUserInfo()?.role).toBe("Admin");
  });

  it("stores user info in local storage when remember-me is true", async () => {
    const mod = await loadModule();

    mod.setTokens({ access_token: "abc", rememberMe: true });
    mod.saveUserInfo({ name: "User", email: "u@example.com", role: "Employee" });

    expect(localStorage.getItem(mod.USER_KEY)).toContain("Employee");
    expect(sessionStorage.getItem(mod.USER_KEY)).toBeNull();
  });

  it("returns null when saved user JSON is invalid", async () => {
    const mod = await loadModule();

    sessionStorage.setItem(mod.USER_KEY, "not-json");
    expect(mod.getUserInfo()).toBeNull();
  });

  it("clears auth and legacy keys", async () => {
    const mod = await loadModule();

    mod.setTokens({ access_token: "abc", rememberMe: true });
    localStorage.setItem("access_token", "legacy");
    localStorage.setItem("refresh_token", "legacy");
    sessionStorage.setItem("access_token", "legacy");
    sessionStorage.setItem("refresh_token", "legacy");
    sessionStorage.setItem("welcome_shown", "1");
    mod.saveUserInfo({ name: "User", email: "u@example.com", role: "HR" });

    mod.clearAuthStorage();

    expect(mod.getAccessToken()).toBeNull();
    expect(mod.getRememberMe()).toBe(false);
    expect(localStorage.getItem("rm")).toBeNull();
    expect(localStorage.getItem(mod.USER_KEY)).toBeNull();
    expect(sessionStorage.getItem(mod.USER_KEY)).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
    expect(sessionStorage.getItem("welcome_shown")).toBeNull();
  });

  it("parses a valid JWT payload", async () => {
    const mod = await loadModule();

    const payload = { sub: "123", role: "Admin" };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const token = `header.${encoded}.sig`;

    expect(mod.parseJwt(token)).toEqual(payload);
    expect(mod.parseJwt("invalid-token")).toBeNull();
  });
});
