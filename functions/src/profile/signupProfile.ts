import { isUndefined, omitBy } from "lodash"
import { Profile } from "./types"

/** The profile fields a sign-up sent, for setRole to write on the new
 * profile. Each way of signing up sends its own set: signing up with Google
 * sends none of them and fills them in from the browser afterward. Firestore
 * refuses a field set to undefined, so a field that wasn't sent is left out
 * rather than written as undefined. */
export function signupProfile(
  requestedRole: string,
  data: { [field: string]: unknown } | undefined
): Partial<Profile> {
  const {
    fullName,
    orgCategories,
    notificationFrequency,
    email,
    public: isPublic
  } = (data ?? {}) as Partial<Profile>

  const fields: Partial<Profile> =
    requestedRole === "organization"
      ? { fullName, email, orgCategories }
      : { fullName, notificationFrequency, email, public: isPublic }

  return omitBy(fields, isUndefined)
}
