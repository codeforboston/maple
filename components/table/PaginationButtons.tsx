import {
  faAngleDoubleLeft,
  faAngleDoubleRight
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "../bootstrap"
import { Pagination } from "../db"
import styled from "styled-components"
import { useTranslation } from "react-i18next"

export const PaginationButtons = ({
  pagination: {
    currentPage,
    nextPage,
    hasNextPage,
    previousPage,
    hasPreviousPage
  }
}: {
  pagination: Pagination
}) => {
  const { t } = useTranslation("common")

  return (
    <div className="d-flex justify-content-center my-3">
      <PreviousStyle
        variant="secondary"
        onClick={previousPage}
        disabled={!hasPreviousPage || currentPage == 1}
      >
        <FontAwesomeIcon icon={faAngleDoubleLeft} />
      </PreviousStyle>
      <SpanStyle variant="secondary" className="align-self-center">
        {t("table.page", { currentPage })}
      </SpanStyle>
      <NextStyle variant="secondary" onClick={nextPage} disabled={!hasNextPage}>
        <FontAwesomeIcon icon={faAngleDoubleRight} />
      </NextStyle>
    </div>
  )
}

const SpanStyle = styled(Button)`
  background-color: #1a3185;
  color: white;
  margin: 2px;
  border-radius: 0;
`
const NextStyle = styled(Button)`
  background-color: #1a3185;
  margin: 2px;
  border-radius: 0px 15px 15px 0px;
`
const PreviousStyle = styled(Button)`
  background-color: #1a3185;
  margin: 2px;
  border-radius: 15px 0px 0px 15px;
`
