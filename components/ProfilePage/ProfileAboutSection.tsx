import { Profile } from "../db"
import { TitledSectionCard } from "../shared"
import { SocialMediaIcons } from "./SocialMediaIcons"

export const ProfileAboutSection = ({
    profile,
    className
  }: {
    profile?: Profile
    className?: string
    isMobile?: boolean
  }) => {
    const { twitter, linkedIn, instagram, fb }: { twitter?: string; linkedIn?: string; instagram?:string; fb?: string } =
      profile?.social ?? {}
  
    return (
      <TitledSectionCard
        className={`${className} h-100`}
        title={`About ${profile?.displayName?.split(" ")[0] ?? "User"}`}
        footer={
           <SocialMediaIcons twitter={twitter} linkedIn={linkedIn} instagram={instagram} fb={fb}/>}
      >
        <div>{profile?.about ?? "State your purpose"}</div>
      </TitledSectionCard>
    )
  }