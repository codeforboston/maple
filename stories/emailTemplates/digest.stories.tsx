import { createMeta } from "stories/utils"
import { OrgAvatar } from "stories/components/OrgAvatar"
import { ComponentStory } from "@storybook/react"
import { FC } from "react"

/** Given the handlebars source string, render it using the provided data. */
const EmailTemplateRenderer: FC<{ templateSource: string; data: any }> =
  null as any

export default createMeta({
  title: "EmailTemplates/Digest",
  figmaUrl: "",
  component: EmailTemplateRenderer
})

const Template: ComponentStory<typeof EmailTemplateRenderer> = args => (
  <EmailTemplateRenderer {...args} />
)

export const Digest = Template.bind({})
Digest.args = {
  data: { x: 2 },
  // TODO: how to load handlebars source in storybook?
  templateSource: ""
}
