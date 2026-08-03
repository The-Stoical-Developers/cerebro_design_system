import type { Meta, StoryObj } from "@storybook/react";
import { SynDataTable, type ColumnDef } from "../react";

type Row = { id: string; name: string; role: string; status: string };

const meta: Meta<typeof SynDataTable<Row>> = {
  title: "Components/DataTable",
  component: SynDataTable,
};

export default meta;
type Story = StoryObj<typeof SynDataTable<Row>>;

const rows: Row[] = [
  { id: "1", name: "Alice", role: "Engineer", status: "active" },
  { id: "2", name: "Bob", role: "Designer", status: "away" },
];

const columns: ColumnDef<Row>[] = [
  { key: "name", header: "Name", accessor: (r) => r.name, sortable: true },
  { key: "role", header: "Role", accessor: (r) => r.role },
  { key: "status", header: "Status", accessor: (r) => r.status },
];

export const Default: Story = {
  render: () => (
    <SynDataTable<Row>
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
    />
  ),
};
