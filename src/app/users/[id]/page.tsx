"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useProfileData } from "@/hooks/useProfileData";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { ProfileTabs } from "@/components/profile/profile-tabs";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const userId = params.id as string;

  useEffect(() => {
    if (isAuthenticated && user && userId === user.id) {
      router.replace("/users/my-info");
    }
  }, [isAuthenticated, user, userId, router]);

  const {
    profile,
    blogs,
    followers,
    following,
    followStats,
    isFollowing,
    isLoadingProfile,
    isLoadingBlogs,
    isLoadingFollowers,
    isLoadingFollowing,
    isTogglingFollow,
    error,
    totalBlogs,
    setActiveTab,
    activeTab,
    toggleFollow,
    isCurrentUser,
  } = useProfileData(userId);

  // Loading state
  if (isLoadingProfile)
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-pulse text-muted-foreground">Đang tải dữ liệu...</div>
      </div>
    );

  if (error || !profile)
    return (
      <div className="container mx-auto py-8">
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-4 max-w-lg mx-auto">
          <h3 className="text-red-800 font-semibold text-lg mb-2">Lỗi</h3>
          <p className="text-red-700">{error || "Không tìm thấy người dùng này."}</p>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container max-w-6xl mx-auto px-2 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <section className="lg:col-span-1">
            <ProfileSidebar
              profile={profile}
              totalBlogs={totalBlogs}
              blogs={blogs}
              followStats={followStats}
              isFollowing={isFollowing}
              toggleFollow={toggleFollow}
              isCurrentUser={isCurrentUser}
              isTogglingFollow={isTogglingFollow}
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
                userId={userId}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
