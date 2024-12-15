import { useTranslation } from "next-i18next"
import { ReactElement } from "react"
import CardBootstrap from "react-bootstrap/Card"
import { formatBillId } from "components/formatting"

import { Internal } from "components/links"

interface CardTitleProps {
  authorUid?: string
  court?: string
  header?: string
  subheader?: string
  timestamp?: string
  inHeaderElement?: ReactElement
  isBillMatch?: boolean
  isUserMatch?: boolean
  type?: string
  userRole?: string
}

export const CardTitle = (props: CardTitleProps) => {
  const {
    authorUid,
    court,
    header,
    subheader,
    isBillMatch,
    isUserMatch,
    type,
    userRole
  } = props

  return (
    <CardBootstrap.Body className={`align-items-center d-flex px-2 pt-2 pb-0`}>
      <CardHeaderImg type={type} userRole={userRole} />
      <CardBootstrap.Body className="px-3 py-0">
        <CardTitleHeadline
          authorUid={authorUid}
          court={court}
          header={header}
          subheader={subheader}
          type={type}
        />
        <CardTitleFollowing
          header={header}
          subheader={subheader}
          isBillMatch={isBillMatch}
          isUserMatch={isUserMatch}
          type={type}
        />
      </CardBootstrap.Body>
    </CardBootstrap.Body>
  )
}

const CardHeaderImg = (props: CardTitleProps) => {
  const { type, userRole } = props

  let avatar = `individualUser.svg`
  if (userRole == `organization`) {
    avatar = `OrganizationUser.svg`
  }

  switch (type) {
    case "testimony":
      return (
        <div className="justify-content-middle d-flex flex-column align-items-center">
          <img alt="capitol building" src={avatar} width="32" height="32" />
        </div>
      )
    case "bill":
      return (
        <div className="justify-content-middle d-flex flex-column align-items-center">
          <img
            alt="capitol building"
            src={`/images/bill-capitol.svg`}
            width="32"
            height="32"
          />
        </div>
      )
    default:
      return <></>
  }
}

const CardTitleHeadline = (props: CardTitleProps) => {
  const { authorUid, court, header, subheader, type } = props
  const { t } = useTranslation("common")

  switch (type) {
    case "testimony":
      return (
        <>
          {header && subheader && (
            <CardBootstrap.Title
              className={`align-items-start fs-6 lh-sm mb-1 text-secondary`}
            >
              <Internal href={`/profile?id=${authorUid}`}>
                <strong>{subheader}</strong>
              </Internal>

              {t("newsfeed.endorsed")}
              <a href={`/bills/${court}/${header}`}>
                <strong>{formatBillId(header)}</strong>
              </a>
            </CardBootstrap.Title>
          )}
        </>
      )
    case "bill":
      return (
        <>
          {header && (
            <CardBootstrap.Title
              className={`align-items-start fs-6 lh-sm mb-1 text-secondary`}
            >
              <a href={`/bills/${court}/${header}`}>
                <strong>{formatBillId(header)}</strong>
              </a>{" "}
              {subheader && (
                <>
                  {t("newsfeed.action_update")}
                  {subheader}
                </>
              )}
            </CardBootstrap.Title>
          )}
        </>
      )
    default:
      return (
        <CardBootstrap.Title
          className={`align-items-start fs-6 lh-sm mb-1 text-secondary`}
        >
          <strong>{header}</strong>
        </CardBootstrap.Title>
      )
  }
}

const CardTitleFollowing = (props: CardTitleProps) => {
  const { header, subheader, isBillMatch, isUserMatch, type } = props
  const { t } = useTranslation("common")

  if (type == `no results`) {
    return <></>
  } else if (type === `bill`) {
    return (
      <>
        {header && (
          <CardBootstrap.Title
            className={`align-items-start fs-6 lh-sm mb-1 text-body-tertiary`}
          >
            {isBillMatch ? (
              <>{t("newsfeed.follow")}</>
            ) : (
              <>{t("newsfeed.not_follow")}</>
            )}
            <strong>{formatBillId(header)}</strong>
          </CardBootstrap.Title>
        )}
      </>
    )
  } else if (isBillMatch === true && isUserMatch === true) {
    return (
      <CardBootstrap.Title
        className={`align-items-start fs-6 lh-sm mb-1 text-body-tertiary`}
      >
        {t("newsfeed.follow")}
        {header && <strong>{formatBillId(header)}</strong>}
        {t("newsfeed.and")}
        {subheader}
      </CardBootstrap.Title>
    )
  } else if (isBillMatch === true && isUserMatch === false) {
    return (
      <CardBootstrap.Title
        className={`align-items-start fs-6 lh-sm mb-1 text-body-tertiary`}
      >
        {t("newsfeed.follow")}
        {header && <strong>{formatBillId(header)}</strong>}
      </CardBootstrap.Title>
    )
  } else if (isBillMatch === false && isUserMatch === true) {
    return (
      <CardBootstrap.Title
        className={`align-items-start fs-6 lh-sm mb-1 text-body-tertiary`}
      >
        {t("newsfeed.follow")}
        {subheader}
      </CardBootstrap.Title>
    )
  } else {
    return (
      <CardBootstrap.Title
        className={`align-items-start fs-6 lh-sm mb-1 text-body-tertiary`}
      >
        {t("newsfeed.not_follow_either")}
        {header && <strong>{formatBillId(header)}</strong>}
        {t("newsfeed.or")}
        {subheader}
      </CardBootstrap.Title>
    )
  }
}
