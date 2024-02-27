import styled from "styled-components"

export const TestimonyHeader = styled.h1`
  font-family: "Nunito";
  font-size: 3rem;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: -1.88px;
  text-align: left;
  color: #000;
`

export const TestimonySubheader = styled.p`
  flex-grow: 0;
  font-family: "Nunito";
  font-size: 1.5rem;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: -0.63px;
  text-align: left;
  color: #000;
`

export const TestimonyCard = styled.div`
  width: 100%;
  height: auto;
  padding: 2rem 3rem;
  flex-direction: row;
  flex-wrap: wrap;
  display: flex;
  margin: 3rem 0;
  @media (max-width: 48em) {
    margin: 0;
    padding: 0;
  }
`

export const TestimonyCardTitle = styled.div`
  font-family: "Nunito";
  font-size: 1.5rem;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: -0.63px;
  text-align: left;
  color: #000;
  @media (max-width: 36em) {
    font-size: 1.25rem;
  }
`

export const TestimonyCardContent = styled.div`
  flex-grow: 0;
  font-family: "Nunito";
  font-size: 1.5rem;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: -0.63px;
  text-align: left;
  color: #000;
  @media (max-width: 36em) {
    font-size: 1.125rem;
  }
`