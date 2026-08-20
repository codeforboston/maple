import type { Meta, StoryObj } from "@storybook/react"
import DidYouKnowSection from "components/homepage/DidYouKnowSection"
import ExplainerSection from "components/homepage/ExplainerSection"
import FeaturesSection from "components/homepage/FeaturesSection"
import { HearingsSectionContent } from "components/homepage/HearingsSection"
import HeroSection from "components/homepage/HeroSection"

const meta: Meta = {
  title: "Organisms/Homepage/Sections"
}

export default meta

type Story = StoryObj

export const Hero: Story = {
  render: () => <HeroSection />
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
