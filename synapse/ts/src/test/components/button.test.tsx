import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SynButton, buttonVariants } from "../../react";

describe("SynButton", () => {
  it("renders children", () => {
    render(<SynButton>Click me</SynButton>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<SynButton onClick={onClick}>Press</SynButton>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop set", () => {
    render(<SynButton disabled>Disabled</SynButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders destructive variant as a button element", () => {
    render(<SynButton variant="destructive">Del</SynButton>);
    const btn = screen.getByRole("button", { name: "Del" });
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe("BUTTON");
  });

  it("applies outline variant class", () => {
    render(<SynButton variant="outline">Out</SynButton>);
    expect(screen.getByRole("button").className).toContain("border");
  });

  it("renders small size as a button element", () => {
    render(<SynButton size="sm">Sm</SynButton>);
    const btn = screen.getByRole("button", { name: "Sm" });
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe("BUTTON");
  });

  it("renders as child element with asChild", () => {
    render(
      <SynButton asChild>
        <a href="/test">Link button</a>
      </SynButton>
    );
    expect(screen.getByRole("link", { name: "Link button" })).toBeInTheDocument();
  });

  it("buttonVariants returns class string", () => {
    const cls = buttonVariants({ variant: "default" });
    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });
});
