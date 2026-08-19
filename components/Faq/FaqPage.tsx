import { useTranslation } from "next-i18next"
import styled from "styled-components"
import LearnBreadcrumb from "../learn/LearnBreadcrumb"
import LearnHeader from "../learn/LearnHeader"
import LearnLayout from "../learn/LearnLayout"
import { FaqCard } from "./FaqCard"
import content from "./faqContent.json"

type Category = {
  heading: string
  qAndA: { disabled?: boolean; question: string; answer: string }[]
}

const isCategory = (v: unknown): v is Category =>
  typeof v === "object" && v !== null && "qAndA" in v

const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

// Closing "still have questions?" call-to-action, on the tinted page background:
// a centered card with a mailto pill button.
const Cta = styled.div`
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  padding: 2.5rem 2rem;
  margin-top: 1.5rem;
  text-align: center;

  h2 {
    font-family: var(--maple-font-heading);
    font-weight: 900;
    color: var(--bs-blue);
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--maple-text-body);
    line-height: 1.65;
    max-width: 34rem;
    margin: 0 auto 1.5rem;
  }

  a {
    display: inline-block;
    padding: var(--maple-space-sm) var(--maple-space-xl);
    border-radius: var(--maple-radius-pill);
    background: var(--maple-brand-primary);
    color: var(--maple-text-inverse);
    font-weight: 700;
    text-decoration: none;
  }

  a:hover {
    background: var(--maple-brand-primary-strong);
    color: var(--maple-text-inverse);
  }
`

export const FaqPage = () => {
  const { t } = useTranslation("common")
  const categories = Object.values(content).filter(isCategory)

  return (
    <LearnLayout width="medium">
      <LearnBreadcrumb section={content.breadcrumb} eyebrow={t("about")} />
      <LearnHeader
        title={content.title}
        subhead={content.subhead}
        titleSize="2.25rem"
        subheadMaxWidth="none"
      />
      <Cards>
        {categories.map(category => (
          <FaqCard
            key={category.heading}
            heading={category.heading}
            qAndAs={category.qAndA}
          />
        ))}
      </Cards>
      <Cta>
        <h2>{content.ctaHeadline}</h2>
        <p>{content.ctaBody}</p>
        <a href={`mailto:${content.ctaEmail}`}>{content.ctaButton}</a>
      </Cta>
    </LearnLayout>
  )
}
