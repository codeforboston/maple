import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ConferenceTestimony } from "components/db"
import { cosignRefusal } from "functions/src/testimony/cosign"
import { useInputContext } from "./context"
import { ink, line, wash } from "./tokens"

const Pill = styled.button`
  flex-shrink: 0;
  margin-right: 8px;
  padding: 4px 12px;
  border: 1px solid ${line.default};
  border-radius: 8px;
  background: var(--maple-surface-base);
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  color: ${ink.strong};
  &:hover {
    background: ${wash.default};
    border-color: ${line.strong};
  }
`

/** Cosigning this entry, if the viewer can: by the rule publishing keeps, and
 * only while the page offers cosigning at all. */
export function useCosign(testimony: ConferenceTestimony) {
  const { uid, onCosign } = useInputContext()
  if (!onCosign || cosignRefusal(uid, testimony)) return
  return () => onCosign(testimony)
}

/** The way to cosign from a card, before its date. */
export function CosignButton({
  testimony
}: {
  testimony: ConferenceTestimony
}) {
  const { t } = useTranslation("conferences")
  const cosign = useCosign(testimony)
  if (!cosign) return null
  return (
    <Pill type="button" onClick={cosign}>
      {t("input.cosign")}
    </Pill>
  )
}
