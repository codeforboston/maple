import { Meta, StoryObj } from "@storybook/react"
import AskField from "components/homepage/AskField"
import HeroSearchPanel, {
  HeroSearchPanelProps
} from "components/homepage/HeroSearchPanel"
import styles from "components/homepage/Homepage.module.css"
import TopicChips from "components/homepage/TopicChips"
import ConferenceLinks, {
  ConferenceActions,
  ConferenceTopics
} from "components/homepage/ConferenceLinks"
import { openConferences } from "../../molecules/conferenceSamples"

type Args = Pick<HeroSearchPanelProps, "title" | "description"> & {
  topics: "conferenceTopics" | "conferences" | "chips" | "none"
  search: "link" | "ask" | "none"
}

/* The panel with its slots filled as on the homepage, inside the hero's
   section, which sets the colours it reads. From the Controls panel, the
   topics slot can hold the conference topics (as on the homepage), the
   conference list (sample data), the topic chips, or nothing, and the search
   slot the buttons to the conference committees (as on the homepage), the ask
   field, or nothing. */
const meta: Meta<Args> = {
  title: "Organisms/Homepage/Hero Search Panel",
  component: HeroSearchPanel,
  args: {
    title: "Wrapping up the 194th legislative session...",
    description:
      "The legislative session has come to an end, but some of its laws are still being decided in conference committees. This is where your voice matters right now!",
    topics: "conferenceTopics",
    search: "link"
  },
  argTypes: {
    title: { name: "Title", control: "text" },
    description: { name: "Introduction", control: "text" },
    topics: {
      name: "Topics slot",
      options: ["conferenceTopics", "conferences", "chips", "none"],
      control: {
        type: "inline-radio",
        labels: {
          conferenceTopics: "Conference topics",
          conferences: "Conference Links (list)",
          chips: "Topic Chips",
          none: "Empty"
        }
      }
    },
    search: {
      name: "Search slot",
      options: ["link", "ask", "none"],
      control: {
        type: "inline-radio",
        labels: {
          link: "Learn More and Add Your Input buttons",
          ask: "Ask Field",
          none: "Empty"
        }
      }
    }
  },
  decorators: [
    Story => (
      <section className={styles.heroSection} style={{ padding: "2rem" }}>
        <Story />
      </section>
    )
  ],
  render: ({ title, description, topics, search }) => (
    <HeroSearchPanel
      title={title}
      description={description}
      topics={
        topics === "conferenceTopics" ? (
          <ConferenceTopics />
        ) : topics === "conferences" ? (
          <ConferenceLinks conferences={openConferences} />
        ) : topics === "chips" ? (
          <TopicChips />
        ) : undefined
      }
      search={
        search === "link" ? (
          <ConferenceActions />
        ) : search === "ask" ? (
          <AskField />
        ) : undefined
      }
    />
  )
}

export default meta

export const Default: StoryObj<Args> = {}
