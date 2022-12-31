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
import index from "instantsearch.js/es/widgets/index/index"

type onClickEventFunction = (e: Event, value: number) => void
export const Tab = (props: {
  label: string
  value: number
  active: boolean
  onClick?: MouseEventHandler
}) => {
  const { label, onClick, active, ref } = props
  return (
    <TabStyle onClick={onClick} active={active} ref={ref}>
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
  const tabRefs = useRef<Array<HTMLDivElement | null>>([])
  const [sliderWidth, setSliderWidth] = useState(0)
  const [sliderPos, setSliderPos] = useState(0)
  const { childTabs, onChange, selectedTab } = props

  useEffect(() => {
    if (tabRefs.current.length > 0) {
      setSliderWidth(
        tabRefs.current[selectedTab - 1].getBoundingClientRect().width
      )
      setSliderPos(tabRefs.current[selectedTab - 1].getBoundingClientRect().x)
    }
  }, [tabRefs, selectedTab])

  const tabs = childTabs?.map((child, index) => {
    const handleClick = (e: Event) => {
      onChange(e, child.props.value)
      setSliderWidth(child.props.width)
    }
    return (
      <div ref={el => (tabRefs.current[index] = el)} key={child.props.label}>
        <React.Fragment>
          {React.cloneElement(child, {
            active: child.props.value === selectedTab,
            onClick: handleClick
          })}
        </React.Fragment>
      </div>
    )
  })

  return (
    <div ref={containerRef}>
      <TabsContainer>{tabs}</TabsContainer>
      <TabSlider width={sliderWidth} position={sliderPos} />
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

const TabSlider = styled.div<{ width: number; position: number }>`
  width: ${props => props.width}px;
  height: 10px;
  background-color: orange;
  transition: 5s;
  transform: ${props => `translateX(${props.position}px)`};
`
