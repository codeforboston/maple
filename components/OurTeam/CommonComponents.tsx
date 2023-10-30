import styled from "styled-components"
import { Container } from "../bootstrap"

export const MemberItem = ({
  name,
  email,
  descr
}: {
  name: string
  email?: string
  descr: string
}) => {
  return (
    <StyledContainer className="py-3 px-4">
      <NameContainer>{name}</NameContainer>
      {email ? (
        <EmailContainer href={"mailto:" + email}>{email}</EmailContainer>
      ) : null}
      <DescrContainer className="my-3">{descr}</DescrContainer>
    </StyledContainer>
  )
}

const StyledContainer = styled(Container)`
  //border-top: 1px solid #979797;
  background: white;
  border-radius: 0 0 10px 10px;
`
const EmailContainer = styled.a`
  color: #1a3185;
  font-size: 20px;
  font-weight: 600;
  line-height: 25px;
  letter-spacing: 0em;
  text-align: left;
  text-decoration: underline;
`
const NameContainer = styled.div`
  color: #1a3185;
  font-size: 25px;
  font-weight: 600;
  line-height: 31px;
  letter-spacing: 0em;
  text-align: left;
`
const DescrContainer = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.015em;
  text-align: left;
`

export const Divider = styled.hr`
  border: 1px solid #979797;
  margin: 0;
`

export const PageDescr = styled.div`
  font-weight: 700;
  font-size: 25px;
`

export const PageTitle = styled.div`
  font-weight: 600;
  font-size: 60px;
`
export const SectionContainer = styled.div`
  border-radius: 10px;
  background: white;
`

export const SectionTitle = styled.div`
  color: #ffffff;
  background: #1a3185;
  font-weight: 500;
  font-size: 26px;
  border-radius: 10px 10px 0 0;
`
