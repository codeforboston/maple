import matter from 'gray-matter';
import marked from 'marked';
import yaml from 'js-yaml';

// According to the guide, if we wanted the possibility of using .yml files as a blog, include this. 
// If not, we could probably get rid of this and the blogConfig.yml file 
export async function getConfig() {
  const config = await import(`../blogConfig.yml`);
  return yaml.safeLoad(config.default);
}

// This is called in the main /blog url to fetch all posts. 
// Ideally, we would paginate this section or have a load more button so that we won't see 50+ blog posts in a row
export async function getAllPosts() {
    const context = require.context('../_posts', false, /\.md$/);
    const posts = [];
    for(const key of context.keys()){
        const post = key.slice(2);
        const content = await import(`../_posts/${post}`);
        const meta = matter(content.default);
        posts.push({
        slug: post.replace('.md',''),
        title: meta.data.title
        });
    };
    return posts;
};
// This is specifically for the /posts/[article name]
export async function getPostBySlug(slug) {
    const fileContent = await import(`../_posts/${slug}.md`);
    const meta = matter(fileContent.default);
    const content = marked(meta.content);
    return {
      title: meta.data.title, 
      content: content
    };
};