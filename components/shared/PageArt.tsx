import styled, { createGlobalStyle } from "styled-components"

/**
 * An explorer's illustration as a pair on either side of the page column,
 * each tucked partly behind the column's edge: the right one up by the top of
 * the search box on a page whose search follows straight after the title, the
 * left one a little lower and smaller. Placed from the top of the column (where
 * the title starts), not from the search box, so it sits in the same spot on
 * every explorer whatever comes between the title and the search, such as a
 * description or a notice. Render it directly inside the page column, which
 * must be positioned.
 *
 * The left one is flipped to face the column, as the right one does; pass
 * mirrorLeft={false} for art with writing in it that would read backwards.
 * leftSrc gives the left one art of its own, which is not flipped. out moves
 * both further from the column, for a page that wants more room.
 * Tilted away from the column, or upright for art that should not tilt, such
 * as a building. Desktop widths, and the Digital Democracy and Mixed skins
 * with explorer art on (data-maple-art), only.
 */
export const PageArt = ({
  src,
  leftSrc,
  upright = false,
  mirrorLeft = !leftSrc,
  out = 0,
  sameSize = false,
  size = 9,
  leftLift = 0,
  leftSize,
  rightDrop = 0,
  right = true,
  leftTilt = -10,
  leftOut = 0,
  rightOpacity,
  rightOut = 0
}: {
  /** The page's own illustration, on the right, and on the left too unless
   * leftSrc gives the left its own. */
  src: string
  /** Art of its own for the left piece. Drawn to face the column already, so
   * it is not mirrored unless mirrorLeft says so. */
  leftSrc?: string
  upright?: boolean
  mirrorLeft?: boolean
  /** How much further out from the column both pieces sit, in rem. */
  out?: number
  /** The left piece at the right one's size, instead of a little smaller. */
  sameSize?: boolean
  /** The right piece's width in rem; the left one is in proportion. */
  size?: number
  /** How much higher the left piece sits, in rem. */
  leftLift?: number
  /** The left piece's width in rem, when it should differ from the usual
   * proportion; overrides sameSize. */
  leftSize?: number
  /** How much lower the right piece sits, in rem, for a page with more
   * between its title and its search box. */
  rightDrop?: number
  /** false leaves the right piece out. */
  right?: boolean
  /** The left piece's turn in degrees; negative turns it anticlockwise,
   * leaning out toward the window edge. */
  leftTilt?: number
  /** How much further out the left piece alone sits, in rem; negative brings
   * it in. */
  leftOut?: number
  /** The right piece's opacity, 0 to 1, when it should differ from the
   * usual 0.75. */
  rightOpacity?: number
  /** How much further out the right piece alone sits, in rem; negative
   * brings it in. */
  rightOut?: number
}) => (
  <>
    <ClipSideways />
    <Pair
      aria-hidden="true"
      $upright={upright}
      $mirrorLeft={mirrorLeft}
      style={
        {
          "--page-art-out": `${out}rem`,
          "--page-art-size": `${size}rem`,
          "--page-art-left-lift": `${leftLift}rem`,
          "--page-art-right-drop": `${rightDrop}rem`,
          "--page-art-left-tilt": `${leftTilt}deg`,
          "--page-art-left-out": `${leftOut}rem`,
          "--page-art-right-out": `${rightOut}rem`,
          ...(rightOpacity !== undefined && {
            "--page-art-right-opacity": rightOpacity
          }),
          ...(leftSize !== undefined && {
            "--page-art-left-size": `${leftSize}rem`
          })
        } as React.CSSProperties
      }
    >
      {right && <img className="right" src={encodeURI(src)} alt="" />}
      <img
        className={sameSize ? "left same-size" : "left"}
        src={encodeURI(leftSrc ?? src)}
        alt=""
      />
    </Pair>
  </>
)

/* Anything past the edge of the window is cut off rather than adding a
   sideways scrollbar. clip, unlike hidden, leaves sticky elements working. */
const ClipSideways = createGlobalStyle`
  main#main-content {
    overflow-x: clip;
  }
`

const Pair = styled.div<{ $upright: boolean; $mirrorLeft: boolean }>`
  display: none;

  /* Digital Democracy and Mixed only, and only while explorer art is on
     (data-maple-art); the Maple skin has none. */
  @media (min-width: 992px) {
    [data-maple-theme="dd"]:not([data-maple-art="off"]) & {
      display: contents;
    }
  }

  img {
    position: absolute;
    height: auto;
    pointer-events: none;
    /* Behind the page's own blocks, over the page ground. */
    z-index: -1;
    /* Dimmed, so it stays in the background. */
    opacity: 0.75;
  }

  /* Reaches 1.5rem in behind the column's right edge. 2.25rem down: 2rem above
     where the search box starts on bills, under the title (its 1.15 line
     height at 38px, plus the 1.5rem below it). */
  .right {
    left: calc(100% - 1.5rem + var(--page-art-out) + var(--page-art-right-out));
    top: calc(2.25rem + var(--page-art-right-drop));
    width: var(--page-art-size);
    transform: ${p => (p.$upright ? "none" : "rotate(10deg)")};
    opacity: var(--page-art-right-opacity, 0.75);
  }

  /* Reaches 1rem in behind the left edge, lower down. */
  .left {
    right: calc(100% - 1rem + var(--page-art-out) + var(--page-art-left-out));
    top: calc(7rem - var(--page-art-left-lift));
    /* 7.5rem at the default size, unless leftSize says otherwise. */
    width: var(--page-art-left-size, calc(var(--page-art-size) * 7.5 / 9));
    transform: ${p =>
      [
        p.$upright ? "" : "rotate(var(--page-art-left-tilt))",
        p.$mirrorLeft ? "scaleX(-1)" : ""
      ]
        .join(" ")
        .trim() || "none"};
  }

  .left.same-size {
    width: var(--page-art-left-size, var(--page-art-size));
  }
`
