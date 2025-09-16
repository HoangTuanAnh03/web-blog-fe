// import { useState, useEffect, useCallback } from 'react'
// import { useAuth } from '@/contexts/auth-context' 
// import { apiService } from '@/lib/api-service'
// import type { CategoryResponse, PageResponse, PostSummaryResponse } from '@/types/api'

// interface UseBlogFilters {
//   query?: string
//   topics?: string[]
//   page?: number
//   size?: number
// }

// export function useBlog() {
//   const { isAuthenticated, user } = useAuth()
  
//   // Categories state
//   const [categories, setCategories] = useState<CategoryResponse[]>([])
//   const [categoriesLoading, setCategoriesLoading] = useState(true)
//   const [categoriesError, setCategoriesError] = useState<string | null>(null)

//   // Blogs state
//   const [blogs, setBlogs] = useState<PageResponse<PostSummaryResponse> | null>(null)
//   const [blogsLoading, setBlogsLoading] = useState(false)
//   const [blogsError, setBlogsError] = useState<string | null>(null)

//   const loading = categoriesLoading || blogsLoading
//   const error = categoriesError || blogsError

//   useEffect(() => {
//     async function fetchCategories() {
//       if (!isAuthenticated) {
//         return
//       }
// await new Promise(resolve => setTimeout(resolve, 100));
//       try {
//         setCategoriesLoading(true)
//         setCategoriesError(null)
        
//         const response = await apiService.getTopics()
        
//         if (response.code === 200) {
//           setCategories(response.data)
//         } else {
//           throw new Error(response.message || 'Error fetching categories')
//         }
//       } catch (err: any) {
//         setCategoriesError(err.message ?? 'Không thể tải danh sách chủ đề')
//       } finally {
//         setCategoriesLoading(false)
//       }
//     }

//     fetchCategories()
//   }, [isAuthenticated]) 

//   const fetchBlogs = useCallback(async (filters: UseBlogFilters = {}) => {
//     if (!isAuthenticated) {
//       return
//     }

//     try {
//       setBlogsLoading(true)
//       setBlogsError(null)

//       const { page = 0, size = 12, query, topics } = filters

//       const topicsAsNumbers = topics 
//         ? topics.map(t => parseInt(t, 10)).filter(n => !isNaN(n)) 
//         : []

//       const apiFilters = {
//         query: query || '',
//         topics: topicsAsNumbers,
//       }

//       const response = await apiService.getBlogList(page, size, apiFilters)
      
//       if (response && response.data && response.data.content !== undefined) {
//         setBlogs(response.data)
//       } else {
//         throw new Error('Invalid response structure')
//       }
//     } catch (err: any) {
//       setBlogsError(err.message ?? 'Có lỗi xảy ra khi tải bài viết')
      
//       setBlogs(null)
//     } finally {
//       setBlogsLoading(false)
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isAuthenticated, user?.id]) 

//   useEffect(() => {
//     if (isAuthenticated) {
//       setBlogs(null)
//       setBlogsError(null)
//     }
//   }, [isAuthenticated])

//   return {
//     // Categories
//     categories,
//     categoriesLoading,
//     categoriesError,
    
//     // Blogs
//     blogs,
//     blogsLoading,
//     blogsError,
//     fetchBlogs,

//     loading,
//     error,

//     isAuthenticated,
//     user,
//   }
// }

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiService } from "@/lib/api-service"
import type { CategoryResponse, PageResponse, PostSummaryResponse } from "@/types/api"

interface UseBlogFilters {
  query?: string
  topics?: string[] 
  page?: number
  size?: number
}

