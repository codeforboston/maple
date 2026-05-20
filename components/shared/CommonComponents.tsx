import { PrettyEmailWrap } from "react-pretty-email-wrap"
import styled from "styled-components"
import { Container } from "../bootstrap"
import * as links from "../links"

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
        <EmailContainer href={"mailto:" + email}>
          <PrettyEmailWrap>{email}</PrettyEmailWrap>
        </EmailContainer>
      ) : null}
      <DescrContainer className="my-3">{descr}</DescrContainer>
    </StyledContainer>
  )
}

export const Back = styled(links.Internal)`
  margin-right: auto;
`

export const ButtonContainer = styled.div`
  width: fit-content;
`

export const DescrContainer = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.015em;
  text-align: left;
  color: var(--maple-text-body);
`

export const Divider = styled.hr`
  border: 1px solid var(--maple-border-default);
  margin: 0;
`

const EmailContainer = styled.a`
  color: var(--maple-brand-primary);
  font-size: 20px;
  font-weight: 600;
  line-height: 25px;
  letter-spacing: 0em;
  text-align: left;
  text-decoration: underline;
`

export const FeatureCalloutButton = styled.button`
  border-radius: var(--maple-radius-xl);
  font-size: 12px;
`

export const NameContainer = styled.div`
  color: var(--maple-brand-primary);
  font-size: 25px;
  font-weight: 600;
  line-height: 31px;
  letter-spacing: 0em;
  text-align: left;
`

export const PageDescr = styled.div`
  font-weight: 700;
  font-size: 25px;
  color: var(--maple-text-body);
`

export const PageTitle = styled.div`
  font-weight: 600;
  font-size: 60px;
  color: var(--maple-text-strong);
`

export const SectionContainer = styled.div`
  border-radius: var(--maple-radius-lg);
  background: var(--maple-surface-base);
`

export const SectionTitle = styled.div`
  color: var(--maple-text-inverse);
  background: var(--maple-brand-primary);
  font-weight: 500;
  font-size: 26px;
  border-radius: var(--maple-radius-lg) var(--maple-radius-lg) 0 0;
`

const StyledContainer = styled(Container)`
  //border-top: 1px solid #979797;
  background: var(--maple-surface-base);
  border-radius: 0 0 var(--maple-radius-lg) var(--maple-radius-lg);
`
