import ErrorPage from "next/error"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import {
  ProfileMember,
  usePublicProfile,
  usePublishedTestimonyListing
} from "../db"
import { Banner } from "../shared/StyledSharedComponents"

export function Newsfeed() {
  const { user } = useAuth()
  const { result: profile, loading } = usePublicProfile(user?.uid)

  const isMobile = useMediaQuery("(max-width: 768px)")

  console.log("P:", profile)
  console.log("U:", user)

  return (
    <>
      {loading ? (
        <Row>
          <Spinner animation="border" className="mx-auto" />
        </Row>
      ) : (
        <>
          {profile ? (
            <>
              <div>Hello There</div>
            </>
          ) : (
            <ErrorPage statusCode={404} withDarkMode={false} />
          )}
        </>
      )}
    </>
  )
}
