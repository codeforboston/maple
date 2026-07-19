import styled from "styled-components"
import svgPaths from "./svgPaths"

// The WHO/WHAT/WHEN/WHERE/WHY/HOW badges from the Figma prototype.
//
// The prototype positioned each shape with Tailwind's `hypot()` sizing and
// `container-type: size`, which is how Figma expresses a rotated path inside a
// bounding box. A rotated <svg> reaches the same result without Tailwind.

const Badge = styled.div<{ $w: number; $h: number }>`
  position: relative;
  flex-shrink: 0;
  width: ${p => p.$w}px;
  height: ${p => p.$h}px;

  svg {
    position: absolute;
    display: block;
  }

  .label {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 12.45px;
    line-height: 1;
    letter-spacing: 1.5px;
    color: #fff;
    white-space: nowrap;
    padding-left: 1.5px;
  }
`

type BlobProps = {
  label: string
  color: string
  path: string
  viewBox: string
  /** Outer badge box. */
  w: number
  h: number
  /** The shape's own box, positioned within the badge. */
  shape: { w: number; h: number; left: number; top: number }
  rotate?: number
  /**
   * Rotating a shape grows its bounding box, so a rotated blob would otherwise
   * render noticeably larger than an unrotated one. Rotated blobs are centred
   * in the badge and scaled down. Note the scale is not a pure bounding-box
   * match: a rotated bbox includes empty diagonal corners, so matching bbox
   * width would leave the visible shape smaller than its unrotated siblings.
   */
  scale?: number
}

const Blob = ({
  label,
  color,
  path,
  viewBox,
  w,
  h,
  shape,
  rotate,
  scale
}: BlobProps) => {
  const transform = rotate
    ? `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale ?? 1})`
    : undefined

  return (
    <Badge $w={w} $h={h}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={viewBox}
        fill="none"
        preserveAspectRatio="none"
        style={
          rotate
            ? {
                width: shape.w,
                height: shape.h,
                left: "50%",
                top: "50%",
                transform
              }
            : {
                width: shape.w,
                height: shape.h,
                left: shape.left,
                top: shape.top
              }
        }
      >
        <path d={path} fill={color} />
      </svg>
      <span className="label">{label}</span>
    </Badge>
  )
}

export const WhoBlob = () => (
  <Blob
    label="WHO"
    color="var(--bs-gold)"
    path={svgPaths.p38984180}
    viewBox="0 0 69.46 58.3698"
    w={69}
    h={58}
    shape={{ w: 69, h: 58, left: 0, top: 0 }}
  />
)

export const WhatBlob = () => (
  <Blob
    label="WHAT"
    color="var(--bs-green)"
    path={svgPaths.p276c5200}
    viewBox="0 0 71.2289 68.0039"
    w={70}
    h={59}
    shape={{ w: 92, h: 93, left: -12, top: -17 }}
    rotate={65.06}
    scale={0.66}
  />
)

export const WhenBlob = () => (
  <Blob
    label="WHEN"
    color="var(--bs-red)"
    path={svgPaths.p1f124780}
    viewBox="0 0 69.4526 65.561"
    w={70}
    h={63}
    shape={{ w: 69, h: 65, left: 1, top: -3 }}
  />
)

export const WhereBlob = () => (
  <Blob
    label="WHERE"
    color="var(--bs-blue)"
    path={svgPaths.p1f789000}
    viewBox="0 0 62.2444 65.7062"
    w={70}
    h={63}
    shape={{ w: 89, h: 86, left: -10, top: -12 }}
    rotate={65.06}
    scale={0.7}
  />
)

export const WhyBlob = () => (
  <Blob
    label="WHY"
    color="var(--bs-orange)"
    path={svgPaths.p38dd600}
    viewBox="0 0 65.8987 54.6035"
    w={70}
    h={63}
    shape={{ w: 66, h: 55, left: 1, top: 4 }}
  />
)

export const HowBlob = () => (
  <Blob
    label="HOW"
    color="var(--maple-learn-cyan)"
    path={svgPaths.p276c5200}
    viewBox="0 0 71.2289 68.0039"
    w={70}
    h={63}
    shape={{ w: 88, h: 91, left: -11, top: -14 }}
    rotate={-112.24}
    scale={0.69}
  />
)
