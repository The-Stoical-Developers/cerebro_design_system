import type { Meta, StoryObj } from "@storybook/react";
import { SynBadge } from "../react";

const meta: Meta<typeof SynBadge> = {
  title: "Primitives/Badge",
  component: SynBadge,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
    tone: {
      control: "select",
      options: ["emerald", "cyan", "amber", "red", "violet", "sky", "rose", "indigo", "orange"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SynBadge>;

export const Default: Story = { args: { children: "Badge" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Secondary" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Error" } };
export const Outline: Story = { args: { variant: "outline", children: "Outline" } };
export const Tone: Story = { args: { tone: "cyan", children: "toned" } };
