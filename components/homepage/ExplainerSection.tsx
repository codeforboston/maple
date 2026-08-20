import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"
import { Internal } from "components/links"
import styles from "./Homepage.module.css"

export default function ExplainerSection() {
  const { t } = useTranslation("homepage")

  return (
    <section className={styles.explainer}>
      <div className={styles.sectionShell}>
        <div className={styles.explainerInner}>
          <div className={styles.explainerCopy}>
            <h2 className={styles.explainerTitle}>{t("explainer.title")}</h2>
            <p className={styles.explainerBody}>{t("explainer.body")}</p>
            <Internal href="/bills" className={styles.primaryAction}>
              {t("explainer.action")}
            </Internal>
          </div>
          <div className={styles.explainerVisual}>
            <Image
              className={styles.appPreview}
              src="/maple-1.png"
              alt={t("hearings.logoAlt")}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
