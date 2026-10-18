import type { Meta, StoryObj } from "@storybook/react"
import DidYouKnowSection from "components/homepage/DidYouKnowSection"
import ExplainerSection from "components/homepage/ExplainerSection"
import FeaturesSection from "components/homepage/FeaturesSection"
import { HearingsSectionContent } from "components/homepage/HearingsSection"
import HeroSection, { HeroSectionProps } from "components/homepage/HeroSection"
import LegacyHeroSection from "components/homepage/legacy/LegacyHeroSection"
import TopicsSection from "components/homepage/TopicsSection"

const meta: Meta = {
  title: "Organisms/Homepage/Sections"
}

export default meta

type Story = StoryObj

/* Each block can be toggled from the Controls panel, and the Skin menu in the
   toolbar switches between the two looks. The defaults match the homepage. */
export const Hero: StoryObj<HeroSectionProps & { version: "new" | "old" }> = {
  args: {
    version: "new",
    showBody: false,
    showActions: false,
    showAsk: true
  },
  argTypes: {
    version: {
      name: "Version",
      description:
        "Old is the hero as it is on main, before the redesign; the other settings only apply to the new one.",
      options: ["new", "old"],
      control: {
        type: "inline-radio",
        labels: { new: "New", old: "Old (main)" }
      }
    }
  },
  render: ({ version, ...args }) =>
    version === "old" ? <LegacyHeroSection /> : <HeroSection {...args} />
}

export const Topics: Story = {
  render: () => <TopicsSection />
}

export const DidYouKnow: Story = {
  render: () => <DidYouKnowSection />
}

export const Explainer: Story = {
  render: () => <ExplainerSection />
}

export const Features: Story = {
  render: () => <FeaturesSection />
}

export const Hearings: Story = {
  render: () => (
    <HearingsSectionContent
      loading={false}
      upcomingHearings={[
        {
          type: "hearing",
          id: 1,
          month: "APR",
          date: "29",
          location: "Gardner Auditorium",
          name: "Joint Committee on State Administration and Regulatory Oversight"
        },
        {
          type: "hearing",
          id: 2,
          month: "MAY",
          date: "02",
          location: "Room A-2",
          name: "Joint Committee on Consumer Protection and Professional Licensure"
        },
        {
          type: "hearing",
          id: 3,
          month: "MAY",
          date: "07",
          location: "Virtual Hearing",
          name: "Joint Committee on Environment and Natural Resources"
        },
        {
          type: "hearing",
          id: 4,
          month: "MAY",
          date: "12",
          location: "Room B-1",
          name: "Joint Committee on Public Health"
        }
      ]}
    />
  )
}

export const HearingsLoading: Story = {
  render: () => <HearingsSectionContent loading upcomingHearings={[]} />
}
