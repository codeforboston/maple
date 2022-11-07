import { CardTitle, ListItem } from "components/Card"
import { Card as MapleCard } from "../Card/Card"
import Styles from "./PriorityBillsCard.module.css"
import Image from "react-bootstrap/Image"
import styled from "styled-components"

type bill = {
  id: string
  billNumber: string
  title: string
  stance: string
}

export const PriorityBillsCard = (props: {
  bills: bill[]
  selectedBillId: string
  session: string
  onClick: (billNumber: string) => void
}) => {
  const items = props.bills.map((bill, index) => {
    let style = Styles.billSlot
    if (bill.billNumber === props.selectedBillId) {
      style = Styles.billSelected
    }
    return (
      <ListItem
        className={style}
        onClick={() => props.onClick(bill.billNumber)}
        key={bill.billNumber}
        billName={bill.billNumber}
        billDescription={bill.title}
        element={Position(bill.stance)}
      />
    )
  })

  const header = (
    <CardTitle header="Priority Bills" subheader={`Session ${props.session}`} />
  )

  return <MapleCard items={items} headerElement={header} />
}

const Position = (stance: string) => {
  var stanceSVG
  switch (stance) {
    case "endorse":
      stanceSVG = "Thumbs Up.svg"
      break
    case "oppose":
      stanceSVG = "Thumbs Down.svg"
      break
    default:
      stanceSVG = "Thumbs Neut.svg"
  }
  return (
    <SvgStyle>
      <Image className="svg" alt="" src={stanceSVG} />
    </SvgStyle>
  )
}

const SvgStyle = styled.div`
  position: absolute;
  left: 7%;
  top: 15%;
`
