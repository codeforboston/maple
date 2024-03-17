import { Meta, StoryObj } from "@storybook/react"
import { userEvent, within } from "@storybook/testing-library"
import {
  HighContrastButton,
  CustomDropdownButton,
  ToggleButton
} from "components/buttons"
import { Button, Dropdown, SplitButton } from "react-bootstrap"
import { useDropdownToggle } from "react-overlays"
import styled from "styled-components"
import CustomDropdownToggle from "../../components/BootstrapCustomDropdownToggle"

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

export const CustonDropdownToggleButton: Story = {
  render: args => {
    return (
      <div className={`col-12 hstack gap-5 px-lg-5 `}>
        <Dropdown className={`col-4`}>
          <CustomDropdownToggle
            label={"Dropdown Label"}
            variant={"secondary"}
          />
          <Dropdown.Menu className={`col-12 bg-white `}>
            {args.menuItems.map((item: string, index: number) => {
              return <Dropdown.Item key={index}>{item}</Dropdown.Item>
            })}
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown className={`col-4`}>
          <CustomDropdownToggle
            label={"Select Button Base "}
            variant={"outline-secondary"}
          />
          <Dropdown.Menu className={`col-12 bg-white `}>
            {args.menuItems.map((item: string, index: number) => {
              return <Dropdown.Item key={index}>{item}</Dropdown.Item>
            })}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  },
  args: {
    label: "Dropdown",
    variantColor: "secondary",
    menuItems: ["example item", "example item", "example item"]
  }
}

export default meta
