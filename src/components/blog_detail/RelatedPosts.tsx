"use client"

import { BlogCard } from "@/components/blog/blog-card";
import type { PostResponse } from "@/types/api"

interface RelatedPostsProps {
  posts: PostResponse['relatedPosts']
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Bài viết liên quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} hideAuthor={false} />
        ))}
      </div>
    </section>
  )
}
