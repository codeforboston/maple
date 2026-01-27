import { Row } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

function AnnouncementBanner({
  endDate,
  children
}: {
  endDate: Date
  children: React.ReactElement
}) {
  const isOpen = localStorage.getItem("isBannerClosed")
  const [closed, setClosed] = useState<boolean>(isOpen != null)
  const close = () => {
    setClosed(true)
    localStorage.setItem("isBannerClosed", "true")
  }

  const now: Date = new Date()
  if (now < endDate && !closed) {
    return (
      <Row
        style={{ zIndex: 100 }}
        className="position-relative h3 text-center text-white p-3 bg-warning"
      >
        <button
          className="position-absolute top-0 end-0 border-0 bg-transparent p-1"
          style={{ width: "auto" }}
          onClick={close}
        >
          <FontAwesomeIcon
            icon={faXmark}
            style={{ color: "white", fontSize: "18px", paddingRight: "8px" }}
          />
        </button>

        {children}
      </Row>
    )
  } else {
    return <></>
  }
}

export default AnnouncementBanner
