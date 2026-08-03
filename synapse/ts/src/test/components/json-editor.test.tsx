import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SynJsonEditor, validateJson } from "../../react";

describe("SynJsonEditor", () => {
  it("renders a textarea with the provided value", () => {
    render(<SynJsonEditor value={'{"a":1}'} onChange={() => {}} />);
    const ta = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(ta.value).toBe('{"a":1}');
  });

  it("uses default placeholder {} when none provided", () => {
    render(<SynJsonEditor value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("{}")).toBeInTheDocument();
  });

  it("respects custom placeholder and rows", () => {
    render(
      <SynJsonEditor
        value=""
        onChange={() => {}}
        placeholder="custom-ph"
        rows={8}
      />
    );
    const ta = screen.getByPlaceholderText("custom-ph") as HTMLTextAreaElement;
    expect(ta).toBeInTheDocument();
    expect(ta.rows).toBe(8);
  });

  it("calls onChange when user types", () => {
    const onChange = vi.fn();
    render(<SynJsonEditor value="" onChange={onChange} />);
    const ta = screen.getByRole("textbox");
    fireEvent.change(ta, { target: { value: "{}" } });
    expect(onChange).toHaveBeenCalledWith("{}");
  });

  it("renders error message when error is provided", () => {
    render(
      <SynJsonEditor value="{" onChange={() => {}} error="Invalid JSON syntax" />
    );
    expect(screen.getByText("Invalid JSON syntax")).toBeInTheDocument();
  });

  it("applies error styling when error is provided", () => {
    render(
      <SynJsonEditor value="{" onChange={() => {}} error="oops" />
    );
    const ta = screen.getByRole("textbox");
    expect(ta.className).toContain("border-destructive");
  });

  it("does not render error paragraph when no error", () => {
    render(<SynJsonEditor value="{}" onChange={() => {}} />);
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });
});

describe("validateJson", () => {
  it("returns undefined for empty string", () => {
    expect(validateJson("")).toBeUndefined();
  });

  it("returns undefined for whitespace-only string", () => {
    expect(validateJson("   ")).toBeUndefined();
  });

  it("returns undefined for the placeholder {}", () => {
    expect(validateJson("{}")).toBeUndefined();
  });

  it("returns undefined for valid JSON object", () => {
    expect(validateJson('{"a":1,"b":[1,2]}')).toBeUndefined();
  });

  it("returns undefined for valid JSON array", () => {
    expect(validateJson("[1,2,3]")).toBeUndefined();
  });

  it("returns an error string for invalid JSON", () => {
    const result = validateJson("{not json}");
    expect(typeof result).toBe("string");
    expect(result).toBeTruthy();
  });

  it("falls back to 'Invalid JSON' when thrown value is not an Error", () => {
    const spy = vi.spyOn(JSON, "parse").mockImplementation(() => {
      throw "non-error string";
    });
    try {
      expect(validateJson('{"a":1}')).toBe("Invalid JSON");
    } finally {
      spy.mockRestore();
    }
  });
});
