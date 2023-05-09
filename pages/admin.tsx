import { createPage } from "components/page"
import type { NextPage } from "next"
import dynamic from "next/dynamic"
const App = dynamic(() => import("components/moderation/moderation"), {
  ssr: false
})

// TODO: move dynamic into moderation/index.tsx
// import {App} from 'components/moderation'

const Admin: NextPage = () => {
  return <App />
}

export default Admin
