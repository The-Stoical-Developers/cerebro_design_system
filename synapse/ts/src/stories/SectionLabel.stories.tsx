import type { Meta, StoryObj } from "@storybook/react";
import { SynSectionLabel } from "../react";

const meta: Meta<typeof SynSectionLabel> = {
  title: "Primitives/SectionLabel",
  component: SynSectionLabel,
};

export default meta;
type Story = StoryObj<typeof SynSectionLabel>;

export const Default: Story = { args: { children: "Section title" } };
