import { Meta, StoryObj } from "@storybook/react"
import { Tag } from "components/Tag/Tag"

const meta:Meta = {
  title: "Molecules/Tag",
  component: Tag
}

export default meta

type Story = StoryObj<typeof Tag>

export const Senate: Story = {args : { chamber: "senate" }}

export const House: Story = { args : { chamber: "house" } }

export const Joint: Story = { args : { chamber: "joint" } }
