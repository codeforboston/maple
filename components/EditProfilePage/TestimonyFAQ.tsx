import styled from "styled-components"
import { Card, Col, Image } from "react-bootstrap"
import { useTranslation } from "next-i18next"

const StyledCard = styled(Card)`
  flex-grow: 1;
  border-radius: 1rem;
  background: var(--bs-blue);
  border: none;
  color: white;
  padding: 1.5rem 2rem;
`

export const TestimonyFAQ = ({ className }: { className: string }) => {
  const { t } = useTranslation("editProfile")
  return (
    <StyledCard className={className}>
      <Card.Body>
        <h2>{t("testimonies.faq")}</h2>
        <div className="p-4 m-3 d-flex justify-content-center">
          <Image
            className="w-100"
            fluid
            alt="writing icon"
            src="/writing.svg"
          ></Image>
        </div>

        <h4>{t("testimonies.edit")}</h4>
        <p>{t("testimonies.editTip1")}</p>
        <p> {t("testimonies.editTip2")}</p>
      </Card.Body>
    </StyledCard>
  )
}
