import { getDocs, collection } from "firebase/firestore"
import { firestore } from "../../firebase"
import { nullableQuery } from "../common"
import { useAsync } from "react-async-hook"
import { Testimony } from "common/testimony/types"

export type UseDraftTestimonyListing = ReturnType<
  typeof useDraftTestimonyListing
>
export function useDraftTestimonyListing({ uid }: { uid: string }) {
  const items = useAsync(
    () => {
      return listTestimony(uid)
    },
    [uid],
    {
      onSuccess: data => data
    }
  )

  return items
}

async function listTestimony(uid: string): Promise<Testimony[]> {
  const result = await getDocs(
    nullableQuery(collection(firestore, `/users/${uid}/draftTestimony`))
  )
  return result.docs.map(d => d.data() as Testimony)
}
