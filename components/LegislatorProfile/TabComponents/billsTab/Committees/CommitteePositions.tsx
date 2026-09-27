import { useTranslation } from "next-i18next"
import { useState, useEffect } from "react"
import {
  StyledBadge,
  StyledSubSectionHeaders,
  StyledSubsectionTable,
  StyledSubsectionTableColumnData,
  StyledSubsectionTableColumnHeader
} from "../StyledComponents/BillStyledComponents"
import { TabBlock } from "components/LegislatorProfile/LegislatorComponents"
import { MemberContent } from "functions/src/members/types"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { CSSProperties } from "react"

interface CommitteeRow {
  code: string
  name: string
  role: string
  since: string
}

const getRoleBadgeStyle = (role: string): CSSProperties =>
  role === "Chair"
    ? { backgroundColor: "#dcfce7", color: "#15803d" }
    : { backgroundColor: "#e2e8f0", color: "#1e293b" }

export const CommitteePositions = ({
  member
}: {
  member: MemberContent | undefined
}) => {
  const { t } = useTranslation("legislators")
  const [committees, setCommittees] = useState<CommitteeRow[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchCommittees = async () => {
      if (!member?.Committees || !member?.MemberCode) {
        setCommittees([])

        return
      }

      setLoading(true)

      const db = getFirestore()

      const memberCode = member.MemberCode

      try {
        const promises = member.Committees.map(async (item: any) => {
          const courtNum = item.GeneralCourtNumber

          const code = item.CommitteeCode

          const committeeRef = doc(
            db,
            `generalCourts/${courtNum}/committees/${code}`
          )

          const committeeSnap = await getDoc(committeeRef)

          const courtRef = doc(db, `generalCourts/${courtNum}`)

          const courtSnap = await getDoc(courtRef)

          let shortName = code // Fallback

          let role = "Member"

          let courtDate = "Unknown"

          if (committeeSnap.exists()) {
            const data = committeeSnap.data()

            shortName =
              data.content?.ShortName || data.content?.FullName || code

            const isChair =
              data.content?.HouseChairperson?.MemberCode === memberCode ||
              data.content?.SenateChairperson?.MemberCode === memberCode

            role = isChair ? "Chair" : "Member"
          }

          if (courtSnap.exists()) {
            const courtData = courtSnap.data()

            courtDate =
              courtData.years || courtData.startDate || `${courtNum}th`
          } else {
            const startYear = courtNum * 2 + 1637

            courtDate = `${startYear}`
          }

          return {
            code,
            name: shortName,
            role,
            since: courtDate
          }
        })

        const results = await Promise.all(promises)

        setCommittees(results)
      } catch (error) {
        console.error("Error loading committee positions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCommittees()
  }, [member?.MemberCode, member?.Committees])

  return (
    <div>
      <StyledSubSectionHeaders>
        {t("profiles.committeePositions.header")}
      </StyledSubSectionHeaders>
      <TabBlock>
        <StyledSubsectionTable>
          <thead>
            <tr>
              <StyledSubsectionTableColumnHeader>
                Committee
              </StyledSubsectionTableColumnHeader>
              <StyledSubsectionTableColumnHeader>
                Role
              </StyledSubsectionTableColumnHeader>
              <StyledSubsectionTableColumnHeader>
                Since
              </StyledSubsectionTableColumnHeader>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <StyledSubsectionTableColumnData colSpan={3}>
                  Loading positions...
                </StyledSubsectionTableColumnData>
              </tr>
            ) : committees.length === 0 ? (
              <tr>
                <StyledSubsectionTableColumnData colSpan={3}>
                  No committee positions found.
                </StyledSubsectionTableColumnData>
              </tr>
            ) : (
              committees.map(committee => (
                <tr key={committee.code}>
                  <StyledSubsectionTableColumnData>
                    {committee.name}
                  </StyledSubsectionTableColumnData>

                  <StyledSubsectionTableColumnData>
                    <StyledBadge style={getRoleBadgeStyle(committee.role)}>
                      {committee.role}
                    </StyledBadge>
                  </StyledSubsectionTableColumnData>

                  <StyledSubsectionTableColumnData>
                    {committee.since}
                  </StyledSubsectionTableColumnData>
                </tr>
              ))
            )}
          </tbody>
        </StyledSubsectionTable>
      </TabBlock>
    </div>
  )
}
