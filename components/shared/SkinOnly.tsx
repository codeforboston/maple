import styled from "styled-components"

/**
 * Content for one look only. Both versions are rendered and the skin
 * (data-maple-theme on <html>) shows one, so nothing swaps in after the page
 * loads. Digital Democracy includes Mixed, which shares its skin.
 */

/** Shown under the Maple skin only. */
export const MapleOnly = styled.div`
  [data-maple-theme="dd"] & {
    display: none;
  }
`

/** Shown under Digital Democracy and Mixed only. */
export const DigitalDemocracyOnly = styled.div`
  display: none;

  [data-maple-theme="dd"] & {
    display: block;
  }
`

/**
 * Which hero the Digital Democracy skin shows: the redesigned one by default,
 * or the redesigned one laid out like main's (below).
 */
export const NewHeroOnly = styled.div`
  [data-maple-hero="statehouse"] & {
    display: none;
  }
`

/** The Digital Democracy hero laid out like main's, with main's copy and the
 * statehouse in its own column in place of the search panel (data-maple-hero="statehouse",
 * the switcher's Statehouse option, which also gives the navbar its shadow on
 * every page; styles/globals.css). */
export const StatehouseHeroOnly = styled.div`
  display: none;

  [data-maple-hero="statehouse"] & {
    display: block;
  }
`
