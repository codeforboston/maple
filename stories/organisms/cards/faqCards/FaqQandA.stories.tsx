import { Meta, StoryObj } from "@storybook/react"
import { FaqQandAButton } from "components/Faq"

const meta: Meta = {
  title: "Organisms/Cards/FaqCards/FaqQandAButton",
  component: FaqQandAButton
}

export default meta

type Story = StoryObj<typeof FaqQandAButton>

export const BasicQuestionAndAnswerToggleButton: Story = {
  args: {
    question: "What's for dinner?",
    answer: "Pizza!"
  }
}
