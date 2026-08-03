import type { Meta, StoryObj } from "@storybook/react";
import {
  SynCard,
  SynCardContent,
  SynCardDescription,
  SynCardFooter,
  SynCardHeader,
  SynCardTitle,
} from "../react";

const meta: Meta<typeof SynCard> = {
  title: "Primitives/Card",
  component: SynCard,
};

export default meta;
type Story = StoryObj<typeof SynCard>;

export const Default: Story = {
  render: () => (
    <SynCard className="w-80">
      <SynCardHeader>
        <SynCardTitle>Card title</SynCardTitle>
        <SynCardDescription>Card description goes here.</SynCardDescription>
      </SynCardHeader>
      <SynCardContent>
        <p className="text-sm text-text-2">Main card content.</p>
      </SynCardContent>
      <SynCardFooter>
        <span className="text-xs text-text-3">Footer</span>
      </SynCardFooter>
    </SynCard>
  ),
};
