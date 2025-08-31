import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Edit, Eye, User, Share2, BookOpen, Users, BarChart3 } from "lucide-react"

export function ProfileSidebar({
  profile, totalBlogs, blogs, followStats, isFollowing, toggleFollow,
  isCurrentUser, isTogglingFollow, setActiveTab
}: any) {
  const nf = new Intl.NumberFormat("vi-VN")

const viewsPageTotal = Array.isArray(blogs)
  ? blogs.reduce((sum: number, b: any) => sum + (Number(b?.viewsCount) || 0), 0)
  : 0

const avgViewsPerPost = totalBlogs > 0
  ? Math.round(viewsPageTotal / Math.min(totalBlogs, blogs?.length || 0))
  : 0

const topPost = Array.isArray(blogs) && blogs.length > 0
  ? [...blogs].sort((a: any, b: any) => (b?.viewsCount || 0) - (a?.viewsCount || 0))[0]
  : null
  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-white rounded shadow-md">
        <div className="p-6 flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 text-2xl font-bold">
            {profile.name}
            {profile.gender === "MALE" ? <MaleIcon /> : <FemaleIcon />}
          </div>
          <div className="text-sm text-muted-foreground mb-2">{profile.email}</div>
          <div className="text-sm text-muted-foreground mb-4">
            <span className="flex items-center justify-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(profile.dob).toLocaleDateString()}
            </span>
          </div>
          {isCurrentUser ? (
            <div className="flex gap-2 w-full">
              <Link href={`/edit_profile`} className="w-full">
                <Button variant="outline" className="w-full gap-1">
                  <Edit className="h-4 w-4" />
                  Chỉnh Sửa Hồ Sơ
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                variant={isFollowing ? "outline" : "default"}
                className="w-full gap-1"
                onClick={toggleFollow}
                disabled={isTogglingFollow}
              >
                <User className="h-4 w-4" />
                {isFollowing ? "Đang Theo Dõi" : "Theo Dõi"}
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded shadow-md">
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground"><Eye className="h-4 w-4" /><span className="text-sm">Lượt Xem</span></div>
            <p className="text-2xl font-bold">{blogs.reduce((sum: number, blog: any) => sum + (blog.viewsCount || 0), 0)}</p>
          </div>
          <div className="space-y-1 cursor-pointer" onClick={() => setActiveTab("posts")}>
            <div className="flex items-center gap-1 text-muted-foreground"><BookOpen className="h-4 w-4"/><span className="text-sm">Bài Viết</span></div>
            <p className="text-2xl font-bold">{totalBlogs}</p>
          </div>
          <div className="space-y-1 cursor-pointer" onClick={() => setActiveTab("followers")}>
            <div className="flex items-center gap-1 text-muted-foreground"><Users className="h-4 w-4"/><span className="text-sm">Follower</span></div>
            <p className="text-2xl font-bold">{followStats.follower}</p>
          </div>
          <div className="space-y-1 cursor-pointer" onClick={() => setActiveTab("following")}>
            <div className="flex items-center gap-1 text-muted-foreground"><User className="h-4 w-4"/><span className="text-sm">Following</span></div>
            <p className="text-2xl font-bold">{followStats.following}</p>
          </div>
        </div>
      </div>
<div className="bg-white rounded shadow-md">
      <div className="p-6 bg-gray-50 rounded-md border border-gray-200">
        <div className="flex items-center gap-2 text-gray-600 mb-4 justify-center">
          <BarChart3 className="h-5 w-5" />
          <span className="text-sm font-medium">Thông tin nổi bật</span>
        </div>

        <div className="mt-4 p-3 rounded-md bg-white border">
          <div className="text-xs text-gray-500 mb-1">Trung bình view/bài (trên trang)</div>
          <div className="text-lg font-medium">{nf.format(avgViewsPerPost)}</div>

          {topPost && (
            <div className="mt-3">
              <div className="text-xs text-gray-500">Bài nổi bật (trang)</div>
              <div className="text-sm font-medium truncate" title={topPost.title}>
                {topPost.title}
              </div>
              <div className="text-xs text-gray-500">
                {nf.format(topPost.viewsCount || 0)} lượt xem
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

function MaleIcon() { return ( <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d="M16 3h5v5" /><path d="m21 3-6.75 6.75" /><circle cx="10" cy="14" r="6" /></svg> ) }
function FemaleIcon() { return ( <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d="M12 15v7"/><path d="M9 19h6"/><circle cx="12" cy="9" r="6" /></svg> ) }
