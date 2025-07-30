import { Container } from "react-bootstrap"
import { useTranslation, Trans } from "next-i18next"
import * as links from "components/links"

const AdditionalResources = () => {
  const content = [
    {
      i18nKey: "find_legislator",
      href: "https://malegislature.gov/Search/FindMyLegislator"
    },
    {
      i18nKey: "legislative_doc",
      href: "https://www.mass.gov/doc/the-legislative-process-0/download"
    },
    {
      i18nKey: "legal_services",
      href: "https://www.masslegalservices.org/content/legislative-process-massachusetts-0"
    }
  ]
  const { t } = useTranslation("learnComponents")

  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fs-1 fw-bold text-center text-black">
        {t("legislative.additional_resources")}
      </h1>
      <p className="fs-4 mx-5 my-3">{t("legislative.resources_intro")}</p>

      {content.map(({ i18nKey, href }) => (
        <div
          key={i18nKey}
          className="m-4 py-2 px-4 text-bg-light rounded-4 d-flex align-items-center align-items-sm-start"
        >
          <div className="d-flex flex-0 justify-content-xs-center p-4">
            <p className="fs-4">
              <Trans
                t={t}
                i18nKey={`legislative.${i18nKey}`}
                components={[<links.External href={href} />]}
              />
            </p>
          </div>
        </div>
      ))}
    </Container>
  )
}

export default AdditionalResources
