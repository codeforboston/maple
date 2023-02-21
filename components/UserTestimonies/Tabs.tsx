import React, {
  MouseEventHandler,
  ReactElement,
  useEffect,
  useRef,
  useState
} from "react"
import styled from "styled-components"

type onClickEventFunction = (e: Event, value: number) => void

export const TabSlider = (props: {
  width: number
  position: number
  resizing: boolean
}) => {
  const { width, position, resizing } = props
  return (
    <TabSliderStyle
      width={width ?? 200}
      position={position}
      resizing={resizing}
    />
  )
}

export const TabSliderContainer = (props: { children?: JSX.Element }) => {
  const { children } = props
  return <TabSliderContainerStyle>{props.children}</TabSliderContainerStyle>
}

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
  const [sliderWidth, setSliderWidth] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [resizing, setResizing] = useState(false)
  const [sliderPos, setSliderPos] = useState(0)
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
      resizing && setResizing(false)
    }
  }, [selectedTab, viewportWidth])

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth)
      setResizing(true)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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
    <ComponentContainer ref={containerRef}>
      <TabsContainer>{tabs}</TabsContainer>
      <TabSliderContainer>
        <TabSlider
          width={sliderWidth}
          position={sliderPos}
          resizing={resizing}
        />
      </TabSliderContainer>
    </ComponentContainer>
  )
}

const ComponentContainer = styled.div`
  margin-bottom: 2%;
`
const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const TabStyle = styled.div<{ active: boolean }>`
  margin: 1rem;
  background: none;
  color: ${props => (props.active ? "#C71E32" : "black")};
  border: none;
  font: inherit;
  cursor: pointer;
  outline: none;
`
const TabSliderContainerStyle = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  /*background-color: black; visible track for slider */
  width: 100%;
  height: 1px;
  position: absolute;
`
export const TabSliderStyle = styled.div<{
  width: number
  position: number
  resizing: boolean
}>`
  transition: all ${props => (props.resizing ? "0s" : "0.5s")};
  width: ${props => `${props.width}px`};
  height: 5px;
  background-color: #c71e32;
  transform: ${props => `translateX(${props.position}px)`};
  position: absolute;
  z-index: 9;
`
