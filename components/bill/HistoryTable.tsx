import styled from "styled-components"
import { BillHistory } from "../db"

export type HistoryProps = { billHistory: BillHistory }

const BillHistoryActionRows = ({ billHistory }: HistoryProps) => {
  return (
    <>
      {billHistory.map((billHistoryItem, index) => {
        return (
          <tr key={index}>
            <td>
              {billHistoryItem.Date.substring(5, 10)}-
              {billHistoryItem.Date.substring(0, 4)}
            </td>
            <td>{billHistoryItem.Action}</td>
            <td>{billHistoryItem.Branch}</td>
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
