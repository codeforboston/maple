import { Meta, StoryObj } from "@storybook/react"
import { userEvent, within } from "@storybook/testing-library"
import { EditProfileButton } from "components/ProfilePage/ProfileButtons"
import {
  GearButton,
  HighContrastButton,
  ToggleButton
} from "components/buttons"
import { Button, Col } from "react-bootstrap"
import styled from "styled-components"

const BaseButton = styled(Button)``

const meta: Meta = {
  title: "Atoms/BaseButton",
  component: BaseButton
}

type Story = StoryObj<typeof BaseButton>

export const Primary: Story = {
  args: {
    children: "Button",
    variant: "secondary"
  },
  name: "Button"
}

export const HoveredButton: Story = {
  ...Primary,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.hover(canvas.getByRole("button"))
  }
}

export const ClickedButton: Story = {
  ...Primary,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button"))
  }
}

export const EditButton: Story = {
  decorators: [
    Story => (
      <div className={`w-25 p-5 border border-warning rounded-4`}>
        <Col
          className={`d-flex flex-column justify-content-center align-items-center gap-2`}
        >
          <Story />
        </Col>
      </div>
    )
  ],
  render: () => {
    return (
      <>
        <GearButton
          variant="outline-secondary"
          size="lg"
          className={`py-1`}
          disabled={false}
          onClick={() => console.log("gear")}
        >
          Settings
        </GearButton>
        <EditProfileButton />
      </>
    )
  },
  name: "Edit Profile Button"
}

export const ContrastButtons: Story = {
  render: args => {
    return (
      <div className={`d-flex gap-3`}>
        <HighContrastButton
          state={true}
          baseFill="outline"
          label="True base outline"
        />
        <HighContrastButton state={false} label="False basefill " />
        <ToggleButton
          size={"sm"}
          className={`btn-sm`}
          toggleState={true}
          stateTrueLabel={"Toggle state true"}
          stateFalseLabel={"Toggle state false"}
          onClick={() => console.log("toggle")}
        />
        <ToggleButton
          size={"sm"}
          className={`btn-sm`}
          toggleState={false}
          stateTrueLabel={"Toggle state true"}
          stateFalseLabel={"Toggle state false"}
          onClick={() => console.log("toggle")}
        />
      </div>
    )
  }
}

export default meta
