import styled from "styled-components"
import { Card as MapleCard } from "../Card/Card"

export const Notice = (props: { text: string; className: string }) => {
  var body = <NoticeStyle>{props.text}</NoticeStyle>
  return <MapleCard body={body} className={props.className} />
}
const NoticeStyle = styled.div`
  padding: 1rem;
  font-size: 1.2rem;
  text-align: center;
  font-family: nunito;
  background-color: #1a3185;
  color: white;
`
