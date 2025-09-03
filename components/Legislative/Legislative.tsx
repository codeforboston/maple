import { Container } from "react-bootstrap"
import { TestimonyCardList } from "components/LearnTestimonyComponents/TestimonyCardComponents"
import { useTranslation } from "next-i18next"

const LegislativeContent = [
  {
    src: "speaker-podium.svg",
    alt: ""
  },
  {
    src: "mic-with-testify.svg",
    alt: ""
  },
  {
    src: "doc-with-arrows-to-people.svg",
    alt: ""
  },
  {
    src: "leg-with-lightbulb.svg",
    alt: ""
  },
  {
    src: "speaker-with-leg.svg",
    alt: ""
  },
  {
    src: "opinions.svg",
    alt: ""
  },
  {
    src: "respect-with-blob.svg",
    alt: ""
  },
  {
    src: "speaker-with-pen.svg",
    alt: ""
  }
]

const Legislative = () => {
  const { t } = useTranslation("learnComponents")

  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fw-bold tracking-tighter lh-base">
        {t("legislative.title")}
      </h1>
      <p className="fs-4 tracking-tight lh-base">{t("legislative.intro")}</p>
      <TestimonyCardList
        contents={LegislativeContent.map((value, index) => ({
          ...value,
          title: t(`legislative.content.${index}.title`),
          paragraphs: [t(`legislative.content.${index}.paragraph`)]
        }))}
        shouldAlternateImages={false}
      />
    </Container>
  )
}

export default Legislative
