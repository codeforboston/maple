import { Stories } from "@storybook/addon-docs"
import { ComponentStory } from "@storybook/react"
import Input from "components/forms/Input"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Molecules/Forms/Input",
  component: Input,
  parameters: {
    docs: {
      page: () => <Stories includePrimary />
    }
  }
})

const Template: ComponentStory<typeof Input> = args => <Input {...args} />

export const Primary = Template.bind({})
Primary.args = {
  label: "Input"
}
Primary.storyName = "Input"

export const WithError = Template.bind({})
WithError.args = {
  ...Primary.args,
  error: "Error message"
}

export const WithHelp = Template.bind({})
WithHelp.args = {
  ...Primary.args,
  help: "This is some help text to help you understand the question"
}
