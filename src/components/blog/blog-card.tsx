"use client";

import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  Clock,
  Eye,
  MessageSquare,
  MoreVertical,
  Tag,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { PostSummaryResponse } from "@/types/api";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  post: PostSummaryResponse;
  hideAuthor?: boolean;
  isAuthor?: boolean;
}

function getSafeImageUrl(cover: string | null | undefined): string {
  if (!cover || cover === "string" || cover === "null") {
    return "/placeholder.png";
  }
  return cover.startsWith("http") || cover.startsWith("/") ? cover : "/placeholder.png";
}

function getReadingTime(content?: string): number {
  if (!content) return 1;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200); // 200 words per minute
}

export function BlogCard({ post, hideAuthor = false, isAuthor = false }: BlogCardProps) {
  const { toast } = useToast();

  if (!post) return null;

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;

    try {
      const token = JSON.parse(localStorage.getItem("authState") || "{}")?.accessToken;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/post/${post.id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });

      if (response.ok) {
        toast({
          title: "✅ Xóa thành công",
          description: "Bài viết đã được xóa khỏi hệ thống",
          duration: 2000,
        });
      } else {
        throw new Error("Không thể xóa bài viết");
      }
    } catch (error) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể xóa bài viết. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const coverImage = getSafeImageUrl(post.cover);
  const readingTime = getReadingTime(post.excerpt);

  return (
    <article className="group">
      <Card className="h-full flex flex-col bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md overflow-hidden">
        {/* Cover Image */}
        <div className="relative overflow-hidden">
          <Link href={`/blogs/${post.id}`}>
            <div className="aspect-[16/10] relative bg-gradient-to-br from-muted/20 to-muted/40">
              <Image
                src={coverImage}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>

          {/* Floating Elements */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {/* Category Badge */}
            {post.category && post.category.length > 0 && (
              <Badge className="bg-white/90 text-foreground hover:bg-white backdrop-blur-sm shadow-sm border-0">
                <Tag className="h-3 w-3 mr-1" />
                {post.category[0]}
              </Badge>
            )}

            {/* Action Menu */}
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm shadow-sm text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    🗑️ Xóa bài viết
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Warning Badge */}
          {post.hasSensitiveContent && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="destructive" className="shadow-lg">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Nội dung nhạy cảm
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5">
          {/* Additional Categories */}
          {post.category && post.category.length > 1 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.category.slice(1, 3).map((cat) => (
                <Badge key={cat} variant="outline" className="text-xs py-0.5 px-2">
                  {cat}
                </Badge>
              ))}
              {post.category.length > 3 && (
                <Badge variant="outline" className="text-xs py-0.5 px-2">
                  +{post.category.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Title */}
          <Link href={`/blogs/${post.id}`} className="block mb-3">
            <h2 className="font-bold text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
          </Link>

          {/* Excerpt */}
          <p className="text-muted-foreground line-clamp-3 leading-relaxed mb-4 flex-1">
            {post.excerpt}
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 py-2 border-t border-muted/30">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewsCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {post.commentsCount}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {readingTime}p đọc
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(post.createdAt)}
            </span>
          </div>

          {/* Author Section */}
          {!hideAuthor && (
            <div className="pt-2">
              {post.userResponse ? (
                <Link
                  href={`/users/${post.userResponse.id}`}
                  className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-muted/50 transition-colors group/author"
                >
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage
                      src={post.userResponse.avatar || "/placeholder.svg"}
                      alt={post.userResponse.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {post.userResponse.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium group-hover/author:text-primary transition-colors truncate">
                      {post.userResponse.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tác giả • @{post.userResponse.name?.toLowerCase().replace(/\s+/g, '') || 'user'}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted">??</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-muted-foreground">Tác giả ẩn danh</p>
                    <p className="text-xs text-muted-foreground">Không xác định</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </article>
  );
}
