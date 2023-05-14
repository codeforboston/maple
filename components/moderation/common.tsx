import { Typography } from "@mui/material"
import { useRecordContext } from "react-admin"

export const StatusField = ({ label }: { label?: string }) => {
  const record = useRecordContext()

  const status = record.resolution !== undefined ? "resolved" : "pending"

  return <Typography>{status}</Typography>
}
