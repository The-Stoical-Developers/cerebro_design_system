import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SynBreadcrumb } from "../../react";

describe("SynBreadcrumb", () => {
  it("renders Home link always", () => {
    render(<SynBreadcrumb pathname="/" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders breadcrumb for /agents", () => {
    render(<SynBreadcrumb pathname="/agents" />);
    expect(screen.getByText("Agents")).toBeInTheDocument();
  });

  it("renders multi-segment path /agents/new", () => {
    render(<SynBreadcrumb pathname="/agents/new" />);
    expect(screen.getByText("Agents")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("capitalizes unknown segments", () => {
    render(<SynBreadcrumb pathname="/somepage" />);
    expect(screen.getByText("Somepage")).toBeInTheDocument();
  });

  it("renders known label for mcp-servers segment", () => {
    render(<SynBreadcrumb pathname="/mcp-servers" labels={{ "mcp-servers": "MCP Servers" }} />);
    expect(screen.getByText("MCP Servers")).toBeInTheDocument();
  });

  it("renders Home as a link to /", () => {
    render(<SynBreadcrumb pathname="/agents" />);
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("Home link has hover-color Tailwind classes applied", () => {
    render(<SynBreadcrumb pathname="/agents" />);
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink.className).toContain("hover:text-text-1");
  });

  it("intermediate segment link has hover-color Tailwind classes applied", () => {
    render(<SynBreadcrumb pathname="/agents/new" />);
    const link = screen.getByRole("link", { name: "Agents" });
    expect(link.className).toContain("hover:text-text-1");
  });
});
