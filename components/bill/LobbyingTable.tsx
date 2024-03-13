import { Card, Container } from "../bootstrap"
import { FC } from "../types"
import { BillProps } from "./types"
import { Table } from "react-bootstrap"
import { Card as MapleCard } from "../Card"

export const LobbyingTable: FC<React.PropsWithChildren<BillProps>> = ({
  bill,
  className
}) => {
  const current = bill.currentCommittee
  if (!current) return null
  return (
    <Container className="p-0">
      <MapleCard
        className={`${className} bg-white`}
        headerElement={
          <Card.Header className="h4 bg-secondary text-light">
            Lobbying Parties
          </Card.Header>
        }
        body={
          <Card.Body>
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
          </Card.Body>
        }
      />
    </Container>
  )
}
