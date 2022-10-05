import { ComponentMeta } from "@storybook/react"
import { ComponentType, JSXElementConstructor } from "react"

/** Copied from ComponentMeta */
type ComponentConstructor =
  | keyof JSX.IntrinsicElements
  | JSXElementConstructor<any>

type Meta<T extends ComponentConstructor> = {
  title: string
  component: ComponentType<T>
  figmaUrl?: string
}

export const createMeta = <T extends ComponentConstructor>({
  title,
  component,
  figmaUrl
}: Meta<T>): ComponentMeta<T> => {
  const meta: ComponentMeta<T> = { title, component }
  if (figmaUrl)
    meta.parameters = {
      design: {
        type: "figma",
        url: figmaUrl
      }
    }
  return meta
}
