"use client";

import { useAuth } from "@/contexts/auth-context";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { useProfileData } from "@/hooks/useProfileData";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const userId = user?.id;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

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
  } = useProfileData(userId || "");
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-pulse text-muted-foreground">
          Đang chuyển hướng...
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-pulse text-muted-foreground">
          Đang tải hồ sơ...
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-4 max-w-lg mx-auto">
          <h3 className="text-red-800 font-semibold text-lg mb-2">Lỗi</h3>
          <p className="text-red-700">
            {error || "Không thể tải thông tin hồ sơ."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container max-w-6xl mx-auto px-2 md:px-6">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 
             4.779.755 6.879 2.055M15 11a3 3 0 
             11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Hồ Sơ Của Tôi
              </h1>
              <p className="mt-1 text-base text-muted-foreground">
                Quản lý thông tin cá nhân và hoạt động của bạn
              </p>
            </div>
          </div>

          {/* Accent underline */}
          <div className="mt-4 h-1 w-20 rounded-full bg-primary/80"></div>
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
  );
}
