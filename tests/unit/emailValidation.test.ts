import { isValidEmailAddress, normalizeEmail } from "../../src/lib/emailValidation";

describe("emailValidation", () => {
  it("accepts normal email addresses", () => {
    expect(isValidEmailAddress("admin@company.com")).toBe(true);
    expect(isValidEmailAddress("john.doe+hr@sub.company.co")).toBe(true);
  });

  it("rejects malformed email addresses", () => {
    expect(isValidEmailAddress("")).toBe(false);
    expect(isValidEmailAddress("missing-at-symbol")).toBe(false);
    expect(isValidEmailAddress("two@@company.com")).toBe(false);
    expect(isValidEmailAddress("admin@company")).toBe(false);
    expect(isValidEmailAddress(".admin@company.com")).toBe(false);
    expect(isValidEmailAddress("admin@-company.com")).toBe(false);
  });

  it("normalizes email addresses for storage", () => {
    expect(normalizeEmail("  Admin@Company.Com  ")).toBe("admin@company.com");
  });
});
