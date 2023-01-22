import styled from "styled-components"
import { Card as MapleCard } from "../Card/Card"

type history = {
  date: string
  branch: string
  action: string
}

type bill = {
  history?: history[] | undefined
}

export const BillStatusCard = (props: { bill: bill; height?: number }) => {
  var body = (
    <ScrollStyle style={props.height ? { height: props.height } : {}}>
      {props.bill.history?.map((hist, index) => {
        return (
          <StatusStyle
            key={hist.action + index}
            style={index == 0 ? { borderTop: "none" } : {}}
          >
            <p>{hist.action}</p>
            <div className="dateBranch">
              <p className="date">{hist.date}</p>
              <div className="branch" style={HandleBranchStyle(hist.branch)}>
                {hist.branch}
              </div>
            </div>
          </StatusStyle>
        )
      })}
    </ScrollStyle>
  )
  return <MapleCard header="Bill Status" body={body} />
}

const HandleBranchStyle = (branchStyle: string) => {
  var returnStyle
  switch (branchStyle) {
    case "HOUSE":
      returnStyle = { backgroundColor: "#1a3185" }
      break
    case "SENATE":
      returnStyle = { backgroundColor: "#A92929" }
      break
    default:
      returnStyle = {
        backgroundColor: "white",
        color: "black",
        border: "solid black 1px"
      }
      break
  }
  return returnStyle
}

const StatusStyle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1% 1% 1% 1%;
  border-top: 1px solid black;
  width: 100%;

  background-color: white;
  color: black;

  font-family: Nunito;
  font-style: normal;
  font-weight: 500;
  font-size: 1.5rem;

  .dateBranch {
    width: 75px;
  }
  .date {
    margin-bottom: 0px;
  }
  .branch {
    margin-top: 0px;
    color: white;

    font-size: 1rem;
    width: fit-content;
    border-radius: 15px;
    padding: 0px 10px 0px 10px;
  }
`

const ScrollStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0%;
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
