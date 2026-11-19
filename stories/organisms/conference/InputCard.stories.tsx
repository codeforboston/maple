import type { Meta, StoryObj } from "@storybook/react"
import { Timestamp } from "firebase/firestore"
import { ReactNode } from "react"
import { ConferenceTestimony } from "components/db"
import { Band, CosignList, Floor } from "components/conference/input/Cosigns"
import { Entry } from "components/conference/input/Entry"
import { InputContext } from "components/conference/input/context"
import { EllipsisVertical } from "components/conference/input/icons"
import { ink } from "components/conference/input/tokens"

/**
 * The conference page's input card (Entry), as Public Input shows it: an
 * input, and a cosign. The cosign as drawn here, naming and linking the
 * input it cosigns, is the source of truth for a cosign with all its
 * context, as it would be shared on its own (over the AT Protocol). Under
 * its input (Entry's `inContext`) it may come to differ; that look has its
 * own story, so a change meant for one shows up here if it touches the
 * other.
 */
const meta: Meta<typeof Entry> = {
  title: "Organisms/Conference/Input card",
  component: Entry,
  decorators: [
    Story => (
      <InputContext.Provider
        value={{
          subject: "An Act relative to phone-free schools",
          followed: new Set(),
          signedIn: false,
          byId: new Map([[input.id, input]])
        }}
      >
        <div style={{ maxWidth: 760, padding: 24 }}>
          <Story />
        </div>
      </InputContext.Provider>
    )
  ]
}

export default meta

type Story = StoryObj<typeof Entry>

/** A day in November 2026. */
const on = (day: number) => Timestamp.fromDate(new Date(2026, 10, day))

/** A filing, with invented people. */
const filing = (
  fields: Partial<ConferenceTestimony> & { id: string; name: string }
): ConferenceTestimony =>
  ({
    authorUid: `uid-${fields.id}`,
    authorDisplayName: fields.name,
    fullName: fields.name,
    authorRole: "user",
    position: "passSomething",
    publishedAt: on(2),
    ...fields
  } as unknown as ConferenceTestimony)

const input = filing({
  id: "input",
  name: "Dana Whitfield",
  content:
    "Phones in class have made it harder for my students to focus. Please pass a final bill this session.",
  cosignCount: 3,
  lastCosignedAt: on(18)
})

const cosign = filing({
  id: "cosign",
  name: "Sam Ortega",
  cosignOfId: input.id,
  content: "I agree. My kids' school tried this and it worked.",
  publishedAt: on(9)
})

const silentCosign = filing({
  id: "silent",
  name: "Lee Park",
  cosignOfId: input.id,
  content: "",
  publishedAt: on(12)
})

const yourCosign = filing({
  id: "yours",
  name: "Riley Chen",
  cosignOfId: input.id,
  content: "Please pass it.",
  publishedAt: on(18)
})

/** A stand-in for the card's menu (Kebab), which needs the app's store. */
const Menu = () => (
  <span style={{ display: "flex", padding: 6, color: ink.mid }} aria-hidden>
    <EllipsisVertical size={19} />
  </span>
)

const card = (testimony: ConferenceTestimony, more: { own?: boolean } = {}) =>
  ({
    render: () => (
      <Entry
        testimony={testimony}
        actions={<Menu />}
        // Opens the input a cosign cosigns, so its name is a live link.
        onOpen={() => {}}
        {...more}
      />
    )
  } satisfies Story)

export const Input: Story = card(input)

/** The source of truth for a cosign with all its context. */
export const Cosign: Story = card(cosign)

export const CosignWithoutWords: Story = card(silentCosign)

export const YourCosign: Story = card(yourCosign, { own: true })

/** Cosigns under their input, each in context (Entry's `inContext`). */
export const CosignsInContext: Story = {
  render: () => {
    const menu = (): ReactNode => <Menu />
    return (
      <Entry
        testimony={input}
        actions={<Menu />}
        band={<Band testimony={input} yours />}
        floor={() => <Floor testimony={input} />}
      >
        {wide => (
          <CosignList
            cosigns={[yourCosign, silentCosign, cosign]}
            mine={yourCosign}
            wide={wide}
            actions={menu}
          />
        )}
      </Entry>
    )
  }
}
