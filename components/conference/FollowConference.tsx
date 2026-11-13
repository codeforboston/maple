import { useTranslation } from "next-i18next"
import { useState } from "react"
import styled from "styled-components"
import { isSitting } from "../../functions/src/shared"
import { useAuth } from "../auth"
import { useFlags } from "../featureFlags"
import { useFollowTopic } from "../shared/FollowButton"
import {
  conferenceTopicName,
  followConference,
  unfollowConference
} from "../shared/FollowingQueries"
import { Bell, BellOff, BellPlus, BellRing } from "./input/icons"
import { ConferenceSummary } from "./types"

type Followable = Pick<ConferenceSummary, "id" | "court" | "status">

/**
 * Following a conference sends its new input to the reader's newsfeed and
 * digest. Once it no longer takes input nothing new can arrive, so the control
 * is there only for a reader who already follows it, to unfollow; it stays
 * once shown, so an unfollow can be taken back.
 */
export function useConferenceFollow(conference: Followable) {
  const uid = useAuth().user?.uid
  const { notifications } = useFlags()
  const ref = { id: conference.id, court: conference.court }
  const follow = useFollowTopic(
    conferenceTopicName(conference.court, conference.id),
    () => followConference(uid, ref),
    () => unfollowConference(uid, ref),
    notifications
  )
  const [kept, setKept] = useState<string>()
  const closedFollowed =
    !isSitting(conference) && follow.loaded && follow.following
  if (closedFollowed && kept !== conference.id) setKept(conference.id)
  // Setting state during render re-renders before commit, so once closedFollowed
  // is true, kept already matches.
  const visible =
    notifications && (isSitting(conference) || kept === conference.id)
  return { ...follow, visible }
}

const Button = styled.button`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--maple-brand-primary);
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: var(--maple-brand-primary-strong);
  }

  /* Each half swaps to the sign of what a press would do on hover, so the
     outcome shows before it happens. */
  .on-hover {
    display: none;
  }
  &:hover .on-hover {
    display: inline-flex;
  }
  &:hover .off-hover {
    display: none;
  }
`

/**
 * The mockup's Follow control: a word and a bell, blue in both states, since
 * it stays a control to press again and the icon and word say which way.
 */
export function FollowConferenceButton({
  following,
  toggle
}: {
  following: boolean
  toggle: () => unknown
}) {
  const { t } = useTranslation("conferences")
  return (
    <Button type="button" aria-pressed={following} onClick={() => toggle()}>
      {following ? (
        <>
          <span className="off-hover">
            <BellRing size={15} />
          </span>
          <span className="on-hover">
            <BellOff size={15} />
          </span>
          <span className="off-hover">{t("follow.following")}</span>
          <span className="on-hover">{t("follow.unfollow")}</span>
        </>
      ) : (
        <>
          <span className="off-hover">
            <Bell size={15} />
          </span>
          <span className="on-hover">
            <BellPlus size={15} />
          </span>
          {t("follow.follow")}
        </>
      )}
    </Button>
  )
}
