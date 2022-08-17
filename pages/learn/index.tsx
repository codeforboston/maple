import { createPage } from "../../components/page"

export default createPage({
  title: "Learn",
  Page: () => {
    return <div>Learn</div>
  }
})

export async function getStaticProps() {
  return {
    redirect: {
      destination: "/learn/basics-of-testimony"
    }
  }
}
