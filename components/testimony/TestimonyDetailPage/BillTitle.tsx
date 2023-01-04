import { formatBillId } from "components/formatting"
import { Internal } from "components/links"
import styled from "styled-components"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"

export const BillTitle = styled(props => {
  const { bill } = useCurrentTestimonyDetails()

  const href = `/bill?id=${bill.content.BillNumber}`
  const title = `${formatBillId(bill.content.BillNumber)}: ${
    bill.content.Title
  }`

  return (
    <h3 {...props}>
      <Internal href={href}>{title}</Internal>
    </h3>
  )
})`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`
