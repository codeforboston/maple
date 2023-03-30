import { ComponentMeta } from "@storybook/react"
import { ComponentType } from "react"

type Meta = ComponentMeta<any> & {
  title: string
  component: ComponentType<any>
  figmaUrl?: string
}

export const createMeta = ({ figmaUrl, ...meta }: Meta) => {
  if (figmaUrl) {
    meta.parameters ||= {}
    meta.parameters.design = {
      type: "figma",
      url: figmaUrl
    }
  }
  return meta
}
