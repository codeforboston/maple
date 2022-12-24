import { Card } from "components/Card"
import { useTestimonyDetails } from "./testimonyDetailSlice"

export const RevisionHistory = () => {
  const { archive } = useTestimonyDetails()

  return (
    <Card
      header={`Revision History (${archive.length})`}
      items={archive.map(t => (
        <div key={t.id}>
          {t.publishedAt.toDate().toLocaleDateString()} version: {t.version}
        </div>
      ))}
    />
  )
}
