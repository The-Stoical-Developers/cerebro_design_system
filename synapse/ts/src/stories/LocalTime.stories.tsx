import type { Meta, StoryObj } from "@storybook/react";
import { SynLocalDate, SynLocalTime, SynRelativeTime } from "../react";

const meta: Meta<typeof SynLocalTime> = {
  title: "Components/LocalTime",
  component: SynLocalTime,
};

export default meta;
type Story = StoryObj<typeof SynLocalTime>;

const iso = "2026-08-02T12:00:00Z";

export const Time: Story = { render: () => <SynLocalTime iso={iso} /> };
export const DateStory: Story = { render: () => <SynLocalDate iso={iso} /> };
DateStory.storyName = "Date";
export const Relative: Story = { render: () => <SynRelativeTime iso={iso} /> };
