import { MouseEventHandler, ReactElement } from "react"
import React from "react"
import styled from "styled-components"
import { Button } from "react-bootstrap"

type onClickEventFunction = (e: Event, value: number) => void
export const Tab = (props: {
  label: string
  value: number
  active: boolean
  onClick?: MouseEventHandler
}) => {
  const { label, onClick, active } = props
  return (
    <TabStyle onClick={onClick}>
      <h3> {label}</h3>
    </TabStyle>
  )
}

export const Tabs = (props: {
  children: ReactElement[]
  onChange: onClickEventFunction
  selectedTab: Number
}) => {
  const { children, onChange, selectedTab } = props

  const tabs = children?.map(child => {
    const handleClick = (e: Event) => {
      onChange(e, child.props.value)
    }
    return (
      <React.Fragment key={child.props.label}>
        {React.cloneElement(child, {
          active: child.props.value === selectedTab,
          onClick: handleClick
        })}
      </React.Fragment>
    )
  })

  return <TabsContainer>{tabs}</TabsContainer>
}

export const TabPanel = () => {
  return (
    <div>
      <h3>Tab Panel</h3>
    </div>
  )
}

const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
`

const TabStyle = styled.button`
  margin: 2rem;
  background: none;
  border: none;
`
