"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PostResponse } from "@/types/api";

interface AuthorBioProps {
  author: PostResponse["userResponse"];
  authorName: string;
  authorAvatar: string;
}

function getInitials(name?: string) {
  if (!name) return "AU";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function safeAvatar(src?: string) {
  if (!src || src === "null" || src === "string") return "/placeholder.svg";
  return src.startsWith("/") || src.startsWith("http")
    ? src
    : "/placeholder.svg";
}

export function AuthorBio({
  author,
  authorName,
  authorAvatar,
}: AuthorBioProps) {
  if (!author) return null;

  const initials = getInitials(authorName);
  const avatarSrc = safeAvatar(authorAvatar);
  const handle = authorName
    ? "@" + authorName.toLowerCase().replace(/\s+/g, "")
    : "@author";

  return (
    <Card
      aria-label="Thông tin tác giả"
      className="
        relative overflow-hidden p-6 md:p-7
        border border-primary/20
        bg-gradient-to-br from-primary/10 via-accent/40 to-card
        dark:from-primary/15 dark:via-accent/20 dark:to-card
        shadow-md
      "
    >
      <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 -bottom-28 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex items-center gap-4 md:gap-5">
        <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-2 ring-white/80 dark:ring-white/10 shadow-lg">
          <AvatarImage src={avatarSrc} alt={authorName || "Author"} />
          <AvatarFallback className="bg-primary/15 text-primary font-bold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight">
            {authorName || "Tác giả ẩn danh"}
          </h3>
          <p className="text-sm text-muted-foreground">{handle}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link href={`/users/${author.id}`}>
              <Button
                size="sm"
                className="
                  rounded-full shadow-sm
                  bg-white/80 hover:bg-white text-foreground
                  dark:bg-white/10 dark:hover:bg-white/15
                  border border-white/60 dark:border-white/10
                "
              >
                Xem thêm bài viết →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
