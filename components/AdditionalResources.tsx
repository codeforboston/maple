import { useTranslation, Trans } from "next-i18next"
import styled from "styled-components"

const Section = styled.section`
  margin-top: 3rem;

  h2 {
    font-family: var(--maple-font-heading);
    font-weight: 700;
    color: var(--bs-blue);
    font-size: clamp(1.5rem, 4vw, 1.875rem);
    margin-bottom: 0.75rem;
  }

  .intro {
    color: var(--maple-text-body);
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    background: var(--maple-surface-base);
    border-radius: var(--maple-radius-xl);
    box-shadow: var(--maple-shadow-sm);
    padding: 1.25rem 1.5rem;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: var(--maple-shadow-hover);
    }
  }

  p {
    color: var(--maple-text-body);
    line-height: 1.7;
    margin: 0;
  }

  a {
    color: var(--bs-blue);
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    li {
      transition: none;
    }
  }
`

const content = [
  {
    i18nKey: "find_legislator",
    href: "https://malegislature.gov/Search/FindMyLegislator"
  },
  {
    i18nKey: "legislative_doc",
    href: "https://www.mass.gov/doc/the-legislative-process"
  },
  {
    i18nKey: "legal_services",
    href: "https://www.masslegalservices.org/content/legislative-process-massachusetts-0"
  }
]

const AdditionalResources = () => {
  const { t } = useTranslation("learnComponents")

  return (
    <Section aria-labelledby="additional-resources-heading">
      {/* h2, not h1: the page already has one, and this is a subsection of it. */}
      <h2 id="additional-resources-heading">
        {t("legislative.additional_resources")}
      </h2>
      <p className="intro">{t("legislative.resources_intro")}</p>

      <ul>
        {content.map(({ i18nKey, href }) => (
          <li key={i18nKey}>
            <p>
              {/* A bare anchor, not links.External: that helper appends a
                  trailing space, which shows up as "the process ." here. */}
              <Trans
                t={t}
                i18nKey={`legislative.${i18nKey}`}
                components={[
                  // eslint-disable-next-line jsx-a11y/anchor-has-content
                  <a
                    href={href}
                    key={i18nKey}
                    target="_blank"
                    rel="noreferrer"
                  />
                ]}
              />
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default AdditionalResources
