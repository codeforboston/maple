import { Hit } from "instantsearch.js"
import { maple } from "components/links"
import Link from "next/link"
import { Testimony } from "components/db/testimony"
import { trimContent } from "components/TestimonyCallout/TestimonyCallout"
import { formatBillId } from "components/formatting"

export const TestimonyHit = ({ hit }: { hit: Hit<Testimony> }) => {
  const url = maple.testimony({ publishedId: hit.id })
  return (
    <Link href={url}>
      <a style={{ all: "unset", cursor: "pointer" }} className="w-100">
        <TestimonyResult hit={hit} />
      </a>
    </Link>
  )
}

const TestimonyResult = ({ hit }: { hit: Hit<Testimony> }) => {
  const date = new Date(hit.publishedAt)
  return (
    <div
      style={{
        background: "white",
        padding: "1rem",
        borderRadius: "4px",
        marginBottom: "0.75rem"
      }}
    >
      <p>Written by {hit.authorDisplayName}</p>
      <hr />
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ marginRight: "10px" }}>
          <div
            style={{
              backgroundImage: `url(thumbs-${hit.position}.svg)`,
              height: "60px",
              aspectRatio: "1",
              backgroundSize: "60px 60px"
            }}
          ></div>
          <span>{hit.position}</span>
        </div>
        <div style={{ width: "100%" }}>
          <Link href={maple.bill({ court: hit.court, id: hit.billId })}>
            <a className="w-100">
              <h2>Bill #{formatBillId(hit.billId)}</h2>
            </a>
          </Link>
          <p>{hit.billTitle}</p>
          <p>{trimContent(hit.content, 200)}</p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {hit.content.trim().length > 0 && <a className="w-20">Read More</a>}
            <span style={{ marginLeft: "auto" }}>
              Posted{" "}
              {date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
