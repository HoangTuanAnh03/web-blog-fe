"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import type { PostResponse } from "@/types/api"

interface AuthorBioProps {
  author: PostResponse['userResponse']
  authorName: string
  authorAvatar: string
}

export function AuthorBio({ author, authorName, authorAvatar }: AuthorBioProps) {
  if (!author) return null

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
          <AvatarImage src={authorAvatar} alt={authorName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-lg">
            {authorName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold text-slate-900">{authorName}</h3>
          <p className="text-slate-600">Tác giả bài viết</p>
          <Link
            href={`/users/${author.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Xem thêm bài viết →
          </Link>
        </div>
      </div>
    </Card>
  )
}
