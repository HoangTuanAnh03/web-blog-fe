"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { apiService } from '@/lib/api-service'
import type { PostResponse } from '@/types/api'

// Helper function lấy current user từ localStorage
const getCurrentUser = () => {
  if (typeof window === "undefined") return null
  
  try {
    const authState = JSON.parse(localStorage.getItem("authState") || "{}")
    return {
      userId: authState.userId || authState.user?.id,
      accessToken: authState.accessToken,
      user: authState.user
    }
  } catch {
    return null
  }
}

interface UseBlogDetailOptions {
  autoFetch?: boolean
  onSuccess?: (blog: PostResponse) => void
  onError?: (error: string) => void
  onDeleted?: () => void
  onUpdated?: (blog: PostResponse) => void
}

interface AuthorInfo {
  name: string
  avatar: string
  id: string | null
}

// Interface cho update blog
interface UpdateBlogData {
  title?: string
  content?: string
  cids?: number[]
  hashtags?: string[]
  cover?: string | null
}

export function useBlogDetail(blogId: string, options: UseBlogDetailOptions = {}) {
  const { 
    autoFetch = true, 
    onSuccess, 
    onError, 
    onDeleted, 
    onUpdated 
  } = options

  // Core state
  const [blog, setBlog] = useState<PostResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Lấy thông tin user hiện tại
  const currentUser = useMemo(() => getCurrentUser(), [])

  // Check ownership
  const isOwner = useMemo(() => {
    if (!blog?.userResponse?.id || !currentUser?.userId) {
      return false
    }
    
    const isUserOwner = blog.userResponse.id === currentUser.userId

    return isUserOwner
  }, [blog?.userResponse?.id, currentUser?.userId])

  // Helper function for safe image URLs
  const getSafeImageUrl = useCallback((url: string | null | undefined, fallback = "/placeholder.svg"): string => {
    if (!url || url === "string" || url === "null") return fallback
    return url.startsWith("http") || url.startsWith("/") ? url : fallback
  }, [])

  // Fetch blog detail function
  const fetchBlogDetail = useCallback(async (): Promise<void> => {
    if (!blogId?.trim()) {
      setError('ID bài viết không hợp lệ')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await apiService.getBlogDetail(blogId)
      console.log('✅ Fetch blog detail response:', response)
      if (response?.code === 200 && response.data) {
        setBlog(response.data)
        onSuccess?.(response.data)
      } else {
        const errorMsg = response?.message || 'Không thể tải bài viết'
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [blogId, onSuccess, onError])

  const deleteBlog = useCallback(async (): Promise<{
    success: boolean
    message: string
    error?: string
  }> => {
    if (!blog?.id || !isOwner) {
      return {
        success: false,
        message: 'Không có quyền xóa bài viết này',
        error: 'Permission denied'
      }
    }


    try {
      setIsDeleting(true)
      setError(null)

      const response = await apiService.deleteBlog(blog.id)
      

      if (response?.code === 200) {
        // Clear local state
        setBlog(null)
        onDeleted?.()
        
        return {
          success: true,
          message: 'Xóa bài viết thành công!'
        }
      } else {
        const errorMsg = response?.message || 'Lỗi khi xóa bài viết'
        return {
          success: false,
          message: errorMsg,
          error: errorMsg
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định khi xóa'
      console.error('❌ Delete blog error:', error)
      
      return {
        success: false,
        message: 'Lỗi khi xóa bài viết',
        error: errorMsg
      }
    } finally {
      setIsDeleting(false)
    }
  }, [blog?.id, isOwner, onDeleted])

  // ✏️ UPDATE BLOG FUNCTION
  const updateBlog = useCallback(async (updateData: UpdateBlogData): Promise<{
    success: boolean
    message: string
    data?: PostResponse
    error?: string
  }> => {
    if (!blog?.id || !isOwner) {
      return {
        success: false,
        message: 'Không có quyền chỉnh sửa bài viết này',
        error: 'Permission denied'
      }
    }


    try {
      setIsUpdating(true)
      setError(null)

      const response = await apiService.updateBlog(blog.id, updateData)
      

      if (response?.code === 200 && response.data) {
        // Update local state with new data
        setBlog(response.data)
        onUpdated?.(response.data)
        
        return {
          success: true,
          message: 'Cập nhật bài viết thành công!',
          data: response.data
        }
      } else {
        const errorMsg = response?.message || 'Lỗi khi cập nhật bài viết'
        return {
          success: false,
          message: errorMsg,
          error: errorMsg
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định khi cập nhật'
      console.error('❌ Update blog error:', error)
      
      return {
        success: false,
        message: 'Lỗi khi cập nhật bài viết',
        error: errorMsg
      }
    } finally {
      setIsUpdating(false)
    }
  }, [blog?.id, isOwner, onUpdated])

  // Quick update functions for specific fields
  const updateTitle = useCallback(async (newTitle: string) => {
    return updateBlog({ title: newTitle })
  }, [updateBlog])

  const updateContent = useCallback(async (newContent: string) => {
    return updateBlog({ content: newContent })
  }, [updateBlog])

  const updateCover = useCallback(async (newCover: string | null) => {
    return updateBlog({ cover: newCover })
  }, [updateBlog])

  const updateCategories = useCallback(async (newCategories: number[]) => {
    return updateBlog({ cids: newCategories })
  }, [updateBlog])

  const updateHashtags = useCallback(async (newHashtags: string[]) => {
    return updateBlog({ hashtags: newHashtags })
  }, [updateBlog])

  // Auto-fetch effect
  useEffect(() => {
    if (autoFetch && blogId) {
      fetchBlogDetail()
    }
    
    return () => {
      if (!autoFetch) {
        setBlog(null)
        setError(null)
        setIsLoading(false)
      }
    }
  }, [blogId, autoFetch, fetchBlogDetail])

  // Action functions
  const retry = useCallback(() => fetchBlogDetail(), [fetchBlogDetail])
  
  const clearError = useCallback(() => setError(null), [])
  
  const reset = useCallback(() => {
    setBlog(null)
    setError(null)
    setIsLoading(false)
    setIsDeleting(false)
    setIsUpdating(false)
  }, [])

  // Share functionality
  const sharePost = useCallback(async (): Promise<boolean> => {
    if (!blog) return false

    const shareData = {
      title: blog.title,
      text: blog.title,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return true
      } else {
        await navigator.clipboard.writeText(window.location.href)
        return true
      }
    } catch {
      return false
    }
  }, [blog])

  // Computed values with memoization
  const authorInfo: AuthorInfo = useMemo(() => {
    if (!blog?.userResponse) {
      return {
        name: "Tác giả ẩn danh",
        avatar: "/placeholder.svg",
        id: null
      }
    }

    return {
      name: blog.userResponse.name || "Tác giả ẩn danh",
      avatar: getSafeImageUrl(blog.userResponse.avatar),
      id: blog.userResponse.id || null
    }
  }, [blog?.userResponse, getSafeImageUrl])

  const readingTime = useMemo((): number => {
    if (!blog?.content) return 0
    const wordsPerMinute = 200
    const plainText = blog.content.replace(/<[^>]*>/g, '')
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  }, [blog?.content])

  const coverImage = useMemo((): string => {
    return getSafeImageUrl(blog?.cover)
  }, [blog?.cover, getSafeImageUrl])

  // Permissions based on ownership
  const permissions = useMemo(() => ({
    canEdit: isOwner && !isUpdating,
    canDelete: isOwner && !isDeleting,
    canManageComments: isOwner
  }), [isOwner, isUpdating, isDeleting])

  // Status flags
  const isFound = Boolean(blog)
  const hasError = Boolean(error)
  const isEmpty = !isLoading && !blog && !error
  const isBusy = isLoading || isDeleting || isUpdating

  // Safe property accessors
  const blogData = useMemo(() => ({
    title: blog?.title || '',
    content: blog?.content || '',
    rawContent: blog?.rawContent || '',
    createdAt: blog?.createdAt || '',
    viewsCount: blog?.viewsCount || 0,
    commentsCount: blog?.commentsCount || 0,
    categories: blog?.category || [],
    hashtags: blog?.hashtags || [],
    hasSensitiveContent: Boolean(blog?.hasSensitiveContent),
    relatedPosts: blog?.relatedPosts || [],
    comments: blog?.comments || [],
  }), [blog])

  return {
    // Core state
    blog,
    isLoading,
    error,
    isDeleting,
    isUpdating,
    
    // Actions
    fetchBlogDetail,
    retry,
    clearError,
    reset,
    sharePost,
    
    // CRUD Operations
    deleteBlog,
    updateBlog,
    updateTitle,
    updateContent,
    updateCover,
    updateCategories,
    updateHashtags,
    
    // Computed values
    authorInfo,
    readingTime,
    coverImage,
    
    // Ownership & Permissions
    isOwner,
    currentUserId: currentUser?.userId,
    blogAuthorId: blog?.userResponse?.id,
    permissions,
    
    // Status flags
    isFound,
    hasError,
    isEmpty,
    isBusy,
    
    // Safe data access
    ...blogData,
  } as const
}
