"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { SearchBar, type SearchParams } from "@/components/blog/search-bar";
import { useBlog } from "@/hooks/useBlog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiService } from "@/lib/api-service";
import type {
  PostResponse,
  PostSummaryResponse,
  CategoryResponse,
} from "@/types/api";
import { FeaturedCarousel } from "@/components/blog/FeaturedCarousel";
import { CategoryQuickPick } from "@/components/blog/CategoryQuickPick";

function BlogCardSkeleton() {
  return (
    <div className="flex flex-col p-4 bg-card border border-border rounded-2xl shadow-card animate-pulse">
      <div className="aspect-[16/9] w-full rounded-xl bg-muted mb-5" />
      <div className="h-5 rounded bg-muted max-w-[70%] mb-3" />
      <div className="h-4 rounded bg-muted max-w-[85%] mb-8" />
      <div className="h-4 rounded bg-muted max-w-[50%]" />
    </div>
  );
}

export default function BlogsPage() {
  // ====== FILTER STATE ======
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    topics: [],
  });

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // ====== HOOK BACKEND ======
  const {
    categories,
    categoriesLoading,
    categoriesError,
    blogs,
    blogsLoading,
    blogsError,
    fetchBlogs,
  } = useBlog();
  

  // ====== STATE AGGREGATE & DETAIL ======
  const [allSummaries, setAllSummaries] = useState<PostSummaryResponse[]>([]);
  const [detailById, setDetailById] = useState<Record<string, PostResponse>>(
    {}
  );
  const [detailsLoading, setDetailsLoading] = useState(false);

  // ====== FEATURED ======
  const [featured, setFeatured] = useState<PostResponse[] | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const fetchedIdsRef = useRef<Set<string>>(new Set());

  // useEffect(() => {
  //   setAllSummaries([]);
  //   setDetailById({});
  //   setCurrentPage(0);
  // }, [searchParams]);

  // ====== AUTH & FETCH PAGE ======
  useEffect(() => {
    if (isAuthenticated) {
      fetchBlogs({
        page: currentPage,
        size: pageSize,
        query: searchParams.query,
        topics: searchParams.topics,
      });
    } else {
      router.push("/login");
    }
  }, [
    currentPage,
    searchParams,
    fetchBlogs,
    isAuthenticated,
    router,
    pageSize,
  ]);

  useEffect(() => {
    if (isAuthenticated) setCurrentPage(0);
  }, [isAuthenticated]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchParams]);

  useEffect(() => {
    if (!blogs) return;
    const content = blogs.content ?? [];
    setAllSummaries((prev) => {
      if (currentPage === 0) return content;
      const existed = new Set(prev.map((x) => x.id));
      const toAppend = content.filter((x) => x.id && !existed.has(x.id));
      return prev.concat(toAppend);
    });
  }, [blogs, currentPage]);

