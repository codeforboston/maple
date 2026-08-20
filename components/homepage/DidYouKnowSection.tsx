import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"
import styles from "./Homepage.module.css"

type FactItem = {
  icon: string
  text: string
}

export default function DidYouKnowSection() {
  const { t } = useTranslation("homepage")
  const facts: FactItem[] = [
    {
      icon: "/handpen.svg",
      text: t("didYouKnow.submit")
    },
    {
      icon: "/images/clock.svg",
      text: t("didYouKnow.deadline")
    },
    {
      icon: "/envelope.svg",
      text: t("didYouKnow.legislators")
    }
  ]

  return (
    <section className={styles.sectionShell}>
      <div className={styles.didYouKnow} aria-labelledby="homepage-facts">
        <h2 id="homepage-facts" className={styles.sectionTitle}>
          {t("didYouKnow.title")}
        </h2>
        <div className={styles.factGrid}>
          {facts.map(fact => (
            <article key={fact.text} className={styles.factCard}>
              <Image
                className={styles.factIcon}
                src={fact.icon}
                alt=""
                aria-hidden="true"
              />
              <p className={styles.factText}>{fact.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
