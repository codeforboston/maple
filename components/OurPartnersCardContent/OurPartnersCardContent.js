import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"

const NuLawLabCardContent = () => {
  return (
    <>
      <Row className="mb-5">
        <Col className="text-center align-self-center">
          <Image fluid src="/nulawlabicon.png" alt="NuLawLab icon" />
        </Col>
        <Col className="align-self-center">
          <p>
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
        <Col className="text-center align-self-center">
          <Image
            fluid
            src="/codeforbostonicon.png"
            alt="Code for Boston icon"
          />
        </Col>
        <Col className="align-self-center">
          <p>
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

const BostonCollegeCardContent = () => {
  return (
    <>
      <Row className="mb-5">
        <Col className="text-center align-self-center">
          <Image fluid src="/bostoncollegeicon.png" alt="Boston College icon" />
        </Col>
        <Col className="align-self-center">
          <p>
            The BC Law School is an inclusive community of scholars that
            prepares students for success in the legal profession at the highest
            levels.<br></br>
            <br></br>Project co-founder Matt Victor is a graduate of The BC Law
            School.
          </p>
        </Col>
      </Row>
    </>
  )
}

const HbkCenterCardContent = () => {
  return (
    <>
      <Row className="mb-3">
        <Col className="text-center align-self-center">
          <Image
            fluid
            src="/berkmankleincentericon.png"
            alt="Berkman Klein Center icon"
          />
        </Col>
        <Col className="align-self-center">
          <p>
            The Berkman Klein Center's mission is to explore and understand
            cyberspace; to study its development, dynamics, norms, and
            standards; and to assess the need or lack thereof for laws and
            sanctions. <br></br>
            <br></br>Project co-founder{" "}
            <a href="https://cyber.harvard.edu/people/nathan-sanders">
              Nathan Sanders
            </a>{" "}
            is a past Fellow and current Affiliate at BKC.
          </p>
        </Col>
      </Row>
    </>
  )
}

export {
  NuLawLabCardContent,
  CodeForBostonCardContent,
  BostonCollegeCardContent,
  HbkCenterCardContent
}
