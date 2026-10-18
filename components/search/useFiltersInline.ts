import { useMediaQuery } from "usehooks-ts"
import { useHtmlAttribute } from "components/shared/useHtmlAttribute"

/**
 * Whether the explorers' filters sit in their column beside the results, or
 * collapse behind the filter button. Maple collapses below 768px, as on main.
 * Digital Democracy and Mixed collapse below 992px, where the column would
 * otherwise stack above the results.
 */
export const useFiltersInline = () => {
  const dd = useHtmlAttribute("data-maple-theme") === "dd"
  return useMediaQuery(dd ? "(min-width: 992px)" : "(min-width: 768px)")
}
