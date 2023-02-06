import styled from "styled-components"
import { Col, Image, Row, Stack } from "../bootstrap"
import { BillProps } from "./types"

const CountDirection = styled.div`
  display: flex;
  flex-direction: row;

  @media (max-width: 311px) {
    flex-direction: column;
  }
`

const CountTotal = styled.div`
  color: var(--bs-blue);
  font-weight: 500;
  font-size: 16px;
  line-height: 125%;

  letter-spacing: 0.015em;
`

const CountCategory = styled.div`
  width: 47px;
  height: 15px;

  font-weight: 600;
  font-size: 12px;
  line-height: 125%;

  letter-spacing: 0.03em;

  color: #979797;
`

const CountIcon = styled(Image)`
  margin-left: 20px;
  padding: 0;
  width: 25%;
`

const CountTally = styled.div`
  color: var(--bs-blue);

  width: 8px;
  height: 15px;

  font-weight: 600;
  font-size: 12px;
  line-height: 125%;
`

export const TestimonyCounts = ({
  bill: {
    testimonyCount: total,
    neutralCount: neutral,
    endorseCount: endorse,
    opposeCount: oppose
  }
}: BillProps) => {
  return (
    <Stack className={`align-self-center mx-auto`}>
      <CountTotal className={`ms-2`}>{total} Total Testimonies</CountTotal>
      <CountDirection className={`me-1 ms-4 my-1`}>
        <Col className={`px-2`}>
          <CountCategory>Endorse</CountCategory>
          <Row className={`justify-content-start`}>
            <CountIcon src="/thumbs-endorse.svg" alt="thumbs up" height="23" />
            <CountTally className={`align-self-center pe-0 ps-2`}>
              {endorse}
            </CountTally>
          </Row>
        </Col>
        <Col className={`px-2`}>
          <CountCategory>Neutral</CountCategory>
          <Row className={`justify-content-start`}>
            <CountIcon src="/thumbs-neutral.svg" alt="thumbs up" height="23" />
            <CountTally className={`align-self-center pe-0 ps-2`}>
              {neutral}
            </CountTally>
          </Row>
        </Col>
        <Col className={`px-2`}>
          <CountCategory>Oppose</CountCategory>
          <Row className={`justify-content-start`}>
            <CountIcon src="/thumbs-oppose.svg" alt="thumbs up" height="23" />
            <CountTally className={`align-self-center pe-0 ps-2`}>
              {oppose}
            </CountTally>
          </Row>
        </Col>
      </CountDirection>
    </Stack>
  )
}
