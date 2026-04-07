import { ReactElement } from "react"
import { Button, ButtonProps, Image } from "react-bootstrap"
import styled from "styled-components"
import { SignInWithButton, useAuth } from "../../auth"
import { Wrap } from "../../links"
import { formUrl, usePublishState } from "../hooks"
import { useTranslation } from "next-i18next"

export type PanelCtaVariant = "default" | "ballotQuestion"

const Styled = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background-color: var(--bs-blue);
  border-radius: 1rem;
  padding: 1.5rem 1rem 1.5rem 1rem;
  color: white;

  .title {
    font-size: 1.25rem;
    font-weight: bold;
  }
`

const Cta = ({
  title,
  cta,
  className
}: {
  title: string
  cta: ReactElement
  className?: string
}) => {
  return (
    <Styled className={className}>
      <div className="text-center title">{title}</div>
      <Image alt="" className="mt-2 mb-2" src="/testimony-panel-empty.svg" />
      {cta}
    </Styled>
  )
}

const CompactPanel = ({ title, cta }: { title: string; cta: ReactElement }) => (
  <div className="d-grid gap-3">
    <div className="rounded border bg-light px-3 py-3 small text-body-secondary fw-semibold">
      {title}
    </div>
    {cta}
  </div>
)

const OpenForm = ({ label, ...props }: { label: string } & ButtonProps) => {
  const { bill, ballotQuestionId } = usePublishState()
  if (!bill) return null
  return (
    <Wrap href={formUrl(bill.id, bill.court, "position", ballotQuestionId)}>
      <Button variant="primary" {...props}>
        {label}
      </Button>
    </Wrap>
  )
}

export const CreateTestimony = ({
  variant = "default"
}: {
  variant?: PanelCtaVariant
}) => {
  const { t } = useTranslation("testimony")
  const namespace = variant === "ballotQuestion" ? "ballotQuestion.panel" : "panel"
  const cta = (
    <OpenForm
      label={t(`${namespace}.createTestimony.label`)}
      className={
        variant === "ballotQuestion"
          ? "w-100 py-2 small fw-semibold"
          : undefined
      }
    />
  )

  return variant === "ballotQuestion" ? (
    <CompactPanel title={t(`${namespace}.createTestimony.title`)} cta={cta} />
  ) : (
    <Cta title={t(`${namespace}.createTestimony.title`)} cta={cta} />
  )
}

export const CompleteTestimony = ({
  variant = "default"
}: {
  variant?: PanelCtaVariant
}) => {
  const { t } = useTranslation("testimony")
  const namespace = variant === "ballotQuestion" ? "ballotQuestion.panel" : "panel"
  const cta = (
    <OpenForm
      label={t(`${namespace}.completeTestimony.label`)}
      variant="info"
      className={
        variant === "ballotQuestion"
          ? "w-100 py-2 small fw-semibold text-white"
          : "text-white"
      }
    />
  )

  return variant === "ballotQuestion" ? (
    <CompactPanel title={t(`${namespace}.completeTestimony.title`)} cta={cta} />
  ) : (
    <Cta
      title={t(`${namespace}.completeTestimony.title`)}
      cta={cta}
      className="text-info"
    />
  )
}

export const SignedOut = ({
  variant = "default"
}: {
  variant?: PanelCtaVariant
}) => {
  const { t } = useTranslation("testimony")
  const namespace = variant === "ballotQuestion" ? "ballotQuestion.panel" : "panel"
  const title =
    variant === "ballotQuestion"
      ? t(`${namespace}.createTestimony.title`)
      : t("panel.signedOut.title")
  const cta =
    variant === "ballotQuestion" ? (
      <SignInWithButton
        label={t(`${namespace}.createTestimony.label`)}
        buttonClassName="py-2 small fw-semibold"
      />
    ) : (
      <SignInWithButton />
    )

  return variant === "ballotQuestion" ? (
    <CompactPanel title={title} cta={cta} />
  ) : (
    <Cta title={title} cta={cta} />
  )
}

export const UnverifiedEmail = ({
  variant = "default"
}: {
  variant?: PanelCtaVariant
}) => {
  const { t } = useTranslation("testimony")
  const id = useAuth().user?.uid!
  const cta = (
    <Wrap href={`/profile?id=${id}`}>
      <Button
        variant="primary"
        className={
          variant === "ballotQuestion"
            ? "w-100 py-2 small fw-semibold"
            : undefined
        }
      >
        {t("panel.unverifiedEmail.label")}
      </Button>
    </Wrap>
  )

  return variant === "ballotQuestion" ? (
    <CompactPanel title={t("panel.unverifiedEmail.title")} cta={cta} />
  ) : (
    <Cta title={t("panel.unverifiedEmail.title")} cta={cta} />
  )
}

export const PendingUpgrade = ({
  variant = "default"
}: {
  variant?: PanelCtaVariant
}) => {
  const { t } = useTranslation("testimony")
  const cta = (
    <Button
      variant="primary"
      disabled
      className={
        variant === "ballotQuestion"
          ? "w-100 py-2 small fw-semibold"
          : undefined
      }
    >
      {t("panel.pendingUpgrade.label")}
    </Button>
  )

  return variant === "ballotQuestion" ? (
    <CompactPanel title={t("panel.pendingUpgrade.title")} cta={cta} />
  ) : (
    <Cta title={t("panel.pendingUpgrade.title")} cta={cta} />
  )
}