export function useBlog() {
  const { isAuthenticated, user } = useAuth()

  // Categories
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  // Blogs 
  const [blogs, setBlogs] = useState<PageResponse<PostSummaryResponse> | null>(null)
  const [blogsLoading, setBlogsLoading] = useState(false)
  const [blogsError, setBlogsError] = useState<string | null>(null)

  const loading = categoriesLoading || blogsLoading
  const error = categoriesError || blogsError

  const allCache = useRef<Map<string, PostSummaryResponse[]>>(new Map())

  useEffect(() => {
    async function fetchCategories() {
      if (!isAuthenticated) return
      await new Promise((r) => setTimeout(r, 100))
      try {
        setCategoriesLoading(true)
        setCategoriesError(null)
        const response = await apiService.getTopics()
        if (response.code === 200) {
          setCategories(response.data)
        } else {
          throw new Error(response.message || "Error fetching categories")
        }
      } catch (err: any) {
        setCategoriesError(err?.message ?? "Không thể tải danh sách chủ đề")
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [isAuthenticated])

  const fetchBlogs = useCallback(
    async (filters: UseBlogFilters = {}) => {
      if (!isAuthenticated) return
      try {
        setBlogsLoading(true)
        setBlogsError(null)

        const { page = 0, size = 12, query, topics } = filters
        const topicsAsNumbers = topics ? topics.map((t) => parseInt(t, 10)).filter((n) => !isNaN(n)) : []
        const apiFilters = { query: query || "", topics: topicsAsNumbers }

        const response = await apiService.getBlogList(page, size, apiFilters)
        if (response?.data && response.data.content !== undefined) {
          setBlogs(response.data)
        } else {
          throw new Error("Invalid response structure")
        }
      } catch (err: any) {
        setBlogsError(err?.message ?? "Có lỗi xảy ra khi tải bài viết")
        setBlogs(null)
      } finally {
        setBlogsLoading(false)
      }
    },
    [isAuthenticated]
  )

  const fetchBlogsAll = useCallback(
    async (filters: Omit<UseBlogFilters, "page" | "size"> = {}) => {
      if (!isAuthenticated) return

      const { query = "", topics } = filters
      const topicsAsNumbers = topics ? topics.map((t) => parseInt(t, 10)).filter((n) => !isNaN(n)) : []
      const apiFilters = { query, topics: topicsAsNumbers }


      const cacheKey = JSON.stringify(apiFilters)
      if (allCache.current.has(cacheKey)) {
        const cached = allCache.current.get(cacheKey)!

        const synthesized: PageResponse<PostSummaryResponse> = {
          content: cached,
          pageable: {
            pageNumber: 0,
            pageSize: cached.length,
            sort: { sorted: false, unsorted: true, empty: true },
            offset: 0,
            paged: false,
            unpaged: true,
          },
          totalElements: cached.length,
          last: true,
          totalPages: 1,
          first: true,
          size: cached.length,
          number: 0,
          sort: { sorted: false, unsorted: true, empty: true },
          numberOfElements: cached.length,
          empty: cached.length === 0,
        }
        setBlogs(synthesized)
        return
      }

      try {
        setBlogsLoading(true)
        setBlogsError(null)

        const STEP = 200 
        let page = 0
        let acc: PostSummaryResponse[] = []
        let totalPages = 1
        let safety = 0 

        while (true) {
          const res = await apiService.getBlogList(page, STEP, apiFilters)
          if (!res?.data?.content) break

          const data = res.data
          acc = acc.concat(data.content || [])
          totalPages = typeof data.totalPages === "number" ? data.totalPages : (page + 1)
          const isLast = data.last === true || page >= totalPages - 1

          page += 1
          safety += 1
          if (isLast || safety > 100) break
        }

        allCache.current.set(cacheKey, acc)

        const synthesized: PageResponse<PostSummaryResponse> = {
          content: acc,
          pageable: {
            pageNumber: 0,
            pageSize: acc.length,
            sort: { sorted: false, unsorted: true, empty: true },
            offset: 0,
            paged: false,
            unpaged: true,
          },
          totalElements: acc.length,
          last: true,
          totalPages: 1,
          first: true,
          size: acc.length,
          number: 0,
          sort: { sorted: false, unsorted: true, empty: true },
          numberOfElements: acc.length,
          empty: acc.length === 0,
        }

        setBlogs(synthesized)
      } catch (err: any) {
        setBlogsError(err?.message ?? "Có lỗi xảy ra khi tải tất cả bài viết")
        setBlogs(null)
      } finally {
        setBlogsLoading(false)
      }
    },
    [isAuthenticated]
  )

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

    // API
    fetchBlogs,      
    fetchBlogsAll,   

    loading,
    error,

    isAuthenticated,
    user,
  }
}
