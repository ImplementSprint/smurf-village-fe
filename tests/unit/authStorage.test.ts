import {
  clearAuthStorage,
  getAccessToken,
  getRememberMe,
  getUserInfo,
  parseJwt,
  saveUserInfo,
  setTokens,
  writeAccessToken,
  USER_KEY,
} from "../../src/lib/authStorage"

const sampleUser = {
  name: "Test User",
  email: "test@example.com",
  role: "HR Officer",
} as const

describe("authStorage", () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    clearAuthStorage()
  })

  it("stores access token in memory and remembers settings", () => {
    setTokens({ access_token: "abc123", rememberMe: true })

    expect(getAccessToken()).toBe("abc123")
    expect(getRememberMe()).toBe(true)
    expect(localStorage.getItem("rm")).toBe("1")
  })

  it("removes rememberMe flag when disabled", () => {
    setTokens({ access_token: "abc123", rememberMe: false })

    expect(getRememberMe()).toBe(false)
    expect(localStorage.getItem("rm")).toBeNull()
  })

  it("writes an access token without changing rememberMe", () => {
    writeAccessToken("new-token")
    expect(getAccessToken()).toBe("new-token")
  })

  it("saves user info to sessionStorage when rememberMe is false", () => {
    setTokens({ access_token: "abc123", rememberMe: false })
    saveUserInfo(sampleUser)

    expect(sessionStorage.getItem(USER_KEY)).toBe(JSON.stringify(sampleUser))
    expect(getUserInfo()).toEqual(sampleUser)
  })

  it("saves user info to localStorage when rememberMe is true", () => {
    setTokens({ access_token: "abc123", rememberMe: true })
    saveUserInfo(sampleUser)

    expect(localStorage.getItem(USER_KEY)).toBe(JSON.stringify(sampleUser))
    expect(getUserInfo()).toEqual(sampleUser)
  })

  it("returns null when stored user data is missing", () => {
    expect(getUserInfo()).toBeNull()
  })

  it("returns null for invalid stored JSON", () => {
    sessionStorage.setItem(USER_KEY, "not-json")
    expect(getUserInfo()).toBeNull()
  })

  it("clears auth storage and legacy token keys", () => {
    localStorage.setItem("access_token", "x")
    localStorage.setItem("refresh_token", "y")
    sessionStorage.setItem("user_info", "z")

    clearAuthStorage()

    expect(getAccessToken()).toBeNull()
    expect(getRememberMe()).toBe(false)
    expect(localStorage.getItem("access_token")).toBeNull()
    expect(localStorage.getItem("refresh_token")).toBeNull()
    expect(sessionStorage.getItem("user_info")).toBeNull()
  })

  it("parses valid JWT payloads", () => {
    const payload = { sub: "123", name: "Test" }
    const base64 = Buffer.from(JSON.stringify(payload)).toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
    const token = `header.${base64}.signature`

    expect(parseJwt(token)).toEqual(payload)
  })

  it("returns null for malformed tokens", () => {
    expect(parseJwt("invalid.token")).toBeNull()
  })
})
