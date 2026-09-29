import type { Preview } from "@storybook/react-vite";
import "../src/index.css";

const preview: Preview = {
  // A toolbar switch for the app's `.dark` class, so every story can be
  // checked against both sets of tokens without leaving Storybook.
  globalTypes: {
    theme: {
      description: "Colour theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      document.documentElement.classList.toggle(
        "dark",
        context.globals.theme === "dark",
      );
      return (
        <div className="bg-(--color-background) p-6 font-body text-(--color-foreground)">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' shows violations in the Accessibility panel without failing.
      test: "todo",
    },
  },
};

export default preview;
