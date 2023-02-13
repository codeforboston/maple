import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
// import admin from "../../functions/src/auth/admin"


const AdminPage = (
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) => (
    <div>
        <h1>This is the admin page</h1>
        <h1>{props}</h1>
    </div>

)


export const getServerSideProps = async (context:GetServerSidePropsContext) => {
    try {
        //check user token for admin status
        //retrieve data from firebase 
        return {
            props: { 
                message: "data retrieved from backend"
            }
        }

    } catch (err) {
        console.log(err)
        return { props: {} as never }
    }
}

export default AdminPage