"use client";

import { useRef, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, ClipboardPaste, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

function isMediumHost(u: URL) {
  return u.hostname === "medium.com" || u.hostname.endsWith(".medium.com");
}

function normalizeMediumUrl(raw: string) {
  const v = raw?.trim();
  if (!v) return "";
  try {
    const has = /^https?:\/\//i.test(v);
    const u = new URL(has ? v : `https://${v}`);
    if (!isMediumHost(u)) return "";
    return u.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

export function LinkInput({
  onAddOne,
  placeholder = "Nhập link tác giả Medium…",
  disabled,
}: {
  onAddOne: (url: string) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = useMemo(() => normalizeMediumUrl(value), [value]);
  const isInvalid = value.trim().length > 0 && !normalized;

  const addNow = async () => {
    if (!normalized) return;
    await onAddOne(normalized);
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1 flex items-center gap-2 rounded-2xl border border-border/70 bg-card/80 backdrop-blur px-3 py-2 shadow-sm">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-accent/40">
            <Link2 className="h-5 w-5 text-primary" />
          </span>
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNow();
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            aria-label="Nhập link tác giả Medium"
            aria-invalid={isInvalid}
            className={cn(
              "h-11 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0",
              isInvalid && "focus-visible:ring-2 focus-visible:ring-destructive/40"
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="rounded-full min-w-24"
            onClick={addNow}
            disabled={disabled || !normalized}
          >
            <Plus className="h-4 w-4 mr-2" /> Thêm
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={disabled}
                onClick={async () => {
                  try {
                    const txt = await navigator.clipboard.readText();
                    if (!txt) return;
                    const firstValid =
                      txt
                        .split(/[\n,\s]+/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map(normalizeMediumUrl)
                        .find(Boolean) || "";
                    setValue(firstValid || txt);
                  } catch {}
                }}
              >
                <ClipboardPaste className="h-4 w-4 mr-2" /> Dán
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dán link Medium từ clipboard</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {isInvalid && (
        <div className="text-xs text-destructive/90 mt-1">
          Chỉ chấp nhận đường dẫn Medium hợp lệ (vd: https://medium.com/@tacgia).
        </div>
      )}
    </TooltipProvider>
  );
}
