import { collection, getFirestore, onSnapshot } from "firebase/firestore"
import { useEffect } from "react"
import { useTranslation } from "next-i18next"
import {
  Datagrid,
  EditButton,
  List,
  TextField,
  WithRecord,
  useRefresh
} from "react-admin"
import { Report } from "."
import { StatusField } from "./common"
import { CreateMockReport } from "./setUp/CreateMockReport"

export function ListReports() {
  const { t } = useTranslation("moderation") 
  const firestore = getFirestore()
  const refresh = useRefresh()
  useEffect(() => {
    const reportsRef = collection(firestore, "reports")
    const unsubscribe = onSnapshot(
      reportsRef,
      () => refresh(),
      (e: Error) => console.log(e)
    )

    return () => unsubscribe()
  }, [])
  return (
    <>
      {process.env.NEXT_PUBLIC_USE_EMULATOR && <CreateMockReport />}
      <List>
        <Datagrid rowClick={"edit"} bulkActionButtons={false}>
          <TextField source="id" label={t("reportId")} />
          <TextField source="testimonyId" />
          <TextField
            source="resolution.archiveTestimonyId"
            label={t("archivedId")}
          />
          <TextField source="reason" />
          <StatusField label={t("status")} />
          <TextField source="resolution.resolution" label={t("resolution") } />
          <TextField source="resolution.moderatorUid" label={t("moderatedBy")} />
          <WithRecord
            label={t("resolveReport")}
            render={(record: Report) => {
              const hasBeenResolved =
                record.resolution?.resolution !== undefined
              return hasBeenResolved ? (
                <div>{t("resolved")}</div>
              ) : (
                <EditButton label={t("resolveReportAction")} disabled={hasBeenResolved} />
              )
            }}
          />
        </Datagrid>
      </List>
    </>
  )
}
