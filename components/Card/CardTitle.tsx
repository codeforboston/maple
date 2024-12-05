import { useTranslation } from "next-i18next"
import { ReactElement } from "react"
import CardBootstrap from "react-bootstrap/Card"
import { formatBillId } from "components/formatting"

interface CardTitleProps {
  court?: string
  header?: string
  subheader?: string
  timestamp?: string
  imgSrc?: string
  imgTitle?: string
  inHeaderElement?: ReactElement
  isBillMatch?: boolean
  isUserMatch?: boolean
  type?: string
}

interface CardTitleFollowingProps {
  header?: string
  subheader?: string
  isBillMatch?: boolean
  isUserMatch?: boolean
  type?: string
}

export const CardTitle = (props: CardTitleProps) => {
  const { court, header, subheader, imgSrc, isBillMatch, isUserMatch, type } =
    props
  const { t } = useTranslation("common")

  return (
    <CardBootstrap.Body className={`align-items-center d-flex px-2 pt-2 pb-0`}>
      <div className="justify-content-middle d-flex flex-column align-items-center">
        {imgSrc && <img alt="" src={imgSrc} width="32" height="32" />}
      </div>
      <CardBootstrap.Body className="px-3 py-0">
        {type == `no results` ? (
          <>
            <CardBootstrap.Title
              className={`align-items-start fs-6 lh-sm mb-1 text-secondary`}
            >
              <strong>{header}</strong>
            </CardBootstrap.Title>
          </>
        ) : (
          <>
            {type == `bill` ? (
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
            ) : (
              <>
                {header && subheader && (
                  <CardBootstrap.Title
                    className={`align-items-start fs-6 lh-sm mb-1 text-secondary`}
                  >
                    {subheader} {t("newsfeed.endorsed")}
                    <a href={`/bills/${court}/${header}`}>
                      <strong>{formatBillId(header)}</strong>
                    </a>
                  </CardBootstrap.Title>
                )}
              </>
            )}
          </>
        )}
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

const CardTitleFollowing = (props: CardTitleFollowingProps) => {
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
