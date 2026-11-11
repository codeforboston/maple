import styled from "styled-components"
import { ink } from "./tokens"

/** An X that closes what it sits on: an opened entry, or a line the page says. */
export const Close = styled.button`
  display: flex;
  border: 0;
  padding: 0;
  background: none;
  color: ${ink.mid};
  &:hover {
    color: ${ink.strong};
  }
`
