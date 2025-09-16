"use client";

import {
  Edit,
  Trash2,
  Settings,
  AlertTriangle,
  Shield,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OwnerActionsProps {
  isOwner: boolean;
  blogTitle?: string;
  isDeleting?: boolean;
  isUpdating?: boolean;
  isBusy?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function OwnerActions({
  isOwner,
  blogTitle = "",
  isDeleting = false,
  isUpdating = false,
  isBusy = false,
  onEdit,
  onDelete,
  className,
}: OwnerActionsProps) {
  if (isOwner && onEdit && onDelete) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-border bg-card shadow-card p-4 space-y-4",
          "ring-1 ring-transparent focus-within:ring-primary/20",
          className
        )}
        aria-busy={isBusy}
      >
        {/* Header */}
        {/* <header className="flex items-center justify-between">
          <h4 className="inline-flex items-center gap-2 font-semibold">
            <Settings className="h-4 w-4" />
            Quản lý bài viết
          </h4>

          {isBusy && (
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              {isUpdating
                ? "Đang cập nhật…"
                : isDeleting
                ? "Đang xóa…"
                : "Đang xử lý…"}
            </span>
          )}
        </header> */}

        {/* Owned banner */}
        <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="font-medium">Bài viết của bạn</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-2">
          {/* <Button
            onClick={onEdit}
            disabled={isBusy}
            title={isUpdating ? "Đang cập nhật…" : "Chỉnh sửa bài viết"}
            className="justify-start gap-2"
            variant="default"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
            {isUpdating ? "Đang cập nhật…" : "Chỉnh sửa bài viết"}
          </Button> */}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isBusy}
                title={isDeleting ? "Đang xóa…" : "Xóa bài viết"}
                variant="destructive"
                className="justify-start gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? "Đang xóa…" : "Xóa bài viết"}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Xác nhận xóa bài viết
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    Bạn có chắc chắn muốn xóa bài viết{" "}
                    <strong className="text-foreground">
                      {blogTitle || "không tên"}
                    </strong>
                    ?
                  </p>
                  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="text-sm font-medium text-red-700">
                      Hành động này không thể hoàn tác.
                    </span>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Hủy bỏ
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xóa…
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xác nhận xóa
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Progress hint */}
        {isBusy && (
          <div className="border-t border-muted pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
              </div>
              <span>
                {isUpdating ? "Cập nhật…" : isDeleting ? "Xóa…" : "Xử lý…"}
              </span>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Non-owner (hoặc thiếu handler)
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card shadow-card p-4 space-y-3",
        className
      )}
    >
      <h4 className="flex items-center gap-2 font-semibold text-muted-foreground">
        <Settings className="h-4 w-4" />
        Hành động
      </h4>

      <div className="rounded-xl border border-muted bg-muted/40 px-3 py-4 text-center">
        <p className="text-sm text-muted-foreground">Không có hành động nào</p>
      </div>

      <div className="border-t border-muted pt-3 text-center text-xs text-muted-foreground">
        Chỉ tác giả mới có thể chỉnh sửa bài viết này
      </div>
    </section>
  );
}
