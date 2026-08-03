import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SynJsonEditor } from "../react";

const meta: Meta<typeof SynJsonEditor> = {
  title: "Components/JsonEditor",
  component: SynJsonEditor,
};

export default meta;
type Story = StoryObj<typeof SynJsonEditor>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('{"hello":"world"}');
    return <SynJsonEditor value={value} onChange={setValue} />;
  },
};

export const WithError: Story = {
  render: () => <SynJsonEditor value="{" onChange={() => {}} error="Invalid JSON" />,
};
