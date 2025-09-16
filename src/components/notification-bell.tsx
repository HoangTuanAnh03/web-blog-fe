"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Bell, Loader2, RefreshCw, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useBlogNotifications";

function fromNow(iso?: string) {
  if (!iso) return undefined;
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    markReadLocal,
    markAllReadLocal,
  } = useNotifications();

  const hasUnread = unreadCount > 0;

  // Tối đa 5 item ban đầu, ưu tiên MỚI → TRƯỚC ĐÓ
  const unread = useMemo(() => notifications.filter((n) => !n.isRead), [notifications]);
  const read = useMemo(() => notifications.filter((n) => n.isRead), [notifications]);

  const MAX_INIT = 5;
  const [expanded, setExpanded] = useState(false);

  // Tính danh sách hiển thị theo trạng thái expanded
  const visibleUnread = expanded ? unread : unread.slice(0, MAX_INIT);
  const remainSlots = expanded ? Infinity : Math.max(0, MAX_INIT - visibleUnread.length);
  const visibleRead = expanded ? read : read.slice(0, remainSlots);

  const totalCount = notifications.length;
  const visibleCount = visibleUnread.length + visibleRead.length;
  const hasMore = visibleCount < totalCount;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Thông báo"
          className={cn(
            "relative rounded-full transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40",
            hasUnread ? "text-primary" : "text-foreground"
          )}
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <>
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary shadow-md" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary/60 animate-ping" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[92vw] max-w-[380px] p-0 overflow-hidden rounded-xl">
        {/* Header compact */}
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Thông báo
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </DropdownMenuLabel>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Làm mới"
              className="h-8 w-8"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Đánh dấu tất cả đã đọc (local)"
              className="h-8 w-8"
              onClick={() => markAllReadLocal()}
              disabled={notifications.length === 0}
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Body (gọn & responsive) */}
        <ScrollArea className="max-h-[70vh] md:max-h-[420px]">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
            </div>
          ) : isError ? (
            <div className="px-3 py-6 text-destructive">{error?.message || "Không thể tải thông báo"}</div>
          ) : totalCount === 0 ? (
            <div className="px-3 py-10 text-center text-muted-foreground">Chưa có thông báo nào.</div>
          ) : (
            <div className="py-1">
              {/* MỚI */}
              {visibleUnread.length > 0 && (
                <div className="px-2 md:px-3 pb-1">
                  <p className="mb-1 hidden text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:block">
                    Mới
                  </p>
                  <ul className="space-y-1">
                    {visibleUnread.map((n) => (
                      <li key={n.id}>
                        <Link
                          href={n.postId ? `/blogs/${n.postId}` : "#"}
                          onClick={() => markReadLocal(n.id)}
                          className={cn(
                            "group relative flex items-start gap-2.5 rounded-lg p-2 md:p-2.5",
                            "bg-primary/5 hover:bg-primary/10 transition-colors"
                          )}
                        >
                          {/* dot trái */}
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary md:h-2 md:w-2" />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-[13px] md:text-[13.5px] font-semibold leading-5">
                              {n.postTitle || n.message || "Bạn có thông báo mới"}
                            </p>
                            {n.postTitle && n.message && (
                              <p className="line-clamp-1 md:line-clamp-2 text-[12px] text-muted-foreground">
                                {n.message}
                              </p>
                            )}
                          </div>
                          <span className="hidden self-center text-[12px] font-medium text-primary/90 md:inline group-hover:underline">
                            Đọc →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TRƯỚC ĐÓ */}
              {visibleRead.length > 0 && (
                <div className="px-2 md:px-3 pt-1">
                  <p className="mb-1 hidden text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:block">
                    Trước đó
                  </p>
                  <ul className="space-y-1">
                    {visibleRead.map((n) => (
                      <li key={n.id}>
                        <Link
                          href={n.postId ? `/blogs/${n.postId}` : "#"}
                          className="group relative flex items-start gap-2.5 rounded-lg p-2 md:p-2.5 hover:bg-accent/60 transition-colors"
                        >
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 md:h-2 md:w-2" />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-[13px] md:text-[13.5px] leading-5">
                              {n.postTitle || n.message || "Thông báo"}
                            </p>
                            {n.postTitle && n.message && (
                              <p className="line-clamp-1 md:line-clamp-2 text-[12px] text-muted-foreground">
                                {n.message}
                              </p>
                            )}
                            <div className="mt-0.5 hidden text-[12px] text-muted-foreground md:block">
                              <time dateTime={(n as any).createdAt}>
                                {fromNow((n as any).createdAt) ?? ""}
                              </time>
                            </div>
                          </div>
                          <span className="hidden self-center text-[12px] font-medium text-primary/90 md:inline group-hover:underline">
                            Đọc →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />

        {/* Footer: Xem thêm / Thu gọn */}
        {totalCount > 0 && (
          <div className="flex items-center justify-end px-3 py-2">
            {hasMore && !expanded ? (
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => setExpanded(true)}
              >
                Xem thêm ({totalCount - visibleCount})
              </Button>
            ) : expanded && totalCount > MAX_INIT ? (
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => setExpanded(false)}
              >
                Thu gọn
              </Button>
            ) : null}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
