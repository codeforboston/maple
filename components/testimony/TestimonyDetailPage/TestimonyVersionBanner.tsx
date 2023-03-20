import { useAppDispatch } from "components/hooks"
import { FC } from "react"
import { Button, Col, Container, ContainerProps, Row } from "react-bootstrap"
import styled from "styled-components"
import { BillTitle } from "./BillTitle"
import { PolicyActions } from "./PolicyActions"
import { RevisionHistory } from "./RevisionHistory"
import { TestimonyDetail } from "./TestimonyDetail"
import {
  useCurrentTestimonyDetails,
  versionSelected
} from "./testimonyDetailSlice"

export const VersionBanner = styled<ContainerProps>(
  ({ className, ...props }) => {
    const dispatch = useAppDispatch()
    const { isCurrentVersion, currentVersion } = useCurrentTestimonyDetails()
    if (isCurrentVersion) return null
    return (
      <div className={className}>
        <Container
          className="d-flex justify-content-between align-items-center"
          {...props}
        >
          Viewing out of date version of testimony{" "}
          <Button
            variant="outline-secondary"
            onClick={() => dispatch(versionSelected(currentVersion))}
          >
            Back to Current Version
          </Button>
        </Container>
      </div>
    )
  }
)`
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;

  background-color: var(--bs-orange);
  color: white;
  font-family: Nunito;
  font-size: 2rem;

  button {
    font-size: 1.25rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
`
