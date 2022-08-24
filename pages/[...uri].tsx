import { useRouter } from "next/router"
import { GetStaticPaths, GetStaticProps } from "next/types"
import { ParsedUrlQuery } from "querystring"
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { Container } from "../components/bootstrap"
import styles from "../components/AdditionalResources/AdditionalResourcesCard.module.css"
import { createPage } from "../components/page"
import { getAllPageIds, getPageData } from "../lib/useContent"

const h1: React.FC = ({children}) => <h1 className={styles.title}>{ children }</h1>
const Intro: React.FC = ({children}) => <div className={styles.subheader}>{ children }</div>

const components = {
  h1,
  Intro
}

type Props = {
  title: string
  uri: string
  source: MDXRemoteSerializeResult
}

export default createPage({
  title: "dadsadsa",
  Page: (props) => {
    console.log(props);
    const { source } = props as Props

    return (
      <Container fluid="md" className="mt-3">
        <MDXRemote {...source} components={components} />
      </Container>
    )
  }
})

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPageIds()
  // { fallback: false } means other routes should 404
  return { paths, fallback: false }
}


interface IParams extends ParsedUrlQuery {
  uri: string[]
}

export const getStaticProps: GetStaticProps = async context => {
  const params = context.params as IParams
  const { uri, title, content} = getPageData(params.uri.join('/'))
  return {
    props: {
      uri,
      title,
      source: await serialize(content)
    }
  }
}
