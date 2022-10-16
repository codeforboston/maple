import { ComponentMeta } from "@storybook/react"
import { ComponentType } from "react"

type Meta = {
  title: string
  component: ComponentType<any>
  figmaUrl?: string
}

export const createMeta = ({ title, component, figmaUrl }: Meta) => {
  const meta: ComponentMeta<any> = { title, component }
  if (figmaUrl)
    meta.parameters = {
      design: {
        type: "figma",
        url: figmaUrl
      }
    }
  return meta
}
