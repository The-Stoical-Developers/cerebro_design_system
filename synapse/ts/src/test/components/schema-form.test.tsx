import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SynSchemaForm } from "../../react";

const textSchema = {
  type: "object" as const,
  required: ["api_key"],
  properties: {
    api_key: { type: "string", format: "password", description: "Your API key" },
    base_url: { type: "string", description: "Optional base URL" },
  },
};

const emptySchema = {
  type: "object" as const,
  properties: {},
};

describe("SynSchemaForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders text inputs for string properties", () => {
    const onChange = vi.fn();
    render(<SynSchemaForm schema={textSchema} values={{}} onChange={onChange} />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("renders password inputs for format=password properties", () => {
    render(<SynSchemaForm schema={textSchema} values={{}} onChange={vi.fn()} />);
    const passwordInput = document.querySelector("input[type='password']");
    expect(passwordInput).not.toBeNull();
  });

  it("shows required asterisk for required fields", () => {
    render(<SynSchemaForm schema={textSchema} values={{}} onChange={vi.fn()} />);
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
  });

  it("formats label correctly: underscores replaced with spaces, title cased", () => {
    render(<SynSchemaForm schema={textSchema} values={{}} onChange={vi.fn()} />);
    expect(screen.getByText(/Api Key/)).toBeInTheDocument();
    expect(screen.getByText(/Base Url/)).toBeInTheDocument();
  });

  it("shows description text when provided", () => {
    render(<SynSchemaForm schema={textSchema} values={{}} onChange={vi.fn()} />);
    expect(screen.getByText("Your API key")).toBeInTheDocument();
    expect(screen.getByText("Optional base URL")).toBeInTheDocument();
  });

  it("shows placeholder with hint for masked fields", () => {
    render(
      <SynSchemaForm
        schema={textSchema}
        values={{}}
        onChange={vi.fn()}
        hints={{ api_key: "abc4" }}
      />
    );
    const passwordInput = document.querySelector("input[type='password']") as HTMLInputElement;
    expect(passwordInput?.placeholder).toBe("••••abc4");
  });

  it("shows default password placeholder when no hint", () => {
    render(<SynSchemaForm schema={textSchema} values={{}} onChange={vi.fn()} />);
    const passwordInput = document.querySelector("input[type='password']") as HTMLInputElement;
    expect(passwordInput?.placeholder).toBe("••••••••");
  });

  it("calls onChange with correct key and value on input", async () => {
    const onChange = vi.fn();
    render(<SynSchemaForm schema={textSchema} values={{}} onChange={onChange} />);
    const textInput = screen.getByRole("textbox");
    await userEvent.type(textInput, "https://example.com");
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe("base_url");
  });

  it("renders nothing when schema has no properties", () => {
    const onChange = vi.fn();
    const { container } = render(<SynSchemaForm schema={emptySchema} values={{}} onChange={onChange} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBe(0);
  });

  it("renders controlled value in input", () => {
    render(
      <SynSchemaForm
        schema={textSchema}
        values={{ base_url: "https://api.example.com" }}
        onChange={vi.fn()}
      />
    );
    const textInput = screen.getByRole("textbox") as HTMLInputElement;
    expect(textInput.value).toBe("https://api.example.com");
  });

  it("handles schema with no required array", () => {
    const schemaNoRequired = {
      type: "object" as const,
      properties: {
        token: { type: "string" },
      },
    };
    render(<SynSchemaForm schema={schemaNoRequired} values={{}} onChange={vi.fn()} />);
    const asterisk = screen.queryByText("*");
    expect(asterisk).toBeNull();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
