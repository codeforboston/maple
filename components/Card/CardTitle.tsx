import { collection, getDocs, query, where } from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ReactElement } from "react"
import CardBootstrap from "react-bootstrap/Card"
import { formatBillId } from "components/formatting"

import { useTranslation } from "next-i18next"
import { useAuth } from "../auth"
import { Stack } from "../bootstrap"
import { firestore } from "../firebase"
import { TitledSectionCard } from "../shared"

import {
  BillElement,
  UserElement
} from "components/EditProfilePage/FollowingTabComponents"
import { is } from "date-fns/locale"

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
}

export const CardTitle = (props: CardTitleProps) => {
  const { header, subheader, timestamp, imgSrc, imgTitle, inHeaderElement } =
    props
  return (
    <CardBootstrap.Body
      className={`align-items-center bg-secondary d-flex text-white`}
    >
      <div className="justify-content-middle d-flex flex-column align-items-center">
        {imgSrc && <img alt="" src={imgSrc} width="75" height="75" />}
        <div className="mt-1">{imgTitle}</div>
      </div>
      <CardBootstrap.Body>
        {header && (
          <CardBootstrap.Title className={`fs-4 lh-sm mb-1`}>
            {header}
          </CardBootstrap.Title>
        )}
        {subheader && (
          <CardBootstrap.Text className={`fs-5 lh-sm mb-1`}>
            {subheader}
          </CardBootstrap.Text>
        )}
        {timestamp && (
          <CardBootstrap.Text className={`fs-6 lh-sm`}>
            {timestamp}
          </CardBootstrap.Text>
        )}
      </CardBootstrap.Body>
      {inHeaderElement && inHeaderElement}
    </CardBootstrap.Body>
  )
}

// newsfeed bill card title
export const CardTitleV2 = (props: CardTitleProps) => {
  const {
    court,
    header,
    subheader,
    timestamp,
    imgSrc,
    imgTitle,
    inHeaderElement,
    isBillMatch
  } = props
  const { t } = useTranslation("common")

  return (
    <CardBootstrap.Body className={`align-items-center d-flex px-2 pt-2 pb-0`}>
      <div className="justify-content-middle d-flex flex-column align-items-center">
        {imgSrc && <img alt="" src={imgSrc} width="32" height="32" />}
      </div>
      <CardBootstrap.Body className="px-3 py-0">
        {header && (
          <CardBootstrap.Title
            className={`align-items-start fs-6 lh-sm mb-1 text-secondary`}
          >
            <a href={`/bills/${court}/${header}`}>
              <strong>{formatBillId(header)}</strong>
            </a>{" "}
            {subheader ? (
              <>
                {t("newsfeed.action_update")}
                {subheader}
              </>
            ) : (
              <></>
            )}
          </CardBootstrap.Title>
        )}
        {header ? (
          <CardBootstrap.Title
            className={`align-items-start fs-6 lh-sm mb-1 text-body-tertiary`}
          >
            {header && isBillMatch ? (
              <>{t("newsfeed.follow")}</>
            ) : (
              <>{t("newsfeed.not_follow")}</>
            )}
            <strong>{formatBillId(header)}</strong>
          </CardBootstrap.Title>
        ) : (
          <></>
        )}
      </CardBootstrap.Body>
    </CardBootstrap.Body>
  )
}
