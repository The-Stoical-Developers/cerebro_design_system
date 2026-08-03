import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SynSchemaForm } from "../react";

const meta: Meta<typeof SynSchemaForm> = {
  title: "Components/SchemaForm",
  component: SynSchemaForm,
};

export default meta;
type Story = StoryObj<typeof SynSchemaForm>;

const schema = {
  type: "object" as const,
  required: ["api_key"],
  properties: {
    api_key: { type: "string", format: "password", description: "Your API key" },
    base_url: { type: "string", description: "Optional base URL" },
  },
};

export const Default: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, string>>({});
    return (
      <SynSchemaForm
        schema={schema}
        values={values}
        onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
      />
    );
  },
};
