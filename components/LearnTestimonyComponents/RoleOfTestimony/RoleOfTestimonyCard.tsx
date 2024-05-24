import { Col, Image, Row } from "../../bootstrap"
import clsx from "clsx"

export type RoleOfTestimonyCardProps = {
  title: string
  index: number
  alt: string
  paragraph: string
  src: string
}

const RoleOfTestimonyCard = ({
  title,
  index,
  alt,
  paragraph,
  src
}: RoleOfTestimonyCardProps) => {
  return (
    <Row
      className="w-100 h-auto d-flex flex-row flex-wrap justify-content-center py-3 px-5 my-5 mx-0 bg-white rounded-3 tracking-tighter"
      style={{ lineHeight: "normal" }}
    >
      <Col
        className="d-flex align-items-center w-auto m-auto my-md-0 mx-md-5"
        sm={{ span: 12, order: 0 }}
        md={{ order: index % 2 == 0 ? 0 : 5 }}
      >
        <Image fluid src={src} alt={alt} style={{ height: "10rem" }} />
      </Col>
      <Col
        className={clsx(
          "d-flex flex-column justify-content-center pt-3 pt-md-0",
          index % 2 === 0 && "ps-3 ps-md-5"
        )}
        sm={{ span: 12, order: 1 }}
        md={{ span: 6, order: 3 }}
      >
        <h4 className="pt-0 pt-md-3 mb-3 fw-bold">{title}</h4>
        <p className="fs-4">{paragraph}</p>
      </Col>
    </Row>
  )
}

export default RoleOfTestimonyCard
