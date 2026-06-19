import { blogPosts } from '@/lib/site-data';

export default function BlogPage() {
  return (
    <main className="container-pad py-12 sm:py-16">
      <div className="mb-8 sm:mb-10">
        <p className="text-xs uppercase tracking-[0.4em] text-electric/70">Blog</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Engineering notes and systems writing.</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {blogPosts.map((post) => (
          <article key={post.slug} className="glass metal-border rounded-3xl p-5 sm:p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">{post.category}</div>
            <h2 className="mt-4 text-xl font-semibold text-white sm:text-2xl">{post.title}</h2>
            <p className="mt-4 text-sm leading-6 text-white/70">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
