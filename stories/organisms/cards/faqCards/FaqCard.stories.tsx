import { Meta, StoryObj } from "@storybook/react"
import { FaqCard } from "components/Faq"

const meta: Meta = {
  title: "Organisms/Cards/FaqCards/FaqCard",
  component: FaqCard
}

export default meta

type Story = StoryObj<typeof FaqCard>

export const CardWithMultipleQandAs: Story = {
  args: {
    heading: "Meals",
    qAndAs: [
      {
        question: "What's for lunch?",
        answer: "Pizza!"
      },
      {
        question: "What do we have to drink?",
        answer: "Lemonade"
      },
      {
        disabled: true,
        question: "What's for dessert?",
        answer: "Ice cream"
      }
    ]
  }
}
