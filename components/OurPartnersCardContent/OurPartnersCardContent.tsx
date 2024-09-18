import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"
import { useTranslation } from "next-i18next"
import { Row, Col } from "../bootstrap"


const NuLawLabCardContent = () => {
  const { t } = useTranslation("common")
  return (
    <>
      <Row className="mb-5">
        <Col className="text-center align-self-center" md={3}>
          <Image
            fluid
            src="/northeastern_school_of_law_logo.svg"
            alt={t("partnerLogos.NuLaw")}
          />
        </Col>
        <Col className="align-self-center" md={9}>
          <p className="lh-sm tracking-wide fs-5 pt-4 pt-md-0">
            The{" "}
            <a
              href="https://www.nulawlab.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              NuLawLab
            </a>{" "}
            is the interdisciplinary innovation laboratory at{" "}
            <a
              href="https://law.northeastern.edu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Northeastern University School of Law
            </a>
            .
          </p>
          <p className="lh-sm tracking-wide fs-5 pt-4 pt-md-0">
            The Lab is a leader in the{" "}
            <a
              href="https://dl.designresearchsociety.org/drs-conference-papers/drs2022/editorials/32/"
              target="_blank"
              rel="noopener noreferrer"
            >
              global legal design movement
            </a>{" "}
            and incubates projects that advance the democratization of law.
          </p>
        </Col>
      </Row>
    </>
  )
}

const CodeForBostonCardContent = () => {
  const { t } = useTranslation("common")

  return (
    <>
      <Row className="mb-3">
        <Col className="text-center align-self-center" md={3}>
          <Image
            fluid
            src="/codeforbostonicon.png"
            alt={t("partnerLogos.CodeForBoston")}
          />
        </Col>
        <Col className="align-self-center" md={9}>
          <p className="lh-sm tracking-wide fs-5 pt-4 pt-md-0">
            Code for Boston addresses local social and civic challenges through
            creative uses of technology. Despite the name, they are not solely
            focused on coding!<br></br>
            <br></br> They foster relationships between government, nonprofit,
            academic, for-profit companies, residents, civic technologists,
            analysts, designers, and many more.{" "}
            <a
              href="https://github.com/codeforboston/maple/graphs/contributors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code for Boston's volunteer contributors
            </a>{" "}
            have led the technical implementation and development of this
            website and platform as an open source project (
            <a
              href="https://github.com/codeforboston/maple"
              target="_blank"
              rel="noopener noreferrer"
            >
              see our repository on GitHub
            </a>
            ).
          </p>
        </Col>
      </Row>
    </>
  )
}

const OpenCollectiveContent = () => {
  const { t } = useTranslation("common")

  return (
    <>
      <Row className="mb-3">
        <Col className="text-center align-self-center" md={3}>

          <Image
            fluid
            src="/open_collective_logo.png"
            alt={t("partnerLogos.OpenCollective")}
          />
        
          <Image fluid src="/pid.png" alt="partners in democracy logo" />

        </Col>
        <Col className="align-self-center" md={9}>
          <p className="lh-sm tracking-wide fs-5 pt-4 pt-md-0">
            {t("partners.pid")}
          </p>
        </Col>
      </Row>
    </>
  )
}

export { NuLawLabCardContent, CodeForBostonCardContent, OpenCollectiveContent }
