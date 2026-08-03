import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SynConfirmDialog } from "../../react";

const DEFAULT_PROPS = {
  open: true,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  title: "Delete item?",
  description: "This action cannot be undone.",
};

describe("SynConfirmDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    const { container } = render(<SynConfirmDialog {...DEFAULT_PROPS} open={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title and description when open", () => {
    render(<SynConfirmDialog {...DEFAULT_PROPS} />);
    expect(screen.getByText("Delete item?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("calls onConfirm when Delete button clicked", async () => {
    const onConfirm = vi.fn();
    render(<SynConfirmDialog {...DEFAULT_PROPS} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Cancel button clicked", async () => {
    const onCancel = vi.fn();
    render(<SynConfirmDialog {...DEFAULT_PROPS} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel when backdrop clicked", async () => {
    const onCancel = vi.fn();
    render(<SynConfirmDialog {...DEFAULT_PROPS} onCancel={onCancel} />);
    const backdrop = screen.getByTestId("confirm-dialog-backdrop");
    await userEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
