import { describe, it, expect } from "vitest";
import { cn } from "../../lib/cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("resolves tailwind conflicts — last wins", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("handles undefined and false", () => {
    expect(cn("a", undefined, false as unknown as string, "c")).toBe("a c");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles conditional classes", () => {
    const active = true;
    expect(cn("base", active && "active")).toBe("base active");
  });

  it("deduplicates identical classes", () => {
    expect(cn("text-sm", "text-sm")).toBe("text-sm");
  });
});
