import { Title } from "@storybook/addon-docs"
import { Meta, StoryObj } from "@storybook/react"
import { Stack } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import {
  PrimaryButtonWithIcon,
  PrimaryButtonWithIconProps
} from "./PrimaryButtonWithIcon"

const Icon = () => <Image src="star.svg" alt="" className="m-auto" />

const pageArgs: PrimaryButtonWithIconProps = {
  iconPosition: "left",
  label: "Label",
  onClick: () => { },
  Icon: <Icon />,
  disabled: false
}


const meta: Meta = {

  title: "Molecules/Buttons/PrimaryButtonWithIcon",
  component: PrimaryButtonWithIcon,
  parameters: {
    background: "light",
    docs: {
      page: () => (
        <Stack gap={2} className="col-4">
          <Title>Primary Button With Icon</Title>
          {/* <Primary {...pageArgs} {...Primary.args} />
          <Secondary {...pageArgs} {...Secondary.args} />
          <Tertiary {...pageArgs} {...Tertiary.args} /> */}
        </Stack>
      )
    }
  },
  args: {
    iconPosition: "left",
    label: "Label",
    onClick: () => { },
    Icon: <Icon />,
    disabled: false
  }
}
export default meta

type Story = StoryObj<typeof PrimaryButtonWithIcon>


export const Primary: Story = {
  args: {
    variant: "primary"
  }
}

export const Secondary: Story = {
  args: {
    variant: "outline-secondary"
  }
}

export const Tertiary: Story = {
  args: {
    variant: "none"
  }
}

export const ButtonStack = (args: PrimaryButtonWithIconProps) => {
  return (
    <Stack className="gap-3">
      <PrimaryButtonWithIcon
        variant="primary"
        onClick={() => { }}
        label="Default"
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
      <PrimaryButtonWithIcon
        variant="primary"
        onClick={() => { }}
        label="Primary-Disabled"
        disabled
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
      <PrimaryButtonWithIcon
        variant="outline-primary"
        onClick={() => { }}
        label="Outline"
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />

      <PrimaryButtonWithIcon
        variant="outline-primary"
        onClick={() => { }}
        label="Outline-Primary-Disabled"
        disabled
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
      <PrimaryButtonWithIcon
        variant="secondary"
        onClick={() => { }}
        label="Secondary"
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
      <PrimaryButtonWithIcon
        variant="outline-secondary"
        onClick={() => { }}
        label="Outline-Secondary-Disabled"
        disabled
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
      <PrimaryButtonWithIcon
        variant="none"
        onClick={() => { }}
        label="Tertiary"
        className="col-1"
        Icon={<Icon />}
        iconPosition={args.iconPosition}
      />
    </Stack>
  )
}
