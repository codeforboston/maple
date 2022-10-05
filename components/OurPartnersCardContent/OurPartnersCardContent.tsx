import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./OurPartnersCardContent.module.css"

const NuLawLabCardContent = () => {
  return (
    <>
      <Row className="mb-5">
        <Col className="text-center align-self-center" md={6}>
          <Image fluid src="/nulawlabicon.png" alt="NuLawLab icon" />
        </Col>
        <Col className="align-self-center" md={6}>
          <p className={styles.content}>
            The NuLawLab is the interdisciplinary innovation laboratory at{" "}
            <a href="https://www.northeastern.edu/law/">
              Northeastern University School of Law
            </a>
            .<br></br>
            <br></br> NuLawLab's researchers are leaders in the emerging global{" "}
            <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3644302">
              Legal Design movement
            </a>
            .
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
            <a href="https://github.com/codeforboston/advocacy-maps/graphs/contributors">
              Code for Boston's volunteer contributors
            </a>{" "}
            have led the technical implementation and development of this
            website and platform as an open source project (
            <a href="https://github.com/codeforboston/advocacy-maps">
              see our repository on GitHub
            </a>
            ).
          </p>
        </Col>
      </Row>
    </>
  )
}

export {
  NuLawLabCardContent,
  CodeForBostonCardContent,
}
