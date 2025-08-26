import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2, Send, Save } from "lucide-react"
import Link from "next/link"

interface BlogPublishBarProps {
  // Common props
  handlePublish: () => void
  isPublishing?: boolean
  hasTitle?: boolean
  hasContent?: boolean
  hasTopics?: boolean
  
  // Mode-specific props
  mode?: 'new' | 'edit'
  hasChanges?: boolean
  cancelHref?: string
  
  // Edit mode specific
  isUpdating?: boolean
}

export function BlogPublishBar({ 
  handlePublish, 
  isPublishing = false,
  hasTitle = false,
  hasContent = false,
  hasTopics = false,
  mode = 'new',
  hasChanges = false,
  cancelHref,
  isUpdating = false
}: BlogPublishBarProps) {
  const completedItems = [hasTitle, hasContent, hasTopics].filter(Boolean).length
  const totalItems = 3
  const isComplete = completedItems === totalItems

  // Determine loading state based on mode
  const isLoading = mode === 'new' ? isPublishing : isUpdating
  
  // Determine if action should be disabled
  const isDisabled = mode === 'new' 
    ? (!isComplete || isPublishing)
    : (!hasChanges || isUpdating || !hasTitle || !hasContent || !hasTopics)

  const getStatusIcon = (completed: boolean) => {
    if (completed) return <CheckCircle className="h-3 w-3 text-green-500" />
    return <AlertCircle className="h-3 w-3 text-muted-foreground" />
  }

  const renderActionButtons = () => {
    if (mode === 'edit') {
      return (
        <div className="flex items-center gap-3">
          {/* Cancel button */}
          <Button 
            variant="outline" 
            size="sm"
            asChild
            disabled={isUpdating}
          >
            <Link href={cancelHref || "/blogs"}>
              Hủy
            </Link>
          </Button>
          
          {/* Update button */}
          <Button 
            onClick={handlePublish}
            disabled={isDisabled}
            size="sm"
            className="gap-2 min-w-[140px]"
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
      )
    }

    // New mode - original publish button
    return (
      <Button 
        onClick={handlePublish}
        disabled={isDisabled}
        size="lg"
        className="gap-2 min-w-[140px]"
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
    )
  }

  return (
    <div className="flex items-center justify-between">
      {/* Progress checklist */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {mode === 'edit' ? 'Trạng thái:' : 'Tiến độ:'}
          </span>
          <Badge variant={isComplete ? "default" : "secondary"}>
            {mode === 'edit' && hasChanges && (
              <span className="mr-1">●</span>
            )}
            {completedItems}/{totalItems}
          </Badge>
          {mode === 'edit' && hasChanges && (
            <Badge variant="outline" className="text-xs">
              Có thay đổi
            </Badge>
          )}
        </div>
        
        <div className={`${mode === 'edit' ? 'hidden lg:flex' : 'hidden md:flex'} items-center gap-4 text-sm`}>
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

      {/* Action buttons */}
      {renderActionButtons()}
    </div>
  )
}
