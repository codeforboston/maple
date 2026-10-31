import type { TFunction } from "next-i18next"

/** A load error as shown on the lobbying pages. Firestore reports a lost
 * connection as "the client is offline", which reads as the lobbying
 * client on these pages, so that one gets our own wording. */
export function lobbyingErrorMessage(
  error: Error | undefined,
  t: TFunction
): string {
  const code = (error as { code?: string } | undefined)?.code
  if (code === "unavailable" || /client is offline/i.test(error?.message ?? ""))
    return t("errors.unavailable")
  return error?.message ?? ""
}
