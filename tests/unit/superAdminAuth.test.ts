import {
  clearSaToken,
  getSaToken,
  isSaAuthenticated,
  setSaToken,
} from "../../src/lib/superAdminAuth"

describe("superAdminAuth", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("stores and returns SA token", () => {
    setSaToken("secret-token")
    expect(getSaToken()).toBe("secret-token")
    expect(isSaAuthenticated()).toBe(true)
  })

  it("returns null when no token is set", () => {
    expect(getSaToken()).toBeNull()
    expect(isSaAuthenticated()).toBe(false)
  })

  it("clears the SA token", () => {
    setSaToken("secret-token")
    clearSaToken()
    expect(getSaToken()).toBeNull()
    expect(isSaAuthenticated()).toBe(false)
  })
})
