import type { StorybookConfig } from "@storybook/react-vite";

// Storybook reuses vite.config.ts, so the `@` alias, the React Compiler and
// the Tailwind plugin all apply to stories exactly as they do to the app.
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],
  framework: "@storybook/react-vite",
};

export default config;
