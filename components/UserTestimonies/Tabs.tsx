import React, {
  MouseEventHandler,
  ReactElement,
  useEffect,
  useRef,
  useState
} from "react"
import styled from "styled-components"

type onClickEventFunction = (e: Event, value: number) => void

export const TabSlider = (props: { width: number; position: number }) => {
  const { width, position } = props
  return <TabSliderStyle width={width ?? 200} position={position} />
}

export const TabSliderContainer = (props: { children?: JSX.Element[] }) => {
  const { children } = props
  return <TabSliderContainerStyle>{children}</TabSliderContainerStyle>
}

export const Tab = (props: {
  label: string
  value: number
  active: boolean
  action?: () => void
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

  const handleResize = () => {
    setViewportWidth(window.innerWidth)
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    const selected = tabRefs.current[selectedTab - 1]
    if (selected) {
      setSliderWidth(selected.clientWidth)
      setSliderPos(selected.offsetLeft)
    }
  }, [selectedTab, viewportWidth])

  const tabs = childTabs?.map((child, index) => {
    const handleClick = (e: Event) => {
      if (child.props.value !== selectedTab) {
        onChange(e, child.props.value)
        child.props.action()
      }
    }
    return (
      <div ref={el => (tabRefs.current[index] = el)} key={child.props.label}>
        {React.cloneElement(child, {
          active: child.props.value === selectedTab,
          onClick: handleClick
        })}
      </div>
    )
  })

  return (
    <ComponentContainer ref={containerRef}>
      <TabsContainer>{tabs}</TabsContainer>
      <TabSliderContainer>
        <TabSliderTrackStyle />
        <TabSlider width={sliderWidth} position={sliderPos} />
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
  justify-content: space-around;
  margin-top: 15px;
`

const TabStyle = styled.div<{ active: boolean }>`
  background: none;
  color: ${props => (props.active ? "#C71E32" : "black")};
  border: none;
  font: inherit;
  cursor: pointer;
  outline: none;
`
//track
const TabSliderContainerStyle = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 1px;
  position: absolute;
`
const TabSliderTrackStyle = styled.div`
  background-color: #f1f1f1;
  align-self: center;
  width: 80%;
  height: 1px;
  position: absolute;
  z-index: 9;
  left: 50%;
  transform: translateX(-50%);
`

export const TabSliderStyle = styled.div<{ width: number; position: number }>`
  transition: all 0.4s;
  width: ${props => `${props.width}px`};
  height: 3px;
  background-color: #c71e32;
  transform: ${props => `translateX(${props.position}px)`};
  position: absolute;
  z-index: 9;
`
