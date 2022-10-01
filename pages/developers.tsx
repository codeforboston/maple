import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"

export default createPage({
  title: "MAPLE developers",
  Page: () => {
    return (
      <Container fluid="md" className="mt-3">
        <h1 className={styles.title}>Writing Effective Testimony</h1>
        <p className={styles.subheader}>
          The basics of writing effective testimony are to clearly outline what
          bill you are testifying about, whether you support or oppose it, why
          you are concerned about the issue, what policy you would like to see
          enacted, and what legislative district you live in. Here are some tips
          you can use to make sure the testimony you submit is as impactful as
          possible:
        </p>
      </Container>
    )
  }
})
