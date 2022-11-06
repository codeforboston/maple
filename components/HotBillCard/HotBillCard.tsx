import { CardTitle, ListItem } from "components/Card"
import { Card as MapleCard } from "../Card/Card"
import { Positions } from "./Positions"
import Styles from "./PriorityBillsCard.module.css"

type bill = {
  id: string
  billNumber: string
  title: string
  endorseCount: number
  opposeCount: number
  neutralCount: number
}

export const HotBillCard = (props: {
  bills: bill[]
  selectedBillId: string
  session: string
}) => {
  const items = props.bills.map((bill, index) => {
    return (
      <ListItem
        key={bill.billNumber}
        billName={bill.billNumber}
        billDescription={bill.title}
        Element={
          <Positions
            endorseCount={bill.endorseCount}
            opposeCount={bill.opposeCount}
            neutralCount={bill.neutralCount}
          />
        }
      />
    )
  })

  const header = <CardTitle header="Hot Bills" />

  return <MapleCard items={items} headerElement={header} />
}
