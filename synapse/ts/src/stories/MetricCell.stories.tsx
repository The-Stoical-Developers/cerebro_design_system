import type { Meta, StoryObj } from "@storybook/react";
import { SynMetricCell } from "../react";

const meta: Meta<typeof SynMetricCell> = {
  title: "Primitives/MetricCell",
  component: SynMetricCell,
  argTypes: {
    tone: {
      control: "select",
      options: ["emerald", "cyan", "amber", "red", "violet", "sky", "rose", "indigo", "orange"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SynMetricCell>;

export const Default: Story = { args: { label: "Revenue", value: "$12k" } };
export const Toned: Story = { args: { label: "Errors", value: "3", tone: "red" } };
