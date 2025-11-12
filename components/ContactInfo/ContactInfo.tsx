import { FC, ReactNode } from "react"
import styled from "styled-components"

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  font-size: 22;
`
export const Link = styled.a`
  color: inherit;
`
export const NoUnderlineLink = styled(Link)`
  text-decoration: none;
`

export const IconContainer = styled.div`
  display: flex;
  gap: 14px;
`
interface Props {
  phoneNumber?: string
  email?: string
  website?: string
  icons?: ReactNode
}

export const ContactInfo: FC<React.PropsWithChildren<Props>> = ({
  phoneNumber,
  email,
  website,
  icons
}) => (
  <Container>
    {phoneNumber && (
      <NoUnderlineLink
        href={`tel: ${phoneNumber}`}
        target="_blank"
        rel="noreferrer"
      >
        {phoneNumber}
      </NoUnderlineLink>
    )}
    {email && (
      <Link href={`mailto: ${email}`} target="_blank" rel="noreferrer">
        {email}
      </Link>
    )}
    {website && (
      <NoUnderlineLink href={website} target="_blank" rel="noreferrer">
        {website}
      </NoUnderlineLink>
    )}
    {icons && <IconContainer>{icons}</IconContainer>}
  </Container>
)
