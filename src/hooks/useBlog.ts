import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context' 
import { apiService } from '@/lib/api-service'
import type { CategoryResponse, PageResponse, PostSummaryResponse } from '@/types/api'

interface UseBlogFilters {
  query?: string
  topics?: string[]
  page?: number
  size?: number
}

export function useBlog() {
  const { isAuthenticated, user } = useAuth()
  
  // Categories state
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  // Blogs state
  const [blogs, setBlogs] = useState<PageResponse<PostSummaryResponse> | null>(null)
  const [blogsLoading, setBlogsLoading] = useState(false)
  const [blogsError, setBlogsError] = useState<string | null>(null)

  const loading = categoriesLoading || blogsLoading
  const error = categoriesError || blogsError

  useEffect(() => {
    async function fetchCategories() {
      if (!isAuthenticated) {
        return
      }
await new Promise(resolve => setTimeout(resolve, 100));
      try {
        setCategoriesLoading(true)
        setCategoriesError(null)
        
        const response = await apiService.getTopics()
        
        if (response.code === 200) {
          setCategories(response.data)
        } else {
          throw new Error(response.message || 'Error fetching categories')
        }
      } catch (err: any) {
        setCategoriesError(err.message ?? 'Không thể tải danh sách chủ đề')
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [isAuthenticated]) 

  const fetchBlogs = useCallback(async (filters: UseBlogFilters = {}) => {
    if (!isAuthenticated) {
      return
    }

    try {
      setBlogsLoading(true)
      setBlogsError(null)

      const { page = 0, size = 12, query, topics } = filters

      const topicsAsNumbers = topics 
        ? topics.map(t => parseInt(t, 10)).filter(n => !isNaN(n)) 
        : []

      const apiFilters = {
        query: query || '',
        topics: topicsAsNumbers,
      }

      const response = await apiService.getBlogList(page, size, apiFilters)
      
      if (response && response.data && response.data.content !== undefined) {
        setBlogs(response.data)
      } else {
        throw new Error('Invalid response structure')
      }
    } catch (err: any) {
      setBlogsError(err.message ?? 'Có lỗi xảy ra khi tải bài viết')
      
      setBlogs(null)
    } finally {
      setBlogsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]) 

  useEffect(() => {
    if (isAuthenticated) {
      setBlogs(null)
      setBlogsError(null)
    }
  }, [isAuthenticated])

  return {
    // Categories
    categories,
    categoriesLoading,
    categoriesError,
    
    // Blogs
    blogs,
    blogsLoading,
    blogsError,
    fetchBlogs,

    loading,
    error,

    isAuthenticated,
    user,
  }
}
