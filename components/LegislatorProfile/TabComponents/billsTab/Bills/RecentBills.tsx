import { TabBlock } from "components/LegislatorProfile/LegislatorComponents"
import { useTranslation } from "next-i18next"
import { StyledSubSectionHeaders } from "../StyledComponents/BillStyledComponents"
import { Bill } from "functions/src/bills/types"
import { Table } from "react-bootstrap"

export const RecentBills = ({ bills }: { bills: Bill[] }) => {
  const { t } = useTranslation("legislators")

  const lastFiveSponsoredBills = bills.slice(0, 5)

  return (
    <div>
      <StyledSubSectionHeaders>
        {t("profiles.recentSponsoredBills.header")}
      </StyledSubSectionHeaders>
      <TabBlock>
        <Table>
          <thead>
            <tr>
              <th>Bill</th>
              <th>Title</th>
              <th>Topics</th>
            </tr>
          </thead>
          <tbody>
            {lastFiveSponsoredBills.map(bill => (
              <tr>
                <td>{bill.id}</td>
                <td>{bill.content.Title}</td>
                <td>{bill.topics ? bill.topics[1].topic : ""}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TabBlock>
    </div>
  )
}
