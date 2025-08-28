"use client"

import { useAuth } from '@/contexts/auth-context'
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { useProfileData } from '@/hooks/useProfileData'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MyProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const userId = user?.id
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const {
    profile,
    blogs,
    followers,
    following,
    followStats,
    isLoadingProfile,
    isLoadingBlogs,
    isLoadingFollowers,
    isLoadingFollowing,
    error,
    totalBlogs,
    setActiveTab,
    activeTab,
    isCurrentUser,
  } = useProfileData(userId || '') 
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-pulse text-muted-foreground">Đang chuyển hướng...</div>
      </div>
    )
  }

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-pulse text-muted-foreground">Đang tải hồ sơ...</div>
      </div>
    )
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-4 max-w-lg mx-auto">
          <h3 className="text-red-800 font-semibold text-lg mb-2">Lỗi</h3>
          <p className="text-red-700">{error || "Không thể tải thông tin hồ sơ."}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container max-w-6xl mx-auto px-2 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hồ Sơ Của Tôi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quản lý thông tin cá nhân và hoạt động của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <section className="lg:col-span-1">
            <ProfileSidebar
              profile={profile}
              totalBlogs={totalBlogs}
              blogs={blogs}
              followStats={followStats}
              isFollowing={false}
              toggleFollow={() => {}} 
              isCurrentUser={isCurrentUser}
              isTogglingFollow={false}
              setActiveTab={setActiveTab}
            />
          </section>
          
          <section className="lg:col-span-3">
            <div className="relative rounded-lg shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 md:p-6 space-y-4 min-h-[600px]">
              <ProfileTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                blogs={blogs}
                followers={followers}
                following={following}
                followStats={followStats}
                isCurrentUser={!!isCurrentUser} 
                isLoadingBlogs={isLoadingBlogs}
                isLoadingFollowers={isLoadingFollowers}
                isLoadingFollowing={isLoadingFollowing}
                profile={profile}
                totalBlogs={totalBlogs}
                userId={profile.id} 
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
