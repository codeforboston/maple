import { Meta, StoryObj } from "@storybook/react"
import ConferenceLinks from "components/homepage/ConferenceLinks"
import styles from "components/homepage/Homepage.module.css"
import { openConferences } from "./conferenceSamples"

/* Inside the hero's section, which sets the colours the links read. */
const meta: Meta<typeof ConferenceLinks> = {
  title: "Molecules/Conference Links",
  component: ConferenceLinks,
  args: { conferences: openConferences, limit: 6 },
  argTypes: {
    conferences: { control: false },
    limit: { name: "Shown before See all", control: { type: "number" } }
  },
  decorators: [
    Story => (
      <section className={styles.heroSection} style={{ padding: "2rem" }}>
        <div style={{ maxWidth: "38rem" }}>
          <Story />
        </div>
      </section>
    )
  ]
}

export default meta

export const Default: StoryObj<typeof ConferenceLinks> = {}
