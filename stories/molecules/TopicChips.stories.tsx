import { Meta, StoryObj } from "@storybook/react"
import styles from "components/homepage/Homepage.module.css"
import TopicChips from "components/homepage/TopicChips"

/* Inside the hero's section, which sets the colours the chips read. */
const meta: Meta<typeof TopicChips> = {
  title: "Molecules/Topic Chips",
  component: TopicChips,
  decorators: [
    Story => (
      <section className={styles.heroSection} style={{ padding: "2rem" }}>
        <Story />
      </section>
    )
  ]
}

export default meta

type Story = StoryObj<typeof TopicChips>

export const Default: Story = {}

/* The circles alone, in the hero panel's 24rem, each naming itself in a
   tooltip. */
export const Circles: Story = {
  args: { variant: "circles" },
  decorators: [
    Story => (
      <div className={styles.heroTopics} style={{ width: "24rem" }}>
        <Story />
      </div>
    )
  ]
}
