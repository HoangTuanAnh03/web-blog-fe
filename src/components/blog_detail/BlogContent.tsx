"use client";

import { RefObject, useMemo } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import type { PostResponse } from "@/types/api";

function enhanceExternalLinks(html: string) {
  return html.replace(
    /<a\s+([^>]*\s)?href\s*=\s*"(https?:\/\/|\/\/)([^"]+)"([^>]*)>/gi,
    (_m, preAttrs = "", _proto, restHref, postAttrs = "") => {
      const attrs = `${preAttrs || ""}href="https://${restHref}"${
        postAttrs || ""
      }`;
      const hasTarget = /target\s*=/i.test(attrs);
      const hasRel = /rel\s*=/i.test(attrs);
      const extra = `${hasTarget ? "" : ' target="_blank"'}${
        hasRel ? "" : ' rel="noopener noreferrer"'
      }`;
      return `<a ${attrs.trim()}${extra}>`;
    }
  );
}

interface BlogContentProps {
  blog: PostResponse;
  showRawContent: boolean;
  coverImage: string;
  contentRef: RefObject<HTMLDivElement>;
}

export function BlogContent({
  blog,
  showRawContent,
  coverImage,
  contentRef,
}: BlogContentProps) {
  const html = useMemo(() => {
    const base = showRawContent
      ? blog.rawContent || blog.content
      : blog.content;
    return enhanceExternalLinks(base || "");
  }, [blog.content, blog.rawContent, showRawContent]);

  const hasCover = Boolean(blog.cover && blog.cover !== "string");

  return (
    <div className="space-y-8">
      {/* Cover Image */}
      {hasCover && (
        <figure className="relative overflow-hidden rounded-2xl shadow-lg">
          <div className="relative aspect-[21/9] sm:aspect-[16/9]">
            <Image
              src={coverImage}
              alt={blog.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-black/5 to-transparent" />
          </div>
          {Boolean((blog as any).coverCaption) && (
            <figcaption className="px-2 py-2 text-center text-xs text-muted-foreground">
              {(blog as any).coverCaption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Article Content */}
      <Card className="border border-border bg-card p-6 sm:p-8 rounded-2xl shadow-card">
        <div
          className="prose prose-slate prose-lg max-w-[72ch] mx-auto
             prose-headings:font-semibold prose-p:text-slate-800
             prose-a:text-primary hover:prose-a:opacity-90
             prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Card>
    </div>
  );
}
