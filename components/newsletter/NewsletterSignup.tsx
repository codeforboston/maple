import { useTranslation } from "next-i18next"
import Button from "react-bootstrap/Button"
import styled from "styled-components"
import { NEWSLETTER_SIGNUP_URL } from "../common"
import LearnLayout from "../learn/LearnLayout"

/* The SendGrid form is a fixed 540px wide and brings its own heading, intro
   and reCAPTCHA. Where it fits, it is embedded; on narrower screens it would be
   cut off, so the page shows its own heading and a button to the form. */
const FITS = "(min-width: 40rem)"

const Frame = styled.iframe`
  display: none;
  width: 100%;
  /* The form is about 550px tall; the rest leaves room for the reCAPTCHA
     challenge, which opens inside the frame. */
  height: 42rem;
  border: 0;
  background: white;
  border-radius: 0.75rem;

  @media ${FITS} {
    display: block;
  }
`

const Narrow = styled.div`
  @media ${FITS} {
    display: none;
  }

  h1 {
    font-family: var(--maple-font-heading);
    font-size: 1.75rem;
  }
`

const Note = styled.p`
  color: var(--maple-text-muted);
  margin: 1rem 0 0;
`

/* Only beside the embedded form, which is what might not load. */
const FrameNote = styled(Note)`
  display: none;

  @media ${FITS} {
    display: block;
  }
`

export const NewsletterSignup = () => {
  const { t } = useTranslation("newsletter")
  return (
    <LearnLayout width="narrow" enlarge={false}>
      <Frame src={NEWSLETTER_SIGNUP_URL} title={t("form_title")} />
      <Narrow>
        <h1>{t("heading")}</h1>
        <p>{t("intro")}</p>
        <Button href={NEWSLETTER_SIGNUP_URL} variant="primary" size="lg">
          {t("sign_up")}
        </Button>
      </Narrow>
      <Note>{t("unsubscribe_note")}</Note>
      <FrameNote>
        {t("trouble")}{" "}
        <a
          href={NEWSLETTER_SIGNUP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("open_form")}
        </a>
      </FrameNote>
    </LearnLayout>
  )
}

export default NewsletterSignup
