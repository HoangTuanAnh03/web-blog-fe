import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Calendar, Users, UserPlus, BookOpen } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pagination } from "@/components/profile/pagination"

// Utility function
function paginate<T>(array: T[], pageSize: number, pageNumber: number): T[] {
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
}

export function ProfileTabs({
  activeTab, setActiveTab, blogs, followers, following, followStats, isCurrentUser,
  isLoadingBlogs, isLoadingFollowers, isLoadingFollowing, profile, totalBlogs
}: any) {
  const POSTS_PER_PAGE = 6
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil((blogs?.length || 0) / POSTS_PER_PAGE)
  const currentBlogs = useMemo(
    () => paginate(blogs || [], POSTS_PER_PAGE, currentPage),
    [blogs, currentPage]
  )

  useEffect(() => {
    if (activeTab === "posts") setCurrentPage(1)
  }, [activeTab])

  const goToPreviousPage = () => setCurrentPage(page => Math.max(page - 1, 1))
  const goToNextPage = () => setCurrentPage(page => Math.min(page + 1, totalPages))
  const goToPage = (page: number) => setCurrentPage(page)

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
          {/* {isCurrentUser && (
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg border">
              <div>
                <h3 className="text-lg font-semibold">Bài Viết Của Bạn</h3>
                <p className="text-sm text-muted-foreground">
                  Quản lý và chia sẻ nội dung của bạn
                </p>
              </div>
            </div>
          )} */}

          {isLoadingBlogs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : blogs && blogs.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentBlogs.map((blog: any, index: number) => (
                  <Card key={blog.id} className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm">
                    <CardContent className="p-0">
                      {/* Card Header */}
                      <div className="h-24 bg-gradient-to-r from-muted/50 to-muted/30 relative">
                        <div className="absolute top-3 right-3">
                          <Badge variant="outline" className="text-xs">
                            #{(currentPage - 1) * POSTS_PER_PAGE + index + 1}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {blog.title}
                        </h3>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(blog.date).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {blog.viewsCount?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={goToPreviousPage}
                onNext={goToNextPage}
                onGoToPage={goToPage}
                currentItemsCount={currentBlogs.length}
                totalItemsCount={blogs.length}
              />
            </div>
          ) : (
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

        <TabsContent value="followers" className="mt-0 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Người Theo Dõi</h3>
              <p className="text-sm text-muted-foreground">
                {followStats.follower} người đang theo dõi
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
                        <AvatarImage src={follower.avatar || "/placeholder.svg"} alt={follower.name} />
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
                          @{follower.name?.toLowerCase().replace(/\s+/g, '')}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm">
                          Xem
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="following" className="mt-0 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Đang Theo Dõi</h3>
              <p className="text-sm text-muted-foreground">
                Đang theo dõi {followStats.following} người
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
                        <AvatarImage src={u.avatar || "/placeholder.svg"} alt={u.name} />
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
                          @{u.name?.toLowerCase().replace(/\s+/g, '')}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm">
                          Xem
                        </Button>
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
