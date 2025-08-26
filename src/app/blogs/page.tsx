"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { BlogCard } from "@/components/blog/blog-card"
import { SearchBar, type SearchParams } from "@/components/blog/search-bar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination"
import { useBlog } from "@/hooks/useBlog"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function BlogsPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    topics: [],
  })
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 5

  const { isAuthenticated, user } = useAuth()

  // Sử dụng useBlog hook
  const {
    categories,
    categoriesLoading,
    categoriesError,
    blogs,
    blogsLoading,
    blogsError,
    fetchBlogs,
  } = useBlog()

useEffect(() => {
    if (isAuthenticated) { 
      fetchBlogs({
        page: currentPage,
        size: pageSize,
        query: searchParams.query,
        topics: searchParams.topics,
      })
    }
  }, [currentPage, searchParams, fetchBlogs, isAuthenticated]) 

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage(0)
    }
  }, [isAuthenticated]) 


  useEffect(() => {
    setCurrentPage(0)
  }, [searchParams])

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getPageNumbers = () => {
    if (!blogs) return []

    const totalPages = blogs.totalPages
    const current = blogs.number
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }

    let startPage = Math.max(0, current - Math.floor(maxPagesToShow / 2))
    let endPage = startPage + maxPagesToShow - 1

    if (endPage >= totalPages) {
      endPage = totalPages - 1
      startPage = Math.max(0, endPage - maxPagesToShow + 1)
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }

  const combinedError = categoriesError || blogsError
  const isInitialLoading = categoriesLoading || (blogsLoading && !blogs)

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Khám Phá Bài Viết
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tìm kiếm và khám phá những bài viết thú vị từ cộng đồng
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          {categoriesLoading ? (
            <div className="h-20 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Đang tải bộ lọc...</span>
              </div>
            </div>
          ) : categoriesError ? (
            <div className="text-center py-4">
              <p className="text-destructive text-sm">Lỗi tải chủ đề: {categoriesError}</p>
            </div>
          ) : (
            <SearchBar onSearch={handleSearch} topics={categories} />
          )}
        </div>

        {/* Content Section */}
        <div>
          {combinedError ? (
            <div className="text-center py-12">
              <div className="text-destructive mb-2">⚠️ Có lỗi xảy ra</div>
              <p className="text-muted-foreground">{combinedError}</p>
              <button 
                onClick={() => {
                  fetchBlogs({
                    page: currentPage,
                    size: pageSize,
                    query: searchParams.query,
                    topics: searchParams.topics,
                  })
                }}
                className="mt-4 text-primary hover:underline"
              >
                Thử lại
              </button>
            </div>
          ) : isInitialLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Đang tải bài viết...</p>
              </div>
            </div>
          ) : blogs && blogs.content.length > 0 ? (
            <>
              {/* Loading overlay khi đang fetch thêm */}
              {blogsLoading && (
                <div className="relative">
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                </div>
              )}

              {/* Results count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Tìm thấy {blogs.totalElements.toLocaleString()} bài viết
                </p>
                <p className="text-sm text-muted-foreground">
                  Trang {currentPage + 1} / {blogs.totalPages}
                </p>
              </div>
              

              {/* Blog grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.content.map((blog) => (
                  blog.id && <BlogCard key={blog.id} post={blog} hideAuthor={false} />
                ))}
              </div>

              {/* Pagination */}
              {blogs.totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                        className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((pageNumber) => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={pageNumber === currentPage}
                          className="cursor-pointer"
                        >
                          {pageNumber + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(blogs.totalPages - 1, currentPage + 1))}
                        className={
                          currentPage === blogs.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                📝
              </div>
              <h3 className="text-xl font-semibold mb-2">Không tìm thấy bài viết nào</h3>
              <p className="text-muted-foreground mb-4">
                Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc để tìm thấy nội dung bạn đang tìm kiếm.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
