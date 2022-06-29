import { Table } from "../bootstrap"
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
            <td>{billHistoryItem.Branch}</td>
            <td>{billHistoryItem.Action}</td>
          </tr>
        )
      })}
    </>
  )
}

export const BillHistoryTable = ({ billHistory }: HistoryProps) => {
  return (
    <div className="text-center">
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th></th>
            <th>Branch</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <BillHistoryActionRows billHistory={billHistory} />
        </tbody>
      </Table>
    </div>
  )
}
