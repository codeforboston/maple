import { createPage } from "../../components/page"

export default createPage({
  title: "About",
  Page: () => {
    return <div>About</div>
  }
})

export async function getStaticProps() {
  return {
    redirect: {
      destination: "/about/mission-and-goals"
    }
  }
}
