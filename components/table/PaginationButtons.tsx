import {
  faAngleLeft,
  faAngleRight,
  faAngleDoubleLeft,
  faAngleDoubleRight
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "../bootstrap"
import { Pagination } from "../db"
import styled from "styled-components"

export const PaginationButtons = ({
  pagination: {
    currentPage,
    nextPage,
    hasNextPage,
    previousPage,
    hasPreviousPage,
    itemsPerPage
  },
  totalTestimonies
}: {
  pagination: Pagination
  totalTestimonies : number | undefined 
}) => {
  if (totalTestimonies === undefined) {
    return null
  }
  let currentPageEnd = Math.min(currentPage * itemsPerPage, totalTestimonies)
  
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
        Page {currentPage}
      </SpanStyle>
      <NextStyle variant="secondary" onClick={nextPage} disabled={!hasNextPage || currentPageEnd >= totalTestimonies}>
        <FontAwesomeIcon icon={faAngleDoubleRight} />
      </NextStyle>
    </div>
  )
}

const SetPageStyle = styled(Button)`
  font-family: nunito;
  background-color: #1a3185;
  margin: 2px;
  border-radius: 0;
`
const SpanStyle = styled(Button)`
  background-color: #1a3185;
  color: white;
  font-family: nunito;
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
