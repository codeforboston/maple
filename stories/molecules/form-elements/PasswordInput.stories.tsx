import type { Meta, StoryObj } from "@storybook/react"
import PasswordInput from "components/forms/PasswordInput"

const meta: Meta = {
  component: PasswordInput,
  title: "Molecules/PasswordInput"
}

type Story = StoryObj<typeof PasswordInput>

export const Primary: Story = {
  args: {
    label: "PasswordInput"
  },
  name: "PasswordInput"
}

export const PasswordInputWithError: Story = {
  args: {
    ...Primary.args,
    error: "Error message"
  },
  name: "PasswordInput with error"
}

export default meta
