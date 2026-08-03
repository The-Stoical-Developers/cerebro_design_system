import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SynCard,
  SynCardHeader,
  SynCardTitle,
  SynCardDescription,
  SynCardContent,
  SynCardFooter,
  SynInput,
  SynLabel,
  SynTextarea,
  SynTable,
  SynTableHeader,
  SynTableBody,
  SynTableFooter,
  SynTableRow,
  SynTableHead,
  SynTableCell,
  SynTableCaption,
} from "../../react";

describe("SynCard", () => {
  it("renders children", () => {
    render(
      <SynCard>
        <SynCardContent>hello</SynCardContent>
      </SynCard>
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders CardHeader and CardTitle", () => {
    render(
      <SynCard>
        <SynCardHeader>
          <SynCardTitle>My Card</SynCardTitle>
        </SynCardHeader>
      </SynCard>
    );
    expect(screen.getByText("My Card")).toBeInTheDocument();
  });

  it("renders CardDescription", () => {
    render(
      <SynCard>
        <SynCardHeader>
          <SynCardDescription>My description</SynCardDescription>
        </SynCardHeader>
      </SynCard>
    );
    expect(screen.getByText("My description")).toBeInTheDocument();
  });

  it("renders CardFooter", () => {
    render(
      <SynCard>
        <SynCardFooter>footer content</SynCardFooter>
      </SynCard>
    );
    expect(screen.getByText("footer content")).toBeInTheDocument();
  });

  it("applies custom className to Card", () => {
    render(<SynCard className="custom-card" data-testid="card" />);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("custom-card");
  });

  it("applies custom className to all Card subcomponents", () => {
    render(
      <SynCard data-testid="card" className="c-card">
        <SynCardHeader data-testid="header" className="c-header">
          <SynCardTitle data-testid="title" className="c-title">
            Title
          </SynCardTitle>
          <SynCardDescription data-testid="desc" className="c-desc">
            Desc
          </SynCardDescription>
        </SynCardHeader>
        <SynCardContent data-testid="content" className="c-content">
          Content
        </SynCardContent>
        <SynCardFooter data-testid="footer" className="c-footer">
          Footer
        </SynCardFooter>
      </SynCard>
    );
    expect(screen.getByTestId("card").className).toContain("c-card");
    expect(screen.getByTestId("header").className).toContain("c-header");
    expect(screen.getByTestId("title").className).toContain("c-title");
    expect(screen.getByTestId("desc").className).toContain("c-desc");
    expect(screen.getByTestId("content").className).toContain("c-content");
    expect(screen.getByTestId("footer").className).toContain("c-footer");
  });
});

describe("SynInput", () => {
  it("renders input element", () => {
    render(<SynInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("supports type prop", () => {
    render(<SynInput type="email" placeholder="email" />);
    const input = screen.getByPlaceholderText("email") as HTMLInputElement;
    expect(input.type).toBe("email");
  });

  it("applies custom className", () => {
    render(<SynInput className="my-input" placeholder="x" />);
    const input = screen.getByPlaceholderText("x");
    expect(input.className).toContain("my-input");
  });

  it("forwards ref to input element", () => {
    let ref: HTMLInputElement | null = null;
    render(
      <SynInput
        ref={(node) => {
          ref = node;
        }}
        placeholder="ref-test"
      />
    );
    expect(ref).not.toBeNull();
    expect(ref!.tagName).toBe("INPUT");
  });
});

describe("SynLabel", () => {
  it("renders label text", () => {
    render(<SynLabel>My Label</SynLabel>);
    expect(screen.getByText("My Label")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<SynLabel className="my-label">Hello</SynLabel>);
    const label = screen.getByText("Hello");
    expect(label.className).toContain("my-label");
  });

  it("associates with htmlFor", () => {
    render(<SynLabel htmlFor="target">Field</SynLabel>);
    const label = screen.getByText("Field");
    expect(label).toHaveAttribute("for", "target");
  });
});

describe("SynTextarea", () => {
  it("renders textarea", () => {
    render(<SynTextarea placeholder="Write here" />);
    expect(screen.getByPlaceholderText("Write here")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<SynTextarea className="my-ta" placeholder="x" />);
    const ta = screen.getByPlaceholderText("x");
    expect(ta.className).toContain("my-ta");
  });

  it("forwards ref to textarea element", () => {
    let ref: HTMLTextAreaElement | null = null;
    render(
      <SynTextarea
        ref={(node) => {
          ref = node;
        }}
        placeholder="ref-test"
      />
    );
    expect(ref).not.toBeNull();
    expect(ref!.tagName).toBe("TEXTAREA");
  });
});

describe("SynTable", () => {
  it("renders table structure", () => {
    render(
      <SynTable>
        <SynTableHeader>
          <SynTableRow>
            <SynTableHead>Name</SynTableHead>
          </SynTableRow>
        </SynTableHeader>
        <SynTableBody>
          <SynTableRow>
            <SynTableCell>Row 1</SynTableCell>
          </SynTableRow>
        </SynTableBody>
      </SynTable>
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Row 1")).toBeInTheDocument();
  });

  it("renders TableFooter and TableCaption", () => {
    render(
      <SynTable>
        <SynTableCaption>Data table</SynTableCaption>
        <SynTableBody>
          <SynTableRow>
            <SynTableCell>A</SynTableCell>
          </SynTableRow>
        </SynTableBody>
        <SynTableFooter>
          <SynTableRow>
            <SynTableCell>Total</SynTableCell>
          </SynTableRow>
        </SynTableFooter>
      </SynTable>
    );
    expect(screen.getByText("Data table")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("applies custom className to all table parts", () => {
    render(
      <SynTable className="t-table" data-testid="table">
        <SynTableCaption className="t-caption" data-testid="caption">
          Cap
        </SynTableCaption>
        <SynTableHeader className="t-head" data-testid="thead">
          <SynTableRow className="t-row-head" data-testid="row-head">
            <SynTableHead className="t-th" data-testid="th">
              H
            </SynTableHead>
          </SynTableRow>
        </SynTableHeader>
        <SynTableBody className="t-body" data-testid="tbody">
          <SynTableRow className="t-row" data-testid="row">
            <SynTableCell className="t-cell" data-testid="cell">
              C
            </SynTableCell>
          </SynTableRow>
        </SynTableBody>
        <SynTableFooter className="t-foot" data-testid="tfoot">
          <SynTableRow>
            <SynTableCell>F</SynTableCell>
          </SynTableRow>
        </SynTableFooter>
      </SynTable>
    );
    expect(screen.getByTestId("table").className).toContain("t-table");
    expect(screen.getByTestId("caption").className).toContain("t-caption");
    expect(screen.getByTestId("thead").className).toContain("t-head");
    expect(screen.getByTestId("row-head").className).toContain("t-row-head");
    expect(screen.getByTestId("th").className).toContain("t-th");
    expect(screen.getByTestId("tbody").className).toContain("t-body");
    expect(screen.getByTestId("row").className).toContain("t-row");
    expect(screen.getByTestId("cell").className).toContain("t-cell");
    expect(screen.getByTestId("tfoot").className).toContain("t-foot");
  });
});
