import Layout from '@components/Layout'
import Link from 'next/link'
import { getConfig, getAllPosts } from '@api'

export default function Blog(props) {
  return (
    <Layout title={props.title} description={props.description}>
      <ul>
        {props.posts.map(function(post, idx) {
          return (
            <li key={idx}>
              <Link href={'/posts/'+post.slug}>
                <a>{post.title}</a>
              </Link>
            </li>
          );
        })}
      </ul>
    </Layout>
  );
};

export async function getStaticProps() {
  const config = await getConfig();
  const allPosts = await getAllPosts();
  return {
    props: {
      posts: allPosts,
      title: config.title,
      description: config.description
    }
  };
};