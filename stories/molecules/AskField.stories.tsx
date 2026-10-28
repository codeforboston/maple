import { Meta, StoryObj } from "@storybook/react"
import AskField from "components/homepage/AskField"
import styles from "components/homepage/Homepage.module.css"

/* Inside the hero's section, which sets the colours the field reads. Click
   the field to see the suggestions. */
const meta: Meta<typeof AskField> = {
  title: "Molecules/Ask Field",
  component: AskField,
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

export const Default: StoryObj<typeof AskField> = {}
