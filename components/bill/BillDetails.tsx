import { flags } from "components/featureFlags"
import { FollowButton } from "components/shared/FollowButton"
import { isCurrentCourt } from "functions/src/shared"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Col, Container, Row } from "../bootstrap"
import { TestimonyFormPanel } from "../publish"
import { Banner } from "../shared/StyledSharedComponents"
import { Back } from "./Back"
import { BillNumber, Styled } from "./BillNumber"
import { BillTestimonies } from "./BillTestimonies"
import BillTrackerConnectedView from "./BillTracker"
import { LobbyingTable } from "./LobbyingTable"
import { Committees, Hearing, Sponsors } from "./SponsorsAndCommittees"
import { Status } from "./Status"
import { Summary } from "./Summary"
import { BillProps } from "./types"
import { BillCosponsorCard } from "components/dashboard/BillCosponsorCard"
import { Bill } from "components/db/bills"
import { Timestamp } from "firebase/firestore"

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

export const BillDetails = ({ bill }: BillProps) => {
  const { t } = useTranslation("common")
  return (
    <>
      {!isCurrentCourt(bill.court) && (
        <Banner>
          this bill is from session {bill.court} - not the current session
        </Banner>
      )}
      <StyledContainer className="mt-3 mb-3">
        <Row>
          <Col>
            <Back href="/bills">{t("back_to_bills")}</Back>
          </Col>
        </Row>
        {bill.history.length > 0 ? (
          <>
            <Row className="align-items-end justify-content-start">
              <Col md={2}>
                <BillNumber bill={bill} />
              </Col>
              <Col xs={10} md={6} className="mb-3 ms-auto">
                <Status bill={bill} />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col xs={12} className="d-flex justify-content-end">
                <FollowButton bill={bill} />
              </Col>
            </Row>
          </>
        ) : (
          <Row>
            <Col>
              <BillNumber bill={bill} />
            </Col>
            <Col xs={6} className="d-flex justify-content-end">
              <Styled>
                <FollowButton bill={bill} />
              </Styled>
            </Col>
          </Row>
        )}
        <Row className="mt-2">
          <Col>
            <Summary bill={bill} />
          </Col>
        </Row>
        <Row>
          <Col md={8}>
            <Sponsors bill={bill} className="mt-4 pb-1" />
            <BillTestimonies bill={bill} className="mt-4" />
            {flags().lobbyingTable && (
              <LobbyingTable bill={bill} className="mt-4 pb-1" />
            )}
          </Col>
          <Col md={4}>
            <Committees bill={bill} className="mt-4 pb-1" />
            <Hearing
              bill={bill}
              className="bg-secondary d-flex justify-content-center mt-4 pb-1 text-light"
            />
            <TestimonyFormPanel bill={bill} />
            {flags().billTracker && (
              <BillTrackerConnectedView bill={bill} className="mt-4" />
            )}
          </Col>
        </Row>
        <BillCosponsorCard bill={testbill} />
      </StyledContainer>
    </>
  )
}

