import React, { ReactNode } from "react"
import { Alert } from "react-bootstrap"
import { withTranslation, WithTranslation } from "next-i18next"

class SearchErrorBoundaryBase extends React.Component<
  { children?: ReactNode } & WithTranslation
> {
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
          {this.props.t("search_error", { error: this.state.error })}
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

export const SearchErrorBoundary = withTranslation("search")(
  SearchErrorBoundaryBase
)
