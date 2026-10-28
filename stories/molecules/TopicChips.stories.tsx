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

export const Default: StoryObj<typeof TopicChips> = {}
