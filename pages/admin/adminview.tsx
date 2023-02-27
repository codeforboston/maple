import { requireAuth } from "../../components/auth"
import { dbService } from "components/db/api"
import { AdminData } from "components/db/admin"
import { createPage } from "../../components/page"
import AdminPage from "../../components/AdminPage/AdminPage"
import { GetServerSideProps } from "next"
import { z } from "zod"

const Query = z.object({court: z.coerce.number(), billId: z.string({})})



export default createPage<{ admindata: AdminData}>({
  title: "Admin View",
  Page: ({ admindata }) => {
    return <AdminPage admindata = {admindata}/>
  }
})


export const getServerSideProps: GetServerSideProps = async ctx => {
    
    const userIsAdmin = true 

    // ctx.res.setHeader(
    //   "Cache-Control",
    //   "public, s-maxage=10, stale-while-revalidate=59"
    // )
  
    // const query = Query.safeParse(ctx.query)
    // if (!query.success) return { notFound: true }

    if (userIsAdmin) {
      
      // const profiles = await dbService().getAllProfiles()
      // if (!profiles) return { notFound: true }
      // return { props: { admindata: JSON.parse(JSON.stringify(profiles))} }

      const flagged_testimonies = await dbService().getFlaggedTestionies()
      if (!flagged_testimonies) return { notFound: true }
      return { props: { admindata: JSON.stringify(flagged_testimonies)} }

    } else {
      console.log("error")
      return { notFound: true}
    }

    
    

  
}
