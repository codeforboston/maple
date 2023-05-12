import _ from "lodash"
import { useCallback, useState, useEffect } from "react"
import {
  Button,
  Datagrid,
  DateField,
  List,
  RaRecord,
  TextField,
  Toolbar,
  WithRecord,
  useListContext,
  useListController
} from "react-admin"

import { upgradeOrganization } from "components/api/upgrade-org"
import { Profile } from "components/db"
import { Internal } from "components/links"

import { createFakeOrg } from "components/moderation"
import { nanoid } from "nanoid"
import { loremIpsum } from "lorem-ipsum"

const UserRoleToolBar = ({
  filterValues,
  setFilters
}: {
  filterValues: object
  setFilters: any
}) => {
  const toggleFilter = useCallback(() => {
    _.isEmpty(filterValues)
      ? setFilters({ role: "pendingUpgrade" }, [], true)
      : setFilters({}, [], true)
  }, [filterValues, setFilters])

  const { data, refetch } = useListContext<Profile[] & RaRecord>()

  const pendingCount =
    data?.filter(d => d.role === "pendingUpgrade").length ?? 0

  const waitForOrg = useCallback(async () => {
    const uid = nanoid(8)
    const fullName = loremIpsum({ count: 2, units: "words" })
    const email = `${uid}@example.com`

    const res = await createFakeOrg({ uid, fullName, email })
    console.log(res.data)
    refetch()
    return res.data
  }, [refetch])

  return (
    <Toolbar sx={{ width: "100%", justifyContent: "space-between" }}>
      <div>Upgrade Requests: {pendingCount} pending upgrades</div>
      <Button
        label={
          _.isEmpty(filterValues) ? "Show Requests Only" : "Show All Profiles"
        }
        variant="outlined"
        onClick={toggleFilter}
      />
      {["development", "test"].includes(process.env.NODE_ENV) && (
        <Button
          label="add fake org request"
          variant="outlined"
          onClick={waitForOrg}
        />
      )}
    </Toolbar>
  )
}

export function ListProfiles() {
  const [updating, setUpdating] = useState<string>()
  const { filterValues, setFilters, refetch } = useListController()
  async function handleUpgrade(record: any) {
    const { id, role } = record
    setUpdating(id)
    if (role !== "pendingUpgrade") {
      console.log(`role wasn't pendingUpgrade, it was ${role}`)
      setUpdating(undefined)

      return
    }
    const response = await upgradeOrganization(id)
    if (response.status === 200) {
      alert(`Upgraded account to organization.`)
    } else {
      alert("Something went wrong, please try again later.")
    }
    console.log(response)
    setUpdating(undefined)
    refetch()
  }

  return (
    <List
      actions={
        <UserRoleToolBar filterValues={filterValues} setFilters={setFilters} />
      }
    >
      <Datagrid
        rowStyle={record => {
          return {
            backgroundColor: record.id === updating ? "" : ""
            // transition: "backgroundColor 1s"
          }
        }}
      >
        <TextField source="fullName" label="Organization" />
        <TextField source="email" /> <br />
        <TextField source="phoneNumber" /> <br />
        <TextField source="website" />
        <DateField source="reportDate" />
        <WithRecord
          render={(record: Profile & RaRecord) => {
            return (
              <>
                <div>{record.about}</div>
                <Internal href={`/profile?id=${record.id}`}>
                  view profile
                </Internal>
              </>
            )
          }}
        />
        <TextField source="role" />
        <WithRecord
          render={record => {
            return record.role === "pendingUpgrade" ? (
              <Button
                label="upgrade"
                variant="outlined"
                onClick={() => handleUpgrade(record)}
              />
            ) : (
              <div></div>
            )
          }}
        />
      </Datagrid>
    </List>
  )
}
