import {
  MouseEventHandler,
  ReactElement,
  useEffect,
  useRef,
  useState
} from "react"
import React from "react"
import styled, { keyframes } from "styled-components"

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
  const tabRefs = useRef<Array<HTMLDivElement | null>>([])
  const { childTabs, onChange, selectedTab } = props
  const [sliderWidth, setSliderWidth] = useState(222)
  const [sliderPos, setSliderPos] = useState(selectedTab * 10)
  const sliderPositionOffset = 16

  useEffect(() => {
    if (
      tabRefs.current[selectedTab - 1] !== null &&
      tabRefs.current[selectedTab - 1]!.getBoundingClientRect().width
    ) {
      setSliderWidth(
        tabRefs.current[selectedTab - 1]!.getBoundingClientRect().width
      )
      setSliderPos(
        tabRefs.current[selectedTab - 1]!.getBoundingClientRect().x -
          sliderPositionOffset
      )
    }
  }, [selectedTab])

  const tabs = childTabs?.map((child, index) => {
    const handleClick = (e: Event) => {
      if (child.props.value !== selectedTab) {
        onChange(e, child.props.value)
        setSliderWidth(child.props.width)
      }
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
      <TabSliderContainer>
        <TabSlider width={sliderWidth ?? 200} position={sliderPos} />
      </TabSliderContainer>
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
const TabSliderContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: black;
  width: 100%;
  height: 1px;
  position: absolute;
  margin-bottom: 1%;
`
const TabSlider = styled.div<{ width: number; position: number }>`
  transition: all 1.5s;
  width: ${props => `${props.width}px`};
  height: 10px;
  background-color: orange;
  transform: ${props => `translateX(${props.position}px)`};
  position: absolute;
  z-index: 9;
`
