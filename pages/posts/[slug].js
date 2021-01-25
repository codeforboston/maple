import { Blog } from '@components/Blog';
import { getPostBySlug, getAllPosts } from '@api';

export default function Post(props) {
  return <Blog title={props.title} content={props.content}/>;
};

export async function getStaticProps(context) {
  return {
    props: await getPostBySlug(context.params.slug)
  };
};

export async function getStaticPaths() {
  let paths = await getAllPosts();
  paths = paths.map(post => ({
    params: { slug:post.slug }
  }));
  return {
    paths: paths,
    fallback: false
  };
};