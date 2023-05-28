import { Meta } from "@storybook/react"
import { createMeta } from "stories/utils"
import { ReportModal } from "../../components/TestimonyCard/ReportModal"

const meta: Meta<typeof ReportModal> = createMeta({
  title: "Report/Report Modal",
  figmaUrl: "",
  component: ReportModal
})

export default meta

export const Primary = () => (
  <ReportModal
    reasons={["Personal Information", "Wrong Bill"]}
    onClose={console.log}
    onReport={report => console.log(report)}
    isLoading={false}
    additionalInformationLabel={"Request"}
    requireAdditionalInformation
  >
    You may only delete testimony from MAPLE if you made an error in the
    testimony submission process (e.g., testified on the wrong bill) or if the
    testimony contains personal information.
  </ReportModal>
)
