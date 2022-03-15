import {
  collectionGroup,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  where
} from "firebase/firestore"
import { useAsync } from "react-async-hook"
import { firestore } from "../../firebase"
import { currentGeneralCourt, nullableQuery } from "../common"
import { Testimony } from "./types"

/** Lists all published testimony according to the provided constraints.
 */
// TODO: paginate once we have sufficient testimony
export function usePublishedTestimonyListing({
  uid,
  billId,
  senatorId,
  representativeId,
  senatorDistrict,
  representativeDistrict,
  limitCount = 10
}: {
  uid?: string
  billId?: string
  limitCount?: number
  senatorId?: string
  representativeId?: string
  senatorDistrict?: string,
  representativeDistrict?: string
}) {
  return useAsync(async () => {
    const testimonyRef = collectionGroup(firestore, "publishedTestimony")

    const result = await getDocs(
      nullableQuery(
        testimonyRef,
        where("court", "==", currentGeneralCourt),
        uid && where("authorUid", "==", uid),
        billId && where("billId", "==", billId),
        senatorId && where("senatorId", "==", senatorId),
        representativeId && where("representativeId", "==", representativeId),
        senatorDistrict && where("senatorDistrict", "==", senatorDistrict),
        representativeDistrict && where("representativeDistrict", "==", representativeDistrict),
        orderBy("publishedAt", "desc"),
        limit(limitCount)
      )
    )

    return result.docs.map(d => d.data() as Testimony)
  }, [billId, limitCount, uid])
}
