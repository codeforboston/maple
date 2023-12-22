import { Meta } from "@storybook/react"
import { StyledProfileIcon } from "components/ProfilePage/StyledUserIcons"
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
        <StyledProfileIcon large />
        <StyledProfileIcon />
        <StyledProfileIcon isOrg large />
        <StyledProfileIcon isOrg />
        <StyledProfileIcon profileImage="/codeforbostonicon.png" />
        <StyledProfileIcon large profileImage="/codeforbostonicon.png" />
      </IconStories>
    )
  },
  name: "Icons"
}

export default meta
