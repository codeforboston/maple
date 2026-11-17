import { Meta, StoryObj } from "@storybook/react"
import styles from "components/homepage/Homepage.module.css"
import NewFeaturesCard from "components/homepage/NewFeaturesCard"

/* Inside the hero's section, which sets the colours the card reads, at the
   hero panel's 42rem (Homepage.module.css). That width suits these two
   features; with different or more features, the panel's width may need to
   change to fit them. */
const meta: Meta<typeof NewFeaturesCard> = {
  title: "Molecules/New Features Card",
  component: NewFeaturesCard,
  args: { className: styles.heroTopics },
  decorators: [
    Story => (
      <section className={styles.heroSection} style={{ padding: "2rem" }}>
        <div style={{ maxWidth: "42rem" }}>
          <Story />
        </div>
      </section>
    )
  ]
}

export default meta

export const Default: StoryObj<typeof NewFeaturesCard> = {}
