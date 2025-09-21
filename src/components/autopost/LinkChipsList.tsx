"use client";

import { useState } from "react";
import { Link2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function LinkChipsList({
  items,
  onRemove,
}: {
  items: { url: string; id?: string }[];
  onRemove: (url: string) => Promise<void> | void; // hỗ trợ async
}) {
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(e: React.MouseEvent, url: string) {
    e.preventDefault();
    e.stopPropagation();
    if (removing) return;
    try {
      setRemoving(url);
      await onRemove(url);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-2",
        "max-h-64 overflow-y-auto shadow-sm"
      )}
    >
      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground px-2 py-1">Chưa có link nào.</div>
        ) : (
          items.map((it) => (
            <span
              key={it.id || it.url}
              className="inline-flex items-center gap-2 rounded-full border bg-background px-2 py-1 text-xs shadow-sm"
            >
              <Link2 className="h-3.5 w-3.5 text-primary" />
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="max-w-[260px] truncate hover:underline"
                title={it.url}
              >
                {it.url.replace(/^https?:\/\//i, "")}
              </a>
              <button
                type="button"
                onClick={(e) => handleRemove(e, it.url)}
                className="ml-1 rounded-full px-1 text-muted-foreground hover:text-foreground disabled:opacity-60"
                aria-label={`Xoá ${it.url}`}
                title="Xoá"
                disabled={removing === it.url}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
