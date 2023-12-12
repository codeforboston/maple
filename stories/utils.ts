import type { Meta, StoryObj } from "@storybook/react"
import { ComponentType } from "react"

type MetaProps = Meta<any> & {
  title: string
  component: ComponentType<any>
}

export const createMeta = ({ component, title, ...props }: MetaProps) => {
  const meta: Meta<typeof component> = { component: component, title: title }

  type Story = StoryObj<typeof component>
  const createStory = () => {
    const NewStory: Story = {}
    return NewStory
  }

  return { meta, createStory }
}
