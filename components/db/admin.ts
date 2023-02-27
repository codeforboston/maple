import { Testimony } from "./testimony"
import { Profile } from "./profile"

export type AdminData = {
    allProfiles: Profile []
    allTestimonies: Testimony []
    flaggedTestimonies: Testimony []
    pendingOrgProfiles: Profile []
}
  