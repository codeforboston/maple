import { t } from "i18next"
import { Form } from "../bootstrap"
import { useTranslation } from "next-i18next"

export const SortTestimonyDropDown = ({
  orderBy,
  setOrderBy
}: {
  orderBy?: string
  setOrderBy: (order: string) => void
}) => {
  const { t } = useTranslation("testimony")
  return (
    <Form.Select
      className="bg-white w-100"
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
