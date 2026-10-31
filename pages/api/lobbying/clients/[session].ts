import { fetchClientList } from "components/db/lobbying"
import { createLobbyingListRoute } from "components/lobbying/listPageProps"

/** Clients list rows for one session, or "all". /lobbying/clients/[session] */
export default createLobbyingListRoute("session", fetchClientList)
