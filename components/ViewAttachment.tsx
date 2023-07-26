import { Testimony, usePublishedTestimonyAttachment } from "./db"
import { External } from "./links"
import styled from "styled-components"

const StyledExternal = styled(External)`
  text-decoration: none;
`

export function ViewAttachment({ testimony }: { testimony?: Testimony }) {
  {
    const id = testimony?.attachmentId
    return id ? <Open id={id} /> : null
  }
}

const Open = ({ id }: { id: string }) => {
  const url = usePublishedTestimonyAttachment(id)
  return url ? (
    <StyledExternal href={url}>View Attached Testimony PDF</StyledExternal>
  ) : null
}
