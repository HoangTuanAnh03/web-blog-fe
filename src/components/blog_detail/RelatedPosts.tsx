"use client";

import { BlogCard } from "@/components/blog/blog-card";
import type { PostResponse } from "@/types/api";
import { Sparkles } from "lucide-react";

interface RelatedPostsProps {
  posts: PostResponse["relatedPosts"];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            Bài viết liên quan
          </span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Những nội dung bạn có thể quan tâm
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.id} blog={post} hideAuthor={false} />
        ))}
      </div>
    </section>
  );
}
