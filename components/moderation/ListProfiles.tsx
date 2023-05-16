import _ from "lodash"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Button,
  Datagrid,
  DateField,
  Identifier,
  List,
  RaRecord,
  TextField,
  Toolbar,
  WithRecord,
  useListContext,
  useListController,
  useRefresh
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

  const fakeOrgRequest = useCallback(async () => {
    const uid = nanoid(8)
    const fullName = loremIpsum({ count: 2, units: "words" })
    const email = `${uid}@example.com`

    await createFakeOrg({ uid, fullName, email })
    refetch()
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
          onClick={fakeOrgRequest}
        />
      )}
    </Toolbar>
  )
}

export const useTrackUpdatingRow = () => {
  // const row = useRef<string>()

  const [updating, setUpdating] = useState<string>()

  const getRow = () => updating
  const setRow = (id: string) => {
    setUpdating(id)
  }
  const clearRow = () => setUpdating(undefined)

  return { getRow, setRow, clearRow }
}

export const ListProfiles = () => {
  const tracking = useTrackUpdatingRow()
  return <InnerListProfiles tracking={tracking} />
}
export function InnerListProfiles({
  tracking
}: {
  tracking: ReturnType<typeof useTrackUpdatingRow>
}) {
  const { getRow, setRow, clearRow } = tracking
  const { filterValues, setFilters, refetch } = useListController()
  const refresh = useRefresh()

  const row = getRow()

  const [highlightColor, setHighlightColor] = useState<string | undefined>(
    "yellow"
  )

  async function handleUpgrade(record: any) {
    setRow(record.id)
    setHighlightColor("yellow")
    await upgradeOrganization(record.id)

    refresh()
    // refetch()
  }

  useEffect(() => {
    clearRow()
  }, [clearRow])

  return (
    <List
      actions={
        <UserRoleToolBar filterValues={filterValues} setFilters={setFilters} />
      }
    >
      <Datagrid
        rowStyle={record => ({
          backgroundColor:
            record.id === getRow() || record.role === "pendingUpgrade"
              ? highlightColor
              : "",
          transition: "backgroundColor 2s ease-in"
        })}
      >
        <TextField source="fullName" label="Organization" />
        <TextField source="email" />
        <TextField source="phoneNumber" />
        <div aria-label="test">
          getRow is {getRow() ? "defined" : "undefined"} {getRow()}
        </div>
        <WithRecord
          render={record => (
            <div
              style={{
                backgroundColor: record.id === row ? "blue" : "",
                transition: "backgroundColor 2s linear"
              }}
            >
              {record.id === getRow() ? "same" : "diff"}
            </div>
          )}
        />
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
