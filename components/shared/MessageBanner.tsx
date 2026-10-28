import { Col, Image } from "components/bootstrap"
import { ReactNode } from "react"
import { RowProps } from "react-bootstrap"
import styled from "styled-components"
import { DigitalDemocracyOnly, MapleOnly } from "./SkinOnly"
import { Banner, SlimBanner } from "./StyledSharedComponents"

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

/* Digital Democracy, Mixed and Statehouse: the slim note (SlimBanner), with
   the icon, the heading in bold and the content beside it. The icons are drawn
   in white for the orange bar, so the icon is used as a mask and takes the
   note's dark ink instead. */
const SlimMessage = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;

  .icon {
    flex: none;
    width: 1.75rem;
    height: 1.75rem;
    background-color: currentColor;
    -webkit-mask: var(--icon) no-repeat center / contain;
    mask: var(--icon) no-repeat center / contain;
  }

  .heading {
    font-weight: 700;
  }
`

export function MessageBanner(props: Props) {
  const { icon, heading, content, ...rest } = props
  return (
    <>
      <MapleOnly>
        <Banner {...rest} className="align-items-center py-4 px-3 m-0">
          <Col xs={"auto"} className="flex mh-50 p-2">
            {icon && <Image style={{ height: "2.8rem" }} src={icon} alt="" />}
          </Col>
          <Col>
            <MessageBannerHeading>{heading}</MessageBannerHeading>
            <MessageBannerContent>{content}</MessageBannerContent>
          </Col>
        </Banner>
      </MapleOnly>
      <DigitalDemocracyOnly>
        <SlimBanner>
          <SlimMessage>
            {icon && (
              <span
                className="icon"
                aria-hidden="true"
                style={{ "--icon": `url("${icon}")` } as React.CSSProperties}
              />
            )}
            <span>
              <span className="heading">{heading}</span> {content}
            </span>
          </SlimMessage>
        </SlimBanner>
      </DigitalDemocracyOnly>
    </>
  )
}
