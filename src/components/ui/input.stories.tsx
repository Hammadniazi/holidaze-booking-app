import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "you@stud.noroff.no",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    defaultValue: "someone@gmail.com",
    error: "Use your stud.noroff.no email address",
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "you@stud.noroff.no" },
};
