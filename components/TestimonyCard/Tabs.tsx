import React, {
  MouseEventHandler,
  ReactElement,
  useEffect,
  useRef,
  useState
} from "react"
import styled from "styled-components"

type onClickEventFunction = (e: Event, value: number) => void

export const TabSlider = (props: { position: number; resizing: boolean }) => {
  const { position, resizing } = props
  return <TabSliderStyle width={250} position={position} resizing={resizing} />
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
      <p> {label}</p>
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
  const [viewportWidth, setViewportWidth] = useState(
    typeof window ? undefined : window.innerWidth
  )
  const [resizing, setResizing] = useState(false)
  const [sliderPos, setSliderPos] = useState(0)

  const handleResize = () => {
    // setResizing(true)
    setViewportWidth(window.innerWidth)
    // if (tabRefs.current[selectedTab - 1]?.offsetLeft === sliderPos)
    //   setResizing(false)
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
      setSliderPos(selected.offsetLeft - 100)
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
        <TabSlider position={sliderPos} resizing={resizing} />
      </TabSliderContainer>
    </ComponentContainer>
  )
}

const ComponentContainer = styled.div`
  margin-bottom: 1rem;
  padding: 1rem 2rem;
`
const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-right: 2rem;
  padding-left: 2rem;
  justify-content: space-between;
`

const TabStyle = styled.div<{ active: boolean }>`
  background: none;
  color: ${props => (props.active ? "#C71E32" : "black")};
  border: none;
  font: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  outline: none;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`
const TabSliderContainerStyle = styled.div`
  display: flex;
  align-items: center;
  height: 1px;
`
const TabSliderTrackStyle = styled.div`
  background-color: #f1f1f1;
  align-self: center;
  width: 100%;
  height: 2px;
  z-index: 9;
`

export const TabSliderStyle = styled.div<{
  width: number
  position: number
  resizing: boolean
}>`
  transition: ${props => `${props.resizing ? "0s" : "all 0.4s"}`};
  width: ${props => `${props.width}px`};
  height: 3px;
  background-color: #c71e32;
  transform: ${props => `translateX(${props.position}px)`};
  position: absolute;
  z-index: 9;
`
