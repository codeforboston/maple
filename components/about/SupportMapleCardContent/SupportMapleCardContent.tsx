import { useTranslation } from "next-i18next"

const DonateCardContent = () => {
  const { t } = useTranslation("supportmaple")
  return (
    <>
      <p>
        <span>{`${t("donate.bodytextOne")} `}</span>
        <a
          href="https://crm.bloomerang.co/HostedDonation?ApiKey=pub_89ca6da3-3b89-11ed-ba98-0665072ac94d&WidgetId=20480"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("donate.donorsLink")}
        </a>
      </p>
    </>
  )
}

const VolunteerCardContent = () => {
  const { t } = useTranslation("supportmaple")
  return (
    <>
      <p>
        <span>{`${t("volunteer.bodytextOne")} `}</span>
        <a
          href="https://github.com/codeforboston/maple/graphs/contributors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("volunteer.githubLink")}
        </a>
        <span>{`, ${t("volunteer.bodytextTwo")} `}</span>
        <a href="mailto:info@mapletestimony.org">info@mapletestimony.org.</a>
      </p>
    </>
  )
}

const FeedbackCardContent = () => {
  const { t } = useTranslation("supportmaple")
  return (
    <>
      <p>
        <span>{`${t("feedback.bodytextOne")} `}</span>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScU0l0bs-QLdVqIlh6iwi-Y2kOrSv7eqH5h4klhhtNGqsxCSw/viewform?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("feedback.feedbackForm")}
        </a>
        <span>{` ${t("feedback.bodytextTwo")} `}</span>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSebZTHz0XGR4WgPf10yTPXSOuZK2P41HxK0AFGXM57KbFWuDg/viewform?usp=share_link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("feedback.bugForm")}
        </a>
      </p>
    </>
  )
}

const UseMAPLECardContent = () => {
  const { t } = useTranslation("supportmaple")
  return (
    <>
      <p>{t("useMAPLE.bodytext")}</p>
    </>
  )
}

export {
  DonateCardContent,
  VolunteerCardContent,
  FeedbackCardContent,
  UseMAPLECardContent
}
