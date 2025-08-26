"use client"

import { RefObject } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import type { PostResponse } from "@/types/api"

interface BlogContentProps {
  blog: PostResponse
  showRawContent: boolean
  coverImage: string
  contentRef: RefObject<HTMLDivElement>
}

export function BlogContent({ blog, showRawContent, coverImage, contentRef }: BlogContentProps) {
  return (
    <div className="space-y-8">
      {/* Cover Image */}
      {blog.cover && blog.cover !== "string" && (
        <div className="aspect-video relative rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={coverImage}
            alt={blog.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          />
        </div>
      )}

      {/* Article Content */}
      <Card className="p-8 bg-white shadow-sm border-0">
        <div
          ref={contentRef}
          className="prose prose-slate max-w-none prose-lg prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{
            __html: showRawContent ? blog.rawContent || blog.content : blog.content
          }}
        />
      </Card>
    </div>
  )
}
