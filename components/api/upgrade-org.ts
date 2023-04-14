import { mapleClient } from "./maple-client"

/**
 * Changes the user's role to "organization".
 *
 * This route requires the logged-in user to be an admin.
 *
 * More specifically, the user's authentication token's customClaim "role" must be "admin".
 *
 * @param userId the user id of an organization, e.g. "Dmq0BXaE18aLR9ew4uTZBRJVlR8L"
 * @returns if 200, a {"data": <user>}
 *  if 404, 401, 403 a {"error": "message"}
 */
export async function upgradeOrganization(userId: string) {
  return mapleClient.patch(`/api/users/${userId}`, { role: "organization" })
}
