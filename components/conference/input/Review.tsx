import { useState } from "react"
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
  looksLikeEmail,
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
  font-size: 0.875rem;
  color: ${ink.strong};
`

const Link = styled.button`
  padding: 6px 2px;
  border: 0;
  background: none;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${brand.ink};
  text-decoration: underline;
`

const Edit = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: ${ink.mid};
  }
  div {
    display: flex;
    gap: 10px;
  }
  input {
    flex: 1;
    min-width: 0;
    height: 40px;
    padding: 0 12px;
    border: 1px solid ${brand.fill};
    border-radius: 8px;
    font-size: 0.875rem;
    color: ${ink.strong};
  }
  button {
    height: 40px;
    padding: 0 16px;
    border: 1px solid ${brand.fill};
    border-radius: 8px;
    background: var(--maple-surface-base);
    font-size: 0.8125rem;
    font-weight: 600;
    color: ${brand.fill};
  }
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

/** Where a reply goes: the reader's own address, or the one they gave for
 * this letter. Their login address is not changed. */
function useReplyTo(chosen?: string | null) {
  const { user } = useAuth()
  const own = user?.email ?? ""
  return { own, replyTo: chosen?.trim() || own }
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

/** The reply-to address and the way to give another for this letter only. */
export function ReplyTo({
  own,
  value,
  onChange
}: {
  /** The reader's login address. */
  own: string
  /** The address chosen for this letter; empty to use `own`. */
  value: string
  onChange: (replyTo: string) => void
}) {
  const { t } = useTranslation("conferences")
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState("")
  const [invalid, setInvalid] = useState(false)
  const open = () => {
    setText(value || own)
    setEditing(true)
  }
  const done = () => {
    const next = text.trim()
    if (next && !looksLikeEmail(next)) return setInvalid(true)
    onChange(next === own ? "" : next)
    setEditing(false)
  }
  return (
    <>
      <Heading>{t("review.email_label")}</Heading>
      <Box>
        {t("review.email_note")}
        {editing ? (
          <Edit>
            <label htmlFor="reply-to">{t("review.reply_to_label")}</label>
            <div>
              <input
                id="reply-to"
                type="email"
                value={text}
                aria-invalid={invalid}
                onChange={e => {
                  setText(e.target.value)
                  setInvalid(false)
                }}
                onKeyDown={e => e.key === "Enter" && done()}
              />
              <button type="button" onClick={done}>
                {t("review.done")}
              </button>
            </div>
            <span role={invalid ? "alert" : undefined}>
              {t(invalid ? "review.reply_to_invalid" : "review.reply_to_note")}
            </span>
          </Edit>
        ) : (
          <Current>
            <span>{value || own}</span>
            <Link type="button" onClick={open}>
              {t("review.use_other")}
            </Link>
          </Current>
        )}
      </Box>
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
  cosign,
  chosen,
  onChoose
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
  /** The reply-to the reader chose for this letter; empty for their own. */
  chosen: string
  onChoose: (replyTo: string) => void
}) {
  const { representative, senator } = useLegislators(court)
  const { own, replyTo } = useReplyTo(chosen)
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
          <ReplyTo own={own} value={chosen} onChange={onChoose} />
          <LetterPreview
            letter={renderLetter({
              author,
              replyTo,
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
