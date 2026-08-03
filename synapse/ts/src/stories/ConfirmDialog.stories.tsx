import type { Meta, StoryObj } from "@storybook/react";
import { SynConfirmDialog } from "../react";

const meta: Meta<typeof SynConfirmDialog> = {
  title: "Components/ConfirmDialog",
  component: SynConfirmDialog,
  args: {
    open: true,
    title: "Delete item?",
    description: "This action cannot be undone.",
    onConfirm: () => {},
    onCancel: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof SynConfirmDialog>;

export const Default: Story = {};
