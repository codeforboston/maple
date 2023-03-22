import { Image } from "react-bootstrap"

export type Position = "endorse" | "neutral" | "oppose"

export function PositionLabel({ position }: { position: Position }) {

  const iconSrc = `./thumbs-${position}.svg`

  return (
    <div>
      <Image alt = "thumbs up icon" src= {iconSrc}/>
    
    </div>
  )
}
