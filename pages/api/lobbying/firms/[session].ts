import { fetchFirmList } from "components/db/lobbying"
import { createLobbyingListRoute } from "components/lobbying/listPageProps"

/** Lobbyists list rows for one session, or "all". /lobbying/firms/[session] */
export default createLobbyingListRoute("session", fetchFirmList)
