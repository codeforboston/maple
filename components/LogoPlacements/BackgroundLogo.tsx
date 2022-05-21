import { Image } from "react-bootstrap"

export default function BackgroundLogo() {
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        transformOrigin: "bottom right",
        transform: "scale(1.4)"
      }}
    >
      <Image fluid alt="" src="maple-1.png" />
    </div>
  )
}
