import { CardTitle, ListItem } from "components/Card"
import { Card as MapleCard } from "../Card/Card"
import Styles from "./PriorityBillsCard.module.css"

type bill = {
  id: string
  billNumber: string
  title: string
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
      />
    )
  })

  const header = (
    <CardTitle header="Priority Bills" subheader={`Session ${props.session}`} />
  )

  return <MapleCard items={items} headerElement={header} />
}
