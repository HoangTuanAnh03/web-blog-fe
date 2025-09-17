"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, ChevronDown } from "lucide-react";
import type { CategoryResponse } from "@/types/api";

const normalize = (s: string) =>
  (s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function CategoryQuickPick({
  categories,
  selectedTopicIds,
  onToggleTopicId,
  onClear,
  loading,
  maxVisible = 10,
}: {
  categories: CategoryResponse[];
  selectedTopicIds: string[]; // ID string[] (giống SearchBar)
  onToggleTopicId: (idStr: string) => void; // Toggle ngay, không cần áp dụng
  onClear: () => void; // Xoá tất cả filter
  loading?: boolean;
  maxVisible?: number;
}) {
  // Map & dedupe theo tên hiển thị (cname), nhưng giữ idStr để lọc
  const items = useMemo(() => {
    const seen = new Set<string>();
    const out: { idStr: string; label: string; desc: string }[] = [];
    for (const c of categories || []) {
      const label = (c.cname || String(c.id)).trim();
      const key = normalize(label);
      if (!label || seen.has(key)) continue;
      seen.add(key);
      out.push({
        idStr: String(c.id),
        label,
        desc: (c.cdesc || "").trim(),
      });
    }
    return out;
  }, [categories]);

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selectedSet = useMemo(
    () => new Set(selectedTopicIds || []),
    [selectedTopicIds]
  );

  const visible = items.slice(0, maxVisible);
  const rest = items.slice(maxVisible);

  const filteredAll = items.filter(
    (it) =>
      normalize(it.label).includes(normalize(q)) ||
      normalize(it.desc).includes(normalize(q)) ||
      it.idStr.includes(q.trim())
  );

  return (
    <div className="space-y-3" aria-label="Chọn nhanh danh mục">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-card to-transparent" />
  <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card to-transparent" />

  <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
    <div className="flex flex-nowrap gap-2 md:flex-wrap items-center pl-3">
            {/* Tất cả */}
            <Button
              type="button"
              variant={selectedSet.size ? "outline" : "default"}
              size="sm"
              className={`rounded-full ${
                selectedSet.size ? "" : "border-primary"
              } shadow-sm`}
              onClick={onClear}
            >
              Tất cả
            </Button>

            {visible.map((it) => {
              const active = selectedSet.has(it.idStr);
              return (
                <Button
                  key={it.idStr}
                  type="button"
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full shadow-sm ${
                    active ? "border-primary" : "hover:bg-accent"
                  }`}
                  aria-pressed={active}
                  title={it.desc || it.label}
                  onClick={() => onToggleTopicId(it.idStr)}
                >
                  {it.label}
                </Button>
              );
            })}

            {rest.length > 0 && (
              <Sheet
                open={open}
                onOpenChange={(v) => {
                  setOpen(v);
                  setQ("");
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full shadow-sm gap-1"
                  >
                    Xem tất cả <ChevronDown className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="h-[70vh] overflow-hidden p-0"
                >
                  <div className="flex h-full flex-col">
                    <div className="border-b px-4 py-3">
                      <div className="font-semibold">Danh mục</div>
                      <div className="mt-2 flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          placeholder="Tìm danh mục..."
                          className="w-full bg-transparent text-sm outline-none"
                          aria-label="Tìm danh mục"
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4">
                      <button
                        type="button"
                        className="mb-3 text-sm font-medium rounded-md border px-2 py-1 hover:bg-accent"
                        onClick={() => {
                          onClear();
                          setOpen(false);
                        }}
                      >
                        Bỏ chọn (Tất cả)
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {filteredAll.map((it) => {
                          const checked = selectedSet.has(it.idStr);
                          return (
                            <button
                              key={it.idStr}
                              type="button"
                              title={it.desc || it.label}
                              className={`flex items-center justify-between rounded-lg border p-2 text-left ${
                                checked
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-accent"
                              }`}
                              onClick={() => onToggleTopicId(it.idStr)}
                            >
                              <span className="text-sm">{it.label}</span>
                              <span
                                aria-hidden
                                className={`ml-3 h-3 w-3 rounded-full ${
                                  checked
                                    ? "bg-primary"
                                    : "bg-transparent border border-border"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t p-4 flex items-center justify-end">
                      <Button type="button" onClick={() => setOpen(false)}>
                        Đóng
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Chưa có danh mục để hiển thị.
        </div>
      )}
    </div>
  );
}
