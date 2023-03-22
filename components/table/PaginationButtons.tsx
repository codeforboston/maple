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
    hasPreviousPage
  }
}: {
  pagination: Pagination
}) => {
  const pages = [1, 2, 3, 4]

  const handleSetPage = (pageNumber: number) => {
    console.log(pageNumber)
  }

  return (
    <div className="d-flex justify-content-center my-3">
      <PreviousStyle
        variant="secondary"
        onClick={previousPage}
        disabled={!hasPreviousPage}
      >
        <FontAwesomeIcon icon={faAngleDoubleLeft} />
      </PreviousStyle>
      <span className="align-self-center">Page {currentPage}</span>
      <NextStyle variant="secondary" onClick={nextPage} disabled={!hasNextPage}>
        <FontAwesomeIcon icon={faAngleDoubleRight} />
      </NextStyle>

      {/* 
      //filler nonfunctional pagination
      <PreviousStyle
        variant="secondary"
        onClick={previousPage}
        disabled={!hasPreviousPage}
      >
        <FontAwesomeIcon icon={faAngleDoubleLeft} />
      </PreviousStyle>

      {pages.map((page, index) => (
        <SetPageStyle
          onClick={() => handleSetPage(index + 1)}
          variant="secondary"
          disabled={false}
        >
          {index + 1}
        </SetPageStyle>
      ))}

      <NextStyle variant="secondary" onClick={nextPage} disabled={!hasNextPage}>
        <FontAwesomeIcon icon={faAngleDoubleRight} />
      </NextStyle> */}
    </div>
  )
}

const SetPageStyle = styled(Button)`
  background-color: #1a3185;
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
