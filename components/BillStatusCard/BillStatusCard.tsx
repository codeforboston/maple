import { Card as MapleCard } from "../Card/Card"
import styled from "styled-components"

export const BillStatusCard = (props: {}) => {
  var body = (
    <StatusStyle>
      <h3>House</h3>
      <h1>Hearing Scheduled for Nov 11, 2022</h1>
    </StatusStyle>
  )
  return <MapleCard body={body} />
}

const StatusStyle = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #1a3185;
  color: white;
  .header: small;
  padding: 5%;

  h1 {
    text-align: center;
    align-self: center;
  }

  :hover {
    background-color: #6d7bb1;
  }
`
