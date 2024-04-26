import { Container } from "react-bootstrap"
import AdditionalResourcesCard from "./AdditionalResourcesCard"
import AdditionalResourcesCardContent from "./AdditionalResourcesCardContent"

const content = [
  {
    paragraph: {
      P1: (
        <>
          The MA Legislature has an{" "}
          <a
            href="https://malegislature.gov/Search/FindMyLegislator"
            target="_blank"
            rel="noopener noreferrer"
          >
            online tool
          </a>{" "}
          you can use to identify your legislators based on your home address.
        </>
      )
    }
  },
  {
    paragraph: {
      P1: (
        <>
          The MA Legislature publishes a{" "}
          <a
            href="https://www.mass.gov/doc/the-legislative-process-0/download"
            target="_blank"
            rel="noopener noreferrer"
          >
            document on the legislative process.
          </a>
        </>
      )
    }
  },
  {
    paragraph: {
      P1: (
        <>
          Mass Legal Services published a 2007 guide to The{" "}
          <a
            href="https://www.masslegalservices.org/content/legislative-process-massachusetts-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            Legislative Process in Massachusetts.
          </a>
        </>
      )
    }
  }
]

const AdditionalResources = () => {
  return (
    <Container fluid="md" className="mt-3">
      <h1 className={`fs-1 fw-bold text-center text-black`}>
        Additional Resources
      </h1>
      <p className={`fs-4 mx-5 my-3`}>
        We hope these pages will help you submit effective testimony. You may
        want to consult these other resources to build a more detailed
        understanding of the legislative process and how you can contribute.
      </p>
      {content.map((value, index) => (
        <AdditionalResourcesCard key={index}>
          <AdditionalResourcesCardContent key={index}>
            {value.paragraph.P1}
          </AdditionalResourcesCardContent>
        </AdditionalResourcesCard>
      ))}
    </Container>
  )
}

export default AdditionalResources