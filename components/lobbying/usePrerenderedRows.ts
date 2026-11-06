/**
 * A list page's rows for the selected session: the prerendered ones for the
 * session the page was built with, else what `useRows` loads for it.
 */
export function usePrerenderedRows<R>(
  session: number | "all",
  initialSession: number,
  initialRows: R[],
  useRows: (session: number | "all" | undefined) => {
    result?: R[]
    status: string
    error?: Error
  }
) {
  const prerendered = session === initialSession
  const other = useRows(prerendered ? undefined : session)
  return {
    rows: prerendered ? initialRows : other.result,
    loading: !prerendered && other.status !== "success",
    error: !prerendered && other.status === "error" ? other.error : undefined
  }
}
