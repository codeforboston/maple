import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import styled from "styled-components"
import { Col, Container, Row } from "components/bootstrap"
import {
  DescrContainer,
  Divider,
  NameContainer,
  SectionContainer,
  SectionTitle
} from "components/shared/CommonComponents"
import LearnBreadcrumb from "components/learn/LearnBreadcrumb"
import LearnHeader from "components/learn/LearnHeader"
import LearnLayout from "components/learn/LearnLayout"
import type { Policy } from "./PolicyPage"

/* A section heading ("+ ## Overview"), a sub-heading ("+ ### Cookies:"), and
   a rule set between sections ("---", not "+ ---" inside one). */
const SECTION = /^\+?\s*##(?!#)\s*(.+?)\s*$/
const SUBSECTION = /^\+?\s*###\s*(.+?)\s*$/
const BETWEEN_SECTIONS = /^\s*---\s*$/
const BULLET = /^\s*[-*]\s/

type Section = {
  title: string
  /** Lines under no sub-heading, before the first one. */
  intro: string[]
  subsections: { title: string; lines: string[] }[]
  /** Lines after the sub-headings that belong to the whole section: text
   * set apart by a blank line, not a bullet. */
  outro: string[]
}

/** The policy text (public/<policy>.md) cut into sections and sub-sections.
 * Each section is written as one "+" list; its lines lose that marker here so
 * their own bullets and text render as they read. */
const parsePolicy = (content: string): Section[] => {
  const sections: Section[] = []
  let previousBlank = false
  for (const raw of content.split("\n")) {
    const section = raw.match(SECTION)
    if (section) {
      sections.push({
        title: section[1],
        intro: [],
        subsections: [],
        outro: []
      })
      previousBlank = false
      continue
    }
    const current = sections[sections.length - 1]
    if (!current || BETWEEN_SECTIONS.test(raw)) continue
    const subsection = raw.match(SUBSECTION)
    if (subsection) {
      // Shown as a row, so without the text's trailing colon.
      current.subsections.push({
        title: subsection[1].replace(/:\s*$/, ""),
        lines: []
      })
      previousBlank = false
      continue
    }
    const line = raw.replace(/^\+ ?/, "")
    // The rule under each section heading ("+ ---").
    if (BETWEEN_SECTIONS.test(line)) continue
    const blank = line.trim() === ""
    const last = current.subsections[current.subsections.length - 1]
    if (current.outro.length) current.outro.push(line)
    else if (last && !blank && previousBlank && !BULLET.test(line))
      current.outro.push(line)
    else if (last) last.lines.push(line)
    else current.intro.push(line)
    previousBlank = blank
  }
  return sections
}

const hasText = (lines: string[]) => lines.some(l => l.trim() !== "")

const Markdown = ({ lines }: { lines: string[] }) => (
  <ReactMarkdown>{lines.join("\n")}</ReactMarkdown>
)

const VALUES = [
  { key: "humility", image: "/handShake.jpg" },
  { key: "compassion", image: "/compassion.png" },
  { key: "curiosity", image: "/lightBulb.png" }
] as const

/**
 * Digital Democracy and Mixed: a policy as its own page under Policies, laid
 * out like the AI Tools page (components/learn/AiTools/AiTools.tsx): each
 * section a white card with a navy title bar and its text below, nothing
 * collapsing, sub-headings as bold lines. Our Shared Values closes the page
 * the same way. The Maple skin keeps main's page (PolicyPage.tsx).
 */
export const PolicyAboutPage = ({ policy }: { policy: Policy }) => {
  const { t } = useTranslation(["policies", "common"])
  const [content, setContent] = useState("")

  useEffect(() => {
    fetch(`/${policy}.md`)
      .then(res => res.text())
      .then(text => setContent(text))
  }, [policy])

  return (
    <LearnLayout width="wide">
      <LearnBreadcrumb
        section={t(`tabs.${policy}`)}
        eyebrow={t("about", { ns: "common" })}
        parent={{ label: t("title"), href: "/policies" }}
      />
      <LearnHeader title={t(`tabs.${policy}`)} titleSize="2.25rem" />
      <PolicyBody className="px-0">
        {parsePolicy(content).map(section => (
          <Row key={section.title}>
            <Col className="py-4">
              <SectionContainer>
                <SectionTitle className="p-3">{section.title}</SectionTitle>
                {hasText(section.intro) && (
                  <DescrContainer className="py-4 px-4">
                    <Markdown lines={section.intro} />
                  </DescrContainer>
                )}
                {section.subsections.map((sub, index) => (
                  <div key={sub.title}>
                    {(index > 0 || hasText(section.intro)) && <Divider />}
                    <NameContainer className="pt-4 px-4">
                      {sub.title}
                    </NameContainer>
                    <DescrContainer className="py-3 px-4">
                      <Markdown lines={sub.lines} />
                    </DescrContainer>
                  </div>
                ))}
                {hasText(section.outro) && (
                  <>
                    <Divider />
                    <DescrContainer className="py-4 px-4">
                      <Markdown lines={section.outro} />
                    </DescrContainer>
                  </>
                )}
              </SectionContainer>
            </Col>
          </Row>
        ))}

        <Row>
          <Col className="py-4">
            <SectionContainer>
              <SectionTitle className="p-3">{t("values.heading")}</SectionTitle>
              <DescrContainer className="py-4 px-4">
                <p>{t("values.description1")}</p>
                <p>{t("values.description2")}</p>
                <ul className="values">
                  {VALUES.map(({ key, image }) => (
                    <li key={key}>
                      <img src={image} alt="" />
                      {t(`values.${key}`)}
                    </li>
                  ))}
                </ul>
              </DescrContainer>
            </SectionContainer>
          </Col>
        </Row>
      </PolicyBody>
    </LearnLayout>
  )
}

/* Tuned as on How MAPLE Uses AI (components/about/MapleAI/MapleAI.tsx): body
   text at 0.9375rem and a 1.5 line height, and sub-headings, laid out like
   its Disclaimers card (each with its lines, a divider between), in the
   heading font at 1.125rem so they read as under the section title. Lists
   keep their bullets with room between items. */
const PolicyBody = styled(Container)`
  ${NameContainer} {
    font-family: var(--maple-font-heading);
    font-size: 1.125rem;
    line-height: 1.35;
  }

  ${DescrContainer} {
    font-size: var(--learn-small-text, 0.9375rem);
    line-height: 1.5;

    ul {
      margin-bottom: 0;
    }

    li {
      padding-bottom: 0.75rem;
    }

    p {
      margin-bottom: 0.75rem;
    }

    > :last-child,
    > :last-child > :last-child,
    > :last-child li:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }

  /* The three values as navy tiles with their pictures, as on main's page. */
  ul.values {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    list-style: none;
    margin: 1.25rem 0 0;
    padding: 0;

    li {
      flex: 1 1 12rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      min-height: 100px;
      padding: 1rem;
      border-radius: var(--maple-radius-lg);
      background: var(--maple-brand-primary);
      color: var(--maple-text-inverse);
      font-weight: 700;
    }

    img {
      width: 60px;
      height: 55px;
      object-fit: contain;
    }
  }
`
