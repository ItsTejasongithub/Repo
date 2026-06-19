import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { blogPosts } from '@/lib/site-data';

type Params = Promise<{ slug: string }>;

const contentDirectory = path.join(process.cwd(), 'content', 'blog');

async function loadPost(slug: string) {
  const post = blogPosts.find((entry) => entry.slug === slug);
  if (!post) return null;

  const source = await readFile(path.join(contentDirectory, `${slug}.mdx`), 'utf8');
  const { content, frontmatter } = await compileMDX<{ title: string; description: string; category: string }>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
  });

  return { content, frontmatter, post };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const result = await loadPost(slug);

  if (!result) notFound();

  const { content, frontmatter } = result;

  return (
    <main className="container-pad py-16">
      <article className="glass metal-border rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-electric/70">{frontmatter.category}</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">{frontmatter.title}</h1>
        <p className="mt-4 max-w-3xl text-white/70">{frontmatter.description}</p>
        <div className="prose prose-invert mt-10 max-w-none prose-p:text-white/75 prose-headings:text-white prose-a:text-electric">
          {content}
        </div>
      </article>
    </main>
  );
}
