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
      {/* <Button
      variant="primary"
      style={{ marginRight: 15 }}
      onClick={previousPage}
      disabled={!hasPreviousPage}
    >
      <FontAwesomeIcon icon={faAngleLeft} />
    </Button>
    <span className="align-self-center">Page {currentPage}</span>
    <Button
      variant="primary"
      style={{ marginLeft: 15 }}
      onClick={nextPage}
      disabled={!hasNextPage}
    >
      <FontAwesomeIcon icon={faAngleRight} />
    </Button> */}
      {/* /////////////////////////////// */}
      <Button
        variant="secondary"
        style={{ marginRight: 15 }}
        onClick={previousPage}
        disabled={!hasPreviousPage}
      >
        <FontAwesomeIcon icon={faAngleDoubleLeft} />
      </Button>
      {pages.map((page, index) => (
        <SetPageStyle
          onClick={() => handleSetPage(index + 1)}
          variant="secondary"
          disabled={false}
        >
          {index + 1}
        </SetPageStyle>
      ))}

      <Button
        variant="secondary"
        style={{ marginLeft: 15 }}
        onClick={nextPage}
        disabled={!hasNextPage}
      >
        <FontAwesomeIcon icon={faAngleDoubleRight} />
      </Button>
    </div>
  )
}

const SetPageStyle = styled(Button)`
  background-color: #1a3185;
  margin: 1px;
`
