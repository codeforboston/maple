import { UserRecord, Auth } from "firebase-admin/auth"

/**  Returns a list of all users in firestore. */
export const listAllUsers = async (auth: Auth) => {
  const users: UserRecord[] = []
  let nextPageToken: string | undefined
  do {
    const result = await auth.listUsers(1000, nextPageToken)
    users.push(...result.users)
  } while (nextPageToken)
  return users
}
