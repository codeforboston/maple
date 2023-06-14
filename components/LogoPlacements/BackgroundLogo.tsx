import { Image } from "react-bootstrap"

export default function BackgroundLogo() {
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        bottom: -100,
        transformOrigin: "bottom right",
        transform: "scale(1.5)",
        opacity: 0.1
      }}
    >
      <Image fluid alt="" src="/maple-logo-white-no-tagline.svg" />
    </div>
  )
}
