"use client";

import { RefObject, useMemo, useState } from "react";
import { Calendar, Clock, Eye, Tag, Hash, MoreHorizontal } from "lucide-react";
import type { PostResponse } from "@/types/api";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OwnerActions } from "@/components/blog_detail/OwnerActions";
import { cn } from "@/lib/utils";

interface BlogSidebarProps {
  blog: PostResponse;
  contentRef: RefObject<HTMLDivElement>;
  isOwner?: boolean;
  isDeleting?: boolean;
  isUpdating?: boolean;
  isBusy?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BlogSidebar({
  blog,
  contentRef, // reserved for TOC
  isOwner = false,
  isDeleting = false,
  isUpdating = false,
  isBusy = false,
  onEdit,
  onDelete,
}: BlogSidebarProps) {
  const readingMinutes = useMemo(
    () => Math.max(1, Math.ceil((blog.content?.length || 0) / 1000)),
    [blog.content]
  );

  const [showAllTags, setShowAllTags] = useState(false);
  const hashtags: string[] = Array.isArray((blog as any).hashtags) ? (blog as any).hashtags : [];
  const TAG_LIMIT = 14;
  const visibleTags = showAllTags ? hashtags : hashtags.slice(0, TAG_LIMIT);
  const canToggleTags = hashtags.length > TAG_LIMIT;

  return (
    <aside>
      <div className="sticky top-20 md:top-24 space-y-5">
        {/* ========== TÁC VỤ (đưa lại OwnerActions) ========== */}
        {isOwner && (
          <Section title="Tác vụ" icon={<MoreHorizontal className="h-3.5 w-3.5" />}>
            <OwnerActions
              isOwner={isOwner}
              blogTitle={blog.title}
              isDeleting={isDeleting}
              isUpdating={isUpdating}
              isBusy={isBusy}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Section>
        )}

        {/* Thông tin bài viết */}
        <Section title="Thông tin bài viết" icon={<Calendar className="h-3.5 w-3.5" />}>
          <dl className="grid grid-cols-1 gap-1.5">
            <StatRow icon={<Calendar className="h-4 w-4" />} label={formatDate(blog.createdAt)} />
            <StatRow
              icon={<Eye className="h-4 w-4" />}
              label={`${(blog as any).viewsCount?.toLocaleString?.() ?? 0} lượt đọc`}
            />
            <StatRow icon={<Clock className="h-4 w-4" />} label={`~${readingMinutes} phút đọc`} />
          </dl>
        </Section>

        {/* Chủ đề */}
        {Array.isArray(blog.category) && blog.category.length > 0 && (
          <Section title="Chủ đề" icon={<Tag className="h-3.5 w-3.5" />}>
            <div className="flex flex-wrap gap-1.5">
              {blog.category.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center rounded-full bg-accent/50 px-2 py-0.5 text-xs"
                  title={cat}
                >
                  {cat}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <Section title="Hashtags" icon={<Hash className="h-3.5 w-3.5" />}>
            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-full border-border/70 bg-background px-2 py-0.5 text-[11px] leading-5"
                  title={`#${tag}`}
                >
                  <span className="text-primary mr-0.5">#</span>
                  <span className="max-w-[9rem] truncate">{tag}</span>
                </Badge>
              ))}
            </div>

            {canToggleTags && (
              <button
                type="button"
                onClick={() => setShowAllTags((v) => !v)}
                className="mt-2 text-xs font-medium text-primary underline-offset-4 hover:underline"
                aria-expanded={showAllTags}
              >
                {showAllTags ? "Thu gọn" : `Xem thêm ${hashtags.length - TAG_LIMIT} thẻ`}
              </button>
            )}
          </Section>
        )}
      </div>
    </aside>
  );
}

/* ===== Helpers ===== */

function Section({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border/60 bg-card/70 p-4", className)}>
      <h4 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </span>
        )}
        {title}
      </h4>
      {children}
    </section>
  );
}

function StatRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md px-1 py-1 hover:bg-accent/50">
      <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-accent/70">
        {icon}
      </span>
      <dt className="sr-only">{typeof label === "string" ? label : "stat"}</dt>
      <dd className="text-sm text-foreground/90">{label}</dd>
    </div>
  );
}
