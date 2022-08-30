import styled from "styled-components"

export const LabeledContainer = styled.div`
  border-radius: 1rem;
  background: white;
  padding: 0.5rem 1rem 1rem 0.5rem;

  .title {
    color: white;
    background-color: var(--bs-red);
    font-size: 1.25rem;
    line-height: 2.25rem;
    min-width: 15rem;
    width: fit-content;
    border-radius: 0 1.5rem 1.5rem 0;

    position: relative;
    padding-left: 2rem;
    left: -1.5rem;
  }
`
