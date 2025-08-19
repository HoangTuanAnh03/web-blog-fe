import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
  onGoToPage: (page: number) => void
  currentItemsCount: number
  totalItemsCount: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onGoToPage,
  currentItemsCount,
  totalItemsCount
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="h-8 px-2"
        >
          <ChevronLeft className="h-3 w-3" />
          Trước
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onGoToPage(page)}
            className="h-8 w-8 p-0 text-xs"
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="h-8 px-2"
        >
          Sau
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="text-center text-xs text-muted-foreground">
        Trang {currentPage} / {totalPages} - Hiển thị {currentItemsCount} trong số {totalItemsCount} bài viết
      </div>
    </div>
  )
}
