import type { Meta, StoryObj } from "@storybook/react";
import { SynStatusDot } from "../react";

const meta: Meta<typeof SynStatusDot> = {
  title: "Primitives/StatusDot",
  component: SynStatusDot,
  argTypes: {
    status: {
      control: "select",
      options: ["idle", "queued", "running", "done", "error"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SynStatusDot>;

export const Default: Story = { args: { status: "running" } };
export const Done: Story = { args: { status: "done" } };
export const Error: Story = { args: { status: "error" } };
