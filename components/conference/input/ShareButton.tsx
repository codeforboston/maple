import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Plus } from "./icons"
import { brand } from "./tokens"

const Button = styled.button`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
  padding: 8px 16px 8px 12px;
  border: 1px solid ${brand.fill};
  border-radius: 8px;
  background: ${brand.fill};
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  &:hover:not(:disabled) {
    background: ${brand.hover};
    border-color: ${brand.hover};
  }
  &:disabled {
    border-color: transparent;
    background: ${brand.fillDisabled};
    cursor: not-allowed;
  }
`

/** The way in, beside the title. Drawn disabled once the reader has filed. */
export function ShareButton({
  onClick,
  disabled
}: {
  onClick: () => void
  disabled?: boolean
}) {
  const { t } = useTranslation("conferences")
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? t("input.shared") : undefined}
    >
      <Plus size={16} />
      {t("input.share")}
    </Button>
  )
}
