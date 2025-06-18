import { billSiteURL, Wrap } from "components/links"
import { useContext } from "react"
import styled from "styled-components"
import { BillHistory } from "common/bills/types"
import { CourtContext } from "./Status"

export type HistoryProps = { billHistory: BillHistory }

const LinkConnectedBills = ({ action }: { action: string }): JSX.Element => {
  /* regex must have capture group for split to work */
  const billRegex = new RegExp(/([HS]\d+)/)

  const court = useContext(CourtContext)
  if (!billRegex.test(action)) {
    return <>{action}</>
  }
  const words = action.split(billRegex)
  const wordMap = words.map((w, i) =>
    billRegex.test(w) ? (
      <Wrap key={i} href={billSiteURL(w, court)}>
        {w}
      </Wrap>
    ) : (
      w
    )
  )

  return <>{wordMap}</>
}

const BillHistoryActionRows = ({ billHistory }: HistoryProps) => {
  return (
    <>
      {billHistory.map((billHistoryItem, index) => {
        const { Date, Action, Branch } = billHistoryItem
        return (
          <tr key={index}>
            <td>
              {Date.substring(5, 10)}-{Date.substring(0, 4)}
            </td>
            <td>
              <LinkConnectedBills action={Action} />
            </td>
            <td>{Branch}</td>
          </tr>
        )
      })}
    </>
  )
}

export const HistoryTable = ({ billHistory }: HistoryProps) => {
  return (
    <div className="text-center">
      <StyledTable>
        <thead>
          <tr>
            <th></th>
            <th>Status History</th>
            <th>Branch</th>
          </tr>
        </thead>
        <tbody>
          <BillHistoryActionRows billHistory={billHistory} />
        </tbody>
      </StyledTable>
    </div>
  )
}

const StyledTable = styled.table`
  table-layout: auto;
  width: 100%;
  font-family: "Nunito";

  th {
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: -1.125px;
    text-align: start;
    color: white;
    background-color: var(--bs-secondary);

    padding: 0.5rem;
    outline: 0.25rem solid white;
  }

  th:last-child {
    width: 24%;
    text-align: center;
  }

  tbody {
    td {
      font: {
        family: Nunito;
        size: 16px;
        weight: 400;
      }
      line-height: 22px;
      letter-spacing: -1.125px;
      text-align: start;

      padding: 0.5rem 0.75rem;
      outline: 0.25rem solid white;
    }
    tr:nth-child(odd) {
      background: hsla(353, 74%, 45%, 0.2);
    }

    td:last-child {
      text-align: center;
    }
  }
`
