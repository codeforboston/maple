import { useMediaQuery } from "usehooks-ts"

/**
 * Whether the explorers' filters sit in their column beside the results, or
 * collapse behind the filter button. They collapse below 992px, where the
 * column would otherwise stack above the results.
 */
export const useFiltersInline = () => useMediaQuery("(min-width: 992px)")
