import type { Meta, StoryObj } from "@storybook/react";
import { SynAppShell, SynBreadcrumb, SynSidebarNav, SynTopbar, SynIcons } from "../react";

const meta: Meta<typeof SynAppShell> = {
  title: "Shell/AppShell",
  component: SynAppShell,
};

export default meta;
type Story = StoryObj<typeof SynAppShell>;

const groups = [
  {
    label: "Operate",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <SynIcons.IconDashboard /> },
      { label: "Tasks", href: "/tasks", icon: <SynIcons.IconTasks /> },
    ],
  },
];

export const Default: Story = {
  render: () => (
    <div className="h-screen overflow-hidden">
      <SynAppShell
        sidebar={<SynSidebarNav groups={groups} currentPath="/dashboard" brandName="Synapse" />}
        topbar={
          <SynTopbar
            onSearch={() => {}}
            indicator={<span className="text-xs font-mono text-body">ready</span>}
          />
        }
      >
        <SynBreadcrumb pathname="/dashboard" />
        <div className="p-6">
          <h1 className="text-2xl font-semibold">Page content</h1>
        </div>
      </SynAppShell>
    </div>
  ),
};
