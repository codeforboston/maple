import ErrorPage from "next/error"
import styled from "styled-components"
import { Col, Container, Row, Spinner } from "components/bootstrap"
import { useDistrict, useMember } from "components/db"
import { DistrictTab } from "./DistrictTab"

const tabs = [
  "Priorities",
  "Bills",
  "Elections",
  "Finance",
  "District",
  "Her testimony",
  "Votes"
]

const TabButton = styled.button`
  background: transparent;
  border: 0;
  border-bottom: 5px solid transparent;
  color: #68707a;
  font-size: 1.35rem;
  font-weight: 700;
  padding: 1.35rem 1.9rem 1.15rem;

  &.active {
    border-bottom-color: #18358f;
    color: #18358f;
  }
`

export function LegislatorProfilePage({
  court,
  memberCode
}: {
  court: number
  memberCode: string
}) {
  const { member, loading: memberLoading } = useMember(court, memberCode)
  const { district, loading: districtLoading } = useDistrict(
    court,
    member?.Branch,
    member?.District
  )

  if (memberLoading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  }

  if (!member) {
    return <ErrorPage statusCode={404} withDarkMode={false} />
  }

  return (
    <Container fluid="xl" className="pb-5">
      <Row className="mt-4 mb-3">
        <Col>
          <h1 className="fw-bold mb-1">{member.Name}</h1>
          <p className="fs-5 text-body-secondary mb-0">
            {member.Branch} - {member.District}
          </p>
        </Col>
      </Row>
      <div
        className="d-flex justify-content-between border-bottom mb-4 overflow-auto"
        role="tablist"
        aria-label="Legislator profile sections"
      >
        {tabs.map(label => (
          <TabButton
            key={label}
            type="button"
            role="tab"
            aria-selected={label === "District"}
            className={label === "District" ? "active" : undefined}
            disabled={label !== "District"}
          >
            {label}
          </TabButton>
        ))}
      </div>
      <div role="tabpanel">
        <DistrictTab district={district} loading={districtLoading} />
      </div>
    </Container>
  )
}
