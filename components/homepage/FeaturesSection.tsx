import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"
import styles from "./Homepage.module.css"

type FeatureItem = {
  icon: string
  body: string
}

export default function FeaturesSection() {
  const { t } = useTranslation("homepage")
  const features: FeatureItem[] = [
    {
      icon: "/homepage/feature-1.svg",
      body: t("features.research")
    },
    {
      icon: "/homepage/feature-2.svg",
      body: t("features.publish")
    },
    {
      icon: "/homepage/feature-3.svg",
      body: t("features.share")
    }
  ]

  return (
    <section className={styles.sectionShell}>
      <div className={styles.features} aria-labelledby="homepage-features">
        <h2 id="homepage-features" className={styles.sectionTitle}>
          {t("features.title")}
        </h2>
        <div className={styles.featureLayout}>
          <div className={styles.featurePreviewWrap}>
            <Image
              className={styles.featurePreview}
              src="/homepage/feature-preview-ballot-question.png"
              alt={t("hearings.appPreviewAlt")}
            />
          </div>
          <div className={styles.featureList}>
            {features.map(feature => (
              <article key={feature.icon} className={styles.featureItem}>
                <div className={styles.featureIconWrap}>
                  <Image
                    className={styles.featureIcon}
                    src={feature.icon}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className={styles.featureBody}>{feature.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
