//import { BlogPost } from '../../components/Blog';
//import { Layout } from "../../components";
import { getPostBySlug, getAllPosts } from '@api';
import BlogPost from "@components/BlogPost/BlogPost";

export default function Post(props) {
  return <BlogPost title={props.title} content={props.content}/>;
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