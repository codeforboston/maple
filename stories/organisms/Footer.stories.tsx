import { Meta, StoryObj } from "@storybook/react"
import PageFooter from "components/Footer/Footer"
import type { User } from "firebase/auth"

/* The site footer, on every page. Signed in, its account links show the
   profile and sign-out instead of sign-in. Use the Skin menu in the toolbar to
   compare it under each skin. */
const meta: Meta<typeof PageFooter> = {
  title: "Organisms/Footer",
  component: PageFooter,
  parameters: { layout: "fullscreen" },
  args: { authenticated: false, user: null, signOut: () => {} }
}

export default meta

type Story = StoryObj<typeof PageFooter>

export const SignedOut: Story = {}

export const SignedIn: Story = {
  args: { authenticated: true, user: { uid: "example" } as User }
}
