import { useCallback, useState } from "react"
import { BillContent, usePublishedTestimonyListing } from "../db"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import { BillProps } from "./types"
import styled from "styled-components"
import { Card as MapleCard } from "../Card"
import { Card as BootstrapCard } from "react-bootstrap"
import { Tab, Tabs } from "./Tabs"

export const BillTestimonies = (
  props: BillProps & {
    className?: string
  }
) => {
  const [authorRole, setAuthorRole] = useState("")
  const { id, court } = props.bill
  const testimony = usePublishedTestimonyListing({
    billId: id,
    court
  })

  const { items, setFilter } = testimony

  const refreshtable = useCallback(() => {
    items.execute()
  }, [items])

  const [activeTab, setActiveTab] = useState(1)

  const handleTabClick = (e: Event, value: number) => {
    setActiveTab(value)
  }

  const handleFilter = (filter: string | undefined) => {
    if (filter === "organization") {
      setFilter({ authorRole: "organization" })
      //setAuthorRole(filter)
    }
    if (filter === "user") {
      setFilter({ authorRole: "user" })
      //setAuthorRole(filter)
    }
    if (filter === "") {
      setFilter({ authorRole: "" })
      //setAuthorRole("")
    }
    // } else {
    //   const authorRole =
    //     filter === null
    //       ? null
    //       : ["user", "admin", "legislator", "pendingUpgrade"].includes(filter)
    //       ? filter
    //       : null
    //   setFilter(authorRole ? { authorRole } : null)
    // }
  }

  const tabs = [
    <Tab
      key="at"
      label="All Testimonies"
      active={false}
      value={1}
      action={() => handleFilter("")}
    />,
    <Tab
      key="uo"
      label="Individuals"
      active={false}
      value={2}
      action={() => handleFilter("user")}
    />,
    <Tab
      key="oo"
      label="Organizations"
      active={false}
      value={3}
      action={() => handleFilter("organization")}
    />
  ]
  return (
    <MapleCard
      headerElement={<Head>Testimony</Head>}
      body={
        <>
          {" "}
          <Tabs
            childTabs={tabs}
            onChange={handleTabClick}
            selectedTab={activeTab}
          ></Tabs>
          <ViewTestimony
            {...testimony}
            showControls={false}
            className={props.className}
            billsPage={true}
          />
        </>
      }
    ></MapleCard>
  )
}
const Head = styled(BootstrapCard.Header)`
  background-color: var(--bs-blue);
  color: white;
  font-size: 22px;
`
