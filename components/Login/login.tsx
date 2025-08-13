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
        <div
          className={`align-items-center d-flex justify-content-center px-2 pt-2 pb-0`}
        >
          <div className={`px-3 py-0`}>
            <div
              className={`align-items-center d-flex fs-5 justify-content-center lh-sm mb-1 text-secondary`}
            >
              <div className={`pe-2`}>
                <img
                  alt="closed lock with key"
                  src={`/closed-lock-with-key.png`}
                  width="32"
                  height="32"
                />{" "}
              </div>
              {t("almostThere")}
            </div>
            <br />
            <div
              className={`align-items-start d-flex fs-5 justify-content-center lh-sm mb-1 text-secondary`}
            >
              {t("justLogIn")}
            </div>
            <br />
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