const testbill: Bill = {
  id: '1234',
  court: 193,
  content: {
    Pinslip: 'test pinslip',
    Title: 'a bill to do legislative things',
    PrimarySponsor: {
      "Id": "JSC1",
      "Name": "Josh S. Cutler",
      "Type": 1,
      "ResponseDate": "2023-01-17T15:14:22.9133333"
    },
    Cosponsors: [
      {
        "Id": "L_S1",
        "Name": "Lindsay N. Sabadosa",
        "Type": 1,

        "ResponseDate": "2023-01-18T15:55:36.56"
      },
      {
        "Id": "DCG1",
        "Name": "Denise C. Garlick",
        "Type": 1,

        "ResponseDate": "2023-01-18T15:56:46.42"
      },
      {
        "Id": "JCD1",
        "Name": "James C. Arena-DeRosa",
        "Type": 1,

        "ResponseDate": "2023-02-18T11:48:54.2"
      },
      {
        "Id": "SBA1",
        "Name": "Shirley B. Arriaga",
        "Type": 1,

        "ResponseDate": "2023-05-08T13:16:41.88"
      },
      {
        "Id": "BMA1",
        "Name": "Brian M. Ashe",
        "Type": 1,

        "ResponseDate": "2023-06-15T09:28:22.0566667"
      },
      {
        "Id": "RBB1",
        "Name": "Ruth B. Balser",
        "Type": 1,

        "ResponseDate": "2023-02-15T12:41:35.2633333"
      },
      {
        "Id": "CPB2",
        "Name": "Christine P. Barber",
        "Type": 1,

        "ResponseDate": "2023-02-23T10:22:43.34"
      },
      {
        "Id": "J_B1",
        "Name": "John Barrett, III",
        "Type": 1,

        "ResponseDate": "2023-02-10T13:23:01.5266667"
      },
      {
        "Id": "NMB1",
        "Name": "Natalie M. Blais",
        "Type": 1,

        "ResponseDate": "2023-02-08T10:10:02.6333333"
      },
      {
        "Id": "MDB0",
        "Name": "Michael D. Brady",
        "Type": 1,

        "ResponseDate": "2023-05-04T12:00:13.9566667"
      },
      {
        "Id": "PLC1",
        "Name": "Peter Capano",
        "Type": 1,

        "ResponseDate": "2023-01-30T09:29:07.1366667"
      },
      {
        "Id": "DRC1",
        "Name": "Daniel R. Carey",
        "Type": 1,

        "ResponseDate": "2023-02-24T13:56:33.48"
      },
      {
        "Id": "JMC0",
        "Name": "Joanne M. Comerford",
        "Type": 1,

        "ResponseDate": "2023-02-09T10:21:23.9"
      },
      {
        "Id": "M_C1",
        "Name": "Mike Connolly",
        "Type": 1,

        "ResponseDate": "2023-02-15T14:41:47.7766667"
      },
      {
        "Id": "MCD1",
        "Name": "Marjorie C. Decker",
        "Type": 1,

        "ResponseDate": "2023-05-03T10:05:32.67"
      },
      {
        "Id": "SND0",
        "Name": "Sal N. DiDomenico",
        "Type": 1,

        "ResponseDate": "2023-01-25T16:24:36.71"
      },
      {
        "Id": "CAD1",
        "Name": "Carol A. Doherty",
        "Type": 1,

        "ResponseDate": "2023-01-30T15:51:40.3133333"
      },
      {
        "Id": "M_D2",
        "Name": "Mindy Domb",
        "Type": 1,

        "ResponseDate": "2023-01-20T14:34:12.0366667"
      },
      {
        "Id": "K_D1",
        "Name": "Kate Donaghue",
        "Type": 1,

        "ResponseDate": "2023-02-28T11:24:40.29"
      },
      {
        "Id": "MMD1",
        "Name": "Michelle M. DuBois",
        "Type": 1,

        "ResponseDate": "2023-02-07T21:30:17.69"
      },
      {
        "Id": "PAD1",
        "Name": "Patricia A. Duffy",
        "Type": 1,

        "ResponseDate": "2023-03-01T16:58:31.3166667"
      },
      {
        "Id": "JBE0",
        "Name": "James B. Eldridge",
        "Type": 1,

        "ResponseDate": "2023-02-19T14:52:08.2933333"
      },
      {
        "Id": "TFB1",
        "Name": "Tricia Farley-Bouvier",
        "Type": 1,

        "ResponseDate": "2023-02-10T09:43:48.2933333"
      },
      {
        "Id": "PRF0",
        "Name": "Paul R. Feeney",
        "Type": 1,

        "ResponseDate": "2023-01-26T15:01:03.0033333"
      },
      {
        "Id": "CLG1",
        "Name": "Carmine Lawrence Gentile",
        "Type": 1,

        "ResponseDate": "2023-02-02T22:26:54.4166667"
      },
      {
        "Id": "C_G1",
        "Name": "Carlos González",
        "Type": 1,

        "ResponseDate": "2023-03-31T15:59:54.5433333"
      },
      {
        "Id": "JKH1",
        "Name": "James K. Hawkins",
        "Type": 1,

        "ResponseDate": "2023-01-27T15:21:11.4266667"
      },
      {
        "Id": "N_H1",
        "Name": "Natalie M. Higgins",
        "Type": 1,

        "ResponseDate": "2023-02-14T14:02:56.14"
      },
      {
        "Id": "PJK1",
        "Name": "Patrick Joseph Kearney",
        "Type": 1,

        "ResponseDate": "2023-02-09T16:23:34.2233333"
      },
      {
        "Id": "DAL1",
        "Name": "David Henry Argosky LeBoeuf",
        "Type": 1,

        "ResponseDate": "2023-01-30T15:18:03.9666667"
      },
      {
        "Id": "JPL1",
        "Name": "Jack Patrick Lewis",
        "Type": 1,

        "ResponseDate": "2023-01-20T17:41:31.3866667"
      },
      {
        "Id": "DPL1",
        "Name": "David Paul Linsky",
        "Type": 1,

        "ResponseDate": "2023-06-20T15:29:09.34"
      },
      {
        "Id": "ACM1",
        "Name": "Adrian C. Madaro",
        "Type": 1,

        "ResponseDate": "2023-02-13T15:39:58.3133333"
      },
      {
        "Id": "RAM1",
        "Name": "Rita A. Mendes",
        "Type": 1,

        "ResponseDate": "2023-05-18T15:16:47.1766667"
      },
      {
        "Id": "S_M1",
        "Name": "Samantha Montaño",
        "Type": 1,

        "ResponseDate": "2023-01-23T13:59:17.6066667"
      },
      {
        "Id": "BWM1",
        "Name": "Brian W. Murray",
        "Type": 1,

        "ResponseDate": "2023-02-16T23:15:34.4966667"
      },
      {
        "Id": "SCO1",
        "Name": "Steven Owens",
        "Type": 1,

        "ResponseDate": "2023-03-01T11:33:07.13"
      },
      {
        "Id": "WSP1",
        "Name": "Smitty Pignatelli",
        "Type": 1,

        "ResponseDate": "2023-02-08T09:49:01.4633333"
      },
      {
        "Id": "O_R1",
        "Name": "Orlando Ramos",
        "Type": 1,

        "ResponseDate": "2023-03-31T11:02:43.65"
      },
      {
        "Id": "RLR0",
        "Name": "Rebecca L. Rausch",
        "Type": 1,

        "ResponseDate": "2023-07-07T16:11:25.1866667"
      },
      {
        "Id": "MRS1",
        "Name": "Margaret R. Scarsdale",
        "Type": 1,

        "ResponseDate": "2023-03-27T16:41:44.28"
      },
      {
        "Id": "DAS1",
        "Name": "Danillo A. Sena",
        "Type": 1,

        "ResponseDate": "2023-03-07T15:35:04.4266667"
      },
      {
        "Id": "TMS1",
        "Name": "Thomas M. Stanley",
        "Type": 1,

        "ResponseDate": "2023-02-10T15:47:34.6833333"
      },
      {
        "Id": "S_G2",
        "Name": "Steven Ultrino",
        "Type": 1,

        "ResponseDate": "2023-01-31T09:27:05.3833333"
      },
      {
        "Id": "E_U1",
        "Name": "Erika Uyterhoeven",
        "Type": 1,

        "ResponseDate": "2023-02-09T13:23:10.4633333"
      },
      {
        "Id": "T_V1",
        "Name": "Tommy Vitolo",
        "Type": 1,

        "ResponseDate": "2023-03-30T12:11:00.8333333"
      },
      {
        "Id": "SLG1",
        "Name": "Susannah M. Whipps",
        "Type": 1,

        "ResponseDate": "2023-01-27T14:52:06.1266667"
      },
      {
        "Id": "BLW1",
        "Name": "Bud L. Williams",
        "Type": 1,

        "ResponseDate": "2023-02-08T19:41:28.4633333"
      }
    ],
    DocumentText: 'document text',
    BillNumber: 'H1234',
    DocketNumber: '1234',
    GeneralCourtNumber: 193,
    LegislationTypeName: ''
},
city: 'Boston',
cosponsorCount: 0,
testimonyCount: 0,
endorseCount: 0,
neutralCount: 0,
opposeCount: 0,
fetchedAt: Timestamp.fromMillis(0),
history: [],
}
