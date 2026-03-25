import { Form } from "../bootstrap"
import { useTranslation } from "next-i18next"

export const SortTestimonyDropDown = ({
  orderBy,
  setOrderBy,
  variant = "default"
}: {
  orderBy?: string
  setOrderBy: (order: string) => void
  variant?: "default" | "ballotQuestion"
}) => {
  const { t } = useTranslation("testimony")
  return (
    <Form.Select
      className={
        variant === "ballotQuestion"
          ? "bg-white w-100 border rounded-pill px-3 py-2 small"
          : "bg-white w-100"
      }
      onChange={e => setOrderBy(e.target.value)}
    >
      <option value="Most Recent First">
        {t("sortTestimonyDropDown.recentFirst")}
      </option>
      <option value="Oldest First">
        {t("sortTestimonyDropDown.oldestFirst")}
      </option>
    </Form.Select>
  )
}
