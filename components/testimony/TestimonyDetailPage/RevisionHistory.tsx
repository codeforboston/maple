import { Card } from "components/Card"
import { useAppDispatch } from "components/hooks"
import { ListGroup } from "react-bootstrap"
import styled from "styled-components"
import {
  Revision,
  useCurrentTestimonyDetails,
  versionSelected
} from "./testimonyDetailSlice"
import { FC } from "react"

const HistoryItem: FC<{ revision: Revision }> = ({ revision: t }) => {
  const dispatch = useAppDispatch()
  const { version: currentVersion } = useCurrentTestimonyDetails()

  let changes: string
  if (t.changes.new) changes = "Initial Testimony"
  else
    changes = `${[
      t.changes.position && "Stance",
      t.changes.content && "Text",
      t.changes.attachment && "Attachment"
    ]
      .filter(Boolean)
      .join(", ")} Changed`

  const date = t.publishedAt.toDate().toLocaleDateString()

  return (
    <ListGroup.Item
      action
      variant="secondary"
      active={t.version === currentVersion}
      onClick={() => dispatch(versionSelected(t.version))}
    >
      <div className="d-inline-flex justify-content-between w-100">
        <span>{date}</span> <span className="fw-bold ms-2">{changes}</span>
      </div>
      <div>version: {t.version}</div>
    </ListGroup.Item>
  )
}

export const RevisionHistory = styled(props => {
  const { revisions } = useCurrentTestimonyDetails()

  return (
    <Card
      className={props.className}
      header={`Revision History (${revisions.length})`}
      items={revisions.map(t => (
        <HistoryItem key={t.version} revision={t} />
      ))}
    />
  )
})`
  .list-group-item {
    background: white;
  }
`
