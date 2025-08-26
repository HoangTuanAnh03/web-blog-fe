"use client"

import { RefObject } from "react"
import { Calendar, Clock, Eye, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
// import { TableOfContents } from "@/components/table-of-contents"
import type { PostResponse } from "@/types/api"
import { formatDate } from "@/lib/utils"
import { OwnerActions } from "@/components/blog_detail/OwnerActions"

interface BlogSidebarProps {
  blog: PostResponse
  contentRef: RefObject<HTMLDivElement>
  isOwner?: boolean
  isDeleting?: boolean
  isUpdating?: boolean
  isBusy?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function BlogSidebar({ 
  blog, 
  contentRef, 
  isOwner = false,
  isDeleting = false,
  isUpdating = false,
  isBusy = false,
  onEdit,
  onDelete
}: BlogSidebarProps) {
  return (
    <aside className="xl:col-span-1">
      <div className="sticky top-24 space-y-6">
        {/* Table of Contents */}
        {/* <Card className="p-6 bg-white border-0 shadow-sm">
          <TableOfContents contentRef={contentRef} />
        </Card>  */}
         <Card className="p-6 bg-white border-0 shadow-sm">
          <OwnerActions
            isOwner={isOwner}
            blogTitle={blog.title}
            isDeleting={isDeleting}
            isUpdating={isUpdating}
            isBusy={isBusy}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Card>

        {/* Article Stats */}
        <Card className="p-6 bg-white border-0 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4">Thông tin bài viết</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Eye className="h-4 w-4 text-slate-500" />
              <span>{blog.viewsCount.toLocaleString()} lượt đọc</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              <span>{blog.commentsCount} bình luận</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>~{Math.ceil((blog.content?.length || 0) / 1000)} phút đọc</span>
            </div>
          </div>
        </Card>

        {/* Categories */}
        {blog.category && blog.category.length > 0 && (
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4">Chủ đề</h4>
            <div className="flex flex-wrap gap-2">
              {blog.category.map((cat) => (
                <Badge key={cat} variant="secondary" className="font-normal">
                  {cat}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Hashtags */}
        {blog.hashtags && blog.hashtags.length > 0 && (
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4">Hashtags</h4>
            <div className="flex flex-wrap gap-2">
              {blog.hashtags.map((tag) => (
                <Badge key={tag} variant="outline" className="font-normal">
                  #{tag}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </aside>
  )
}
