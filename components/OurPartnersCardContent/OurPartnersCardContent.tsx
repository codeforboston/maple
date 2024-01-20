import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./OurPartnersCardContent.module.css"
import { ReactNode } from "react"

const NuLawLabCardContent = () => (
  <OurPartnersCardContent
    image={
      <Image
        fluid
        src="/northeastern_school_of_law_logo.svg"
        alt="Northeatern School of Law icon"
      />
    }
    content={
      <>
        <p className={styles.content}>
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
        <p className={styles.content}>
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
      </>
    }
  />
)

const CodeForBostonCardContent = () => {
  return (
    <OurPartnersCardContent
      image={
        <Image fluid src="/codeforbostonicon.png" alt="Code for Boston icon" />
      }
      content={
        <p className={styles.content}>
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
          have led the technical implementation and development of this website
          and platform as an open source project (
          <a
            href="https://github.com/codeforboston/maple"
            target="_blank"
            rel="noopener noreferrer"
          >
            see our repository on GitHub
          </a>
          ).
        </p>
      }
    />
  )
}

const OpenCollectiveContent = () => (
  <OurPartnersCardContent
    image={
      <Image fluid src="/open_collective_logo.png" alt="open_collective_logo" />
    }
    content={
      <p className={styles.content}>
        MAPLE is a fiscally sponsored initiative of the 501(c)(3), the Open
        Collective Foundation (OCF). You can see a full list of our donors and
        expenditures on our Open Collective webpage. You can also join the list
        and make a donation through the sit.
      </p>
    }
  />
)

type OurPartnersCardContentProps = {
  image: ReactNode
  content: ReactNode
}

export const OurPartnersCardContent = ({
  image,
  content
}: OurPartnersCardContentProps) => {
  return (
    <Row className="mb-3">
      <Col className="text-center align-self-center" md={3}>
        {image}
      </Col>

      <Col className="align-self-center" md={9}>
        {content}
      </Col>
    </Row>
  )
}

export { NuLawLabCardContent, CodeForBostonCardContent, OpenCollectiveContent }
