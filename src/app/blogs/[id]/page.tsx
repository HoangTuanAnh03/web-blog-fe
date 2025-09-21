"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  FileText,
  Sparkles,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CommentSection } from "@/components/comment-section"
import { useAuth } from "@/contexts/auth-context"
import { useBlogDetail } from "@/hooks/useBlogDetail"
import { BlogHeader } from "@/components/blog_detail/BlogHeader"
import { BlogContent } from "@/components/blog_detail/BlogContent"
import { AuthorBio } from "@/components/blog_detail/AuthorBio"
import { BlogSidebar } from "@/components/blog_detail/BlogSidebar"
import { RelatedPosts } from "@/components/blog_detail/RelatedPosts"
import { toast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api-service"

interface BlogPageProps {
  params: { id: string }
}

export default function BlogPage({ params }: BlogPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const contentRef = useRef<HTMLDivElement>(null)

  const { 
    blog, 
    isLoading, 
    error, 
    isOwner, 
    isDeleting, 
    isUpdating, 
    isBusy, 
    deleteBlog, 
    updateBlog 
  } = useBlogDetail(params.id)
  console.log(blog)
  const [showRawContent, setShowRawContent] = useState(false)
  const [showAISummary, setShowAISummary] = useState(false)

  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  const getSafeImageUrl = (url: string | null | undefined, fallback = "/placeholder.svg") => {
    if (!url || url === "string" || url === "null") return fallback
    return url.startsWith("http") || url.startsWith("/") ? url : fallback
  }

const handleAISummary = async () => {
  if (!blog?.id) return
  setShowAISummary(true)
  setLoadingSummary(true)
  setAiSummary(null)
  try {
    const res = await apiService.getBlogSummary(blog.id)
    if (res?.code === 200 && res.data?.summary) {
      setAiSummary(res.data.summary)
    } else {
      setAiSummary("Không thể tạo tóm tắt cho bài viết này.")
    }
  } catch (e) {
    setAiSummary("Lỗi khi gọi API tóm tắt.")
  } finally {
    setLoadingSummary(false)
  }
}

  const handleBack = () => {
    const from = searchParams.get("from")
    const uid = searchParams.get("uid")

    if (from === "profile") {
      if (uid) router.push(`/profile/${uid}`)
      else router.push(`/profile`)
      return
    }
    if (from === "blogs") {
      router.push(`/blogs`)
      return
    }

    if (typeof window !== "undefined" && document.referrer) {
      try {
        const ref = new URL(document.referrer)
        if (ref.origin === window.location.origin) {
          router.back()
          return
        }
      } catch {}
    }

    router.push("/blogs")
  }

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          url: window.location.href,
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleEdit = () => {
    if (blog?.id) {
      window.location.href = `/blogs/edit/${blog.id}`
    }
  }

  const handleDelete = async () => {
    const result = await deleteBlog()
    if (!result.success) {
      toast({
        title: "Lỗi",
        description: result.message,
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  useEffect(() => {
    setShowRawContent(false)
  }, [blog?.id])

  useEffect(() => {
    if (!blog?.hasSensitiveContent) setShowRawContent(false)
  }, [blog?.hasSensitiveContent])
  const handleToggleRawContent = () => {
    if (!blog?.hasSensitiveContent) return
    const raw = blog?.rawContent?.trim()
    if (!raw) {
      toast({
        title: "Không có nội dung gốc",
        description: "Bài viết này không cung cấp rawContent để hiển thị.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    setShowRawContent(v => !v)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="h-10 bg-gray-200 rounded-md w-40 animate-pulse"></div>
          </div>
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Đang tải bài viết</h3>
              <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20 space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">Không tìm thấy bài viết</h3>
              <p className="text-gray-600 max-w-md mx-auto">    
                {error || "Bài viết này không tồn tại hoặc đã bị xóa."}
              </p>
            </div>
            <Button variant="outline" onClick={handleBack} className="mt-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const coverImage = getSafeImageUrl(blog.cover)
  const authorName = blog.userResponse?.name || "Tác giả ẩn danh"
  const authorAvatar = getSafeImageUrl(blog.userResponse?.avatar)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={handleBack} className="gap-2 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Quay lại</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          
          {/* Content */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-8">
              <BlogHeader 
                blog={blog}
                authorName={authorName}
                authorAvatar={authorAvatar}
                onShare={handleShare}
              />
            </div>

            {blog.hasSensitiveContent && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-800 font-semibold">
                  Cảnh báo: Nội dung nhạy cảm
                </AlertTitle>
                <AlertDescription className="text-amber-700 mt-2">
                  Bài viết này chứa nội dung có thể không phù hợp với một số độc giả. 
                  Vui lòng cân nhắc khi đọc và chia sẻ.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleAISummary}
                    className="gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    disabled={loadingSummary}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Tóm tắt AI</span>
                    <span className="sm:hidden">AI</span>
                  </Button>

                  {isAuthenticated && blog.hasSensitiveContent && (
                    <Button
                      type="button"
                      onClick={handleToggleRawContent}
                      aria-pressed={showRawContent}
                      variant={showRawContent ? "default" : "outline"}
                      className={`gap-2 ${showRawContent ? "" : "bg-gray-50"}`}
                      disabled={!blog.rawContent}
                    >
                      <FileText className="h-4 w-4" />
                      {showRawContent ? "Đang xem nội dung gốc" : "Nội dung gốc"}
                    </Button>
                  )}
                </div>
              </div>

              {showAISummary && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-blue-800 font-semibold mb-2">Tóm tắt AI</h3>
                  {loadingSummary ? (
                    <div className="flex items-center gap-2 text-blue-700 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tạo tóm tắt...
                    </div>
                  ) : (
                    <p className="text-blue-700 text-sm whitespace-pre-line">
                      {aiSummary}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border">
              <BlogContent 
                blog={blog}
                showRawContent={showRawContent}
                coverImage={coverImage}
                contentRef={contentRef}
              />
            </div>

            {/* Author */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <AuthorBio 
                author={blog.userResponse}
                authorName={authorName}
                authorAvatar={authorAvatar}
              />
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg shadow-sm border">
              <CommentSection blogId={blog.id} comments={blog.comments ?? []} />
            </div>

            {/* Related */}
            {blog.relatedPosts && blog.relatedPosts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <RelatedPosts posts={blog.relatedPosts} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              <BlogSidebar 
                blog={blog} 
                contentRef={contentRef}
                isOwner={isOwner}
                isDeleting={isDeleting}
                isUpdating={isUpdating}
                isBusy={isBusy}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
