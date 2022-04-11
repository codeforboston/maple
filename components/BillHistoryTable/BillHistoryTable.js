import React from "react"
import { Table } from "react-bootstrap"

const BillHistoryActionRows = ({ billHistory }) => {
  return billHistory.map((billHistoryItem, index) => {
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
  })
}

const BillHistoryTable = ({ billHistory }) => {
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
          {billHistory && <BillHistoryActionRows billHistory={billHistory} />}
        </tbody>
      </Table>
    </div>
  )
}

export default BillHistoryTable
