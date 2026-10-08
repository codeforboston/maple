import { Meta, StoryObj } from "@storybook/react"
import { PageArt } from "components/shared/PageArt"
import styled from "styled-components"

/** Each explorer's own illustration, for the src slot. */
const ICONS = {
  Bills: "/Legislation + Mag Glass.svg",
  "Bills (lightbulb, flipped)": "/Leg + Lightbulb-alt-flip.svg",
  Testimony: "/testimony-panel-empty 1.svg",
  "Ballot questions": "/Mail with Blob.svg",
  Hearings: "/statehouse.svg"
}

const meta: Meta<typeof PageArt> = {
  title: "Molecules/Page Art",
  component: PageArt,
  parameters: {
    docs: {
      description: {
        component:
          "Shows only in the Digital Democracy and Mixed skins, with Explorer art on (both in the toolbar), at 992px and wider."
      }
    }
  },
  argTypes: {
    src: {
      name: "Icon",
      options: Object.keys(ICONS),
      mapping: ICONS,
      control: { type: "select" }
    },
    leftSrc: {
      name: "Left icon",
      options: ["Same as right", ...Object.keys(ICONS)],
      mapping: { "Same as right": undefined, ...ICONS },
      control: { type: "select" }
    }
  },
  args: { src: "Bills", upright: false },
  render: args => (
    <Stage>
      <Column>
        <PageArt {...args} />
        <h1>Browse Bills</h1>
        <Box>
          <input className="form-control" placeholder="Search For Bills" />
        </Box>
      </Column>
    </Stage>
  )
}

export default meta

type Story = StoryObj<typeof PageArt>

export const Bills: Story = {
  args: { leftSrc: "Bills (lightbulb, flipped)" }
}

export const Testimony: Story = {
  args: { src: "Testimony" }
}

export const BallotQuestions: Story = {
  args: { src: "Ballot questions" }
}

/* A stand-in for an explorer page: a title and search box in a column, with
   room either side for the pair, as the page leaves. */
const Stage = styled.div`
  padding: 3rem 12rem;
`

const Column = styled.div`
  position: relative;

  h1 {
    margin-bottom: 1.5rem;
  }
`

const Box = styled.div`
  background: white;
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--bs-border-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  padding: var(--maple-space-lg);
`
