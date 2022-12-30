import { ReactElement } from "react"
import React from "react"
import styled from "styled-components"

export const Tab = (props: {
  label: string
  active: boolean
  onClick: () => void
}) => {
  const { label, onClick, active } = props
  return <h3 onClick={onClick}>{label}</h3>
}

export const Tabs = (props: {
  children: ReactElement[]
  onChange: (e: Event, any: any) => void
  selectedTab: Number
}) => {
  const { children, onChange, selectedTab } = props
  const tabs = children?.map(child => {
    const handleClick = (e: Event) => {
      onChange(e, child.props.value)
    }
    return React.cloneElement(child, {
      active: child.props.value === selectedTab,
      onClick: handleClick
    })
  })
  return <div>{tabs}</div>
}

export const TabPanel = () => {
  return (
    <div>
      <h3>Tab Panel</h3>
    </div>
  )
}
