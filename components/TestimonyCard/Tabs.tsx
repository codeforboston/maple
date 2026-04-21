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
  variant?: "default" | "ballotQuestion"
}) => {
  const { label, onClick, active, variant = "default" } = props
  return (
    <TabStyle onClick={onClick} active={active} variant={variant}>
      <p> {label}</p>
    </TabStyle>
  )
}

export const Tabs = (props: {
  childTabs: ReactElement[]
  onChange: onClickEventFunction
  selectedTab: number
  variant?: "default" | "ballotQuestion"
}) => {
  const containerRef = useRef(null)
  const tabRefs = useRef<Array<HTMLDivElement | null>>([])
  const { childTabs, onChange, selectedTab, variant = "default" } = props
  const [sliderWidth, setSliderWidth] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === "undefined" ? undefined : window.innerWidth
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
      setSliderWidth(selected.clientWidth)
      setSliderPos(
        selected.offsetLeft - (variant === "ballotQuestion" ? 0 : 16)
      )
    }
  }, [selectedTab, viewportWidth, variant])

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
          onClick: handleClick,
          variant
        })}
      </div>
    )
  })

  return (
    <ComponentContainer ref={containerRef} variant={variant}>
      <TabsContainer variant={variant}>{tabs}</TabsContainer>
      <TabSliderContainer>
        <TabSliderTrackStyle variant={variant} />
        <TabSlider
          width={sliderWidth}
          position={sliderPos}
          resizing={resizing}
        />
      </TabSliderContainer>
    </ComponentContainer>
  )
}

const ComponentContainer = styled.div<{
  variant: "default" | "ballotQuestion"
}>`
  margin-bottom: ${props =>
    props.variant === "ballotQuestion" ? "1.25rem" : "2%"};
  position: relative;
`
const TabsContainer = styled.div<{ variant: "default" | "ballotQuestion" }>`
  display: flex;
  flex-direction: row;
  gap: ${props => (props.variant === "ballotQuestion" ? "2rem" : "0")};
  justify-content: ${props =>
    props.variant === "ballotQuestion" ? "flex-start" : "space-around"};
  margin: ${props =>
    props.variant === "ballotQuestion" ? "0 0 0.75rem" : "0"};
  margin-top: ${props => (props.variant === "ballotQuestion" ? "0" : "15px")};
  overflow-x: ${props =>
    props.variant === "ballotQuestion" ? "auto" : "visible"};
`

const TabStyle = styled.div<{
  active: boolean
  variant: "default" | "ballotQuestion"
}>`
  background: none;
  color: ${props =>
    props.variant === "ballotQuestion"
      ? props.active
        ? "#c71e32"
        : "#212529"
      : props.active
      ? "#C71E32"
      : "black"};
  border: none;
  font: inherit;
  font-size: ${props =>
    props.variant === "ballotQuestion" ? "0.95rem" : "1.5rem"};
  font-weight: ${props =>
    props.variant === "ballotQuestion" ? (props.active ? 700 : 500) : 400};
  cursor: pointer;
  outline: none;
  white-space: ${props =>
    props.variant === "ballotQuestion" ? "nowrap" : "normal"};

  @media (max-width: 768px) {
    font-size: ${props =>
      props.variant === "ballotQuestion" ? "0.95rem" : "1rem"};
  }

  p {
    margin: ${props => (props.variant === "ballotQuestion" ? "0" : "initial")};
  }
`
const TabSliderContainerStyle = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 1px;
  position: absolute;
`
const TabSliderTrackStyle = styled.div<{
  variant: "default" | "ballotQuestion"
}>`
  background-color: #f1f1f1;
  align-self: center;
  width: ${props => (props.variant === "ballotQuestion" ? "100%" : "75%")};
  height: 1px;
  margin: 0;
  padding: 0;
  position: absolute;
  z-index: 9;
  left: ${props => (props.variant === "ballotQuestion" ? "0" : "50%")};
  transform: ${props =>
    props.variant === "ballotQuestion" ? "none" : "translateX(-55%)"};
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
