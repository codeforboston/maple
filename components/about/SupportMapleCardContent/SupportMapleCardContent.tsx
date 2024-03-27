import { Button } from "../../bootstrap";
import { useTranslation } from "next-i18next";

const DonateCardContent = () => {
  const { t } = useTranslation("supportmaple");
  return (
    <>
      <p>
        {`${t("donate.bodytextOne")} `}
        <Button
          variant="primary"
          href="https://opencollective.com/mapletestimony"
          target="_blank"
          rel="noopener noreferrer"
          as="a"
        >
          {t("donate.donorsLink")}
        </Button>
        {` ${t("donate.bodytextTwo")}`}
      </p>
    </>
  );
};

const VolunteerCardContent = () => {
  const { t } = useTranslation("supportmaple");
  return (
    <>
      <p>
        {`${t("volunteer.bodytextOne")} `}
        <Button
          variant="link"
          href="https://github.com/codeforboston/maple/graphs/contributors"
          target="_blank"
          rel="noopener noreferrer"
          as="a"
        >
          {t("volunteer.githubLink")}
        </Button>
        {`, ${t("volunteer.bodytextTwo")} `}
        <a href="mailto:info@mapletestimony.org">info@mapletestimony.org</a>.
      </p>
    </>
  );
};

const FeedbackCardContent = () => {
  const { t } = useTranslation("supportmaple");
  return (
    <>
      <p>
        {`${t("feedback.bodytextOne")} `}
        <Button
          variant="link"
          href="https://docs.google.com/forms/d/e/1FAIpQLScU0l0bs-QLdVqIlh6iwi-Y2kOrSv7eqH5h4klhhtNGqsxCSw/viewform?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          as="a"
        >
          {t("feedback.feedbackForm")}
        </Button>
        {` ${t("feedback.bodytextTwo")} `}
        <Button
          variant="link"
          href="https://docs.google.com/forms/d/e/1FAIpQLSebZTHz0XGR4WgPf10yTPXSOuZK2P41HxK0AFGXM57KbFWuDg/viewform?usp=share_link"
          target="_blank"
          rel="noopener noreferrer"
          as="a"
        >
          {t("feedback.bugForm")}
        </Button>
      </p>
    </>
  );
};

const UseMAPLECardContent = () => {
  const { t } = useTranslation("supportmaple");
  return (
    <>
      <p>{t("useMAPLE.bodytext")}</p>
    </>
  );
};

export {
  DonateCardContent,
  VolunteerCardContent,
  FeedbackCardContent,
  UseMAPLECardContent
};
