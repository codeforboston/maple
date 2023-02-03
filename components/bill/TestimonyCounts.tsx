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

// const Container = styled.div`
//   display: grid;
//   grid-template-columns: 5rem 8rem 2rem;
//   grid-template-rows: 2rem 2rem 2rem 2rem;
//   align-items: center;

//   .position {
//     grid-column: 1;
//   }

//   .meter {
//     position: relative;

//     height: 1rem;
//     grid-column: 2;

//     .filled {
//       background-color: var(--position-color);
//     }

//     .total {
//       background-color: var(--bs-body-bg);
//     }

//     .filled,
//     .total {
//       position: absolute;
//       top: 0px;
//       left: 0px;
//       right: 0px;
//       height: 100%;
//       border-radius: 0.5rem;
//     }
//   }

//   .count {
//     grid-column: 3;

//     background-color: var(--bs-body-bg);
//     border-radius: 1rem;
//     text-align: center;
//     margin: auto;
//     font-family: "Archivo";
//     padding: 0 0.4rem 0 0.4rem;
//     font-size: 0.75rem;
//   }

//   .title {
//     grid-column: 1 / 4;
//     grid-row: 1;

//     text-align: center;
//     margin: auto;
//     color: var(--bs-blue);
//   }

//   .endorse {
//     grid-row: 2;
//     --position-color: var(--bs-green);
//   }
//   .oppose {
//     grid-row: 3;
//     --position-color: var(--bs-orange);
//   }
//   .neutral {
//     grid-row: 4;
//     --position-color: var(--bs-dark-blue);
//   }
// `

// const Count = ({
//   position,
//   count,
//   total,
//   label
// }: {
//   position: string
//   label: string
//   count: number
//   total: number
// }) => {
//   return (
//     <>
//       <div className={`position ${position}`}>{label}</div>
//       <div className={`meter ${position}`}>
//         <div className="total" />
//         <div
//           className="filled"
//           style={{ right: `${total > 0 ? (1 - count / total) * 100 : 100}%` }}
//         />
//       </div>
//       <div className={`count ${position}`}>{count}</div>
//     </>
//   )
// }

export const TestimonyCounts = ({
  bill: {
    testimonyCount: total,
    neutralCount: neutral,
    endorseCount: endorse,
    opposeCount: oppose
  }
}: BillProps) => {
  return (
    // <Container>
    //   <div className="title">{total} Total Testimonies</div>
    //   <Count position="endorse" count={endorse} label="Endorse" total={total} />
    //   <Count position="neutral" count={neutral} label="Neutral" total={total} />
    //   <Count position="oppose" count={oppose} label="Oppose" total={total} />
    // </Container>
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
