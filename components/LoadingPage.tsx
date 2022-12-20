import { Spinner } from "react-bootstrap"
import styled from "styled-components"

export const LoadingPage = styled(({ ...rest }) => (
  <div {...rest}>
    <Spinner animation="border" />
  </div>
))`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5rem;
`
