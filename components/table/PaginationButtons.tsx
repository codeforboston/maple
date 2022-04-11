import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "../bootstrap"
import { UseBills } from "../db"

export const PaginationButtons = ({
  pagination: {
    currentPage,
    nextPage,
    hasNextPage,
    previousPage,
    hasPreviousPage
  }
}: {
  pagination: Pick<
    UseBills,
    | "currentPage"
    | "nextPage"
    | "hasNextPage"
    | "previousPage"
    | "hasPreviousPage"
  >
}) => (
  <div className="d-flex justify-content-center mb-3">
    <Button
      variant="primary"
      style={{ marginRight: 15 }}
      onClick={previousPage}
      disabled={!hasPreviousPage}
    >
      <FontAwesomeIcon icon={faAngleLeft} />
    </Button>
    <span>Page {currentPage}</span>
    <Button
      variant="primary"
      style={{ marginLeft: 15 }}
      onClick={nextPage}
      disabled={!hasNextPage}
    >
      <FontAwesomeIcon icon={faAngleRight} />
    </Button>
  </div>
)
