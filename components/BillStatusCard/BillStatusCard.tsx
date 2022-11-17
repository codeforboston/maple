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
            <p>{hist.action}</p>
            <div>
              <p className="date">{hist.date}</p>
              <p className="branch">{hist.branch}</p>
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
  justify-content: space-between;
  padding: 5%;
  border-top: 1px solid black;

  background-color: white;
  color: black;

  font-family: Nunito;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 25px;

  .date {
    margin-bottom: 0px;
  }
  .branch {
    margin-top: 0px;
    background-color: red;
    color: white;

    border-radius: 15px;
    padding: 0px 10px 0px 10px;
  }
`

const ScrollStyle = styled.div`
  padding: 0%;
  height: 300px;
  overflow: hidden;
  overflow-y: scroll;

  /* width */
  ::-webkit-scrollbar {
    width: 10px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 10px;
  }
`
