import { ReactElement } from "react"
import { Button, ButtonProps, Image } from "react-bootstrap"
import styled from "styled-components"
import { SignInWithButton, useAuth } from "../../auth"
import { Wrap } from "../../links"
import { formUrl, usePublishState } from "../hooks"
import { useTranslation } from "next-i18next"

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

const OpenForm = ({ label, ...props }: { label: string } & ButtonProps) => {
  const bill = usePublishState().bill!
  return (
    <Wrap href={formUrl(bill.id, bill.court)}>
      <Button variant="primary" {...props}>
        {label}
      </Button>
    </Wrap>
  )
}

export const CreateTestimony = () => {
  const { t } = useTranslation("testimony")

  return (
    <Cta
      title={t("panel.createTestimony.title")}
      cta={<OpenForm label={t("panel.createTestimony.label")} />}
    />
  )
}

export const CompleteTestimony = () => {
  const { t } = useTranslation("testimony")

  return (
    <Cta
      title={t("panel.completeTestimony.title")}
      cta={
        <OpenForm
          label={t("panel.completeTestimony.label")}
          variant="info"
          className="text-white"
        />
      }
      className="text-info"
    />
  )
}

export const SignedOut = () => {
  const { t } = useTranslation("testimony")

  return <Cta title={t("panel.signedOut.title")} cta={<SignInWithButton />} />
}

export const UnverifiedEmail = () => {
  const { t } = useTranslation("testimony")
  const id = useAuth().user?.uid!

  return (
    <Cta
      title={t("panel.unverifiedEmail.title")}
      cta={
        <Wrap href={`/profile?id=${id}`}>
          <Button variant="primary">{t("panel.unverifiedEmail.label")}</Button>
        </Wrap>
      }
    />
  )
}

export const PendingUpgrade = () => {
  const { t } = useTranslation("testimony")

  return (
    <Cta
      title={t("panel.pendingUpgrade.title")}
      cta={
        <Button variant="primary" disabled>
          {t("panel.pendingUpgrade.label")}
        </Button>
      }
    />
  )
}
