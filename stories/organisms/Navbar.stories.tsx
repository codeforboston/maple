import { Meta, StoryObj } from "@storybook/react"
import { MainNavbar } from "components/Navbar"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

/* The site navbar's two looks. "auto" follows the Skin menu in the toolbar:
   neutral under Digital Democracy, blue otherwise. */
const meta: Meta<typeof MainNavbar> = {
  title: "Organisms/Navbar",
  component: MainNavbar,
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["blue", "neutral", "auto"]
    }
  },
  decorators: [
    (Story, ...rest) => {
      const { store } = wrapper.useWrappedStore(...rest)

      return (
        <Redux store={store}>
          <Providers>
            <Story />
          </Providers>
        </Redux>
      )
    }
  ]
}

export default meta

type Story = StoryObj<typeof MainNavbar>

export const Blue: Story = { args: { variant: "blue" } }

export const Neutral: Story = { args: { variant: "neutral" } }
