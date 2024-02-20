import React from "react"
import { Alert } from "react-bootstrap"

export class SearchErrorBoundary extends React.Component {
  state: { error: string | null } = { error: null }

  promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    console.error(event)
    event.preventDefault()
    this.setState({ error: event.reason?.message })
  }

  render() {
    if (this.state.error) {
      return (
        <Alert variant="danger">
          Something went wrong. Please try again. Original message:{" "}
          {this.state.error}
        </Alert>
      )
    }

    return this.props.children
  }

  static getDerivedStateFromError(error: any) {
    return { error: error?.message }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log(error, errorInfo)
  }

  componentDidMount() {
    window.addEventListener("unhandledrejection", this.promiseRejectionHandler)
  }

  componentWillUnmount() {
    window.removeEventListener(
      "unhandledrejection",
      this.promiseRejectionHandler
    )
  }
}
