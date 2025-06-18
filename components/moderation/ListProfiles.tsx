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

import {
  rejectOrganizationRequest,
  acceptOrganizationRequest
} from "components/api/upgrade-org"
import { Profile } from "../../common/profile/types"
import { Internal } from "components/links"

import { ButtonGroup } from "@mui/material"
import { Role } from "common/auth/types"
import { createFakeOrg } from "components/moderation"
import { loremIpsum } from "lorem-ipsum"
import { nanoid } from "nanoid"

const UserRoleToolBar = () => {
  const { data, refetch, filterValues, setFilters } = useListContext<
    Profile[] & RaRecord
  >()

  const refresh = useRefresh()

  const filterClick = (role?: Role) => {
    const newFilter = filterValues["role"] === role ? { role: "" } : { role }
    setFilters(newFilter, undefined, true)
    refresh()
  }

  const pendingCount =
    data?.filter(d => d.role === "pendingUpgrade").length ?? 0

  const fakeOrgRequest = useCallback(async () => {
    const uid = nanoid(8)
    const fullName = loremIpsum({ count: 2, units: "words" })
    const email = `${uid}@example.com`

    await createFakeOrg({ uid, fullName, email })

    if (filterValues["role"] === "organization")
      setFilters({ role: "pendingUpgrade" }, [])

    refetch()
  }, [filterValues, refetch, setFilters])

  return (
    <Toolbar sx={{ width: "100%", justifyContent: "space-between" }}>
      <div>Upgrade Requests: {pendingCount} pending upgrades</div>
      <ButtonGroup title="Show only: ">
        {["pendingUpgrade", "organization"].map(role => {
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
        <Button
          key={"all"}
          label={"clear filter"}
          value={"all"}
          variant="outlined"
          onClick={() => filterClick()}
        />{" "}
      </ButtonGroup>

      {process.env.NEXT_PUBLIC_USE_EMULATOR && (
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
  return (
    <List actions={<UserRoleToolBar />}>
      <InnerListProfiles tracking={tracking} />
    </List>
  )
}
export function InnerListProfiles({
  tracking
}: {
  tracking: ReturnType<typeof useTrackUpdatingRow>
}) {
  const { clearUpdating, getJustUpdated, setIsJustUpdated } = tracking
  const { filterValues, setFilters } = useListController()
  const refresh = useRefresh()

  const getBGHighlight = (record: RaRecord) => {
    if (record.role === "pendingUpgrade") return "lightyellow"
    if (record.id === getJustUpdated()) return "lightblue"
    return ""
  }

  async function handleAccept(record: any) {
    setIsJustUpdated(record.id)
    await acceptOrganizationRequest(record.id)
    clearUpdating()
    filterValues["role"] === "pendingUpgrade" &&
      setFilters({ role: "organization" }, [])
    refresh()
  }

  async function handleReject(record: any) {
    setIsJustUpdated(record.id)
    await rejectOrganizationRequest(record.id)
    clearUpdating()
    filterValues["role"] === "pendingUpgrade" && setFilters({}, [])
    refresh()
  }

  return (
    <Datagrid
      bulkActionButtons={false}
      rowStyle={record => ({
        backgroundColor: getBGHighlight(record),
        animationName: record.id === getJustUpdated() ? "fadeOut" : "",
        animationDelay: "2s",
        animationDuration: "2s",
        animationFillMode: "forwards"
      })}
    >
      <TextField source="fullName" label="Organization" />
      <TextField source="contactInfo.publicEmail" label="email" />
      <TextField source="contactInfo.publicPhone" label="phone" />

      <TextField source="contactInfo.website" label="website" />
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
            <div className="d-flex gap-2">
              <Button
                label="upgrade"
                variant="outlined"
                onClick={async () => await handleAccept(record)}
              />
              <Button
                label="reject"
                variant="outlined"
                onClick={async () => await handleReject(record)}
              />
            </div>
          ) : (
            <div></div>
          )
        }}
      />
    </Datagrid>
  )
}
