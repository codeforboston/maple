import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./OurPartnersCardContent.module.css"

const NuLawLabCardContent = () => {
  return (
    <>
      <Row className="mb-5">
        <Col className="text-center align-self-center" md={6}>
          <Image
            fluid
            src="/nu_school_of_law.png"
            alt="Northeatern School of Law icon"
          />
        </Col>
        <Col className="align-self-center" md={6}>
          <p className={styles.content}>
            The <a href="https://www.nulawlab.org/">NuLawLab</a> is the
            interdisciplinary innovation laboratory at{" "}
            <a href="https://law.northeastern.edu/">
              Northeastern University School of Law
            </a>
            . The Lab is a leader in the{" "}
            <a href="https://dl.designresearchsociety.org/drs-conference-papers/drs2022/editorials/32/">
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
  return (
    <>
      <Row className="mb-3">
        <Col className="text-center align-self-center" md={6}>
          <Image
            fluid
            src="/codeforbostonicon.png"
            alt="Code for Boston icon"
          />
        </Col>
        <Col className="align-self-center" md={6}>
          <p className={styles.content}>
            Code for Boston addresses local social and civic challenges through
            creative uses of technology. Despite the name, they are not solely
            focused on coding!<br></br>
            <br></br> They foster relationships between government, nonprofit,
            academic, for-profit companies, residents, civic technologists,
            analysts, designers, and many more.{" "}
            <a href="https://github.com/codeforboston/maple/graphs/contributors">
              Code for Boston's volunteer contributors
            </a>{" "}
            have led the technical implementation and development of this
            website and platform as an open source project (
            <a href="https://github.com/codeforboston/maple">
              see our repository on GitHub
            </a>
            ).
          </p>
        </Col>
      </Row>
    </>
  )
}

export { NuLawLabCardContent, CodeForBostonCardContent }
