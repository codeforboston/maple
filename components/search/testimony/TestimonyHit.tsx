import { Hit } from "instantsearch.js"
import { maple } from "components/links"
import Link from "next/link"
import { Testimony } from "components/db/testimony"
import { Callout } from "components/TestimonyCallout/TestimonyCallout"

export const TestimonyHit = ({ hit }: { hit: Hit<Testimony> }) => {
  const url = maple.testimony({ publishedId: hit.id })
  return (
    <Link href={url}>
      <a style={{ all: "unset" }} className="w-100">
        <Callout {...hit} />
      </a>
    </Link>
  )
}
