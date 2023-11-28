import { Title } from "@storybook/addon-docs"
import Image from "react-bootstrap/Image"
import { createMeta } from "stories/utils"
// TODO: move into components directory
import { ComponentStory } from "@storybook/react"
import { Stack } from "react-bootstrap"
import {
  PrimaryButtonWithIcon,
  PrimaryButtonWithIconProps
} from "./PrimaryButtonWithIcon"

const Icon = () => <Image src="star.svg" alt="" className="m-auto" />

const pageArgs: PrimaryButtonWithIconProps = {
  iconPosition: "left",
  label: "Label",
  onClick: () => {},
  Icon: <Icon />,
  disabled: false
}

export default createMeta({
  title: "Components/Buttons/PrimaryButtonWithIcon",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=245%3A14373",
  component: PrimaryButtonWithIcon,
  parameters: {
    background: "light",
    docs: {
      page: () => (
        <Stack gap={2} className="col-4">
          <Title>Primary Button With Icon</Title>
          <Primary {...pageArgs} {...Primary.args} />
          <Secondary {...pageArgs} {...Secondary.args} />
          <Tertiary {...pageArgs} {...Tertiary.args} />
        </Stack>
      )
    }
  },
  args: {
    iconPosition: "left",
    label: "Label",
    onClick: () => {},
    Icon: <Icon />,
    disabled: false
  }
})

const Template: ComponentStory<typeof PrimaryButtonWithIcon> = args => (
  <PrimaryButtonWithIcon {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  variant: "primary"
}

export const Secondary = Template.bind({})

Secondary.args = {
  variant: "outline-secondary"
}

export const Tertiary = Template.bind({})

Tertiary.args = {
  variant: "none"
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
