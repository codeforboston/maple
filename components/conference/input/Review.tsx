import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { useAuth } from "components/auth"
import { ProfileMember, useMember, useProfile } from "components/db"
import { useLetterOnRecord } from "components/db/legislatorMail"
import {
  ConferencePosition,
  hasLegislators,
  Letter,
  LetterMember,
  renderLetter
} from "functions/src/conferenceLetters/letter"
import { Disc as Avatar } from "./Entry"
import { CalendarDays, House, Mail, SquarePen } from "./icons"
import { brand, ink, line, wash } from "./tokens"

const Heading = styled.p`
  margin: 0 0 10px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${ink.mid};
`

const Goes = styled.ul`
  list-style: none;
  margin: 0 0 22px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Row = styled.li`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${ink.midheavy};
  svg {
    flex: none;
    margin-top: 2px;
    color: ${brand.ink};
  }
  strong {
    color: ${ink.strong};
  }
`

const Aside = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 0.8125rem;
  color: ${ink.mid};
`

const Conferees = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 10px;
  font-size: 0.8125rem;
  color: ${ink.mid};
`

const Discs = styled.div`
  display: flex;
  padding-left: 8px;
`

const Disc = styled(Avatar)`
  width: 30px;
  height: 30px;
  margin-left: -8px;
  border: 2px solid var(--maple-surface-base);
  font-size: 0.6875rem;
  font-weight: 700;
`

const Box = styled.div`
  margin-bottom: 22px;
  padding: 14px 16px;
  border: 1px solid ${line.default};
  border-radius: 8px;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: ${ink.midheavy};
`

const Current = styled.div`
  margin-top: 6px;
  font-size: 0.875rem;
  color: ${ink.strong};
`

const Message = styled.div`
  padding: 14px 16px;
  background: ${wash.default};
  border: 1px solid ${line.default};
  border-radius: 8px;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: ${ink.midheavy};
  p {
    margin: 0 0 10px;
  }
`

const Headers = styled.dl`
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 4px 12px;
  margin: 0 0 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${line.default};
  dt {
    font-weight: 400;
    color: ${ink.mid};
  }
  dd {
    margin: 0;
    color: ${ink.strong};
    overflow-wrap: anywhere;
  }
`

const Quote = styled.blockquote`
  margin: 0 0 12px;
  padding: 2px 0 2px 14px;
  border-left: 3px solid ${brand.edge};
  p {
    margin-bottom: 6px;
  }
`

const Foot = styled.p`
  && {
    margin: 0;
    font-size: 0.75rem;
    color: ${ink.mid};
  }
`

const Banner = styled.p`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 0 0 20px;
  padding: 12px 14px;
  background: ${brand.soft};
  border-radius: 8px;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: ${brand.fill};
  svg {
    flex: none;
    margin-top: 2px;
  }
  button {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    font-weight: 700;
    color: inherit;
    text-decoration: underline;
  }
