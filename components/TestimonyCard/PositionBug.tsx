import { Image } from "react-bootstrap"
import { useTranslation } from "next-i18next"

export type Position = "endorse" | "neutral" | "oppose"

export function PositionLabel({ position }: { position: Position }) {
  const {t} = useTranslation("profile")

  const iconSrc = `/thumbs-${position}.svg`
  return (
    <div>
      <Image alt={t('position.oppose')} src={iconSrc} />
    </div>
  )
}
