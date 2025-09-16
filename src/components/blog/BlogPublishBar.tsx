"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2, Send, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogPublishBarProps {
  // Common props
  handlePublish: () => void;
  isPublishing?: boolean;
  hasTitle?: boolean;
  hasContent?: boolean;
  hasTopics?: boolean;

  // Mode-specific props
  mode?: "new" | "edit";
  hasChanges?: boolean;
  cancelHref?: string;

  // Edit mode specific
  isUpdating?: boolean;

  // --- Optional UX props (mặc định không cần truyền) ---
  sticky?: "top" | "bottom" | false; // dính trên/dưới, mặc định "bottom"
  className?: string;                 // thêm class tùy ý
  onSaveDraft?: () => void;           // nút "Lưu nháp" (tùy chọn)
  showSaveDraft?: boolean;            // bật/tắt nút "Lưu nháp"
}

export function BlogPublishBar({
  handlePublish,
  isPublishing = false,
  hasTitle = false,
  hasContent = false,
  hasTopics = false,
  mode = "new",
  hasChanges = false,
  cancelHref,
  isUpdating = false,
  sticky = "bottom",
  className,
  onSaveDraft,
  showSaveDraft = false,
}: BlogPublishBarProps) {
  const completedItems = [hasTitle, hasContent, hasTopics].filter(Boolean).length;
  const totalItems = 3;
  const isComplete = completedItems === totalItems;

  // Loading theo mode
  const isLoading = mode === "new" ? isPublishing : isUpdating;

  // Disable hành động theo mode
  const isDisabled =
    mode === "new"
      ? !isComplete || isPublishing
      : !hasChanges || isUpdating || !hasTitle || !hasContent || !hasTopics;

  const getStatusIcon = (completed: boolean) =>
    completed ? (
      <CheckCircle className="h-3 w-3 text-green-500" aria-hidden="true" />
    ) : (
      <AlertCircle className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
    );

  const completionPct = Math.round((completedItems / totalItems) * 100);

  const stickyPos =
    sticky === "top" ? "top-0" : sticky === "bottom" ? "bottom-0" : "";

  return (
    <div
      className={cn(
        // khung sticky glassy
        sticky
          ? "sticky z-40"
          : "",
        stickyPos,
        "w-full",
        className
      )}
      role="region"
      aria-label={mode === "edit" ? "Thanh cập nhật bài viết" : "Thanh xuất bản bài viết"}
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
        <div
          className={cn(
            "mt-6 rounded-2xl border border-border/80 bg-card/80 shadow-lg",
            "backdrop-blur supports-[backdrop-filter]:bg-card/60"
          )}
        >
          {/* Hairline gradient */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="flex items-center justify-between gap-4 p-4 md:p-5">
            {/* LEFT: tiến độ + checklist */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {mode === "edit" ? "Trạng thái:" : "Tiến độ:"}
                </span>
                <Badge variant={isComplete ? "default" : "secondary"}>
                  {mode === "edit" && hasChanges && <span className="mr-1">●</span>}
                  {completedItems}/{totalItems}
                </Badge>
                {mode === "edit" && hasChanges && (
                  <Badge variant="outline" className="text-xs">
                    Có thay đổi
                  </Badge>
                )}
              </div>

              {/* Progress bar + checklist (responsive) */}
              <div className="mt-3 flex items-center gap-4">
                {/* progress bar */}
                <div
                  className="h-1.5 w-36 rounded-full bg-muted"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={completionPct}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>

                {/* checklist chi tiết: ẩn bớt trên mobile */}
                <div
                  className={cn(
                    mode === "edit" ? "hidden lg:flex" : "hidden md:flex",
                    "items-center gap-4 text-sm"
                  )}
                >
                  <div className="flex items-center gap-1">
                    {getStatusIcon(hasTitle)}
                    <span className={hasTitle ? "text-foreground" : "text-muted-foreground"}>
                      Tiêu đề
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(hasContent)}
                    <span className={hasContent ? "text-foreground" : "text-muted-foreground"}>
                      Nội dung
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(hasTopics)}
                    <span className={hasTopics ? "text-foreground" : "text-muted-foreground"}>
                      Chủ đề
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: actions */}
            <div className="flex items-center gap-3">
              {/* Lưu nháp (tùy chọn) */}
              {showSaveDraft && onSaveDraft && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onSaveDraft}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Lưu nháp
                </Button>
              )}

              {mode === "edit" ? (
                <div className="flex items-center gap-3">
                  {/* Cancel */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={isUpdating}
                  >
                    <Link href={cancelHref || "/blogs"} aria-label="Hủy cập nhật và quay lại danh sách">
                      Hủy
                    </Link>
                  </Button>

                  {/* Update */}
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={isDisabled}
                    size="sm"
                    className="gap-2 min-w-[160px]"
                    aria-disabled={isDisabled}
                    aria-busy={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Cập nhật bài viết
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                // NEW: Publish
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={isDisabled}
                  size="lg"
                  className="gap-2 min-w-[140px]"
                  aria-disabled={isDisabled}
                  aria-busy={isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang đăng...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Xuất bản
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* hairline dưới khi sticky ở top để phân lớp UI */}
      {sticky === "top" && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      )}
    </div>
  );
}
