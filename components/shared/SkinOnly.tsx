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
