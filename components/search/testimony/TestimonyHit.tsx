import { Hit } from "instantsearch.js"
import { maple } from "components/links"
import Link from "next/link"
import { Testimony } from "components/db/testimony"
import { trimContent } from "components/TestimonyCallout/TestimonyCallout"
import { formatBillId } from "components/formatting"
import { useBill } from "components/db/bills"
import { FollowButton } from "components/shared/FollowButton"
import { Image } from "react-bootstrap"

export const TestimonyHit = ({ hit }: { hit: Hit<Testimony> }) => {
  const url = maple.testimony({ publishedId: hit.id })
  console.log(url)
  return (
    <Link href={url}>
      <a style={{ all: "unset", cursor: "pointer" }} className="w-100">
        <TestimonyResult hit={hit} />
      </a>
    </Link>
  )
}

const TestimonyResult = ({ hit }: { hit: Hit<Testimony> }) => {
  const date = new Date(
    parseInt(hit.publishedAt.toString())
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
  const { loading, error, result: bill } = useBill(hit.court, hit.billId)
  const committee = bill?.currentCommittee
  const isOrg = hit.authorRole === "organization"
  const writtenBy = isOrg ? (
    <Link href={`/profile?id=${hit.authorUid}`}>{hit.authorDisplayName}</Link>
  ) : (
    hit.authorDisplayName
  )
  return (
    <div
      style={{
        background: "white",
        padding: "1rem",
        borderRadius: "4px",
        marginBottom: "0.75rem"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px"
        }}
      >
        <Image
          src={isOrg ? "/profile-org-icon.svg" : "/profile-individual-icon.svg"}
          alt="profile icon"
          height="30px"
          width="30px"
        />
        <span style={{ flexGrow: 1 }}>
          <b>Written by {writtenBy}</b>
        </span>
        {isOrg && <FollowButton profileid={hit.authorUid} />}
      </div>
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
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {/* <Link href={maple.bill({ court: hit.court, id: hit.billId })}> */}
            {/* <a> */}
            <h2>Bill #{formatBillId(hit.billId)}</h2>
            {/* </a> */}
            {/* </Link> */}
            {committee && (
              <span
                style={{
                  background: "var(--bs-blue)",
                  borderRadius: "50px",
                  color: "white",
                  padding: "5px 10px"
                }}
              >
                {committee.name}
              </span>
            )}
          </div>
          <h6 style={{ color: "var(--bs-blue)", fontWeight: 600 }}>
            {bill?.content.Title}
          </h6>
          <p>"{trimContent(hit.content, 500)}"</p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {/* {hit.content.trim().length > 0 && <a className="w-20">Read More</a>} */}
            <span style={{ marginLeft: "auto" }}>{`Posted ${date}`}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
