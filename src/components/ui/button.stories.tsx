import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Search } from "lucide-react";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Confirm booking", onClick: fn() },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "accent",
        "secondary",
        "outline",
        "ghost",
        "link",
        "destructive",
      ],
    },
    size: { control: "inline-radio", options: ["sm", "default", "lg", "icon"] },
    asChild: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Accent: Story = { args: { variant: "accent" } };

export const Loading: Story = { args: { variant: "accent", isLoading: true } };

export const Disabled: Story = { args: { disabled: true } };

export const WithIcon: Story = {
  args: {
    variant: "accent",
    children: (
      <>
        <Search className="h-4 w-4" aria-hidden="true" />
        Search
      </>
    ),
  },
};

/** Every variant side by side — the view Storybook is best at. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {(
        [
          "default",
          "accent",
          "secondary",
          "outline",
          "ghost",
          "link",
          "destructive",
        ] as const
      ).map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};
