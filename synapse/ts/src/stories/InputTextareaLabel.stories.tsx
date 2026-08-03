import type { Meta, StoryObj } from "@storybook/react";
import { SynInput, SynLabel, SynTextarea } from "../react";

const inputMeta: Meta<typeof SynInput> = {
  title: "Primitives/Input",
  component: SynInput,
};
export const InputStory: StoryObj<typeof SynInput> = {
  render: () => (
    <div className="space-y-2">
      <SynLabel htmlFor="demo-input">Email</SynLabel>
      <SynInput id="demo-input" type="email" placeholder="you@example.com" />
    </div>
  ),
};
InputStory.storyName = "Input";

const textareaMeta: Meta<typeof SynTextarea> = {
  title: "Primitives/Textarea",
  component: SynTextarea,
};
export const TextareaStory: StoryObj<typeof SynTextarea> = {
  args: { placeholder: "Type something…", rows: 4 },
};
TextareaStory.storyName = "Textarea";

export default inputMeta;
