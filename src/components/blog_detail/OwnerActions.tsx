"use client"

import { Edit, Trash2, Settings, AlertTriangle, Shield, Loader2 } from "lucide-react"
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
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface OwnerActionsProps {
  isOwner: boolean
  blogTitle?: string
  isDeleting?: boolean
  isUpdating?: boolean
  isBusy?: boolean
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function OwnerActions({
  isOwner,
  blogTitle = "",
  isDeleting = false,
  isUpdating = false,
  isBusy = false,
  onEdit,
  onDelete,
  className
}: OwnerActionsProps) {
  if (isOwner && onEdit && onDelete) {
    return (
      <div className={cn("space-y-3", className)}>
        <h4 className="font-medium flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Quản lý bài viết
          {isBusy && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {isUpdating ? "Cập nhật..." : isDeleting ? "Xóa..." : "Xử lý..."}
            </span>
          )}
        </h4>
        
        <nav className="space-y-1" role="navigation" aria-label="Owner actions">
          
          <div className={cn(
            "block py-1.5 px-2 text-sm transition-colors rounded-md",
            "text-green-700 bg-green-50 border-l-2 border-green-500"
          )}>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="line-clamp-2 font-medium">
                Bài viết của bạn
              </span>
            </div>
          </div>

          <button
            onClick={onEdit}
            disabled={isBusy}
            className={cn(
              "block py-1.5 px-2 text-sm transition-colors hover:text-foreground w-full text-left rounded-md",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              
              isBusy 
                ? "text-muted-foreground cursor-not-allowed opacity-50" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              
              !isBusy && "border-l-2 border-transparent hover:border-primary/50"
            )}
            title={isUpdating ? "Đang cập nhật..." : "Chỉnh sửa bài viết"}
          >
            <div className="flex items-center gap-2">
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
              <span className="line-clamp-2">
                {isUpdating ? "Đang cập nhật..." : "Chỉnh sửa bài viết"}
              </span>
            </div>
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={isBusy}
                className={cn(
                  "block py-1.5 px-2 text-sm transition-colors hover:text-foreground w-full text-left rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  
                  isBusy 
                    ? "text-muted-foreground cursor-not-allowed opacity-50" 
                    : "text-red-600 hover:text-red-700 hover:bg-red-50",
                  
                  !isBusy && "border-l-2 border-transparent hover:border-red-200"
                )}
                title={isDeleting ? "Đang xóa..." : "Xóa bài viết"}
              >
                <div className="flex items-center gap-2">
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="line-clamp-2">
                    {isDeleting ? "Đang xóa..." : "Xóa bài viết"}
                  </span>
                </div>
              </button>
            </AlertDialogTrigger>
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Xác nhận xóa bài viết
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    Bạn có chắc chắn muốn xóa bài viết{" "}
                    <strong className="text-foreground">{blogTitle}</strong>?
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-md border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-red-700 text-sm font-medium">
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
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xác nhận xóa
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </nav>

        {isBusy && (
          <div className="mt-3 pt-3 border-t border-muted">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse rounded-full w-1/2" />
              </div>
              <span>
                {isUpdating ? "Cập nhật..." : isDeleting ? "Xóa..." : "Xử lý..."}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="font-medium text-muted-foreground flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Hành động
      </h4>
      
      <nav className="space-y-1" role="navigation" aria-label="No actions available">
        
        <div className={cn(
          "block py-3 px-2 text-sm transition-colors rounded-md text-center",
          "text-muted-foreground bg-muted/30 border-l-2 border-muted"
        )}>
          <div className="flex flex-col items-center gap-2">
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground">
                Không có hành động nào
              </p>
            </div>
          </div>
        </div>

      </nav>

      <div className="mt-3 pt-3 border-t border-muted">
        <div className="text-xs text-muted-foreground text-center">
          Chỉ tác giả mới có thể chỉnh sửa bài viết này
        </div>
      </div>
    </div>
  )
}
