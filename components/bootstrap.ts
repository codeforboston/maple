import React from "react"

// re-exports of all the bootstrap components we use. This ensures we only pull
// in the components we use and makes it easy to reuse across the app.
export { default as Button } from "react-bootstrap/Button"
export { default as Navbar } from "react-bootstrap/Navbar"
export { default as Nav } from "react-bootstrap/Nav"
export { default as NavDropdown } from "react-bootstrap/NavDropdown"
export { default as SSRProvider } from "react-bootstrap/SSRProvider"
export { default as OverlayTrigger } from "react-bootstrap/OverlayTrigger"
export { default as Modal } from "react-bootstrap/Modal"

export type StyledFC<T = {}> = React.FC<T & { className?: string }>
