import { FC } from "react"
import styled from "styled-components"
import { Card as MapleCard } from "../Card"
import { Card as BootstrapCard } from "react-bootstrap"

const Chamber = styled.span`
  font-size: 16px;
`

const Committee = styled.div`
  display: flex;
  width: 100%;
  text-align: center;
  justify-content: center;
  font-size: 22px;
`

const Container = styled.div`
  max-width: 255px;
  font-family: Nunito;
`
const Head = styled(BootstrapCard.Header)`
  background-color: var(--bs-blue);
  color: white;
  font-size: 22px;
`

export const CurrentCommitteeCard: FC<React.PropsWithChildren<{
  chamber: "House" | "Senate"
  committee: string
}>> = ({ committee, chamber }) => (
  <Container>
    <MapleCard
      headerElement={<Head>Committee</Head>}
      body={
        <BootstrapCard.Body>
          <Chamber>{chamber}</Chamber>
          <br />
          <Committee>{committee}</Committee>
        </BootstrapCard.Body>
      }
    />
  </Container>
)
