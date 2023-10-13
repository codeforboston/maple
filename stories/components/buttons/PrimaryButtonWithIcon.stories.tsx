import { createMeta } from "stories/utils"
import Image from "react-bootstrap/Image"

// TODO: move into components directory
import {
  PrimaryButtonWithIcon,
  PrimaryButtonWithIconProps
} from "./PrimaryButtonWithIcon"
import { ComponentStory } from "@storybook/react"
import { Stack } from "react-bootstrap"

const Icon = () => <Image src="star.svg" alt="" className="m-auto" />

export default createMeta({
  title: "Components/Buttons/PrimaryButtonWithIcon",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=245%3A14373",
  component: PrimaryButtonWithIcon,
  parameters: {
    background: "light"
  },
  args: {
    iconPosition: "left",
    label: "Label",
    onClick: () => {}
  }
})

const Template = (args: PrimaryButtonWithIconProps) => (
  <PrimaryButtonWithIcon {...args} />
)

export const Primary: ComponentStory<typeof PrimaryButtonWithIcon> =
  Template.bind({})

Primary.args = {
  variant: "primary",
  Icon: <Icon />,
  disabled: false
}

export const Secondary: ComponentStory<typeof PrimaryButtonWithIcon> =
  Template.bind({})

Secondary.args = {
  variant: "outline-secondary",
  disabled: false,
  Icon: <Icon />
}

export const Tertiary: ComponentStory<typeof PrimaryButtonWithIcon> =
  Template.bind({})

Tertiary.args = {
  variant: "none",
  disabled: false,
  Icon: <Icon />
}

export const ButtonStack = (args: PrimaryButtonWithIconProps) => {
  return (
    <Stack className="gap-3">
      <PrimaryButtonWithIcon
        variant="primary"
        onClick={() => {}}
        label="Default"
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
      <PrimaryButtonWithIcon
        variant="primary"
        onClick={() => {}}
        label="Primary-Disabled"
        disabled
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
      <PrimaryButtonWithIcon
        variant="outline-primary"
        onClick={() => {}}
        label="Outline"
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />

      <PrimaryButtonWithIcon
        variant="outline-primary"
        onClick={() => {}}
        label="Outline-Primary-Disabled"
        disabled
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
      <PrimaryButtonWithIcon
        variant="secondary"
        onClick={() => {}}
        label="Secondary"
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
      <PrimaryButtonWithIcon
        variant="outline-secondary"
        onClick={() => {}}
        label="Outline-Secondary-Disabled"
        disabled
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
      <PrimaryButtonWithIcon
        variant="none"
        onClick={() => {}}
        label="Tertiary"
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
    </Stack>
  )
}
