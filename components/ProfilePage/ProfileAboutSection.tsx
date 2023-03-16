import { Profile } from "../db"
import { TitledSectionCard } from "../shared"
import { Socials } from "./Socials"

export const ProfileAboutSection = ({
    profile,
    className
  }: {
    profile?: Profile
    className?: string
    isMobile?: boolean
  }) => {
    const { twitter, linkedIn }: { twitter?: string; linkedIn?: string } =
      profile?.social ?? {}
  
    return (
      <TitledSectionCard
        className={`${className} h-100`}
        title={`About ${profile?.displayName?.split(" ")[0] ?? "User"}`}
        footer={
           <Socials twit={twitter} linkedIn={linkedIn} />}
      >
        <div>{profile?.about ?? "State your purpose"}</div>
      </TitledSectionCard>
    )
  }