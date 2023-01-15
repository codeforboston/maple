import { CardTitle, ListItem } from "components/Card"
import { Card as MapleCard } from "../Card/Card"
import Styles from "./PriorityBillsCard.module.css"
import Image from "react-bootstrap/Image"
import styled from "styled-components"

type bill = {
  id: string
  billNumber: string
  title: string
  stance?: string
}

export const PriorityBillsCard = (props: {
  bills: bill[]
  selectedBillId: string
  session: string
  onClick: (billNumber: string) => void
  editBtn: boolean
}) => {
  const items = props.bills?.map((bill, index) => {
    let style = Styles.billSlot
    if (bill.billNumber === props.selectedBillId) {
      style = Styles.billSelected
    }
    return bill.stance ? (
      <ListItem
        className={style}
        onClick={() => props.onClick(bill.billNumber)}
        key={bill.billNumber}
        billName={bill.billNumber}
        billNameElement={Position(bill.stance)}
        billDescription={bill.title}
      />
    ) : (
      <ListItem
        className={style}
        onClick={() => props.onClick(bill.billNumber)}
        key={bill.billNumber}
        billName={bill.billNumber}
        billDescription={bill.title}
      />
    )
  })

  const header = props.editBtn ? (
    <CardTitle
      header="Priority Bills"
      subheader={`Session ${props.session}`}
      inHeaderElement={EditButton()}
    />
  ) : (
    <CardTitle header="Priority Bills" subheader={`Session ${props.session}`} />
  )

  return <MapleCard items={items} headerElement={header} />
}

const Position = (stance: string) => {
  var stanceSVG
  switch (stance) {
    case "endorse":
      stanceSVG = "/thumbs-endorse.svg"
      break
    case "oppose":
      stanceSVG = "/thumbs-oppose.svg"
      break
    default:
      stanceSVG = "/thumbs-neutral.svg"
  }
  return (
    <SvgStyle>
      <Image className="svg" alt="" src={stanceSVG} />
    </SvgStyle>
  )
}

const EditButton = () => {
  return (
    <EditBtnStyle onClick={() => console.log("edit")}>
      <p className="editTitle">edit</p>
      <SvgStyle>
        <Image className="svg" alt="" src="/edit-testimony.svg" />
      </SvgStyle>
    </EditBtnStyle>
  )
}

const SvgStyle = styled.div`
  display: inline;
  align-self: ;
`

const EditBtnStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  .editTitle {
    color: #8999d6;
  }
  p {
    margin: 0;
  }
`
