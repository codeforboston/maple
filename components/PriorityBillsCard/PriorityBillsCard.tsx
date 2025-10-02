import { CardTitle, ListItem } from "components/Card"
import { Card as MapleCard } from "../Card/Card"
import CardBootstrap from "react-bootstrap/Card"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import clsx from "clsx"
import { useTranslation } from "next-i18next"

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
  const { t } = useTranslation("common")

  const items = props.bills?.map(bill => {
    const isSelectedBill = bill.billNumber === props.selectedBillId

    return bill.stance ? (
      <ListItem
        className={clsx(
          "bg-secondary text-white" && !isSelectedBill,
          "bg-white text-dark" && isSelectedBill
        )}
        onClick={() => props.onClick(bill.billNumber)}
        key={bill.billNumber}
        billName={bill.billNumber}
        billNameElement={Position(bill.stance)}
        billDescription={bill.title}
      />
    ) : (
      <ListItem
        className={clsx(
          "bg-secondary text-white" && !isSelectedBill,
          "bg-white text-dark" && isSelectedBill
        )}
        onClick={() => props.onClick(bill.billNumber)}
        key={bill.billNumber}
        billName={bill.billNumber}
        billDescription={bill.title}
      />
    )
  })

  const headerText = t("priority_bills", { defaultValue: "Priority Bills" })

  const header = (
    <CardTitle>
      <CardBootstrap.Title className="align-items-start fs-6 lh-sm mb-1 text-secondary">
        <strong>{headerText}</strong>
      </CardBootstrap.Title>
    </CardTitle>
  )

  return <MapleCard items={items} headerElement={header} />
}

const Position = (stance: string) => {
  let stanceSVG: string
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
    <div className="d-inline">
      <Image className="svg" alt="" src={stanceSVG} />
    </div>
  )
}

const EditBtnStyle = styled.p`
  color: #8999d6;
`
