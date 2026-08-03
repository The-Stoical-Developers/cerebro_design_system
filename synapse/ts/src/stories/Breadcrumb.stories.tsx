import type { Meta, StoryObj } from "@storybook/react";
import { SynBreadcrumb } from "../react";

const meta: Meta<typeof SynBreadcrumb> = {
  title: "Shell/Breadcrumb",
  component: SynBreadcrumb,
};

export default meta;
type Story = StoryObj<typeof SynBreadcrumb>;

export const Default: Story = {
  args: {
    pathname: "/agents/new",
    labels: { "mcp-servers": "MCP Servers" },
  },
};
