"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, Flame } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-white flex flex-col justify-between">
      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center text-center py-20 space-y-8">
        <div className="flex justify-center gap-3">
          <Badge variant="default" className="text-base px-4 py-1">BLOG PLATFORM</Badge>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight max-w-3xl mx-auto drop-shadow">
          Chào mừng bạn đến với <span className="text-primary">ATBlog</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Nơi cộng đồng chia sẻ, học hỏi & lan tỏa tri thức  Kênh blog dành cho lập trình viên và những người yêu công nghệ hiện đại.<br/>
          Khám phá các bài viết chất lượng, thủ thuật code, trends mới & nhiều hơn nữa.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center pt-3">
          <Button asChild size="lg" className="gap-2 font-semibold shadow-lg">
            <Link href="/blogs">
              <BookOpen className="h-5 w-5" />
              Khám phá Bài viết
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 font-semibold">
            <Link href="/blogs/new">
              <Flame className="h-5 w-5" />
              Viết blog của bạn
            </Link>
          </Button>
        </div>
      </section>

      {/* Why choose - Value props */}
      <section className="container mx-auto py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="rounded-xl bg-white shadow-sm p-6 flex flex-col items-center text-center space-y-2">
            <Flame className="h-10 w-10 text-primary" />
            <h3 className="font-bold text-lg">Nơi khởi nguồn tri thức</h3>
            <p className="text-muted-foreground text-sm">
              Tổng hợp các bài viết chia sẻ kinh nghiệm thực chiến, giải thuật, framework, product - tất cả chỉ trong một nền tảng mở.
            </p>
          </div>
          <div className="rounded-xl bg-white shadow-sm p-6 flex flex-col items-center text-center space-y-2">
            <BookOpen className="h-10 w-10 text-secondary" />
            <h3 className="font-bold text-lg">Cho cộng đồng, bởi cộng đồng</h3>
            <p className="text-muted-foreground text-sm">
              Mọi thành viên đều có thể đăng bài, bình luận, thảo luận & tìm cảm hứng code cùng những người bạn chung đam mê.
            </p>
          </div>
          <div className="rounded-xl bg-white shadow-sm p-6 flex flex-col items-center text-center space-y-2">
            <ArrowRight className="h-10 w-10 text-blue-500" />
            <h3 className="font-bold text-lg">Tối ưu cho học tập & phát triển</h3>
            <p className="text-muted-foreground text-sm">
              Dữ liệu rõ ràng, tìm kiếm mạnh mẽ, trải nghiệm mượt mà trên mọi thiết bị, an toàn bảo mật & sẵn sàng cho SEO.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
