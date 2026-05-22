import { cn } from "../../src/lib/utils"

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold")
  })

  it("merges duplicate tailwind classes", () => {
    expect(cn("px-4", "px-6", "py-2")).toBe("px-6 py-2")
  })

  it("filters falsy values", () => {
    expect(cn("block", null as any, undefined as any)).toBe("block")
  })
})
