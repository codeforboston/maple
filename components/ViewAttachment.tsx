import { Testimony, usePublishedTestimonyAttachment } from "./db"
import { External } from "./links"

export function ViewAttachment({ testimony }: { testimony?: Testimony }) {
  {
    const id = testimony?.attachmentId
    return id ? <Open id={id} /> : null
  }
}

const Open = ({ id }: { id: string }) => {
  const url = usePublishedTestimonyAttachment(id)
  return url ? (
    <External href={url}>View Attached Testimony PDF</External>
  ) : null
}
