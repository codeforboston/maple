import { parseISO, format } from "date-fns"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/router"
import { Trans, useTranslation } from "next-i18next"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { Col, Container, Image, Row } from "../bootstrap"
import { Transcriptions } from "./Transcriptions"
import { firestore } from "components/firebase"
import * as links from "components/links"

const SidebarBody = styled.div`
  background-color: white;
`

const SidebarSubbody = styled.div`
  font-size: 0.85rem;
`

const SidebarHeader = styled.div`
  background-color: #c0c4dc;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  padding-top: 9px;
`

export const HearingSidebar = ({ hearingDate }: { hearingDate: string }) => {
  const { t } = useTranslation("common")

  const dateObject = new Date(hearingDate)
  const formattedDate = dateObject.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric"
  })

  console.log("Start Time: ", formattedDate)

  return (
    <>
      <SidebarHeader className={`fs-6 fw-bold px-3 pb-2`}>
        {t("hearing_details")}
      </SidebarHeader>
      <SidebarBody className={`fs-6 fw-bold px-3 py-3`}>
        <SidebarSubbody className={`mb-1`}>
          {t("recording_date")}
        </SidebarSubbody>
        <div className={`fw-normal`}>{formattedDate}</div>
      </SidebarBody>
    </>
  )
}
