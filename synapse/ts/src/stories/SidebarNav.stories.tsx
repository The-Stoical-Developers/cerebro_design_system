import type { Meta, StoryObj } from "@storybook/react";
import { SynSidebarNav, SynIcons } from "../react";

const meta: Meta<typeof SynSidebarNav> = {
  title: "Shell/SidebarNav",
  component: SynSidebarNav,
};

export default meta;
type Story = StoryObj<typeof SynSidebarNav>;

const groups = [
  {
    label: "Operate",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <SynIcons.IconDashboard /> },
      { label: "Tasks", href: "/tasks", icon: <SynIcons.IconTasks /> },
    ],
  },
  {
    label: "Configure",
    items: [
      { label: "Agents", href: "/agents", icon: <SynIcons.IconAgents /> },
      { label: "Tools", href: "/tools", icon: <SynIcons.IconTools /> },
    ],
  },
];

export const Default: Story = {
  render: () => (
    <div className="relative h-96">
      <SynSidebarNav groups={groups} currentPath="/agents" brandName="Synapse" />
    </div>
  ),
};
