import { format, fromUnixTime } from "date-fns"
import styled from "styled-components"
import { Row } from "../bootstrap"
import { FC } from "../types"
import { LabeledContainer } from "./LabeledContainer"
import styles from "./SponsorsAndCommittees.module.css"
import { BillProps } from "./types"
import { billSiteURL, Wrap } from "components/links"
import { useContext } from "react"
import { BillHistory } from "../db"
import { CourtContext } from "./Status"
import { Button, Modal, Table } from "react-bootstrap"

export const LobbyingTable: FC<React.PropsWithChildren<BillProps>> = ({
  bill,
  className
}) => {
  const current = bill.currentCommittee
  if (!current) return null
  return (
    <LabeledContainer className={className}>
      <Row className={`bg-secondary text-light ${styles.subHeader}`}>
        Lobbying Parties
      </Row>
      <Table>
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Position</th>
            <th>Disclosure Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Example Name</td>
            <td>Pro</td>
            <td>April 10, 2023</td>
          </tr>
          <tr>
            <td>Example Name</td>
            <td>Neutral</td>
            <td>March 29, 2023</td>
          </tr>
        </tbody>
      </Table>
    </LabeledContainer>
  )
}
