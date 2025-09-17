"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostResponse } from "@/types/api";

type Props = {
  items: PostResponse[];
  loading?: boolean;
  title?: string;
  className?: string;
  maxItems?: number;
  ctaText?: string;
  subtitle?: string; 
};

export function FeaturedCarousel({
  items,
  loading = false,
  title = "Bài viết mới",
  className = "",
  maxItems = 5,
  ctaText = "Đọc ngay",
  subtitle,
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [idx, setIdx] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [paused, setPaused] = useState(false);

  const derived = useMemo(
    () => (items ?? []).slice(0, maxItems),
    [items, maxItems]
  );
  const pageCount = loading ? 3 : derived.length;

  const getSafeImageUrl = (cover: string | null | undefined): string => {
    if (!cover || cover === "string" || cover === "null")
      return "/placeholder.png";
    return cover.startsWith("http") || cover.startsWith("/")
      ? cover
      : "/placeholder.png";
  };

  const updateNavState = () => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 2);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 2);
  };

  // Lấy danh sách slide (dùng aria-roledescription="slide" sẵn có)
  const getSlides = () =>
    Array.from(
      trackRef.current?.querySelectorAll<HTMLElement>(
        '[aria-roledescription="slide"]'
      ) ?? []
    );

const scrollToIndex = useCallback((nextIndex: number) => {
  const el = trackRef.current;
  const slides = getSlides();
  if (!el || slides.length === 0) return;

  const i = Math.max(0, Math.min(nextIndex, slides.length - 1));
  const target = slides[i];

  const targetLeft = target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2;

  el.scrollTo({
    left: Math.max(0, targetLeft),
    behavior: "smooth",
  });

  setIdx(i);
  setTimeout(updateNavState, 250);
}, []);

  const scrollByAmount = (dir: "prev" | "next") => {
    const slides = getSlides();
    if (slides.length === 0) return;

    const next =
      dir === "next"
        ? Math.min(idx + 1, slides.length - 1)
        : Math.max(idx - 1, 0);
    scrollToIndex(next);
  };

  useEffect(() => {
    updateNavState();
    const onResize = () => updateNavState();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  // Auto slide
  useEffect(() => {
  if (paused || loading || derived.length === 0) return;
  const timer = setInterval(() => {
    const slides = getSlides();
    if (slides.length === 0) return;

    if (idx >= slides.length - 1) {
      scrollToIndex(0);
    } else {
      scrollToIndex(idx + 1);
    }
  }, 3000);

  return () => clearInterval(timer);
}, [paused, loading, derived.length, idx, scrollToIndex]);

  return (
    <section
      className={`relative ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={title}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="mb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                )}
                <div className="mt-3 h-1 w-14 rounded-full bg-primary/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Prev/Next */}
        <div className="hidden md:flex gap-2" aria-label="Điều hướng carousel">
          <button
            onClick={() => scrollByAmount("prev")}
            disabled={!canPrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Xem trước"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollByAmount("next")}
            disabled={!canNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Xem tiếp"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(e) => {
          const el = e.currentTarget;
          const slides = getSlides();
          if (slides.length === 0) return;

          // Tìm slide có tâm gần nhất so với tâm viewport của track
          const center = el.scrollLeft + el.clientWidth / 2;
          let closest = 0;
          let minDist = Number.POSITIVE_INFINITY;

          for (let i = 0; i < slides.length; i++) {
            const s = slides[i];
            const left = s.offsetLeft;
            const right = left + s.offsetWidth;
            const mid = (left + right) / 2;
            const dist = Math.abs(mid - center);
            if (dist < minDist) {
              minDist = dist;
              closest = i;
            }
          }

          setIdx(closest);
          updateNavState();
        }}
        tabIndex={0}
      >
        {(loading ? Array.from({ length: 3 }) : derived).map((raw, i) => {
          if (loading) {
            return (
              <div
                key={`s-${i}`}
                className="snap-center shrink-0 w-[88%] md:w-[60%] lg:w-[48%] h-[280px] md:h-[320px] rounded-2xl border border-border shadow-card overflow-hidden animate-pulse bg-muted"
                aria-hidden="true"
              />
            );
          }

          // Item
          const post = raw as PostResponse;
          const postTitle = post?.title || "Bài viết";
          const href = post?.id ? `/blogs/${post.id}` : "#";
          const imgUrl = getSafeImageUrl(
            (post as any).cover || (post as any).coverImage
          );

          const tags: string[] = Array.isArray(post?.category)
            ? post.category.slice(0, 3)
            : Array.isArray((post as any)?.hashtags)
            ? (post as any).hashtags.slice(0, 3)
            : [];

          return (
            <article
              key={post?.id ?? i}
              className="snap-center shrink-0 w-[88%] md:w-[60%] lg:w-[48%] relative rounded-2xl border border-border shadow-card overflow-hidden"
              aria-roledescription="slide"
              aria-label={postTitle}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={postTitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 88vw, (max-width: 1024px) 60vw, 48vw"
                    priority={i === 0}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-accent to-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
              </div>

              {/* Content overlay */}
              <div className="relative z-10 h-[280px] md:h-[320px] flex flex-col justify-end p-5 md:p-6">
                {tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2 text-xs">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full border border-white/35 bg-black/20 px-3 py-1 text-white/90 backdrop-blur"
                        title={`#${t}`}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <h3 className="text-white text-xl md:text-2xl font-semibold leading-snug line-clamp-2 drop-shadow">
                  {postTitle}
                </h3>

                <div className="mt-3">
                  <Link
                    href={href}
                    className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
                    aria-label={`Đọc ${postTitle}`}
                  >
                    {ctaText} →
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Dots (mobile) */}
      {pageCount > 1 && (
        <div
          className="mt-3 flex justify-center gap-1 md:hidden"
          aria-label="Chỉ báo trang"
        >
          {Array.from({ length: pageCount }).map((_, i) => (
            <span
              key={i}
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                i === idx ? "bg-foreground" : "bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      )}

      {!loading && derived.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground mt-4">
          Chưa có bài viết mới.
        </div>
      )}
    </section>
  );
}
