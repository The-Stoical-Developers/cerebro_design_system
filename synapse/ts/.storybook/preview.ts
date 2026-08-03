import type { Preview } from "@storybook/react";
import "./preview.css";
import "../src/generated/css/synapse_theme.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "var(--color-bg)" },
        { name: "dark", value: "var(--color-bg)" },
      ],
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
