import styled from "styled-components"
import { Row } from "../bootstrap"

export const Banner = styled(Row).attrs(props => ({
  className: `h3 text-center text-white justify-content-center p-3 bg-warning m-0 gx-0 w-100 ${props.className}`,
  children: props.children
}))``

/**
 * The Digital Democracy and Mixed skins' slim note across the top of a page,
 * in place of Banner's large orange bar: a pale tint of the Beta tag's orange,
 * with the amber note's dark ink and bold, underlined links. Used by the
 * lobbying explorer's beta note and the bill page's conference banner.
 */
export const SlimBanner = styled.p`
  margin: 0;
  padding: 1.1rem 1rem;
  text-align: center;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: var(--maple-color-amber-subtle-text);
  background: color-mix(in srgb, var(--bs-orange) 14%, #ffffff);
  border-bottom: 1px solid color-mix(in srgb, var(--bs-orange) 45%, #ffffff);

  a {
    color: var(--maple-color-amber-subtle-text);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 0.16em;
  }
`
