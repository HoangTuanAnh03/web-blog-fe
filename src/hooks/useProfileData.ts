import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface UserResponse {
  id: string
  email: string
  name: string
  gender: "MALE" | "FEMALE"
  dob: string
  avatar: string | null
  no_password: boolean
  is_locked: boolean
}

interface PostSummaryResponse {
  id: string
  title: string
  viewsCount: number
  date: string
}

interface FollowStats {
  follower: number
  following: number
}

// Interface cho update request
interface UserUpdateRequest {
  name: string
  avatar: string | null
  gender: "MALE" | "FEMALE"
  dob: string
}

export function useProfileData(userId: string) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("posts")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)

  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true)
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false)
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false)
  const [isTogglingFollow, setIsTogglingFollow] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Data states
  const [profile, setProfile] = useState<UserResponse | null>(null)
  const [blogs, setBlogs] = useState<PostSummaryResponse[]>([])
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  const [followStats, setFollowStats] = useState<FollowStats>({ follower: 0, following: 0 })
  const [isFollowing, setIsFollowing] = useState(false)
  const [totalBlogs, setTotalBlogs] = useState(0)

  const isCurrentUser = isAuthenticated && user?.id === userId

  const getAuthHeaders = () => {
    const token = JSON.parse(localStorage.getItem("authState") as string)?.accessToken
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
  
  // 1. Fetch user profile info
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        setIsLoadingProfile(true)
        const res = await fetch('https://api.sportbooking.site/users/my-info', {
          headers: getAuthHeaders()
        })
        const json = await res.json()

        if (json.code === 200 && json.data) {
          setProfile(json.data)
        } else {
          setError("Không thể tải thông tin người dùng")
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setError("Đã xảy ra lỗi khi tải thông tin người dùng")
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchUserInfo()
  }, [])

  // 2. Fetch user blogs
  useEffect(() => {
  async function fetchUserBlogs() {
    if (activeTab !== "posts") return
    try {
      setIsLoadingBlogs(true)
      const res = await fetch(
        `https://api.sportbooking.site/blog/post/user/${userId}?page=${currentPage}`,
        {
          headers: getAuthHeaders()
        }
      )
      const json = await res.json()
      if (json.code === 200 && json.data) {
        setBlogs(json.data.content || [])
        setTotalBlogs(json.data.totalElements || 0)
      }
    } catch (error) {
      console.error("Error fetching user blogs:", error)
    } finally {
      setIsLoadingBlogs(false)
    }
  }

  fetchUserBlogs()
}, [activeTab, currentPage, pageSize, userId])


  // 3. Fetch follow stats
  useEffect(() => {
    async function fetchFollowStats() {
      try {
        const res = await fetch(`https://api.sportbooking.site/users/${userId}/follow-stats`, {
          headers: getAuthHeaders()
        })
        const json = await res.json()
        
        if (json.code === 200 && json.data) {
          setFollowStats({
            follower: json.data.follower?.length || 0,
            following: json.data.following?.length || 0
          })
          setFollowers(json.data.follower || [])
          setFollowing(json.data.following || [])
        }
      } catch (error) {
        console.error("Error fetching follow stats:", error)
      }
    }

    fetchFollowStats()
  }, [userId])

  // 4. Fetch followers when tab is active
  useEffect(() => {
    async function fetchFollowers() {
      if (activeTab !== "followers" || followers.length > 0) return
      try {
        setIsLoadingFollowers(true)
        const res = await fetch(`https://api.sportbooking.site/users/${userId}/followers`, {
          headers: getAuthHeaders()
        })
        const json = await res.json()
        
        if (json.code === 200 && json.data) {
          setFollowers(json.data)
        }
      } catch (error) {
        console.error("Error fetching followers:", error)
      } finally {
        setIsLoadingFollowers(false)
      }
    }

    fetchFollowers()
  }, [activeTab, userId, followers.length])

  // 5. Fetch following when tab is active
  useEffect(() => {
    async function fetchFollowing() {
      if (activeTab !== "following" || following.length > 0) return
      try {
        setIsLoadingFollowing(true)
        const res = await fetch(`https://api.sportbooking.site/users/${userId}/following`, {
          headers: getAuthHeaders()
        })
        const json = await res.json()
        
        if (json.code === 200 && json.data) {
          setFollowing(json.data)
        }
      } catch (error) {
        console.error("Error fetching following:", error)
      } finally {
        setIsLoadingFollowing(false)
      }
    }

    fetchFollowing()
  }, [activeTab, userId, following.length])

  // 6. Check follow status (if not current user)
  useEffect(() => {
    async function fetchFollowStatus() {
      if (!isAuthenticated || isCurrentUser) return
      try {
        const res = await fetch(`https://api.sportbooking.site/users/${userId}/is-following`, {
          headers: getAuthHeaders()
        })
        const json = await res.json()
        
        if (json.code === 200) {
          setIsFollowing(json.data || false)
        }
      } catch (error) {
        console.error("Error fetching follow status:", error)
      }
    }

    fetchFollowStatus()
  }, [userId, isAuthenticated, isCurrentUser])



  // Toggle follow/unfollow
  const toggleFollow = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    try {
      setIsTogglingFollow(true)
      const res = await fetch(`https://api.sportbooking.site/users/${userId}/toggle-follow`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      const json = await res.json()
      
      if (json.code === 200) {
        setIsFollowing(!isFollowing)
        setFollowStats(prev => ({
          ...prev,
          follower: isFollowing ? prev.follower - 1 : prev.follower + 1
        }))
        
        // Update followers list optimistically
        if (isFollowing) {
          setFollowers(prev => prev.filter(f => f.id !== user?.id))
        } else {
          setFollowers(prev => [...prev, user])
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
    } finally {
      setIsTogglingFollow(false)
    }
  }

  return {
    profile,
    blogs,
    followers,
    following,
    followStats,
    isFollowing,
    totalBlogs,
    
    activeTab,
    isCurrentUser,
    error,
    
    isLoadingProfile,
    isLoadingBlogs,
    isLoadingFollowers,
    isLoadingFollowing,
    isTogglingFollow,
    
    setActiveTab,
    toggleFollow,
    
    currentPage,
    setCurrentPage,
    pageSize,
  }
}
