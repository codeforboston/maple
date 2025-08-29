import { CardTitle, ListItem } from "components/Card"
import { Card as MapleCard } from "../Card/Card"
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
  const items = props.bills?.map((bill, index) => {
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
    <div className="d-inline">
      <Image className="svg" alt="" src={stanceSVG} />
    </div>
  )
}

const EditButton = () => {
  const { t } = useTranslation("common")
  return (
    <div
      className="d-flex flex-column align-items-center"
      onClick={() => console.log("edit")}
    >
      <EditBtnStyle className="m-0 editTitle">{t("edit")}</EditBtnStyle>
      <div className="d-inline">
        <Image className="svg" alt="" src="/edit-testimony.svg" />
      </div>
    </div>
  )
}

const EditBtnStyle = styled.p`
  color: #8999d6;
`
