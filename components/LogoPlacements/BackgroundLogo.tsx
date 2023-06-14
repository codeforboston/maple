import { Image } from "react-bootstrap"

export default function BackgroundLogo() {
  return (
    <div
      style={{
        position: "absolute",
        right: 10,
        bottom: -75,
        transformOrigin: "center",
        transform: "scale(1.3)",
        opacity: 0.1
      }}
    >
      <Image fluid alt="" src="/maple-logo-white-no-tagline.svg" />
    </div>
  )
}
