/*import { createService } from "components/service"
import { setSubscriptionRef } from "components//shared/FollowingQueries"
import { Bill } from "../db"
import { onSnapshot } from "firebase/firestore"
import { useEffect } from "react"
import { useAuth } from "../../auth"
import { profileRef } from "./profile"
import { billFollowChanged} from "./redux" 
import { useAppDispatch } from "components/hooks"
//import { Bill } from "./types"

//export type SearchService = ReturnType<typeof useService>


export const { Provider } = createService(() => {
    const uid = useAuth().user?.uid
    const dispatch = useAppDispatch
    useEffect(() => {
      if (uid) {
        const unsubscribe = onSnapshot(setSubscriptionRef(uid), snapshot => {
          dispatch(billFollowChanged())
        })
        return () => {
          unsubscribe()
          dispatch(billFollowChanged())
        }
      }
    }, [dispatch, uid])
  }) */
