import { Script } from "./types"
import { currentGeneralCourt } from "../../functions/src/shared"

export const script: Script = async ({ db, args }) => {
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
      courtMembersMap.set(data.content["District"], data)
    }

    // prepare update
    const writer = db.bulkWriter()

    console.log("Fetching all profiles ...")
    const users = await db.collection("profiles").get()
    console.log(`${users.size} profiles fetched`)

    for (const user of users.docs) {
      let data = user.data()
      console.log("User info:", user.id)

      if (data.hasOwnProperty("senator")) {
        const senator = data.senator
        if (courtMembersMap.has(senator.district)) {
          console.log(
            `User ${data.displayName} has senator ${senator.name} ${senator.id} that is in the general court 194`
          )
          const senatorCurrentGC = courtMembersMap.get(senator.district)
          data.senator.id = senatorCurrentGC.id
          data.senator.name = senatorCurrentGC.content["Name"]
          console.log(
            `Updating ${senatorCurrentGC.content["Name"]} ${senatorCurrentGC.id}`
          )

          writer.update(db.doc(`/profiles/${user.id}`), {
            senator: data.senator
          })
        } else {
          console.log(`User ${data.displayName} has ${senator.id} ${senator.name} 
            with UNKNOW district ${senator.district} in the general court 194`)
        }
      } else {
        console.log("WARNING: no senator found!")
      }

      if (data.hasOwnProperty("representative")) {
        const representative = data.representative
        if (courtMembersMap.has(representative.district)) {
          console.log(
            `User ${data.displayName} has representative ${representative.name} ${representative.id} that is in the general court 194`
          )
          const representativeCurrentGC = courtMembersMap.get(
            representative.district
          )
          //console.log(`Representative ${JSON.stringify(representativeCurrentGC, null, 2)} in the general court 194`)
          data.representative.id = representativeCurrentGC.id
          data.representative.name = representativeCurrentGC.content["Name"]
          console.log(
            `Updating representative ${representativeCurrentGC.content["Name"]} ${representativeCurrentGC.id}`
          )

          writer.update(db.doc(`/profiles/${user.id}`), {
            senator: data.senator
          })
        } else {
          console.log(`User ${data.displayName} has ${representative.id} ${representative.name} 
                      with UNKNOW district ${representative.district}in the general court 194`)
        }
      } else {
        console.log("WARNING: no representative found!")
      }
    }
    await writer.close()
    console.log(`Updated ${users.size} documents`)
  } catch (error) {
    console.error("ERROR: updating General Court failed with ", error)
  }
}
