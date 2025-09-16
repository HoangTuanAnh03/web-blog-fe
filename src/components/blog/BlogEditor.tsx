"use client";

import { useRef, useMemo, useState, useImperativeHandle, forwardRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageIcon, Upload, X, Loader2, Info, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TinyMCEEditorRef } from "@/components/tinymce-editor";
import { cn } from "@/lib/utils";

/* Lazy-load TinyMCE (giữ nguyên) */
const TinyMCEEditor = dynamic(() => import("@/components/tinymce-editor"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-xl p-6 h-[500px] flex items-center justify-center bg-muted/30">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm font-medium">Đang tải trình soạn thảo...</p>
      </div>
    </div>
  ),
});

export interface BlogEditorRef {
  getTextContent: () => string;
}

interface BlogEditorProps {
  /* API hiện có */
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  textContent: string;
  setTextContent: (textContent: string) => void;
  coverImage: string | null;
  handleCoverImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCoverImage: () => void;

  /* Tuỳ chọn mới (không bắt buộc) */
  maxTitleLen?: number;             // mặc định 100
  coverHint?: string;               // hint hiển thị dưới dropzone
  onCoverFile?: (file: File) => void; // nếu muốn drag&drop ảnh bìa
  onSaveDraft?: () => void;         // nút "Lưu nháp"
  savingDraft?: boolean;            // trạng thái lưu nháp
  className?: string;               // thêm class ngoài cùng
}

export const BlogEditor = forwardRef<BlogEditorRef, BlogEditorProps>(
  (
    {
      title,
      setTitle,
      content,
      setContent,
      textContent,
      setTextContent,
      coverImage,
      handleCoverImageChange,
      handleRemoveCoverImage,

      /* optional */
      maxTitleLen = 100,
      coverHint = "Ảnh ngang (16:9) sẽ hiển thị đẹp nhất. Hỗ trợ JPG/PNG, tối đa 5MB.",
      onCoverFile,
      onSaveDraft,
      savingDraft = false,
      className,
    },
    ref
  ) => {
    const editorRef = useRef<TinyMCEEditorRef>(null);
    const [dragOver, setDragOver] = useState(false);
    const [coverError, setCoverError] = useState<string | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        getTextContent: () => editorRef.current?.getTextContent() || "",
      }),
      []
    );

    const titleCount = useMemo(() => title.length, [title]);
    const titleTooLong = titleCount > maxTitleLen;
    const safeCover = coverImage && coverImage !== "string" ? coverImage : "";

    /* DnD cho ảnh bìa (nếu dev truyền onCoverFile) */
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      setCoverError(null);

      if (!onCoverFile) return; // không làm gì nếu dev không cung cấp

      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      // Validate nhẹ nhàng (dev có thể tự validate sâu ở parent)
      const isImage = file.type.startsWith("image/");
      const maxBytes = 5 * 1024 * 1024;
      if (!isImage) {
        setCoverError("Vui lòng chọn tệp ảnh (JPG/PNG).");
        return;
      }
      if (file.size > maxBytes) {
        setCoverError("Ảnh quá lớn. Giới hạn 5MB.");
        return;
      }
      onCoverFile(file);
    };

    const CoverEmpty = (
      <div
        className={cn(
          "aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-8 transition-colors",
          dragOver ? "border-primary/60 bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragOver={(e) => {
          if (!onCoverFile) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">Thêm ảnh bìa</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Kéo & thả ảnh vào đây {onCoverFile ? "hoặc" : ""} chọn từ máy tính
        </p>

        <Button variant="outline" asChild>
          <label className="cursor-pointer gap-2">
            <Upload className="h-4 w-4" />
            Chọn ảnh từ máy tính
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setCoverError(null);
                handleCoverImageChange(e);
              }}
            />
          </label>
        </Button>

        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <Info className="h-3.5 w-3.5" />
          {coverHint}
        </p>

        {coverError && (
          <p className="mt-3 text-xs text-destructive" role="alert" aria-live="polite">
            {coverError}
          </p>
        )}
      </div>
    );

    return (
      <div className={cn("space-y-8", className)}>
        {/* Title */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="title" className="text-base font-semibold">
              📝 Tiêu đề bài viết
            </Label>

            {/* Lưu nháp (tùy chọn) */}
            {onSaveDraft && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-full"
                onClick={onSaveDraft}
                disabled={savingDraft}
              >
                {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Lưu nháp
              </Button>
            )}
          </div>

          <Input
            id="title"
            placeholder="Nhập một tiêu đề hấp dẫn cho bài viết của bạn..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn(
              "text-lg h-12 rounded-xl border-2 focus:border-primary/50 transition-colors",
              titleTooLong && "border-red-300 focus:border-red-400"
            )}
            aria-invalid={titleTooLong}
            aria-describedby="title-count"
          />

          <div className="flex items-center justify-between">
            <p id="title-count" className={cn("text-xs", titleTooLong ? "text-destructive" : "text-muted-foreground")}>
              {titleCount}/{maxTitleLen} ký tự
            </p>
            {titleTooLong && (
              <p className="text-xs text-destructive" role="alert" aria-live="polite">
                Tiêu đề quá dài. Hãy rút ngắn để hiển thị đẹp trên thẻ bài viết.
              </p>
            )}
          </div>
        </div>

        {/* Cover image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">
              🖼️ Ảnh bìa <span className="text-sm font-normal text-muted-foreground ml-2">(Tùy chọn)</span>
            </Label>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-4">
              {safeCover ? (
                <div className="relative group">
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src={safeCover}
                      alt="Ảnh bìa"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 70vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute right-3 top-3 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveCoverImage}
                        className="gap-2 shadow"
                        aria-label="Xóa ảnh bìa"
                      >
                        <X className="h-4 w-4" />
                        Xóa ảnh
                      </Button>
                    </div>
                  </div>
                  {coverHint && (
                    <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" />
                      {coverHint}
                    </p>
                  )}
                </div>
              ) : (
                CoverEmpty
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content editor */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">✍️ Nội dung bài viết</Label>

          {/* Dev-only debug */}
          {process.env.NODE_ENV !== "production" && (
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!editorRef.current) {
                    alert("Editor chưa sẵn sàng.");
                    return;
                  }
                  const htmlContent = editorRef.current?.getContent() || "";
                  const textOnly = editorRef.current?.getTextContent() || "";
                  // eslint-disable-next-line no-alert
                  alert(`HTML:\n${htmlContent}\n\nTEXT:\n${textOnly}`);
                }}
              >
                🧪 Test Text Extraction
              </Button>
            </div>
          )}

          <div className="rounded-xl overflow-hidden border-2 focus-within:border-primary/50 transition-colors">
            <TinyMCEEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              onTextChange={setTextContent}
              height={500}
              placeholder="Hãy bắt đầu viết câu chuyện của bạn..."
            />
          </div>
        </div>
      </div>
    );
  }
);

BlogEditor.displayName = "BlogEditor";
