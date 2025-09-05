import { Timestamp } from "firebase/firestore"
import { Meta, StoryObj } from "@storybook/react"
import { Providers } from "components/providers"
import { ChooseStance } from "components/publish/ChooseStance"
import { ShareButtons } from "components/publish/ShareTestimony"
import {
  SubmitTestimonyForm,
  Form
} from "components/publish/SubmitTestimonyForm"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Organisms/SubmitTestimonyForm",
  component: SubmitTestimonyForm,
  decorators: [
    (Story, ...rest) => <Story {...rest} />,
    (Story, ...rest) => {
      const { store, props } = wrapper.useWrappedStore(...rest)

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

type Story = StoryObj<typeof SubmitTestimonyForm>

export const Primary: Story = {
  render: () => <SubmitTestimonyForm />,
  name: "SubmitTestimonyForm"
}

export default meta

export const ShareButtonsStory: Story = {
  render: () => (
    <div className={`w-100 d-flex`}>
      <ShareButtons />
    </div>
  )
}

export const ChooseStanceStory = {
  render: () => (
    <div className={`w-100 d-flex`}>
      <ChooseStance />
    </div>
  )
}

export const FormStory = {
  render: () => (
    <div className={`w-100 d-flex`}>
      <Form
        step={"position"}
        bill={{
          id: "",
          court: 0,
          content: {
            Title: "",
            BillNumber: "",
            DocketNumber: "",
            GeneralCourtNumber: 0,
            PrimarySponsor: null,
            Cosponsors: [],
            LegislationTypeName: "",
            Pinslip: "",
            DocumentText: ""
          },
          cosponsorCount: 0,
          testimonyCount: 0,
          endorseCount: 0,
          opposeCount: 0,
          neutralCount: 0,
          nextHearingAt: undefined,
          latestTestimonyAt: undefined,
          latestTestimonyId: undefined,
          fetchedAt: Timestamp.fromDate(new Date()),
          history: [],
          currentCommittee: undefined,
          city: undefined,
          similar: []
        }}
        synced={false}
      />
    </div>
  )
}
