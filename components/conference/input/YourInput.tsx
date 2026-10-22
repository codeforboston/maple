import { useState } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { TABS_H } from "../ConferenceTabs"
import { ConferenceTestimony } from "components/db"
import { Entry } from "./Entry"
import { EntryModal } from "./EntryModal"
import { Kebab } from "./Kebab"
import { Check } from "./icons"
import { ink, line, shadow } from "./tokens"

const Section = styled.section`
  scroll-margin-top: calc(
    var(--maple-navbar-height) + var(--title-h, 5rem) + ${TABS_H} + 1.5rem
  );
`

const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin: 12px 0 16px;
`

const Heading = styled.h2`
  margin: 0;
  font-family: var(--maple-font-heading);
  font-weight: 400;
  font-size: 1.375rem;
  line-height: 1.4;
  color: ${ink.strong};
`

const OnRecord = styled.p`
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: ${ink.strong};
  svg {
    color: #2e7d32;
  }
`

const Box = styled.div`
  background: var(--maple-surface-base);
  border: 1px solid ${line.default};
  border-radius: 8px;
  box-shadow: ${shadow.raised};
`

const Private = styled.p`
  margin: 12px 0 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: ${ink.mid};
`

/** What the reader filed, above the public section: it answers to none of that
 * section's controls, and says it is also in the record below. */
export function YourInput({ testimony }: { testimony: ConferenceTestimony }) {
  const { t } = useTranslation("conferences")
  const [opened, setOpened] = useState(false)
  return (
    <Section id="your-input">
      <Head>
        <Heading>{t("input.yours_title")}</Heading>
        <OnRecord>
          <Check size={14} />
          {t("input.yours_on_record")}
        </OnRecord>
      </Head>
      <Box>
        <Entry
          testimony={testimony}
          bare
          actions={
            <Kebab testimony={testimony} onView={() => setOpened(true)} />
          }
        />
      </Box>
      <Private>{t("input.yours_private")}</Private>
      {opened && (
        <EntryModal testimony={testimony} onClose={() => setOpened(false)} />
      )}
    </Section>
  )
}
