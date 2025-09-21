// ===============================
// src/app/auto-post/page.tsx
// ===============================
"use client";

import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAutoPost } from "@/hooks/useAutoPost";
import { LinkInput } from "@/components/autopost/LinkInput";
import { LinkChipsList } from "@/components/autopost/LinkChipsList";
import { CrawlConfirm } from "@/components/autopost/CrawlConfirm";

export default function AutoPostPage() {
  const { toast } = useToast();
  const { links, listQ, addOne, removeOne, triggerCrawl, isBusy } = useAutoPost();

  const getMsg = (res: any) =>
    res?.message || res?.data?.message || (typeof res === "string" ? res : "");

  const handleAddOne = async (url: string) => {
    try {
      const res = await addOne.mutateAsync(url);
      const msg = `Đã thêm: ${url}`;
      toast({ title: "Thành công", description: msg });
    } catch (e: any) {
      toast({
        title: "Không thể thêm",
        description: "Có vẻ như link đã tồn tại.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (url: string) => {
    try {
      const res = await removeOne.mutateAsync(url);
      const msg = `Đã xoá: ${url}`;
      toast({ title: "Thành công", description: msg });
    } catch (e: any) {
      toast({
        title: "Xoá link thất bại",
        description: e?.message || "Lỗi không xác định",
        variant: "destructive",
      });
    }
  };

  const handleCrawl = async () => {
    if (listQ.isLoading) return;

    if (!links || links.length === 0) {
      toast({
        title: "Cảnh báo",
        description: "Bạn cần thêm ít nhất 1 URL tác giả trước khi khởi động tự động đăng.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await triggerCrawl.mutateAsync(undefined);
      const msg = getMsg(res) || "Vui lòng chờ trong giây lát để bài viết được đăng.";
      toast({ title: "Đã khởi động", description: msg });
    } catch (e: any) {
      toast({
        title: "Không thể khởi động",
        description: e?.message || "Lỗi không xác định",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 py-5 space-y-6">
      {/* Hero */}
      <div className="rounded-3xl border bg-gradient-to-br from-background to-card/70 backdrop-blur p-6 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Tạo bài viết tự động
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
          Theo dõi các tác giả yêu thích và tự động lấy — đăng bài viết lên blog của bạn.
        </p>
      </div>

      {/* Add link */}
      <Card className="p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-medium">Thêm link tác giả</h2>
        </div>
        <LinkInput onAddOne={handleAddOne} disabled={isBusy} />
      </Card>

      {/* List */}
      <Card className="p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-medium">Danh sách link</h2>
          <span className="text-xs text-muted-foreground">
            {listQ.isLoading ? "Đang tải…" : `${links.length} link`}
          </span>
        </div>
        <LinkChipsList
          items={links.map((u) => ({ url: u.url, id: u.id }))}
          onRemove={handleRemove}
        />
        {!listQ.isLoading && links.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Bạn chưa có link nào — hãy thêm tối thiểu 1 link trước khi khởi động.
          </p>
        )}
      </Card>

      {/* Crawl */}
      <Card className="p-4 md:p-5 space-y-3">
        <h2 className="text-base md:text-lg font-medium">Crawl & tự động đăng</h2>
        <p className="text-sm text-muted-foreground">
          Hệ thống sẽ chạy nền khi xác nhận. Bạn có thể quay lại sau để xem kết quả.
        </p>
        <CrawlConfirm onConfirm={handleCrawl} pending={triggerCrawl.isPending} />
      </Card>
    </section>
  );
}
