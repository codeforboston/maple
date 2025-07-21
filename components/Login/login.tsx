import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Container } from "../bootstrap"
import { SignInWithButton } from "components/auth"

export default function LoginPage() {
  const { t } = useTranslation("auth")

  const StyledContainer = styled(Container)`
    @media (min-width: 768px) {
    }
  `

  return (
    <StyledContainer>
      <div className={`bg-white my-3 overflow-hidden rounded-3`}>
        <div className={`align-items-center d-flex px-2 pt-2 pb-0`}>
          <div className={`px-3 py-0`}>
            <div className={`align-items-start fs-5 lh-sm mb-1 text-secondary`}>
              You were possibly signed out while trying to go to a page that
              needs to be signed in to function
            </div>
            <br />
            <div className={`align-items-start fs-5 lh-sm mb-1 text-secondary`}>
              Please consider logging in first:
            </div>
            <div className={`justify-content-center d-flex w-100`}>
              <SignInWithButton />
            </div>
            <br />
          </div>
        </div>
      </div>
    </StyledContainer>
  )
}
