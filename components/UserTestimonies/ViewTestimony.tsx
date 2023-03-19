
import React, { useState } from "react"
import {
  UsePublishedTestimonyListing
} from "../db"
import { TitledSectionCard } from "../shared"
import { TestimonyItem } from "./TestimonyItem"
import { Testimony, Position } from "../db"
import { Timestamp } from "firebase/firestore"


const ViewTestimony = (
  props: UsePublishedTestimonyListing & {
    search?: boolean
    showControls?: boolean
    showBillNumber?: boolean
    className?: string
  }
) => {
  const {
    // pagination,
    // items,
    // setFilter,
    showControls = false,
    showBillNumber = false,
    className
  } = props
  // const testimony = items.result ?? []

  const neutralpos:Position = "neutral"

  const testimony1:Testimony = {
    billId: "",
    court: 123,
    position: neutralpos,
    content: "constent",
    attachmentId: "aasdf", 
    id: "id",
    authorUid: "id", 
    version: 1, 
    authorDisplayName:"Author Name"    
  }

  const [orderBy, setOrderBy] = useState<string>()

  return (
    <TitledSectionCard
      title={"Testimony"}
      className={className}
      // bug={<SortTestimonyDropDown orderBy={orderBy} setOrderBy={setOrderBy} />}
    >
      {/* {testimony.length > 0 ? (
        testimony.map(t => (
          <TestimonyItem
            key={t.authorUid + t.billId}
            testimony={t}
            showControls={showControls}
            showBillNumber={showBillNumber}
          />
        ))
      ) : (
        <NoResults>
          There is no testimony here. <br />
          <b>Be the first and add one!</b>
        </NoResults>
      )} */}

   

          <TestimonyItem
            testimony={testimony1}
            showControls={showControls}
            showBillNumber={showBillNumber}
          />
          <TestimonyItem
            testimony={testimony1}
            showControls={showControls}
            showBillNumber={showBillNumber}
          />
        
      
      <div className="p-3" />
      {/* <PaginationButtons pagination={pagination} /> */}
    </TitledSectionCard>
  )
}



export default ViewTestimony
