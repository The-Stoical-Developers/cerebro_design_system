import type { Meta, StoryObj } from "@storybook/react";
import { SynSpinner } from "../react";

const meta: Meta<typeof SynSpinner> = {
  title: "Primitives/Spinner",
  component: SynSpinner,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof SynSpinner>;

export const Default: Story = { args: { size: "md" } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
