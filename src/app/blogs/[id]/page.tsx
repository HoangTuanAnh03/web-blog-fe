"use client"

import { useRef, useState } from "react"
import Link from "next/link"
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

interface BlogPageProps {
  params: { id: string }
}

export default function BlogPage({ params }: BlogPageProps) {
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
  
  const [showRawContent, setShowRawContent] = useState(false)
  const [showAISummary, setShowAISummary] = useState(false)

  const getSafeImageUrl = (url: string | null | undefined, fallback = "/placeholder.svg") => {
    if (!url || url === "string" || url === "null") return fallback
    return url.startsWith("http") || url.startsWith("/") ? url : fallback
  }

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleEdit = () => {
    if (blog?.id) {
      console.log("handleEdit", blog.id)
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
            <Button variant="outline" asChild className="mt-8">
              <Link href="/blogs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Link>
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
      {/* Improved Navigation */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" asChild className="gap-2 hover:bg-gray-100">
              <Link href="/blogs">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Quay lại danh sách</span>
                <span className="sm:hidden">Quay lại</span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          
          {/* Content Area */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-8">
            
            {/* Blog Header Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-8">
              <BlogHeader 
                blog={blog}
                authorName={authorName}
                authorAvatar={authorAvatar}
                onShare={handleShare}
              />
            </div>

            {/* Sensitive Content Warning */}
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

            {/* Article Actions Card */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAISummary(true)}
                    className="gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Tóm tắt AI</span>
                    <span className="sm:hidden">AI</span>
                  </Button>

                  {isAuthenticated && blog.hasSensitiveContent && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-lg text-sm">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-700">Nội dung gốc</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Blog Content Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <BlogContent 
                blog={blog}
                showRawContent={showRawContent}
                coverImage={coverImage}
                contentRef={contentRef}
              />
            </div>

            {/* Author Bio Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <AuthorBio 
                author={blog.userResponse}
                authorName={authorName}
                authorAvatar={authorAvatar}
              />
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <CommentSection blogId={blog.id} comments={blog.comments} />
            </div>

            {/* Related Posts */}
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
