import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

let files: string[] = [];

const getFilesRecursively = (directory: string) => {
  const filesInDirectory = fs.readdirSync(directory);
  for (const file of filesInDirectory) {
    const absolute = path.join(directory, file);
    if (fs.statSync(absolute).isDirectory()) {
        getFilesRecursively(absolute);
    } else {
        files.push(absolute);
    }
  }
};

getFilesRecursively(contentDirectory);

export const getAllPageIds = () => {
  return files.map((fileName) => {
    const relativePath = fileName.replace(contentDirectory, '')
    const uri =  relativePath.substring(1).replace(/\.mdx$/, '').split('/');
    return {
      params: {
        uri,
      }
    }
  });
}



export interface IPageContent {
  title: string
  uri: string
  content: string
}

export const getPageData = (uri: string): IPageContent => {
  const fullPath = path.join(contentDirectory, `${uri}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const { data, content } = matter(fileContents);

  // MDX


  // Combine the data with the uri
  return {
    uri,
    title: data.title,
    content
  };
}