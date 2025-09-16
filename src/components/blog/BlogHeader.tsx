"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, PenLine } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserResponse } from "@/types/api" 

type BlogAuthor = Pick<UserResponse, "id" | "name" | "avatar">

export function BlogHeader({ user }: { user: BlogAuthor | null }) {
  const currentDate = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const displayName = (user?.name?.trim() || "Tác giả ẩn danh")
  const initials = displayName.slice(0, 2).toUpperCase()

  const safeAvatar =
    typeof user?.avatar === "string" &&
    user.avatar &&
    user.avatar !== "null" &&
    user.avatar !== "string"
      ? user.avatar
      : "/placeholder.svg"

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-accent/40 to-transparent",
        "px-5 py-7 md:px-8 md:py-10 shadow-card"
      )}
    >
      {/* Label + ngày */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/80 px-3 py-1 shadow-sm">
          <PenLine className="h-3.5 w-3.5" />
          Bắt đầu bài viết mới
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-4 w-4" />
          {currentDate}
        </span>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1
          className={cn(
            "text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight",
            "bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60",
            "inline-block relative",
            "after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-16 after:rounded-full after:bg-primary/40"
          )}
        >
          Tạo Bài Viết Mới
        </h1>
      </div>

      {/* Tác giả */}
      {user && (
        <div className="mt-6 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-card/80 px-3 py-2 ring-1 ring-border shadow-sm">
            <Link
              href={user.id ? `/users/${user.id}` : "#"}
              className="flex items-center gap-3"
              aria-label={`Trang tác giả ${displayName}`}
            >
              <Avatar className="h-10 w-10 border border-border shadow">
                <AvatarImage src={safeAvatar} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{displayName}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-6 text-[12px] px-2">
                    Tác giả
                  </Badge>
                  {user.id && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      <span className="opacity-70">@</span>
                      {displayName.toLowerCase().replace(/\s+/g, "")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
