import { createPage } from "../components/page"
import { Button, Stack } from "react-bootstrap"
import PolicyPage from "components/Policies/PolicyPage"

export default createPage({
  title: "MAPLE for Organizations",
  Page: () => {
    return <PolicyPage />
  }
})
