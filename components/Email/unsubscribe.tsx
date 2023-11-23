import { Card as MapleCard } from "components/Card"
import Router from "next/router"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Button, Col, Container, Stack } from "../bootstrap"
import { ProfileHook, useProfile } from "../db"
import { useTranslation } from "next-i18next"

const StyledContainer = styled(Container)`
  @media (min-width: 768px) {
  }
`

const StyledBody = styled(Stack)`
  padding: 0.8rem;
`

export function UnsubscribeConfirm() {
  const { user } = useAuth()
  const isUser = user?.uid !== undefined
  const actions = useProfile()
  const { t } = useTranslation(["unsubscribe", "auth"])

  const handleClick = async () => {
    await updateProfile({ actions })
    Router.push("/", "/", { shallow: true })
  }

  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateNotification } = actions
    await updateNotification("None")
  }

  return (
    <StyledContainer>
      <MapleCard
        className={"mt-5"}
        header={`Unsubscribe`}
        body={
          <StyledBody>
            <div>
              {isUser ? (
                t("unsubscribeConfirmation", { ns: "unsubscribe" })
              ) : (
                <br />
              )}
            </div>
            <div className={`${isUser ? "" : "mx-auto"}`}>
              {isUser
                ? t("settingsChangeTip", { ns: "unsubscribe" })
                : t("logInPrompt", { ns: "auth" })}
            </div>
            <Col className="mx-auto pt-4">
              <Button
                className={`btn btn-sm me-3 py-1`}
                disabled={isUser ? false : true}
                onClick={handleClick}
              >
                {t("continue", { ns: "auth" })}
              </Button>
              <Button
                className={`btn btn-sm btn-outline-secondary py-1`}
                href="/"
              >
                {t("cancel", { ns: "auth" })}
              </Button>
            </Col>
          </StyledBody>
        }
      ></MapleCard>
    </StyledContainer>
  )
}