`

/** What a cosign without words of its own says to its reader: it still
 * counts, and a line would carry more weight. */
export function NoLine({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation("conferences")
  return (
    <Banner>
      <SquarePen size={16} />
      <span>
        {t("review.no_line")}{" "}
        <button type="button" onClick={onAdd}>
          {t("review.add_line")}
        </button>
      </span>
    </Banner>
  )
}

/** The reader's rep and senator as the letter names them: the member
 * documents' own name and district, so a renamed district isn't stale, and
 * what the profile holds until they load. */
export function useLegislators(court: number) {
  const { profile } = useProfile()
  const rep = useMember(court, profile?.representative?.id).member
  const sen = useMember(court, profile?.senator?.id).member
  const named = (
    held: ProfileMember | undefined,
    doc: typeof rep
  ): LetterMember | undefined =>
    held && {
      name: doc?.Name ?? held.name,
      district: doc?.District ?? held.district
    }
  return {
    representative: named(profile?.representative, rep),
    senator: named(profile?.senator, sen)
  }
}

/** The reader's own address, which replies go to and which is copied. */
function YourEmail({ email }: { email: string }) {
  const { t } = useTranslation("conferences")
  return (
    <>
      <Heading>{t("review.email_label")}</Heading>
      <Box>
        {t("review.email_note")}
        <Current>
          <span>{email}</span>
        </Current>
      </Box>
    </>
  )
}

/**
 * Where conference input goes: public on MAPLE, to the reader's rep and
 * senator, and into the conferees' weekly update. A reader whose profile has
 * neither is told whom MAPLE can't notify, and that only the update counts
 * them.
 */
export function Delivery({
  cosign,
  conferees,
  representative,
  senator
}: {
  /** The name of whoever's input this cosigns. */
  cosign?: string
  /** Initials of the conferees. */
  conferees: string[]
  representative?: LetterMember
  senator?: LetterMember
}) {
  const { t } = useTranslation("conferences")
  const known = hasLegislators({ representative, senator })
  const names = [
    representative && t("review.rep", { name: representative.name }),
    senator && t("review.sen", { name: senator.name })
  ]
    .filter(Boolean)
    .join(t("review.and"))
  return (
    <>
      <Heading>
        {t(cosign ? "review.goes_cosign" : "review.goes_input")}
      </Heading>
      <Goes>
        <Row>
          <House size={22} strokeWidth={1.6} />
          <div>
            {cosign
              ? t("review.public_cosign", { name: cosign })
              : t("review.public_input")}
            {!cosign && <Aside>{t("review.public_input_aside")}</Aside>}
          </div>
        </Row>
        <Row>
          <Mail size={22} strokeWidth={1.6} />
          <div>
            {known ? (
              <>
                <strong>{t("review.emailed")}</strong> {names}.
                {cosign && " " + t("review.emailed_cosign", { name: cosign })}
              </>
            ) : (
              t("review.emailed_none")
            )}
          </div>
        </Row>
        <Row>
          <CalendarDays size={22} strokeWidth={1.6} />
          <div>
            {t(cosign ? "review.weekly_cosign" : "review.weekly_input")}
            <Conferees>
              <span>{t("review.conferees")}</span>
              <Discs role="img" aria-label={t("review.conferees_label")}>
                {conferees.map((c, i) => (
                  <Disc key={i}>{c}</Disc>
                ))}
              </Discs>
            </Conferees>
          </div>
        </Row>
      </Goes>
    </>
  )
}

/** The letter as it will be sent. */
export function LetterPreview({ letter }: { letter: Letter }) {
  const { t } = useTranslation("conferences")
  return (
    <>
      <Heading>{t("review.preview_label")}</Heading>
      <Message>
        <Headers>
          <dt>{t("review.from")}</dt>
          <dd>{letter.from}</dd>
          <dt>{t("review.reply_to")}</dt>
          <dd>{letter.replyTo}</dd>
          <dt>{t("review.cc")}</dt>
          <dd>{letter.cc}</dd>
          <dt>{t("review.to")}</dt>
          <dd>{letter.to}</dd>
          <dt>{t("review.subject")}</dt>
          <dd>{letter.subject}</dd>
        </Headers>
        <p>{letter.salutation}</p>
        {letter.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {letter.cosigned && (
          <>
            <p>
              <strong>{letter.cosigned.lead}</strong>
            </p>
            <Quote>
              {letter.cosigned.quote.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Quote>
          </>
        )}
        <p>
          {letter.signature.map((s, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {s}
            </span>
          ))}
        </p>
        <Foot>{letter.footer}</Foot>
      </Message>
    </>
  )
}

/** The body of a review step: where the input goes and, when MAPLE knows whom
 * to write to, the reply-to address and the letter as it will be sent. Mounted
 * on the review step alone, so the legislators are read only there. */
export function LetterReview({
  court,
  conferenceId,
  conferees,
  author,
  conference,
  testimonyId,
  position,
  content,
  cosign
}: {
  court: number
  conferenceId: string
  /** Initials of the conferees, for the weekly update's row. */
  conferees: string[]
  author: string
  conference: string
  /** The input the reader posted before, when editing it. The letter is an
   * update when one for it is on record. */
  testimonyId?: string
  position: ConferencePosition
  /** The reader's own words, empty on a cosign without a note. */
  content: string
  /** Whose input this cosigns. */
  cosign?: { author: string; content: string }
}) {
  const { representative, senator } = useLegislators(court)
  const email = useAuth().user?.email ?? ""
  const edited = useLetterOnRecord(testimonyId)
  return (
    <>
      <Delivery
        cosign={cosign?.author}
        conferees={conferees}
        representative={representative}
        senator={senator}
      />
      {hasLegislators({ representative, senator }) && (
        <>
          <YourEmail email={email} />
          <LetterPreview
            letter={renderLetter({
              author,
              email,
              court,
              conferenceId,
              conference,
              edited,
              position,
              content,
              cosign,
              representative,
              senator
            })}
          />
        </>
      )}
    </>
  )
}
