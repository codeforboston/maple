import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"
import AdditionalResourcesCard from "../components/AdditionalResources/AdditionalResourcesCard"
import AdditionalResourcesCardContent from "../components/AdditionalResources/AdditionalResourcesCardContent"
import styles from "../components/AdditionalResources/AdditionalResourcesCard.module.css"

const content = [
  {
    paragraph: {
      P1: `The MA Legislature has an online tool you can use to identify your legislators (link to malegislature.gov) based on your home address.`
    }
  },
  {
    paragraph: {
      P1: `The MA Legislature publishes a 13-step guide on How an Idea Becomes a Law (link to malegislature.gov)`
    }
  },
  {
    paragraph: {
      P1: `Mass Legal Services published a 2007 guide to The Legislative Process in Massachusetts (link to masslegalservices.org)`
    }
  }
]

export default createPage({
  title: "Additional Resources",
  Page: () => {
    return (
      <Container fluid="md" className="mt-3">
        <h1 className={styles.title}>Additional Resources</h1>
        <p className={styles.subheader}>
          We hope this page will be helpful to you in outlining how to submit
          effective testimony. You may want to consult these other resources to
          build a more detailed understanding of the legislative process and how
          you can contribute.
        </p>
        {content.map((value, index) => (
          <AdditionalResourcesCard title={value.title} key={value.title}>
            <AdditionalResourcesCardContent index={index}>
              {value.paragraph}
            </AdditionalResourcesCardContent>
          </AdditionalResourcesCard>
        ))}
      </Container>
    )
  }
})
