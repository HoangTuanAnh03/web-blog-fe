"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Flame,
  MessageCircle,
  Sparkles,
  Tag,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden"
      >
        {/* soft radial background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-10 h-[28rem] w-[28rem] rounded-full bg-accent/40 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className="text-[13px] px-3 py-1 tracking-wide"
              >
                BLOG PLATFORM
              </Badge>
            </div>

            <h1
              id="hero-title"
              className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight"
            >
              Chào mừng đến với{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>

            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-8 mx-auto max-w-[65ch]">
              Nơi cộng đồng chia sẻ, học hỏi & lan tỏa tri thức cho lập trình
              viên và những người yêu công nghệ. Khám phá bài viết chất lượng,
              thủ thuật code, xu hướng mới & nhiều hơn nữa.
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Thử chatbot AI góc màn hình để tìm nhanh bài viết</span>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="gap-2 font-semibold shadow-card rounded-full"
              >
                <Link href="/blogs" aria-label="Khám phá bài viết">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                  Khám phá Bài viết
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 font-semibold rounded-full"
              >
                {/* <Link href="/blogs/new" aria-label="Viết blog của bạn">
                  <Flame className="h-5 w-5" aria-hidden="true" />
                  Viết blog của bạn
                </Link> */}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          <ValueCard
            icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
            title="Nơi khởi nguồn tri thức"
            desc="Bài viết thực chiến về giải thuật, framework, sản phẩm – tất cả trong một nền tảng mở & thân thiện."
          />
          <ValueCard
            icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
            title="Cho cộng đồng, bởi cộng đồng"
            desc="Đăng bài, bình luận, thảo luận & tìm cảm hứng cùng những người bạn chung đam mê."
          />
          <ValueCard
            icon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
            title="Tối ưu học tập & phát triển"
            desc="Tìm kiếm mạnh mẽ, mượt trên mọi thiết bị, tối ưu SEO – sẵn sàng cho hành trình dài."
          />
        </div>
      </section>

      {/* CTA BANNER */}
      <section
        aria-labelledby="cta-heading"
        className="full-bleed relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent" />
        <div className="container mx-auto px-4 py-10 md:py-12 relative">
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card/80 backdrop-blur p-6 md:p-8 shadow-card">
            <h2
              id="cta-heading"
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-center"
            >
              Sẵn sàng viết bài đầu tiên của bạn?
            </h2>
            <p className="mt-2 text-center text-muted-foreground">
              Chia sẻ góc nhìn & kinh nghiệm – truyền cảm hứng đến cộng đồng.
            </p>
            <div className="mt-6 flex justify-center">
              <Button asChild size="lg" className="rounded-full shadow-card">
                <Link href="/blogs/new">Bắt đầu viết ngay</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <article className="group relative rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-lg">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-6 text-center">
        <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-border">
          <span className="text-primary">{icon}</span>
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-7 max-w-[52ch] mx-auto">
          {desc}
        </p>
      </div>
    </article>
  );
}
