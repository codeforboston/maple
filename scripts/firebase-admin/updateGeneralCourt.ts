import { Script } from "./types"
import { currentGeneralCourt } from "../../functions/src/shared"
import { Boolean, Optional, Record } from "runtypes"
import { Profile}  from "components/db/profile/types"

const Args = Record({
  dryRun: Optional(Boolean)
})

export const script: Script = async ({ db, args }) => {
  const { dryRun } = Args.check(args)

  // if (!dryRun) {
  //   await profileDoc.ref.update({ nextDigestAt })
  // }
  
  console.log(`Update General Court ${currentGeneralCourt} in progress...`)
  try {
    const generalCourts = await db
      .collection(`/generalCourts/${currentGeneralCourt}/members`)
      .get()
    console.log(`${generalCourts.size} members fetched`)

    // check if generalCourts is valid
    if (generalCourts.empty) {
      console.log("ERROR: No members found in the collection.")
      return
    }

    const courtMembersMap = new Map<string, any>()
    for (const member of generalCourts.docs) {
      const data = member.data()
      // store the member data in a map with the district as the key
      console.log(`${data.content["District"]}: ${data.content["Name"]} , ${data.content["MemberCode"]}`)
      courtMembersMap.set(data.content["District"], data)
    }

    // prepare update
    const writer = db.bulkWriter()

    console.log("Fetching all profiles ...")
    const users = await db.collection("profiles").get()
    console.log(`${users.size} profiles fetched`)

    // count updated profiles
    let updatedProfiles = 0

    let numUsersWithoutSenator = 0
    let numUsersWithUpToDateSenator = 0

    let numUsersWithoutRepres = 0
    let numUsersWithUpToDateRepres = 0

    for (const user of users.docs) {
      console.log("User info:", user.id)
      let hasBeenUpdated = false
      let data = user.data() as Profile
      if (data.hasOwnProperty("senator")) {
        const updateData = updateProfileMember(data, "senator", courtMembersMap)
        if (updateData) {
          // update profile
          if (!dryRun) {
            await writer.update(user.ref, updateData)
          }
          hasBeenUpdated = true
          numUsersWithUpToDateSenator++
        } 
      } else {
        console.log(`No senator set on profile ${user.id}!`)
        numUsersWithoutSenator++
      }

      if (data.hasOwnProperty("representative")) {
        const updateData = updateProfileMember(data, "representative", courtMembersMap)
        if (updateData) {
          // update profile
          hasBeenUpdated = hasBeenUpdated || true
          // if (!dryRun) {
          //   await writer.set(user.ref, {repres})
          // }
          numUsersWithUpToDateRepres++
        } 
      } else {
        console.log(`No senator set on profile ${user.id}!`)
        numUsersWithoutRepres++
      }

      if (hasBeenUpdated) {
        updatedProfiles++
      }
    }

    // summary of updated profiles
    // numUsersWithoutSenator/numUsersWithUpToDateSenator/numUsersUpdated
    displaySummaryChanges("senator", updatedProfiles, numUsersWithoutSenator, 
                          numUsersWithUpToDateSenator)
    displaySummaryChanges("representative", updatedProfiles, numUsersWithoutRepres,
                          numUsersWithUpToDateRepres)

    await writer.close()
  } catch (error) {
    console.error("ERROR: updating General Court failed with ", error)
  }
}



// return Profile update if change is needed
// return undefined if no change is needed
const updateProfileMember = (
  profileRef: Profile,
  memberType: string,
  currentMembersMap: Map<string, any>,
  ): Profile | undefined => { 

  let shouldUpdate = false;
  let lastMember = profileRef.representative;
  if (memberType == "senator") {
    lastMember = profileRef.senator;
  } 

  if (!lastMember) {
    console.log(`User has no ${memberType}`)
    return undefined
  }

  if (currentMembersMap.has(lastMember.district)) {
    const currentMember = currentMembersMap.get(lastMember.district)
    console.log(
      `User has ${memberType} ${lastMember.id} ${currentMember.id}`
    )

    if (currentMember.name != lastMember.name) {
      shouldUpdate = true
    }

    if (shouldUpdate) {
      if (memberType == "senator") {
        profileRef.senator = {
          id: currentMember.id,
          name: currentMember.content["Name"],
          district: currentMember.content["District"]
        }
      }
      else {
        profileRef.representative = {
          id: currentMember.id,
          name: currentMember.content["Name"],
          district: currentMember.content["District"]
        }
      }
      console.log(`Updating ${memberType} ${currentMember.content["Name"]} ${currentMember.id}`)
      return profileRef;
    }
  } else {
    console.log(`District ${lastMember.district} ${lastMember.id} not found in the new court`)
  }
  return undefined
}

const displaySummaryChanges = (
  memberType: string,
  updatedProfiles: number,
  numUsersWithoutMember: number,
  numUsersWithUpToDateMember: number
  ) => {
    console.log(`Summary of ${memberType} changes`)
    console.log(`Updated ${updatedProfiles} profiles`)
    console.log(`Number of users without ${memberType}: ${numUsersWithoutMember}`)
    console.log(`Number of users with up to date ${memberType}: ${numUsersWithUpToDateMember}`)
}