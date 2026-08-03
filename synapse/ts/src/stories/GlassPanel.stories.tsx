import type { Meta, StoryObj } from "@storybook/react";
import { SynGlassPanel } from "../react";

const meta: Meta<typeof SynGlassPanel> = {
  title: "Primitives/GlassPanel",
  component: SynGlassPanel,
  argTypes: {
    soft: { control: "boolean" },
    tone: {
      control: "select",
      options: ["emerald", "cyan", "amber", "red", "violet", "sky", "rose", "indigo", "orange"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SynGlassPanel>;

export const Default: Story = {
  render: () => (
    <SynGlassPanel className="p-6">
      <p className="text-sm">A frosted glass panel.</p>
    </SynGlassPanel>
  ),
};
