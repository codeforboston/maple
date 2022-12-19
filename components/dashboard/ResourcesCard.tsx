import styled from "styled-components"

type Props = {}

export function ResourcesCard({}: Props) {
  return (
    <Container>
      <Wrapper>
        <LanguagesContainer>
          <span>Languages</span>

          <Languages>
            <span>Spanish </span> | <span> English</span>
          </Languages>
        </LanguagesContainer>

        <PrivacyContainer>
          <span>
            <Links href="#">Privacy Policy</Links>
          </span>
          <span>
            <Links href="#">Terms and Conditions </Links>
          </span>
        </PrivacyContainer>
        <SocialContainer>
          <InnerContainer>
            <img src="/images/instagram.svg" alt="instagram" />
          </InnerContainer>
          <InnerContainer>
            <img src="/images/twitter.svg" alt="twitter" />
          </InnerContainer>{" "}
          <InnerContainer>
            <img src="/images/facebook.svg" alt="facebook" />
          </InnerContainer>
        </SocialContainer>
      </Wrapper>
    </Container>
  )
}

const Container = styled.div`
  width: 255px;
  background-color: #1a3185;
  height: 223px;
  margin: 1rem;
  border-radius: 20px;
`

const Wrapper = styled.div`
  max-width: 209px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 177.9px;
`

const Languages = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;

  span {
    :first-child {
      padding-right: 5px;
    }
    :last-child {
      padding-left: 5px;
    }
  }
`

const LanguagesContainer = styled.div`
  font-weight: 500;
  font-size: 22px;
  line-height: 27px;
  color: #ffffff;
  padding-top: 20px;
`

const PrivacyContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 11px;
  margin-bottom: 10px;
`

const Links = styled.a`
  color: #ffffff;
  text-decoration: none;
  position: relative;
  :after {
    content: "";
    height: 2px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #ffffff;
    transition: all 300ms linear;
    transform-origin: left center;
    transform: scaleX(0);
    opacity: 0;
    border-radius: 20px;
  }
  &:hover {
    :after {
      transform: scaleX(1);
      opacity: 1;
    }
    color: #ffffff;
  }
`

const SocialContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 7px;
`

const InnerContainer = styled.div`
  margin: 0 5px;
  height: 39.9px;
  width: 39.9px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
`
