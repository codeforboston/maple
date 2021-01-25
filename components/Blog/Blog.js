import { Layout } from '@components/Layout';
import Head from 'next/head';
import Link from 'next/link';

export default function Blog(props) {
  return (
    <Layout>
      <Head>
        <title>{props.title}</title>
      </Head>
      <article>
        <h1>{props.title}</h1>
        <div dangerouslySetInnerHTML={{__html:props.content}}/>
        <div><Link href='/'><a>Home</a></Link></div> 
      </article>
    </Layout>
  );
}