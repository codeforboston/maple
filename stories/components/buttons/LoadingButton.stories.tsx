/* eslint-disable import/no-anonymous-default-export */
import { useState } from "react"
import { ComponentStory, ComponentMeta } from "@storybook/react"

import { LoadingButton } from "../../../components/buttons"

import { Image } from "../../../components/bootstrap"

export default {
  title: "Components/Buttons/LoadingButton",
  component: LoadingButton
} as ComponentMeta<typeof LoadingButton>

const Template: ComponentStory<typeof LoadingButton> = ({
  children,
  disabled = false,
  loading = false,
  ...rest
}) => {
  const [isLoading, setLoading] = useState(loading)
  const clickAction = () => {
    setLoading(true)
    return setTimeout(() => setLoading(false), 2000)
  }
  return (
    <LoadingButton
      loading={isLoading}
      onClick={clickAction}
      disabled={disabled}
      {...rest}
    >
      {children}
    </LoadingButton>
  )
}

export const Primary = Template.bind({})
Primary.args = {
  children: "Click Me!"
}

export const Disabled = Template.bind({})
Disabled.args = {
  disabled: true,
  children: "Disabled"
}

export const Loading = Template.bind({})
Loading.args = {
  loading: true,
  children: "Loading"
}

export const Light = Template.bind({})
Light.args = {
  variant: "light",
  children: "Light"
}

export const WithImage = Template.bind({})
WithImage.args = {
  variant: "light",
  spinnerProps: { className: "me-4" },
  children: (
    <>
      <Image src="/google-icon.png" alt="Google" className="me-4" />
      With Image
    </>
  )
}

// export const LightWithImage = () => (
//   <LoadingButton variant="light" spinnerProps={}>
//
//     Loading Button
//   </LoadingButton>
// )
