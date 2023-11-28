import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { Tag, Chamber } from "../../components/Tag/Tag"
import { Stack } from "react-bootstrap"
import { Title } from "@storybook/addon-docs"

export default createMeta({
  title: "Components/Tag",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=231%3A13514",
  component: Tag,
  parameters: {
    docs: {
      page: () => (
        <Stack gap={3} className="col-2">
          <Title>Tags</Title>
          <Tag chamber="senate" />
          <Tag chamber="house" />
          <Tag chamber="joint" />
        </Stack>
      )
    }
  }
})

const Template: ComponentStory<typeof Tag> = args => <Tag {...args} />

export const Senate = Template.bind({})
Senate.args = { chamber: "senate" }

export const House = Template.bind({})
House.args = { chamber: "house" }

export const Joint = Template.bind({})
Joint.args = { chamber: "joint" }
