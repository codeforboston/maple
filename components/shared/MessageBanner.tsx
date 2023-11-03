import { Col, Image } from "components/bootstrap"
import { ReactNode } from "react"
import { RowProps } from "react-bootstrap"
import styled from "styled-components"
import { Banner } from "./StyledSharedComponents"

export type Props = {
  children?: ReactNode
  className?: string
  heading?: string | ReactNode
  content?: string | ReactNode
  icon?: string
}

const MessageBannerHeading = styled("div")`
  text-align: left;
  font-size: 1.5625rem;
  font-style: normal;
  font-weight: 600;
  line-height: 2rem;
  margin-bottom: 0.015rem;
`
const MessageBannerContent = styled("div")`
  text-align: left;
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.5rem;
  letter-spacing: 0.015rem;
`

export function MessageBanner(props: Props) {
  const { icon, heading, content, ...rest } = props
  return (
    <Banner {...rest} className="align-items-center py-4 px-3 m-0">
      <Col xs={"auto"} className="flex mh-50 p-2">
        {icon && <Image style={{ height: "2.8rem" }} src={icon} alt="" />}
      </Col>
      <Col>
        <MessageBannerHeading>{heading}</MessageBannerHeading>
        <MessageBannerContent>{content}</MessageBannerContent>
      </Col>
    </Banner>
  )
}
