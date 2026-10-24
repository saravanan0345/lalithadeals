import { describe, expect, it } from "vitest";
import { canOpenDemo } from "@/lib/demo-preview";

describe("Development-only demo boundary", () => {
  it("allows demo UI only in development", () => {
    expect(canOpenDemo(true)).toBe(true);
  });
  it("disables demo UI in production", () => {
    expect(canOpenDemo(false)).toBe(false);
  });
});