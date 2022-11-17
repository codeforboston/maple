import { Card as MapleCard } from "../Card/Card"
import { ReactElement } from "react"
import styled from "styled-components"
import { BillHistory } from "components/db"
import bill from "pages/bill"

type history = {
  date: string
  branch: string
  action: string
}

type bill = {
  history?: history[] | undefined
}

export const BillStatusCard = (props: { bill: bill }) => {
  var body = (
    <ScrollStyle>
      {props.bill.history?.map((hist, index) => {
        return (
          <StatusStyle key={hist.action + index}>
            {hist.action}
            <div>
              {hist.date}
              {hist.branch}
            </div>
          </StatusStyle>
        )
      })}
    </ScrollStyle>
  )
  return <MapleCard header="Bill Status" body={body} />
}

const StatusStyle = styled.div`
  display: flex;
  background-color: white;
  color: black;
  .header: small;
  padding: 5%;
  border-top: 1px solid black;
`

const ScrollStyle = styled.div`
  padding: 0%;
  height: 300px;
  overflow: hidden;
  overflow-y: scroll;
`
