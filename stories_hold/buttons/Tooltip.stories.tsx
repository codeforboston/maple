import { ComponentStory } from "@storybook/react"
import { TooltipButton } from "components/buttons"
import { Container, Stack } from "react-bootstrap"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Molecules/Buttons/Tooltip Button",
  component: TooltipButton,
  parameters: {
    docs: {
      page: () => (
        <Stack gap={3} className={"col-3  m-4"}>
          <Primary {...Primary.args} />
          <Secondary {...Secondary.args} />
          <Success {...Success.args} />
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
})

const Template: ComponentStory<typeof TooltipButton> = args => (
  <TooltipButton {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  tooltip: "this is a tool tip",
  text: "hover",
  variant: "primary"
}
export const Secondary = Template.bind({})

Secondary.args = {
  tooltip: "this is a tool tip",
  text: "hover",
  variant: "secondary"
}
export const Success = Template.bind({})

Success.args = {
  tooltip: "this is a tool tip",
  text: "hover",
  variant: "success"
}
