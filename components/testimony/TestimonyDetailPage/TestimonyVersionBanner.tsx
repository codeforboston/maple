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
import { useTranslation } from "next-i18next"

export const VersionBanner = styled<ContainerProps>(
  ({ className, ...props }) => {
    const dispatch = useAppDispatch()
    const { isCurrentVersion, currentVersion } = useCurrentTestimonyDetails()
    const { t } = useTranslation("testimony")
    if (isCurrentVersion) return null
    return (
      <div className={className}>
        <Container
          className="d-flex justify-content-between align-items-center"
          {...props}
        >
          {t("testimonyVersionBanner.viewingVersion")}{" "}
          <Button
            variant="outline-secondary"
            onClick={() => dispatch(versionSelected(currentVersion))}
          >
            {t("testimonyVersionBanner.backToVersion")}
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
  font-size: 2rem;

  button {
    font-size: 1.25rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
`