useEffect(() => {
  let cancelled = false;

  async function loadMissingDetails() {
    const ids = (allSummaries ?? []).map((b) => b.id).filter(Boolean) as string[];
    if (!ids.length) {
      setDetailById({});
      fetchedIdsRef.current.clear();
      return;
    }

    const missing = ids.filter((id) => !detailById[id] && !fetchedIdsRef.current.has(id));
    if (!missing.length) return;

    setDetailsLoading(true);
    try {
      const results = await Promise.all(
        missing.map(async (id) => {
          try {
            const res = await apiService.getBlogDetail(id);
            if (res.code === 200 && res.data) return res.data as PostResponse;
          } catch {}
          return null;
        })
      );
      if (cancelled) return;

      setDetailById((prev) => {
        const next = { ...prev };
        for (const item of results) {
          if (item) {
            next[item.id] = item;
            fetchedIdsRef.current.add(item.id);
          }
        }
        return next;
      });
    } finally {
      if (!cancelled) setDetailsLoading(false);
    }
  }

  loadMissingDetails();
  return () => { cancelled = true; };
// 🔑 Chỉ phụ thuộc summaries để tránh lặp
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [allSummaries]);

  // ====== FEATURED ======
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setFeaturedLoading(true);
        const apiAny = apiService as any;
        if (typeof apiAny.getTopViewedPosts === "function") {
          const res = await apiAny.getTopViewedPosts(5);
          if (!active) return;
          if (Array.isArray(res)) {
            setFeatured(res.slice(0, 5));
            return;
          }
          if (res?.code === 200 && Array.isArray(res?.data)) {
            setFeatured(res.data.slice(0, 5));
            return;
          }
        }
        const list = Object.values(detailById);
        const withViews = list
          .map((x) => ({
            item: x,
            views: (x as any).viewCount ?? (x as any).views ?? 0,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5)
          .map((x) => x.item);
        setFeatured(withViews);
      } finally {
        if (active) setFeaturedLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [detailById]);

  // ====== QUICK PICK HANDLERS ======
  const handleToggleTopicId = (idStr: string) => {
    setSearchParams((p) => {
      const exists = p.topics?.includes(idStr);
      const topics = exists
        ? (p.topics || []).filter((t) => t !== idStr)
        : [...(p.topics || []), idStr];
      return { ...p, topics };
    });
  };
  const handleClearTopics = () =>
    setSearchParams((p) => ({ ...p, topics: [] }));

  // ====== UI STATES ======
  const combinedError = categoriesError || blogsError;
  const isInitialLoading =
    categoriesLoading || (blogsLoading && allSummaries.length === 0);
  const hasMore = blogs ? !blogs.last : false; // dựa theo lần gọi gần nhất
  const gridSummaries = allSummaries.length
    ? allSummaries
    : blogs?.content ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* FEATURED */}
      <section
        aria-labelledby="featured-heading"
        className=" bg-gradient-to-b from-accent/40 via-accent/15 to-transparent"
      >
        <h2 id="featured-heading" className="sr-only">
          Bài viết nổi bật
        </h2>
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Gợi ý hôm nay</p>
          </div>
          <div className="relative overflow-hidden">
            <FeaturedCarousel
              items={featured ?? []}
              loading={featuredLoading}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="mb-8 space-y-3 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Khám phá bài viết
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mx-auto max-w-[70ch]">
            Tìm kiếm & khám phá những bài viết chất lượng từ cộng đồng.
          </p>
        </header>

        {/* FILTER*/}
        <section
          aria-labelledby="filter-heading"
          className="mb-10 rounded-2xl border border-border bg-card shadow-card"
        >
          <h2 id="filter-heading" className="sr-only">
            Bộ lọc
          </h2>

          {/* QuickPick*/}
          <div className="border-b p-4 md:p-5">
            <CategoryQuickPick
              categories={(categories as CategoryResponse[]) || []}
              selectedTopicIds={searchParams.topics || []}
              onToggleTopicId={handleToggleTopicId}
              onClear={handleClearTopics}
              loading={categoriesLoading}
              maxVisible={10}
            />
          </div>

          {/* SearchBar */}
          <div className="p-4 md:p-5">
            {categoriesLoading ? (
              <div className="flex h-20 items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Đang tải bộ lọc…
              </div>
            ) : categoriesError ? (
              <p className="text-center font-medium text-destructive">
                {categoriesError}
              </p>
            ) : (
              <SearchBar
                onSearch={setSearchParams}
                topics={categories as CategoryResponse[]}
              />
            )}
          </div>
        </section>

        {/* Content */}
        <section
          aria-live="polite"
          aria-busy={blogsLoading || detailsLoading}
          className="min-h-[400px]"
        >
          {combinedError ? (
            <div className="py-12 text-center">
              <p className="mb-2 font-semibold text-destructive">
                ⚠️ Có lỗi xảy ra
              </p>
              <p className="text-muted-foreground">{combinedError}</p>
              <button
                onClick={() =>
                  fetchBlogs({
                    page: currentPage,
                    size: pageSize,
                    query: searchParams.query,
                    topics: searchParams.topics,
                  })
                }
                className="mt-5 text-primary hover:underline"
              >
                Thử lại
              </button>
            </div>
          ) : isInitialLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: pageSize }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : gridSummaries.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  Đang hiển thị {gridSummaries.length.toLocaleString()}
                  {blogs?.totalElements ? (
                    <> / {blogs.totalElements.toLocaleString()}</>
                  ) : null}{" "}
                  bài viết
                </p>
                {detailsLoading && (
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Đang tải chi tiết…</span>
                  </div>
                )}
              </div>

              <div className="relative">
                {(blogsLoading || detailsLoading) && (
                  <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-background/40 backdrop-blur-[1px]" />
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {gridSummaries.map((sum) => {
                    const detail = sum.id ? detailById[sum.id] : undefined;
                    return detail ? (
                      <BlogCard key={sum.id} blog={detail} hideAuthor={false} />
                    ) : (
                      <BlogCardSkeleton key={sum.id} />
                    );
                  })}
                </div>
              </div>

              {/* NÚT XEM THÊM */}
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={blogsLoading}
                    aria-busy={blogsLoading}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold shadow-card transition-all hover:shadow-md hover:scale-[1.01] disabled:opacity-60"
                  >
                    {blogsLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
                      </>
                    ) : (
                      <>Xem thêm</>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-4xl">
                📝
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Chưa có bài viết phù hợp
              </h3>
              <p className="mx-auto mb-2 max-w-md text-muted-foreground">
                Hãy điều chỉnh từ khóa hoặc chọn thêm chủ đề để khám phá nội
                dung khác.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
