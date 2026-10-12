import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { StatusDot } from "../../react";

describe("StatusDot", () => {
  it("maps known statuses", () => {
    const { container } = render(<StatusDot status="error" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.dataset.status).toBe("error");
    expect(el.className).toContain("bg-danger");
  });

  it("defaults to idle when no status is given", () => {
    const { container } = render(<StatusDot />);
    expect((container.firstElementChild as HTMLElement).dataset.status).toBe("idle");
  });

  it("does not silently fall back to idle for unknown statuses", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<StatusDot status="pending_review" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.dataset.status).toBe("unknown");
    expect(el.dataset.rawStatus).toBe("pending_review");
    expect(el.className).not.toContain("bg-gray-400");
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
