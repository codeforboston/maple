/* eslint-disable import/no-anonymous-default-export */
import { Title } from "@storybook/addon-docs"
import { Meta, StoryObj } from "@storybook/react"
import { Image, Stack } from "components/bootstrap"
import { LoadingButton } from "components/buttons"

const meta: Meta = {
  title: "Molecules/Buttons/LoadingButton",
  component: LoadingButton,
  parameters: {
    docs: {
      page: () => (
        <Stack gap={2} className="col-4">
          <Title>Loading Buttons</Title>
          <LoadingButton {...Primary.args} />
          {/* <Primary {...Primary.args} />
          <Disabled {...Disabled.args} />
          <Loading {...Loading.args} />
          <Light {...Light.args} />
          <WithImage {...WithImage.args} /> */}
        </Stack>
      )
    }
  }
}

export default meta

type Story = StoryObj<typeof LoadingButton>

// export const RenderFunc: StoryObj = {
//   args: {
//     disabled: false,
//     loading: false,
//   },
//   render: ({children, disabled=false, loading=false, ...rest}) => {
//     const [isLoading, setLoading] = useState(loading)
//     const clickAction = () => {
//       setLoading(true)
//       return setTimeout(() => setLoading(false), 2000)
//     }
//     return (
//       <LoadingButton
//         loading={isLoading}
//         onClick={clickAction}
//         disabled={disabled}
//         {...rest}
//       >
//         {children}
//       </LoadingButton>
//     )
//   }
// }

// const Template: ComponentStory<typeof LoadingButton> = ({
//   children,
//   disabled = false,
//   loading = false,
//   ...rest
// }) => {
//   const [isLoading, setLoading] = useState(loading)
//   const clickAction = () => {
//     setLoading(true)
//     return setTimeout(() => setLoading(false), 2000)
//   }
//   return (
//     <LoadingButton
//       loading={isLoading}
//       onClick={clickAction}
//       disabled={disabled}
//       {...rest}
//     >
//       {children}
//     </LoadingButton>
//   )
// }

export const Primary: Story = {
  args: {
    children: "Click Me!"
  }
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled"
  }
}

export const Loading: Story = {
  args: {
    loading: true,
    children: "Loading"
  }
}

export const Light: Story = {
  args: {
    variant: "light",
    children: "Light"
  }
}

export const WithImage: Story = {
  args: {
    variant: "light",
    spinnerProps: { className: "me-4" },
    children: (
      <>
        <Image src="/google-icon.svg" alt="Google" className="me-4" />
        With Image
      </>
    )
  }
}

// export const LightWithImage = () => (
//   <LoadingButton variant="light" spinnerProps={}>
//
//     Loading Button
//   </LoadingButton>
// )
