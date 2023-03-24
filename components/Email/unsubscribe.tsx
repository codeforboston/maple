import { Card as MapleCard } from "components/Card"
import Router from "next/router"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Button, Col, Container, Stack } from "../bootstrap"
import { ProfileHook, useProfile } from "../db"

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
                "Confirm that you would like to unsubscribe from Notification Emails"
              ) : (
                <br />
              )}
            </div>
            <div className={`${isUser ? "" : "mx-auto"}`}>
              {isUser
                ? "You can change these settings later from Edit Profile page with the Settings button"
                : "Please log in"}
            </div>
            <Col className="mx-auto pt-4">
              <Button
                className={`btn btn-sm me-3 py-1`}
                disabled={isUser ? false : true}
                onClick={handleClick}
              >
                Continue
              </Button>
              <Button
                className={`btn btn-sm btn-outline-secondary py-1`}
                href="/"
              >
                Cancel
              </Button>
            </Col>
          </StyledBody>
        }
      ></MapleCard>
    </StyledContainer>
  )
}
