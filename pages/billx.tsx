import { createPage } from "../components/page"
import SearchBar from '../components/SearchBar/SearchBar'

export default createPage({
  v2: true,
  title: "Bill",
  Page: () => {
    return (
      <>
        <SearchBar />
        <h1>the new bill page</h1>
      </>
    )
  }
})
