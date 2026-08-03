import type { Meta, StoryObj } from "@storybook/react";
import { SynTopbar } from "../react";

const meta: Meta<typeof SynTopbar> = {
  title: "Shell/Topbar",
  component: SynTopbar,
};

export default meta;
type Story = StoryObj<typeof SynTopbar>;

export const Default: Story = {
  render: () => (
    <SynTopbar
      onSearch={() => {}}
      indicator={
        <div className="flex items-center gap-1.5 text-xs text-body dark:text-bodydark font-mono">
          <span className="w-2 h-2 rounded-full bg-success inline-block" />
          <span>api.ready</span>
        </div>
      }
    />
  ),
};
