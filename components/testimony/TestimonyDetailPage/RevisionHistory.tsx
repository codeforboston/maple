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
import { useTranslation } from "next-i18next"

const HistoryItem: FC<React.PropsWithChildren<{ revision: Revision }>> = ({ revision: tr }) => {
  const dispatch = useAppDispatch()
  const { version: currentVersion } = useCurrentTestimonyDetails()

  let changes: string
  if (tr.changes.new) changes = "Initial Testimony"
  else
    changes = `${[
      tr.changes.position && "Stance",
      tr.changes.content && "Text",
      tr.changes.attachment && "Attachment"
    ]
      .filter(Boolean)
      .join(", ")} Changed`

  const date = tr.publishedAt.toDate().toLocaleDateString()

  const { t } = useTranslation("testimony")

  return (
    <ListGroup.Item
      action
      variant="secondary"
      active={tr.version === currentVersion}
      onClick={() => dispatch(versionSelected(tr.version))}
    >
      <div className="d-inline-flex justify-content-between w-100">
        <span>{date}</span> <span className="fw-bold ms-2">{changes}</span>
      </div>
      <div>
        {t("revisionHistory.version")} {tr.version}
      </div>
    </ListGroup.Item>
  )
}

export const RevisionHistory = styled(props => {
  const { revisions } = useCurrentTestimonyDetails()

  const { t } = useTranslation("testimony")

  return (
    <Card
      className={props.className}
      header={t("revisionHistory.history") + `(${revisions.length})`}
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
