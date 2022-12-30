import { MouseEventHandler, ReactElement } from "react"
import React from "react"
import styled, { css } from "styled-components"
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
    <TabStyle onClick={onClick} active={active}>
      <h3> {label}</h3>
    </TabStyle>
  )
}

export const Tabs = (props: {
  childTabs: ReactElement[]
  onChange: onClickEventFunction
  selectedTab: Number
}) => {
  const { childTabs, onChange, selectedTab } = props

  const tabs = childTabs?.map(child => {
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

const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
`

const TabStyle = styled.div<{ active: boolean }>`
  margin: 1rem;
  background: none;
  color: ${props => (props.active ? "orange" : "black")};
  border: none;
  font: inherit;
  cursor: pointer;
  outline: none;
`
