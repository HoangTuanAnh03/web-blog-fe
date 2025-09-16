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
  // Use excerpt if available (PostSummaryResponse), otherwise create from content (PostResponse)
  const excerpt = 'excerpt' in blog && blog.excerpt ? blog.excerpt : createExcerptFromHtml((blog as PostResponse).content);
  const readingTime = Math.max(
    1,
    Math.ceil(('content' in blog ? (blog as PostResponse).content?.length || 0 : blog.excerpt?.length || 0) / 1000)
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
      <Card className="h-full flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary/40">
        {/* Cover (đã cố định tỷ lệ) */}
        <div className="relative">
          <Link
            href={`/blogs/${blog.id}`}
            aria-label={`Xem bài: ${blog.title}`}
          >
            <div className="relative aspect-[16/10] bg-muted">
              <Image
                src={coverImage}
                alt={blog.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
        <div className="flex flex-1 flex-col p-5">
          {/* Hashtag row — giữ CHỖ CỐ ĐỊNH: cao ~28px, 1 hàng, nếu không có vẫn chừa chỗ */}
          <div className={hasTags ? "mb-3 min-h-7" : "mb-2 min-h-7"}>
            {hasTags && (
              <div className="flex items-center gap-1.5 overflow-hidden">
                <div className="flex flex-nowrap gap-1.5 overflow-x-hidden">
                  {hashtags.slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      title={`#${tag}`}
                      className="inline-flex items-center rounded-full border border-border/70 bg-accent/60 px-2.5 py-1 text-xs md:text-[13px] leading-5 text-foreground hover:bg-accent hover:border-primary/30 transition-colors"
                      aria-label={`hashtag ${tag}`}
                    >
                      <span className="mr-1 text-primary">#</span>
                      <span className="truncate max-w-[10rem]">{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Title*/}
          <Link href={`/blogs/${blog.id}`} className="block">
            <div className="mb-2 min-h-[3.2rem]">
              <h2 className="line-clamp-2 text-xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-primary">
                {blog.title}
              </h2>
            </div>
          </Link>

          {/* Excerpt*/}
          <div className="min-h-[8.2rem]">
            <p className="mb-4 flex-1 break-words leading-relaxed text-muted-foreground line-clamp-5 overflow-hidden">
              {excerpt}
            </p>
          </div>

          {/* Meta */}
          <div className="mb-3 flex items-center justify-between border-t border-border/80 py-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-4 w-4" aria-hidden="true" />
                {Number(views).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                {Number(comments).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-4 w-4" aria-hidden="true" />~
                {readingTime}p đọc
              </span>
            </div>
            <time
              className="inline-flex items-center gap-1"
              dateTime={blog.createdAt}
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              {formatDate(blog.createdAt)}
            </time>
          </div>

          {/* Author */}
          {!hideAuthor && (
            <div className="pt-1 min-h-[56px]">
              {blog.userResponse ? (
                <Link
                  href={`/users/${blog.userResponse.id}`}
                  className="group/author -m-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
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
                    <p className="truncate font-medium transition-colors group-hover/author:text-primary">
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
