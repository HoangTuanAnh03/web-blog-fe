import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Calendar, Users, UserPlus, BookOpen, MessageSquare, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pagination } from "@/components/profile/pagination"

// Helper function for safe image URL
function getSafeImageUrl(url: string | null | undefined, fallback = "/placeholder.svg"): string {
  if (!url || url === "string" || url === "null") return fallback
  return url.startsWith("http") || url.startsWith("/") ? url : fallback
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("authState") as string)?.accessToken
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

interface ProfileTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  blogs: any[]
  followers: any[]
  following: any[]
  followStats: { follower: number; following: number }
  isCurrentUser: boolean
  isLoadingBlogs: boolean
  isLoadingFollowers: boolean
  isLoadingFollowing: boolean
  profile: any
  totalBlogs: number
  userId: string
}

export function ProfileTabs({
  activeTab,
  setActiveTab,
  blogs,
  followers,
  following,
  followStats,
  isCurrentUser,
  isLoadingBlogs,
  isLoadingFollowers,
  isLoadingFollowing,
  profile,
  totalBlogs,
  userId
}: ProfileTabsProps) {
  //  New pagination states
  const POSTS_PER_PAGE = 12
  const [currentPage, setCurrentPage] = useState(1) // UI 1-based
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingPage, setIsLoadingPage] = useState(false)
  const [currentBlogs, setCurrentBlogs] = useState<any[]>([])

  useEffect(() => {
    async function fetchPageData() {
      if (activeTab !== "posts") return
      
      try {
        setIsLoadingPage(true)
        
        const apiPage = Math.max(0, currentPage - 1)
        
        console.log(`🔄 Fetching UI page ${currentPage} → API page ${apiPage}`)
        
        const res = await fetch(
          `https://api.sportbooking.site/blog/post/user/${userId}?page=${apiPage}&size=${POSTS_PER_PAGE}`,
          { headers: getAuthHeaders() }
        )
        const json = await res.json()
        
        if (json.code === 200 && json.data) {
          setCurrentBlogs(json.data.content || [])
          
          if (apiPage === 0) {
            const totalElements = json.data.totalElements || 0
            const calculatedPages = Math.ceil(totalElements / POSTS_PER_PAGE)
            setTotalPages(calculatedPages)
          }
          
          console.log(` Loaded page ${currentPage} (API page=${apiPage}) - ${json.data.content.length} items`)
        }
      } catch (error) {
        console.error(`❌ Error fetching page ${currentPage}:`, error)
      } finally {
        setIsLoadingPage(false)
      }
    }

    fetchPageData()
  }, [currentPage, activeTab, userId])

  useEffect(() => {
    if (activeTab === "posts" && currentPage !== 1) {
      console.log(`🔄 Reset to page 1 when switching to posts tab`)
      setCurrentPage(1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const goToPreviousPage = () => {
    const newPage = Math.max(currentPage - 1, 1)
    console.log(`⬅️ Previous: ${currentPage} → ${newPage}`)
    setCurrentPage(newPage)
  }
  
  const goToNextPage = () => {
    const newPage = Math.min(currentPage + 1, totalPages)
    console.log(`➡️ Next: ${currentPage} → ${newPage}`)
    setCurrentPage(newPage)
  }
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      console.log(`🎯 Jump: ${currentPage} → ${page}`)
      setCurrentPage(page)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Enhanced Tab Navigation */}
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="posts" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Bài Viết
              <Badge variant="secondary" className="ml-1 text-xs">
                {totalBlogs}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="followers" className="gap-2">
              <Users className="h-4 w-4" />
              Followers
              <Badge variant="secondary" className="ml-1 text-xs">
                {followStats.follower}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Following
              <Badge variant="secondary" className="ml-1 text-xs">
                {followStats.following}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {isCurrentUser && activeTab === "posts" && (
            <Link href="/blogs/new">
              <Button className="gap-2 shadow-sm">
                <Edit className="h-4 w-4" />
                Viết Bài Mới
              </Button>
            </Link>
          )}
        </div>

        <TabsContent value="posts" className="mt-0 space-y-6">
          {isCurrentUser && (
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg border">
              <div>
                <h3 className="text-lg font-semibold">Bài Viết Của Bạn</h3>
                <p className="text-sm text-muted-foreground">
                  Quản lý và chia sẻ nội dung của bạn • Trang {currentPage}/{totalPages}
                </p>
              </div>
              {isLoadingPage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải...
                </div>
              )}
            </div>
          )}

          {(isLoadingBlogs || isLoadingPage) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="aspect-video bg-muted"></div>
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : currentBlogs && currentBlogs.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentBlogs.map((blog: any, index: number) => (
                  <Link key={blog.id} href={`/blogs/${blog.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm cursor-pointer overflow-hidden">
                      <div className="relative">
                        {/* Blog Cover Image */}
                        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30">
                          {blog.cover && blog.cover !== "string" && blog.cover !== "null" ? (
                            <Image
                              src={getSafeImageUrl(blog.cover)}
                              alt={blog.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                          )}
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                          
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="text-xs bg-white/90 backdrop-blur-sm">
                              #{(currentPage - 1) * POSTS_PER_PAGE + index + 1}
                            </Badge>
                          </div>

                          {/* Sensitive Content Warning */}
                          {blog.hasSensitiveContent && (
                            <div className="absolute top-3 left-3">
                              <Badge variant="destructive" className="text-xs">
                                18+
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {/* Card Content */}
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                            {blog.title}
                          </h3>
                          
                          {/* Blog excerpt if available */}
                          {blog.excerpt && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                              {blog.excerpt}
                            </p>
                          )}

                          {/* Categories */}
                          {blog.category && blog.category.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {blog.category.slice(0, 2).map((cat: string) => (
                                <Badge key={cat} variant="outline" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                              {blog.category.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{blog.category.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(blog.createdAt).toLocaleDateString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {blog.viewsCount?.toLocaleString() || '0'}
                              </span>
                            </div>
                            
                            {/* Comments count */}
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {blog.commentsCount || 0}
                            </span>
                          </div>

                          {/* Reading time estimate */}
                          <div className="mt-2 pt-2 border-t border-muted/50">
                            <span className="text-xs text-muted-foreground">
                              ~{Math.ceil((blog.content?.length || 0) / 1000)} phút đọc
                            </span>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-sm text-muted-foreground text-center">
                    <div>
                      Trang <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                    </div>
                    <div className="mt-1">
                      Hiển thị <span className="font-medium">{currentBlogs.length}</span> / <span className="font-medium">{totalBlogs.toLocaleString()}</span> bài viết
                    </div>
                  </div>
                  
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrevious={goToPreviousPage}
                    onNext={goToNextPage}
                    onGoToPage={goToPage}
                    currentItemsCount={currentBlogs.length}
                    totalItemsCount={totalBlogs}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {isCurrentUser ? "Chưa có bài viết nào" : "Người dùng chưa có bài viết"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {isCurrentUser
                    ? "Hãy bắt đầu chia sẻ suy nghĩ của bạn với thế giới."
                    : "Người dùng này chưa đăng bài viết nào."
                  }
                </p>
                {isCurrentUser && (
                  <Link href="/blogs/new">
                    <Button className="gap-2">
                      <Edit className="h-4 w-4" />
                      Viết Bài Đầu Tiên
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="mt-0 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Người Theo Dõi</h3>
              <p className="text-sm text-muted-foreground">
                {followStats.follower.toLocaleString()} người đang theo dõi
              </p>
            </div>
          </div>

          {isLoadingFollowers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : followers.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Chưa có người theo dõi</h3>
                <p className="text-muted-foreground">
                  Chia sẻ nội dung chất lượng để thu hút người theo dõi!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {followers.map((follower: any) => (
                <Card key={follower.id} className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-muted">
                        <AvatarImage src={getSafeImageUrl(follower.avatar)} alt={follower.name} />
                        <AvatarFallback className="bg-muted font-semibold">
                          {follower.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/users/${follower.id}`} 
                          className="font-semibold hover:text-primary transition-colors block truncate"
                        >
                          {follower.name}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          @{follower.name?.toLowerCase().replace(/\s+/g, '') || 'user'}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/users/${follower.id}`}>
                          <Button variant="outline" size="sm">
                            Xem
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Following Tab */}
        <TabsContent value="following" className="mt-0 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Đang Theo Dõi</h3>
              <p className="text-sm text-muted-foreground">
                Đang theo dõi {followStats.following.toLocaleString()} người
              </p>
            </div>
          </div>

          {isLoadingFollowing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : following.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Chưa theo dõi ai</h3>
                <p className="text-muted-foreground">
                  Khám phá và theo dõi những người dùng thú vị!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {following.map((u: any) => (
                <Card key={u.id} className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-muted">
                        <AvatarImage src={getSafeImageUrl(u.avatar)} alt={u.name} />
                        <AvatarFallback className="bg-muted font-semibold">
                          {u.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/users/${u.id}`} 
                          className="font-semibold hover:text-primary transition-colors block truncate"
                        >
                          {u.name}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          @{u.name?.toLowerCase().replace(/\s+/g, '') || 'user'}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/users/${u.id}`}>
                          <Button variant="outline" size="sm">
                            Xem
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
