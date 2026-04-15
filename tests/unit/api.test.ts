describe("API_BASE_URL", () => {
  const original = process.env.NEXT_PUBLIC_API_BASE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = original;
    jest.resetModules();
  });

  it("uses fallback base URL when env var is unset", async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    jest.resetModules();

    const mod = await import("../../src/lib/api");
    expect(mod.API_BASE_URL).toBe("http://localhost:5000/api/tribeX/auth/v1");
  });

  it("uses NEXT_PUBLIC_API_BASE_URL when provided", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.test/api";
    jest.resetModules();

    const mod = await import("../../src/lib/api");
    expect(mod.API_BASE_URL).toBe("https://example.test/api");
  });
});
