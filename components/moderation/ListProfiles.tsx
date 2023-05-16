import { useCallback, useState } from "react"
import {
  Button,
  Datagrid,
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

import { ButtonGroup } from "@mui/material"
import { Role } from "components/auth"
import { createFakeOrg } from "components/moderation"
import { loremIpsum } from "lorem-ipsum"
import { nanoid } from "nanoid"

const UserRoleToolBar = () => {
  const { data, refetch, filterValues, setFilters, displayedFilters } =
    useListContext<Profile[] & RaRecord>()

  const refresh = useRefresh()

  const filterClick = (role?: Role) => {
    const newFilter = filterValues["role"] === role ? { role: "" } : { role }
    setFilters(newFilter, [], true)
    refresh()
  }

  const pendingCount =
    data?.filter(d => d.role === "pendingUpgrade").length ?? 0

  const fakeOrgRequest = useCallback(async () => {
    const uid = nanoid(8)
    const fullName = loremIpsum({ count: 2, units: "words" })
    const email = `${uid}@example.com`

    await createFakeOrg({ uid, fullName, email })

    setFilters({ role: "pendingUpgrade" }, [])
    refetch()
  }, [refetch, setFilters])

  return (
    <Toolbar sx={{ width: "100%", justifyContent: "space-between" }}>
      <div>Upgrade Requests: {pendingCount} pending upgrades</div>
      <ButtonGroup title="Show only: ">
        {["user", "pendingUpgrade", "organization"].map(role => {
          return (
            <Button
              key={role}
              label={`${role}s`}
              value={role}
              variant="outlined"
              sx={{
                backgroundColor:
                  filterValues["role"] === role ? "lightblue" : ""
              }}
              onClick={() => filterClick(role as Role)}
            />
          )
        })}
      </ButtonGroup>

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
  const [updating, setUpdating] = useState<string>()
  const [justUpdated, setJustUpdated] = useState<string>()

  const getUpdating = () => updating

  const setIsUpdating = (id: string) => {
    setUpdating(id)
  }
  const clearUpdating = () => setUpdating(undefined)

  const getJustUpdated = () => justUpdated
  const setIsJustUpdated = (id: string) => setJustUpdated(id)
  const clearJustUpdated = () => {
    setJustUpdated(undefined)
  }

  return {
    getUpdating,
    setIsUpdating,
    clearUpdating,
    getJustUpdated,
    setIsJustUpdated,
    clearJustUpdated
  }
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
  const {
    clearUpdating,
    getJustUpdated,
    setIsJustUpdated,
  } = tracking
  const { filterValues, setFilters } = useListController()
  const refresh = useRefresh()

  const highlightPending = "lightyellow"
  const highlightRecent = "lightblue"

  async function handleUpgrade(record: any) {
    setIsJustUpdated(record.id)
    await upgradeOrganization(record.id)
    clearUpdating()
    refresh()
    filterValues["role"] === "pendingUpgrade" &&
      setFilters({ role: "organization" }, [])
  }

  return (
    <List actions={<UserRoleToolBar />}>
      <Datagrid
        rowStyle={record => ({
          backgroundColor:
            record.role === "pendingUpgrade"
              ? highlightPending
              : record.id === getJustUpdated()
              ? highlightRecent
              : "",
          animationName: record.id === getJustUpdated() ? "fadeOut" : "",
          animationDelay: "2s",
          animationDuration: "2s",
          animationFillMode: "forwards"
        })}
      >
        <TextField source="fullName" label="Organization" />
        <TextField source="contact.email" label="email" />
        <TextField source="contact.phoneNumber" label="phone" />

        <TextField source="contact.website" label="website" />
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
                onClick={async () => await handleUpgrade(record)}
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
