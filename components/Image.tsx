import NextImage, { ImageProps, ImageLoaderProps } from "next/image"

const customLoader = ({ src }: ImageLoaderProps) => {
  return src
}

/**
 * https://github.com/vercel/next.js/discussions/19065
 */
export default function Image(props: ImageProps) {
  return <NextImage {...props} loader={customLoader} unoptimized={true} />
}
