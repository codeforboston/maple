import { Meta, StoryObj } from "@storybook/react"
import AboutTestimony from "components/learn/Testimony/AboutTestimony"
import LearnHub from "components/learn/Hub/LearnHub"
import WritingTips from "components/learn/Testimony/WritingTips"

/* Real Learn pages, each built on the shared Learn layout and header
   (components/learn/LearnLayout.tsx, LearnHeader.tsx), with their own copy.
   Use the Skin menu in the toolbar to compare them: Maple's blue-grey ground,
   Digital Democracy's middle grey with darker borders, Mixed's blue-grey. The
   navbar is not part of these. */
const meta: Meta = {
  title: "Pages/Learn",
  parameters: { layout: "fullscreen" }
}

export default meta

type Story = StoryObj

export const Hub: Story = {
  name: "Learn Hub",
  render: () => <LearnHub />
}

export const HowTestimonyWorks: Story = {
  name: "How Testimony Works",
  render: () => <AboutTestimony />
}

export const WritingTestimony: Story = {
  name: "How to Write Effective Testimony",
  render: () => <WritingTips />
}
