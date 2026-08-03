import type { Meta, StoryObj } from "@storybook/react";
import {
  SynTable,
  SynTableBody,
  SynTableCaption,
  SynTableCell,
  SynTableHead,
  SynTableHeader,
  SynTableRow,
} from "../react";

const meta: Meta<typeof SynTable> = {
  title: "Primitives/Table",
  component: SynTable,
};

export default meta;
type Story = StoryObj<typeof SynTable>;

export const Default: Story = {
  render: () => (
    <SynTable>
      <SynTableCaption>A simple table</SynTableCaption>
      <SynTableHeader>
        <SynTableRow>
          <SynTableHead>Name</SynTableHead>
          <SynTableHead>Role</SynTableHead>
        </SynTableRow>
      </SynTableHeader>
      <SynTableBody>
        <SynTableRow>
          <SynTableCell>Alice</SynTableCell>
          <SynTableCell>Engineer</SynTableCell>
        </SynTableRow>
        <SynTableRow>
          <SynTableCell>Bob</SynTableCell>
          <SynTableCell>Designer</SynTableCell>
        </SynTableRow>
      </SynTableBody>
    </SynTable>
  ),
};
