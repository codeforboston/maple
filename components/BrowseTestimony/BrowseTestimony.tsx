import ErrorPage from "next/error"
import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { TabPane } from "react-bootstrap"
import TabContainer from "react-bootstrap/TabContainer"
import { useMediaQuery } from "usehooks-ts"
import { AllTestimoniesTab } from "./AllTestimoniesTab"
import { IndividualsTab } from "./IndividualsTab"
import { OrganizationsTab } from "./OrganizationsTab"
import {
  Header,
  StyledTabContent,
  StyledTabNav
} from "components/shared/StyledSharedComponents"
import { useAuth } from "../auth"
import { Button, Col, Container, Nav, Row, Spinner } from "../bootstrap"
import { usePublicProfile } from "../db"

export default function BrowseTestimony() {
  const [key, setKey] = useState("AllTestimonies")

  const { t } = useTranslation("browseTestimony")

  const tabs = [
    {
      title: t("tabs.allTestimonies"),
      eventKey: "AllTestimonies",
      content: <AllTestimoniesTab className="mt-3 mb-4" />
    },
    {
      title: t("tabs.individuals"),
      eventKey: "Individuals",
      content: <IndividualsTab className="mt-3 mb-4" />
    },
    {
      title: t("tabs.organizations"),
      eventKey: "Organizations",
      content: <OrganizationsTab className="mt-3 mb-4" />
    }
  ]

  return (
    <>
      <TabContainer activeKey={key} onSelect={(k: any) => setKey(k)}>
        <StyledTabNav>
          {tabs.map((t, i) => (
            <Nav.Item key={t.eventKey}>
              <Nav.Link eventKey={t.eventKey} className={`rounded-top m-0 p-0`}>
                <p className={`my-0 ${i == 0 ? "" : "mx-4"}`}>{t.title}</p>
                <hr className={`my-0`} />
              </Nav.Link>
            </Nav.Item>
          ))}
        </StyledTabNav>
        <StyledTabContent>
          {tabs.map(t => (
            <TabPane key={t.eventKey} title={t.title} eventKey={t.eventKey}>
              {t.content}
            </TabPane>
          ))}
        </StyledTabContent>
      </TabContainer>
    </>
  )
}
