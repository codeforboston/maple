import React from "react";
import { bills } from "./MockAPIResponse"

console.log("bills")
console.log(bills)

const billsComponent = !bills ? "" :
  bills.map((bill, index) => (
    <tr key={index}>
      <td>{bill.billNumber}</td>
      <td>{bill.title}</td>
      <td>{bill.primarySponsor.name}</td>
    </tr>
  )
)
const ViewTestimony = (props) => {
  return (
    <>
      
      <h1>Most Active Bills </h1>

      {/* <Table striped bordered hover> */}
        <thead>
          <tr>
            <th>Bill #</th>
            <th>Bill Name</th>
            <th>Bill Sponsor</th>
          </tr>
        </thead>
        <tbody>
          {billsComponent}
        </tbody>
      {/* </Table> */}
    </>
  );
};

export default ViewTestimony;

