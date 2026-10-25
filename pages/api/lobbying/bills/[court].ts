import { fetchBillRows } from "components/db/lobbying"
import { createLobbyingListRoute } from "components/lobbying/listPageProps"

/** Bill rows for one session of the Bills list. /lobbying/bills/[court] */
export default createLobbyingListRoute(
  "court",
  court => fetchBillRows(court as number),
  { allowAll: false }
)
