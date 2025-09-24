import styled from "styled-components"
import { Image } from "../bootstrap"
import { useTranslation } from "next-i18next"

const Container = styled.div`
  background-color: white;
  border-radius: 6px;
  padding: 3rem 1.5rem 3rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  img {
    width: 6rem;
  }
`

export const NoResults: React.FC<React.PropsWithChildren<unknown>> = ({
  children
}) => {
  const { t } = useTranslation("search")
  return (
    <Container>
      <Image src="/no-results.svg" alt={t("no_results")} />
      <div className="fs-3">{t("looks_pretty_empty_here")}</div>
      <div className="text-center">{children}</div>
    </Container>
  )
}
