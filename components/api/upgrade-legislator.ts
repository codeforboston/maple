import { mapleClient } from "./maple-client"

/**
 * Changes the user's role to "legislator", approving their legislator account request.
 *
 * Requires the logged-in user to be an admin.
 */
export async function acceptLegislatorRequest(userId: string) {
  return mapleClient.patch(`/api/users/${userId}`, { role: "legislator" })
}

/**
 * Rejects a pending legislator request by reverting the user's role to "user".
 * Also releases the claimed member code so it can be claimed by others.
 *
 * Requires the logged-in user to be an admin.
 */
export async function rejectLegislatorRequest(userId: string) {
  return mapleClient.patch(`/api/users/${userId}`, { role: "user" })
}
