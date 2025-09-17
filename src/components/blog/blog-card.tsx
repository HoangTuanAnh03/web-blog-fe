"use client";

import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  Clock,
  Eye,
  MessageSquare,
  MoreVertical,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { PostResponse, PostSummaryResponse } from "@/types/api";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  blog: PostResponse | PostSummaryResponse;
  hideAuthor?: boolean;
  isAuthor?: boolean;
}

function getSafeImageUrl(cover: string | null | undefined): string {
  if (!cover || cover === "string" || cover === "null")
    return "/placeholder.png";
  return cover.startsWith("http") || cover.startsWith("/")
    ? cover
    : "/placeholder.png";
}

function createExcerptFromHtml(html?: string, maxLen = 200): string {
  if (!html) return "";
  let text = html
    .replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length > maxLen) text = text.slice(0, maxLen).trim();

  // Chuẩn hoá dấu chấm và bỏ chuỗi dấu chấm/ellipsis ở CUỐI
  text = text
    .replace(/\.{3,}/g, "…")
    .replace(/(…|\.)+$/u, "")
    .trim();
  return text;
}

function normalizeTagList(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input))
    return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === "string")
    return input
      .split(/[,\n;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

function extractHashtags(blog: any): string[] {
  const fromField = normalizeTagList(
    blog?.hashtags || blog?.hashTags || blog?.tags
  );
  let tags = fromField;

  if (tags.length === 0 && typeof blog?.content === "string") {
    const matches = blog.content.match(/#[\p{L}\w-]+/gu) || [];
    tags = matches.map((m: string) => m.replace(/^#/, ""));
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const v = t.replace(/^#/, "").trim();
    const key = v.toLowerCase();
    if (v && !seen.has(key)) {
      seen.add(key);
      out.push(v);
    }
  }
  return out;
}

export function BlogCard({
  blog,
  hideAuthor = false,
  isAuthor = false,
}: BlogCardProps) {
  if (!blog) return null;

  const coverImage = getSafeImageUrl(blog.cover);
  const excerpt =
    "excerpt" in blog && blog.excerpt
      ? blog.excerpt
      : createExcerptFromHtml((blog as PostResponse).content);
  const readingTime = Math.max(
    1,
    Math.ceil(
      ("content" in blog
        ? (blog as PostResponse).content?.length || 0
        : blog.excerpt?.length || 0) / 1000
    )
  );
  const views = (blog as any).viewsCount ?? (blog as any).viewCount ?? 0;
  const comments =
    (blog as any).commentsCount ?? (blog as any).commentCount ?? 0;

  const categories: string[] = Array.isArray(blog.category)
    ? blog.category.filter(Boolean)
    : [];
  const topCategories = categories.slice(0, 3);

  const hashtags = extractHashtags(blog);
  const hasTags = hashtags.length > 0;

  return (
    <article className="group">
      <Card className="h-full flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary/40">
        <div className="relative">
          <Link
            href={`/blogs/${blog.id}`}
            aria-label={`Xem bài: ${blog.title}`}
          >
            <div className="relative aspect-[16/10] bg-muted overflow-hidden rounded-b-none">
              <Image
                src={coverImage}
                alt={blog.title}
                fill
                className="object-cover will-change-transform transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
            </div>
          </Link>

          {/* Categories  */}
          {topCategories.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {topCategories.map((cat) => (
                <Badge
                  key={cat}
                  className="bg-background/90 text-foreground hover:bg-background backdrop-blur border border-border shadow-sm"
                >
                  {cat}
                </Badge>
              ))}
              {categories.length > 3 && (
                <Badge
                  variant="outline"
                  className="bg-background/70 backdrop-blur text-foreground/80"
                  aria-label={`Còn ${categories.length - 3} danh mục khác`}
                >
                  +{categories.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Actions TOP-RIGHT */}
          {isAuthor && (
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    className="h-8 w-8 bg-background/90 text-foreground shadow-sm backdrop-blur border border-border hover:bg-accent transition-opacity opacity-0 group-hover:opacity-100"
                    aria-label="Tác vụ bài viết"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* thêm item nếu cần */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Cảnh báo nhạy cảm */}
          {blog.hasSensitiveContent && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="destructive" className="shadow">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Nội dung nhạy cảm
              </Badge>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col px-5 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 rounded-xl">
          <div className={hasTags ? "mb-3 min-h-7" : "mb-2 min-h-7"}>
            {hasTags && (
              <div
                className="flex items-center gap-1.5 overflow-x-auto scroll-smooth pl-1 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Danh sách hashtag"
              >
                {hashtags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    title={`#${tag}`}
                    className="inline-flex items-center rounded-full border border-border/60 bg-accent/70 px-2 py-0.5 text-xs leading-5 text-foreground/95 hover:bg-accent/90 hover:border-primary/30 transition-colors"
                    aria-label={`hashtag ${tag}`}
                  >
                    <span className="mr-1 text-primary">#</span>
                    <span className="truncate max-w-[10rem]">{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title*/}
          <Link href={`/blogs/${blog.id}`} className="block">
            <div className="mb-2 min-h-[3.0rem]">
              <h2
                className="line-clamp-2 text-[1.15rem] font-semibold leading-snug tracking-normal text-foreground transition-colors group-hover:text-primary/90
                 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0
                 bg-[length:0%_2px] bg-no-repeat bg-left-bottom
                 group-hover:bg-[length:100%_2px] transition-[background-size] duration-300"
              >
                {blog.title}
              </h2>
            </div>
          </Link>

          {/* Excerpt*/}
          <div className="min-h-[7.6rem]">
            <p className="mb-4 flex-1 break-words leading-normal text-muted-foreground/90 line-clamp-4 overflow-hidden">
              {excerpt}
            </p>
          </div>

          <div className="mt-1">
            <Link
              href={`/blogs/${blog.id}`}
              className="inline-flex items-center text-sm font-medium text-primary hover:opacity-90"
              aria-label={`Đọc bài: ${blog.title}`}
            >
              Đọc tiếp →
            </Link>
          </div>

          {/* Meta */}
<div className="mb-3 border-t border-border/70 pt-3">
  {/* Row 1: Metrics (center) */}
  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
    <span
      className="inline-flex items-center gap-1.5 tabular-nums"
      aria-label="Lượt xem"
      title={`${Number(views).toLocaleString()} lượt xem`}
    >
      <Eye className="h-4 w-4 opacity-80" aria-hidden="true" />
      {Number(views).toLocaleString()}
    </span>

    <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-muted-foreground/40" aria-hidden />

    <span
      className="inline-flex items-center gap-1.5 tabular-nums"
      aria-label="Bình luận"
      title={`${Number(comments).toLocaleString()} bình luận`}
    >
      <MessageSquare className="h-4 w-4 opacity-80" aria-hidden="true" />
      {Number(comments).toLocaleString()}
    </span>

    <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-muted-foreground/40" aria-hidden />

    <span
      className="inline-flex items-center gap-1.5"
      aria-label="Thời gian đọc"
      title={`~${readingTime} phút đọc`}
    >
      <BookOpen className="h-4 w-4 opacity-80" aria-hidden="true" />
      ~{readingTime}p đọc
    </span>
  </div>

  {/* Row 2: Date (right) */}
  <div className="mt-2 flex justify-end">
    <time
      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-xs text-foreground/85 shadow-sm"
      dateTime={blog.createdAt}
      title={formatDate(blog.createdAt)}
    >
      <Clock className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
      {formatDate(blog.createdAt)}
    </time>
  </div>
</div>



          {/* Author */}
          {!hideAuthor && (
            <div className="pt-1 min-h-[56px]">
              {blog.userResponse ? (
                <Link
                  href={`/users/${blog.userResponse.id}`}
                  className="group/author -m-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={`Xem trang tác giả ${blog.userResponse.name}`}
                >
                  <Avatar className="h-10 w-10 border border-border shadow-sm">
                    <AvatarImage
                      src={blog.userResponse.avatar}
                      alt={blog.userResponse.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {blog.userResponse.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground transition-colors group-hover/author:text-primary/90">
                      {blog.userResponse.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @
                      {blog.userResponse.name
                        ?.toLowerCase()
                        .replace(/\s+/g, "") || "user"}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-muted">??</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Tác giả ẩn danh
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Không xác định
                    </p>
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
