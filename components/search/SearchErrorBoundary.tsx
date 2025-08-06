import React, { ReactNode } from "react"
import { Alert } from "react-bootstrap"
import { useTranslation } from "next-i18next"

export class SearchErrorBoundary extends React.Component<{
  children?: ReactNode
}> {
  state: { error: string | null } = { error: null }

  promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    console.error(event)
    event.preventDefault()
    this.setState({ error: event.reason?.message })
  }

  render() {
    const { t } = useTranslation("search")
    const { error } = this.state
    if (error) {
      return <Alert variant="danger">{t("search_error", { error })}</Alert>
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
