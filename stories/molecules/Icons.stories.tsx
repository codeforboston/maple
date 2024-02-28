import { Meta } from "@storybook/react"
import { ProfileIcon } from "components/ProfilePage/StyledUserIcons"
import React from "react"

const IconStories = ({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={className}>{children}</div>
}

const meta: Meta = {
  title: "Molecules/Icons",
  component: IconStories
}

export const Primary = {
  args: {
    children: (
      <IconStories className={`d-flex flex-row gap-5`}>
        <ProfileIcon large />
        <ProfileIcon />
        <ProfileIcon role={"organization"} large />
        <ProfileIcon role={"organization"} />
        <ProfileIcon profileImage="/codeforbostonicon.png" />
        <ProfileIcon large profileImage="/codeforbostonicon.png" />
      </IconStories>
    )
  },
  name: "Icons"
}

export default meta
