import { Meta, StoryObj } from "@storybook/react"
import { userEvent, within } from "@storybook/testing-library"
import { HighContrastButton, ToggleButton } from "components/buttons"
import { Button } from "react-bootstrap"
import styled from "styled-components"

const BaseButton = styled(Button)``

const meta: Meta = {
  title: "Atoms/Buttons/Base Button",
  component: BaseButton
}

export type Story = StoryObj<typeof BaseButton>

export const Primary: Story = {
  args: {
    children: "Button",
    variant: "secondary"
  },
  name: "Base Button"
}

export const HighContrastButtonBase: Story = {
  render: args => {
    return (
      <div className={`col-3 m-5`}>
        <p>Hover and click to see hover and active states</p>
        <p>Use controls panel to view variants & outline variants</p>
        <HighContrastButton variant={args.variant} label={`${args.variant}`} />
      </div>
    )
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: [
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "dark",
        "outline-primary",
        "outline-secondary",
        "outline-success",
        "outline-danger",
        "outline-warning",
        "outline-info",
        "outline-dark"
      ]
    }
  },
  args: {
    variant: "secondary"
  }
}

export const HighContrastToggleButton: Story = {
  render: args => {
    return (
      <div className={`col-3 m-5`}>
        <p>Hover and click to see hover and active states</p>
        <p>Use controls panel to view variants & toggle states</p>
        <ToggleButton
          variant={args.variant}
          toggleState={args.toggleState}
          stateTrueLabel={"Toggle state true"}
          stateFalseLabel={"Toggle state false"}
          onClick={() => console.log("toggle")}
        />
      </div>
    )
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: [
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "dark",
        "outline-primary",
        "outline-secondary",
        "outline-success",
        "outline-danger",
        "outline-warning",
        "outline-info",
        "outline-dark"
      ]
    }
  },
  args: {
    toggleState: true,
    variant: "secondary"
  }
}

export default meta
