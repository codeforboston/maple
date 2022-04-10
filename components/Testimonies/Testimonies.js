import React, { useState } from "react"
import TestimoniesTable from "../TestimoniesTable/TestimoniesTable"
import { usePublishedTestimonyListing2 } from "../db"

// the word "testimonies": In more general, commonly used, contexts, the plural form will also be testimony.  However, in more specific contexts, the plural form can also be testimonies e.g. in reference to various types of testimonies or a collection of testimonies.

const Testimonies = () => {
  const testimoniesResponse = usePublishedTestimonyListing2({})
  const testimonies = testimoniesResponse.items ?? []

  const [filterBy, setFilterBy] = useState(null)

  return (
    <>
      <div className="row mt-2">
        <div className="col-2">
          <select
            className="form-control"
            onChange={e => {
              const option = e.target.value
              setFilterBy(option)
            }}
          >
            <option value="DEFAULT">Filter Testimony by..</option>
            <option value="Senator Name">Senator</option>
            <option value="Representative Name">Representative</option>
            <option value="Senator District">Senator District</option>
            <option value="Representative District">
              Representative District
            </option>
          </select>
        </div>
        <div className="col-6">
          {filterBy && filterBy != "DEFAULT" && (
            <div className="col-md-4">
              <select
                className="form-control"
                onChange={e => {
                  const option = e.target.value
                  // if (option !== "DEFAULT") setSort(option)
                }}
              >
                <option value="DEFAULT">{filterBy}</option>
                <option value="john">John Doe</option>
                <option value="jane">Jane Doe</option>
                <option value="jim">Jim Doe</option>
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2">
        <TestimoniesTable testimonies={testimonies} />
      </div>
    </>
  )
}

export default Testimonies
