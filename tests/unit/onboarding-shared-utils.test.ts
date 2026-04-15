import { formatFileSize, validateFile } from "../../src/components/onboarding/shared/utils";

describe("onboarding shared utils", () => {
  it("formats file size values", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1024)).toBe("1.00 KB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.00 MB");
  });

  it("validates max file size", () => {
    const huge = new File([new Uint8Array(11 * 1024 * 1024)], "huge.pdf", {
      type: "application/pdf",
    });
    const err = validateFile(huge, new Set(["application/pdf"]), "Only PDF allowed");
    expect(err).toContain("File size exceeds 10MB limit");
  });

  it("validates allowed mime types", () => {
    const png = new File(["x"], "x.png", { type: "image/png" });
    expect(validateFile(png, new Set(["application/pdf"]), "Only PDF allowed")).toBe("Only PDF allowed");
  });

  it("returns null when file is valid", () => {
    const pdf = new File(["ok"], "ok.pdf", { type: "application/pdf" });
    expect(validateFile(pdf, new Set(["application/pdf"]), "Only PDF allowed")).toBeNull();
  });
});
