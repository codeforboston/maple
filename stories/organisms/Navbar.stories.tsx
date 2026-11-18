import { Meta, StoryObj } from "@storybook/react"
import { MainNavbar } from "components/Navbar"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta<typeof MainNavbar> = {
  title: "Organisms/Navbar",
  component: MainNavbar,
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

export const Default: Story = {}
