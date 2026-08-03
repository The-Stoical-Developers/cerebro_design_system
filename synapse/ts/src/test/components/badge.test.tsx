import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SynBadge, badgeVariants } from "../../react";

describe("SynBadge", () => {
  it("renders children", () => {
    render(<SynBadge>Active</SynBadge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders default variant as a span element", () => {
    render(<SynBadge>Default</SynBadge>);
    const el = screen.getByText("Default");
    expect(el.tagName).toBe("SPAN");
  });

  it("renders destructive variant with danger class styling", () => {
    render(<SynBadge variant="destructive">Error</SynBadge>);
    const el = screen.getByText("Error");
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("bg-danger");
  });

  it("renders secondary variant with secondary class styling", () => {
    render(<SynBadge variant="secondary">Beta</SynBadge>);
    const el = screen.getByText("Beta");
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("bg-secondary");
  });

  it("renders outline variant with class styling", () => {
    render(<SynBadge variant="outline">Outline</SynBadge>);
    const el = screen.getByText("Outline");
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("text-body");
  });

  it("merges custom className", () => {
    render(<SynBadge className="custom-cls">X</SynBadge>);
    expect(screen.getByText("X").className).toContain("custom-cls");
  });

  it("badgeVariants returns class string", () => {
    const cls = badgeVariants({ variant: "default" });
    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });
});
