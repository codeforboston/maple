import type { Meta, StoryObj } from "@storybook/react"
import Input from "components/forms/Input"

const meta: Meta = {
  component: Input,
  title: "Molecules/Input"
}

type Story = StoryObj<typeof Input>

export const Primary: Story = {
  args: {
    label: "Input"
  },
  name: "Input"
}

export const InputWithError: Story = {
  args: {
    ...Primary.args,
    error: "Error message"
  },
  name: "Input with error"
}

export default meta
