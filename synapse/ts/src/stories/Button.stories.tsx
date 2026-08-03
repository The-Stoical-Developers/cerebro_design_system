import type { Meta, StoryObj } from "@storybook/react";
import { SynButton } from "../react";

const meta: Meta<typeof SynButton> = {
  title: "Primitives/Button",
  component: SynButton,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "destructive", "outline", "secondary", "ghost", "link", "icon"],
    },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
  },
};

export default meta;
type Story = StoryObj<typeof SynButton>;

export const Default: Story = { args: { children: "Button" } };
export const Primary: Story = { args: { variant: "primary", children: "Primary" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Destructive" } };
export const Outline: Story = { args: { variant: "outline", children: "Outline" } };
export const Small: Story = { args: { size: "sm", children: "Small" } };
export const AsChild: Story = {
  render: () => (
    <SynButton asChild>
      <a href="/">Link button</a>
    </SynButton>
  ),
};
