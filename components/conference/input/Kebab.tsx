import { ReactNode, useState } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ToastContainer } from "react-bootstrap"
import { Dropdown } from "components/bootstrap"
import { ConferenceTestimony, Testimony } from "components/db"
import { useReportTestimony } from "components/api/report"
import {
  ReportModal,
  RequestDeleteOwnTestimonyModal
} from "components/TestimonyCard/ReportModal"
import ReportToast from "components/TestimonyCard/ReportToast"
import { useInputContext } from "./context"
import { useToggleFollow } from "./useToggleFollow"
import { BellPlus, EllipsisVertical, FileText, Flag, SquarePen } from "./icons"
import { ink, wash } from "./tokens"
import { Anchor, Menu, Toggle } from "./menu"
import { authStepChanged } from "components/auth/redux"
import { useAppDispatch } from "components/hooks"
import { nameOf } from "./accounts"

const Trigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: none;
  color: ${ink.mid};
  &:hover {
    color: ${ink.strong};
    background: ${wash.default};
  }
`

const KebabMenu = styled(Menu)`
  && {
    --bs-dropdown-min-width: 180px;
  }
`

const Item = styled.button`
  --bs-dropdown-item-padding-y: 7px;
  --bs-dropdown-item-padding-x: 12px;
  && {
    display: flex;
    align-items: center;
    gap: 9px;
    font-weight: 500;
  }
  svg {
    flex-shrink: 0;
    color: ${ink.mid};
  }
`

/** Reporting an entry, or asking for one's own to be deleted: the modal the
 * bill page's testimony uses, worded for input, and its toast. `start` sends a signed-out reader
 * to sign in first; `node` goes anywhere in the tree. */
export function useReport(testimony: ConferenceTestimony) {
  const { t } = useTranslation("conferences")
  const { t: tt } = useTranslation("testimony")
  const dispatch = useAppDispatch()
  const { uid, signedIn } = useInputContext()
  const own = !!uid && testimony.authorUid === uid
  const [open, setOpen] = useState(false)
  const report = useReportTestimony()
  const didReport = report.isError || report.isSuccess
  // The request reads the author and the id, which these share with Testimony.
  const send = (r: { reason: string; additionalInformation: string }) =>
    report.mutate({
      report: r,
      testimony: testimony as unknown as Testimony
    })

  const node = (
    <>
      {open &&
        (own ? (
          <RequestDeleteOwnTestimonyModal
            onClose={() => setOpen(false)}
            onReport={send}
            isLoading={report.isLoading}
            title={t("input.report_title")}
            wrongTarget={t("input.delete_wrong")}
          >
            {t("input.rescind")}
          </RequestDeleteOwnTestimonyModal>
        ) : (
          <ReportModal
            onClose={() => setOpen(false)}
            onReport={send}
            isLoading={report.isLoading}
            title={t("input.report_title")}
            additionalInformationLabel="Additional information:"
            reasons={[
              tt("reportModal.personalInformation"),
              tt("reportModal.offensive"),
              tt("reportModal.violent"),
              tt("reportModal.spam"),
              tt("reportModal.phishing")
            ]}
          />
        ))}
      {didReport && (
        <ToastContainer position="top-center" style={{ zIndex: 1100 }}>
          <ReportToast isSuccessful={report.isSuccess} />
        </ToastContainer>
      )}
    </>
  )
  const start = () =>
    signedIn ? setOpen(true) : dispatch(authStepChanged("start"))
  return { own, start, node }
}

/** What a reader can do with one entry. The first, opening it, is the one a
 * reader wants; the rest act on the submission or its author. */
export function Kebab({
  testimony,
  onView
}: {
  testimony: ConferenceTestimony
  onView?: () => void
}) {
  const { t } = useTranslation("conferences")
  const { onEdit } = useInputContext()
  const { following, toggle: toggleFollow } = useToggleFollow(
    testimony.authorUid
  )

  const report = useReport(testimony)
  const items: { label: string; icon: ReactNode; act: () => void }[] = [
    ...(onView
      ? [{ label: t("input.view"), icon: <FileText size={15} />, act: onView }]
      : []),
    ...(report.own && onEdit
      ? [{ label: t("input.edit"), icon: <SquarePen size={15} />, act: onEdit }]
      : []),
    ...(report.own
      ? []
      : [
          {
            label: following
              ? t("input.unfollow_user")
              : t("input.follow_user"),
            icon: <BellPlus size={15} />,
            act: toggleFollow
          }
        ]),
    {
      label: t("input.report"),
      icon: <Flag size={15} />,
      act: report.start
    }
  ]

  return (
    <>
      <Anchor align="end">
        <Toggle
          as={Trigger}
          type="button"
          aria-label={t("input.more_actions", { name: nameOf(testimony) })}
        >
          <EllipsisVertical size={19} />
        </Toggle>
        <KebabMenu $gap={4} role="menu">
          {items.map(({ label, icon, act }) => (
            <Dropdown.Item
              key={label}
              as={Item}
              type="button"
              role="menuitem"
              onClick={act}
            >
              {icon}
              {label}
            </Dropdown.Item>
          ))}
        </KebabMenu>
      </Anchor>
      {report.node}
    </>
  )
}
