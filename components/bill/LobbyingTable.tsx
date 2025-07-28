import { useTranslation } from "components/i18n"
import { Table } from "react-bootstrap"
import { Card, Container } from "../bootstrap"
import { Card as MapleCard } from "../Card"
import { FC } from "../types"
import { BillProps } from "./types"

export const LobbyingTable: FC<React.PropsWithChildren<BillProps>> = ({
  bill,
  className
}) => {
  const { t, tDate } = useTranslation("common")
  const current = bill.currentCommittee
  if (!current) return null
  return (
    <Container className="p-0">
      <MapleCard
        className={`${className} bg-white`}
        headerElement={
          <Card.Header className="h4 bg-secondary text-light">
            {t("bill.lobbying_parties")}
          </Card.Header>
        }
        body={
          <Card.Body>
            <Table>
              <thead>
                <tr>
                  <th>{t("bill.client_name")}</th>
                  <th>{t("bill.position")}</th>
                  <th>{t("bill.disclosure_date")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t("bill.example_name")}</td>
                  <td>{t("bill.pro")}</td>
                  <td>{tDate("2023-03-29", "PPP")}</td>
                </tr>
                <tr>
                  <td>{t("bill.example_name")}</td>
                  <td>{t("bill.neutral")}</td>
                  <td>{tDate("2023-04-15", "PPP")}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        }
      />
    </Container>
  )
}
