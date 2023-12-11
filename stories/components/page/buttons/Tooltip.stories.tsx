import { ComponentStory, Meta, StoryObj } from "@storybook/react"
import { TooltipButton } from "components/buttons"
import { Container, Stack } from "react-bootstrap"
import { createMeta } from "stories/utils"



const meta: Meta = {
  title: "Molecules/Buttons/Tooltip Button",
  component: TooltipButton,
  parameters: {
    docs: {
      page: () => (
        <Stack gap={3} className={"col-3  m-4"}>
          {/* <Primary {...Primary.args} />
          <Secondary {...Secondary.args} />
          <Success {...Success.args} /> */}
        </Stack>
      )
    }
  },
  decorators: [
    Story => {
      return (
        <Container className="d-flex align-items-center m-5 p-5">
          <Story />
        </Container>
      )
    }
  ]
}
export default meta



type Story = StoryObj<typeof TooltipButton>


export const Primary: Story = {
  args: {
    tooltip: "this is a tool tip",
    text: "hover",
    variant: "primary"
  }
}


export const Secondary: Story = {
  args: {
    tooltip: "this is a tool tip",
    text: "hover",
    variant: "secondary"
  }
}

export const Success: Story = {
  args: {
    tooltip: "this is a tool tip",
    text: "hover",
    variant: "success"
  }
}
