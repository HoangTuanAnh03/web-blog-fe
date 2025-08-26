"use client"

import Link from "next/link"
import { Calendar, Eye, MessageSquare, Share2, Tag } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PostResponse } from "@/types/api"
import { formatDate } from "@/lib/utils"

interface BlogHeaderProps {
  blog: PostResponse
  authorName: string
  authorAvatar: string
  onShare: () => void
}

export function BlogHeader({ blog, authorName, authorAvatar, onShare }: BlogHeaderProps) {
  return (
    <header className="space-y-6">
      {/* Categories */}
      {blog.category && blog.category.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {blog.category.map((cat) => (
            <Badge key={cat} className="bg-blue-50 text-blue-700 hover:bg-blue-100">
              <Tag className="h-3 w-3 mr-1" />
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
        {blog.title}
      </h1>

      {/* Author & Meta Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            href={blog.userResponse ? `/users/${blog.userResponse.id}` : "#"} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                {authorName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-900">{authorName}</p>
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Calendar className="h-3 w-3" />
                {formatDate(blog.createdAt)}
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{blog.viewsCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{blog.commentsCount}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onShare} className="gap-1">
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </Button>
        </div>
      </div>
    </header>
  )
}
