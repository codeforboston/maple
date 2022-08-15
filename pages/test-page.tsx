import { useAuth } from "../components/auth"
import { useEditTestimony } from "../components/db"
import { createPage } from "../components/page"

export default createPage({
  title: "Bill",
  Page: () => {
    const uid = useAuth().user?.uid
    const billId = "S3096"

    useEditTestimony(uid!, billId)

    return <div>Hi</div>
  }
})
