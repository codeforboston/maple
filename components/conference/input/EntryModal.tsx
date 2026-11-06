import { useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ConferenceTestimony } from "components/db"
import { useInputContext } from "./context"
import { useCosign } from "./CosignButton"
import { useReport } from "./Kebab"
import { useLockedScroll } from "./useLockedScroll"
import { useToggleFollow } from "./useToggleFollow"
import { Entry } from "./Entry"
import { X } from "./icons"
import { brand, ink, wash } from "./tokens"

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1045;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);

  @media (min-width: 950px) {
    padding: 32px;
  }
`

const Dialog = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  background: var(--maple-surface-page);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);

  @media (min-width: 950px) {
    height: auto;
    max-width: 880px;
    min-height: 480px;
    border-radius: 12px;
  }
`

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 12px;
  background: var(--maple-surface-page);
  @media (min-width: 950px) {
    border-radius: 12px 12px 0 0;
  }
`

const Title = styled.p`
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 1.25rem;
  color: ${ink.strong};
`

const Close = styled.button`
  display: flex;
  border: 0;
  padding: 0;
  background: none;
  color: ${ink.mid};
  &:hover {
    color: ${ink.strong};
  }
`

const Columns = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  padding: 0 20px 20px;

  @media (min-width: 950px) {
    flex-direction: row;
  }
`

const Main = styled.div`
  flex: 1;
  min-width: 0;
  background: var(--maple-surface-base);
  border-radius: 8px;

  @media (min-width: 950px) {
    min-width: 600px;
  }
`

const Aside = styled.div`
  flex-shrink: 0;
  align-self: flex-start;
  width: 100%;
  padding: 16px;
  background: var(--maple-surface-base);
  border-radius: 8px;

  @media (min-width: 950px) {
    position: sticky;
    top: 68px;
    width: 200px;
  }
`

const Label = styled.p`
  margin: 0 0 10px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${ink.mid};
`

const Action = styled.button`
  display: block;
  width: 100%;
  padding: 6px 8px;
  border: 0;
  border-radius: 8px;
  background: none;
  text-align: left;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${brand.fill};
  &:hover {
    background: ${wash.default};
  }
`

/** An entry opened in place, whole. The card the reader pressed is the card
 * they get. */
export function EntryModal({
  testimony,
  onClose
}: {
  testimony: ConferenceTestimony
  onClose: () => void
}) {
  const { t } = useTranslation("conferences")
  const { subject } = useInputContext()
  const { following, toggle: toggleFollow } = useToggleFollow(
    testimony.authorUid
  )
  const report = useReport(testimony)
  const cosign = useCosign(testimony)

  const escape = useCallback(
    (e: KeyboardEvent) => e.key === "Escape" && onClose(),
    [onClose]
  )
  useEffect(() => {
    document.addEventListener("keydown", escape)
    return () => document.removeEventListener("keydown", escape)
  }, [escape])
  useLockedScroll(true)

  return createPortal(
    <Backdrop role="dialog" aria-modal="true" onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{t("input.modal_title", { subject })}</Title>
          <Close type="button" onClick={onClose} aria-label={t("input.close")}>
            <X size={19} />
          </Close>
        </Header>
        <Columns>
          <Main>
            <Entry testimony={testimony} fullBody bare />
          </Main>
          <Aside>
            <Label>{t("input.actions")}</Label>
            {cosign && (
              <Action
                type="button"
                onClick={() => {
                  onClose()
                  cosign()
                }}
              >
                {t("input.cosign_this")}
              </Action>
            )}
            {!report.own && (
              <Action type="button" onClick={toggleFollow}>
                {t(
                  following ? "input.unfollow_account" : "input.follow_account"
                )}
              </Action>
            )}
            <Action type="button" onClick={report.start}>
              {t("input.report")}
            </Action>
          </Aside>
        </Columns>
        {report.node}
      </Dialog>
    </Backdrop>,
    document.body
  )
}
