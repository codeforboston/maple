import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"
import RoleOfTestimonyCard from "../components/RoleOfTestimony/RoleOfTestimonyCard"
import styles from "../components/AdditionalResources/AdditionalResourcesCard.module.css"

const content = [
  {
    title: "Your voice is instrumental to the legislative process",
    paragraph:
      "It could guide the agenda of the legislature, what topics and bills they consider, and how they decide to act and vote on each bill. ",
    src: "speaker with thumbs.png",
    alt: "Speaker with thumbs"
  },
  {
    title: "Your voice give them insight",
    paragraph:
      "It can inform legislators of the benefits or negative consequences of proposed policies.",
    src: "speaker with leg.png",
    alt: "Speaker with documents"
  },
  {
    title: "You can give suggestions",
    paragraph:
      "You can also recommend specific changes or improvements to legislation, whether you generally support or oppose the bill.",
    src: "speaker with pen.png",
    alt: "Speaker with pen"
  }
]

export default createPage({
  title: "The Role of Testimony",
  Page: () => {
    return (
      <Container fluid="md" className="mt-3">
        <h1 className={styles.title}>The Role of Testimony</h1>
        <p className={styles.subheader}>
          By speaking up, you can make the laws of Massachusetts work better for
          all of us! <br /> <br /> Everyone is able to convey their opinions to
          the legislature, but the process to submit testimony can be confusing
          and intimidating. We hope that this website, the MAPLE platform, will
          make that process easier, more straightforward, and more accessible to
          all stakeholders.
        </p>
        {content.map((value, index) => (
          <RoleOfTestimonyCard
            title={value.title}
            index={index}
            key={value.title}
            alt={value.alt}
            paragraph={value.paragraph}
            src={value.src}
          />
        ))}
      </Container>
    )
  }
})
