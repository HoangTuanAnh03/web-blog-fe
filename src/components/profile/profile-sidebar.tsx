import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar, Edit, Eye, User, Share2, BookOpen, Users, BarChart3, Loader2,
} from "lucide-react"

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

  const name = profile?.name || "Người dùng"
  const initials = String(name).substring(0, 2).toUpperCase()
  const avatar = profile?.avatar || "/placeholder.svg"
  const email = profile?.email
  const dob = profile?.dob ? new Date(profile.dob).toLocaleDateString("vi-VN",
    { year: "numeric", month: "long", day: "numeric" }) : "—"

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="h-16 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent" />

        <div className="p-6 -mt-10 flex flex-col items-center text-center">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-background border border-border shadow-md">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="mt-4 flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="text-foreground">{name}</span>
            {profile?.gender === "MALE" ? <MaleIcon /> : profile?.gender === "FEMALE" ? <FemaleIcon /> : null}
          </div>

          <div className="text-sm text-muted-foreground mt-1 break-all">
            {email ? <a href={`mailto:${email}`} className="hover:underline">{email}</a> : "—"}
          </div>

          <div className="text-sm text-muted-foreground mt-3">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {dob}
            </span>
          </div>

          <div className="mt-5 flex gap-2 w-full">
            {isCurrentUser ? (
              <Link href={`/edit_profile`} className="w-full">
                <Button variant="outline" className="w-full gap-2 rounded-full">
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa hồ sơ
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  className="w-full gap-2 rounded-full"
                  onClick={toggleFollow}
                  disabled={isTogglingFollow}
                >
                  {isTogglingFollow ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </Button>
                <Button variant="outline" size="icon" className="rounded-full" title="Chia sẻ hồ sơ">
                  <Share2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats tiles */}
      <div className="bg-card border border-border rounded-2xl shadow-card">
        <div className="p-6 grid grid-cols-1 gap-4">
          <StatTile
            icon={<Eye className="h-4 w-4" />}
            label="Lượt xem"
            value={nf.format(viewsPageTotal)}
          />
          <StatTile
            clickable
            onClick={() => setActiveTab?.("posts")}
            icon={<BookOpen className="h-4 w-4" />}
            label="Bài viết"
            value={nf.format(totalBlogs || 0)}
          />
          <StatTile
            clickable
            onClick={() => setActiveTab?.("followers")}
            icon={<Users className="h-4 w-4" />}
            label="Follower"
            value={nf.format(followStats?.follower || 0)}
          />
          <StatTile
            clickable
            onClick={() => setActiveTab?.("following")}
            icon={<User className="h-4 w-4" />}
            label="Following"
            value={nf.format(followStats?.following || 0)}
          />
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-card border border-border rounded-2xl shadow-card">
        <div className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-4 justify-center">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-medium">Thông tin nổi bật</span>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <div className="text-xs text-muted-foreground">Trung bình view/bài (trên trang này)</div>
            <div className="mt-1 text-lg font-semibold">{nf.format(avgViewsPerPost)}</div>

            {topPost && (
              <div className="mt-4 space-y-1.5">
                <div className="text-xs text-muted-foreground">Bài nổi bật (trên trang)</div>
                <Link
                  href={`/blogs/${topPost.id}`}
                  className="text-sm font-medium line-clamp-2 hover:underline"
                  title={topPost.title}
                >
                  {topPost.title}
                </Link>
                <div className="text-xs text-muted-foreground">
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

/* --- Subcomponents --- */

function StatTile({
  icon, label, value, clickable, onClick,
}: { icon: React.ReactNode; label: string; value: string | number; clickable?: boolean; onClick?: () => void }) {
  return (
    <button
      type={clickable ? "button" : "button"}
      onClick={clickable ? onClick : undefined}
      className={[
        "group w-full text-left rounded-xl border bg-background p-4 transition-all",
        clickable
          ? "hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          : "cursor-default",
      ].join(" ")}
      aria-label={label}
    >
      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
        <div className="flex-shrink-0">{icon}</div>
        <span className="text-sm font-medium whitespace-normal break-words">{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-bold tracking-tight text-foreground whitespace-normal break-words">
        {value}
      </div>
    </button>
  );
}




function MaleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" className="text-blue-600">
      <path d="M16 3h5v5" />
      <path d="m21 3-6.75 6.75" />
      <circle cx="10" cy="14" r="6" />
    </svg>
  )
}
function FemaleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" className="text-pink-600">
      <path d="M12 15v7" />
      <path d="M9 19h6" />
      <circle cx="12" cy="9" r="6" />
    </svg>
  )
}
