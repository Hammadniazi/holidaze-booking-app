import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ErrorState } from "./error-state";

const meta = {
  title: "UI/ErrorState",
  component: ErrorState,
  tags: ["autodocs"],
  args: {
    title: "Couldn't load your venues",
    message: "The server took too long to respond. Check your connection.",
    onRetry: fn(),
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Retrying: Story = { args: { isRetrying: true } };

/** A 404 is an answer, not a failure — so no "Try again" button. */
export const WithoutRetry: Story = {
  args: {
    title: "Venue not found",
    message: "It may have been removed by its manager.",
    onRetry: undefined,
  },
};
