"use client";

import Link from "next/link";
import {
  Calendar,
  Eye,
  Share2,
  Tag,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PostResponse } from "@/types/api";
import { formatDate } from "@/lib/utils";

interface BlogHeaderProps {
  blog: PostResponse;
  authorName: string;
  authorAvatar: string;
  onShare: () => void;
}

function safeAvatar(src?: string) {
  if (!src || src === "null" || src === "string") return "/placeholder.svg";
  return src.startsWith("/") || src.startsWith("http")
    ? src
    : "/placeholder.svg";
}

function getInitials(name?: string) {
  if (!name) return "AU";
  const p = name.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

export function BlogHeader({
  blog,
  authorName,
  authorAvatar,
  onShare,
}: BlogHeaderProps) {
  const categories = Array.isArray(blog.category)
    ? blog.category.filter(Boolean)
    : [];
  const topCats = categories.slice(0, 3);
  const extraCats = Math.max(0, categories.length - topCats.length);

  const views = (blog as any).viewsCount ?? (blog as any).viewCount ?? 0;

  // Ước lượng thời gian đọc đơn giản từ độ dài content text
  const readingTime = Math.max(
    1,
    Math.ceil((blog.content?.replace(/<[^>]+>/g, "").length || 0) / 1000)
  );

  const initials = getInitials(authorName);
  const avatarSrc = safeAvatar(authorAvatar);

  return (
    <header className="space-y-6">
      {/* Categories (chips) */}
      {topCats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topCats.map((cat) => (
            <Badge
              key={cat}
              className="
                rounded-full px-3 py-1
                bg-background/85 backdrop-blur
                border border-border shadow-sm text-foreground
                hover:bg-accent
              "
            >
              <Tag className="mr-1 h-3.5 w-3.5" />
              {cat}
            </Badge>
          ))}
          {extraCats > 0 && (
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 bg-background/70 backdrop-blur"
              aria-label={`Còn ${extraCats} danh mục khác`}
            >
              +{extraCats}
            </Badge>
          )}
        </div>
      )}

      {/* Title */}
      <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-normal">
        {blog.title}
      </h1>

      {/* Meta card */}
      <div
        className="
          relative overflow-hidden rounded-2xl border border-primary/20
          bg-gradient-to-br from-primary/10 via-accent/40 to-card
          dark:from-primary/15 dark:via-accent/20 dark:to-card
          p-4 md:p-6 shadow-sm
        "
      >
        {/* subtle glow */}
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-28 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Author */}
          <Link
            href={blog.userResponse ? `/users/${blog.userResponse.id}` : "#"}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            aria-label={`Xem trang tác giả ${authorName || "tác giả"}`}
          >
            <Avatar className="h-12 w-12 md:h-14 md:w-14 ring-2 ring-white/80 dark:ring-white/10 shadow">
              <AvatarImage src={avatarSrc} alt={authorName || "Author"} />
              <AvatarFallback className="bg-primary/15 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{authorName || "Tác giả ẩn danh"}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={blog.createdAt}>
                    {formatDate(blog.createdAt)}
                  </time>
                </span>
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />~{readingTime}p đọc
                </span>
                {blog.hasSensitiveContent && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-300/60 bg-red-100/60 px-2 py-0.5 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Nội dung nhạy cảm
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Meta right + share */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {Number(views).toLocaleString()}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="
                gap-1 rounded-full
                bg-white/70 hover:bg-white
                dark:bg-white/10 dark:hover:bg-white/15
                border border-white/60 dark:border-white/10
              "
              aria-label="Chia sẻ bài viết"
            >
              <Share2 className="h-4 w-4" />
              Chia sẻ
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
