import styled from "styled-components"

export default function ProfileContainer() {
  return (
    <Container>
      <Logo>
        <img loading="lazy" src="/imagedotmenu.svg" alt="" />
      </Logo>
      <Wrapper>
        <ImageContainer>
          <img src="/image/ProfilePic.png" alt="" />
        </ImageContainer>
        <Span>Peter Parker</Span>
        <PtAG>Joined in 2022</PtAG>
      </Wrapper>
    </Container>
  )
}

const Container = styled.div`
  width: 254px;
  height: 331px;
  background-color: #1a3185;
  margin: 20px;
  border-radius: 20px;
  color: white;
`

const Wrapper = styled.div`
  max-width: 202px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const ImageContainer = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 999999px;
  margin: 0 auto;

  img {
    width: 100%;
    height: 100%;
  }
`

const Span = styled.span`
  font-weight: 500;
  font-size: 22px;
  line-height: 27.5px;
  text-align: center;
  margin-top: 14px;
`

const PtAG = styled.p`
  font-weight: 500;
  margin-top: 5px;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 1.5%;
  text-align: center;
`

const Logo = styled.div`
  padding-top: 14px;
  margin-bottom: 21px;
  margin-right: 15px;
  text-align: end;
`
