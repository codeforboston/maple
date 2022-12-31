import {
  MouseEventHandler,
  ReactElement,
  useEffect,
  useRef,
  useState
} from "react"
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
  selectedTab: number
}) => {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [sliderWidth, setSliderWidth] = useState(0)
  const { childTabs, onChange, selectedTab } = props

  const tabs = childTabs?.map(child => {
    const handleClick = (e: Event) => {
      onChange(e, child.props.value)
      setSliderWidth(child.props.width)
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

  return (
    <div>
      <TabsContainer>{tabs}</TabsContainer>
      <TabSlider width={100} index={selectedTab} />
    </div>
  )
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

const TabSlider = styled.div<{ width: number; index: number }>`
  width: ${props => props.width}px;
  height: 10px;
  background-color: orange;
  transition: 0.4s;
  transform: ${props => `translateX(${props.width * props.index}px)`};
`
