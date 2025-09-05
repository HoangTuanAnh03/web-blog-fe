import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useImperativeHandle, forwardRef } from "react";
import { TinyMCEEditorRef } from "@/components/tinymce-editor";

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
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  textContent: string;
  setTextContent: (textContent: string) => void;
  coverImage: string | null;
  handleCoverImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCoverImage: () => void;
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
    },
    ref
  ) => {
    const editorRef = useRef<TinyMCEEditorRef>(null);

    useImperativeHandle(
      ref,
      () => {
        console.log(
          "BlogEditor useImperativeHandle called, editorRef.current:",
          editorRef.current
        );
        return {
          getTextContent: () => {
            console.log(
              "getTextContent called, editorRef.current:",
              editorRef.current
            );
            return editorRef.current?.getTextContent() || "";
          },
        };
      },
      []
    );

    return (
      <div className="space-y-8">
        {/* Title input */}
        <div className="space-y-3">
          <Label htmlFor="title" className="text-base font-semibold">
            📝 Tiêu đề bài viết
          </Label>
          <Input
            id="title"
            placeholder="Nhập một tiêu đề hấp dẫn cho bài viết của bạn..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg h-12 rounded-xl border-2 focus:border-primary/50 transition-colors"
          />
          <p className="text-xs text-muted-foreground">
            {title.length}/100 ký tự
          </p>
        </div>

        {/* Cover image */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            🖼️ Ảnh bìa
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Tùy chọn)
            </span>
          </Label>

          <Card className="overflow-hidden">
            <CardContent className="p-4">
              {coverImage ? (
                <div className="relative group">
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src={coverImage}
                      alt="Cover preview"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveCoverImage}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Xóa ảnh
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center text-center p-8 hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Thêm ảnh bìa</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                    Ảnh bìa sẽ giúp bài viết của bạn nổi bật và thu hút độc giả
                    hơn
                  </p>
                  <Button variant="outline" asChild>
                    <label className="cursor-pointer gap-2">
                      <Upload className="h-4 w-4" />
                      Chọn ảnh từ máy tính
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverImageChange}
                      />
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Hỗ trợ JPG, PNG, tối đa 5MB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content editor */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            ✍️ Nội dung bài viết
          </Label>

          {/* Debug button for testing text extraction */}
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Debug button clicked");
                console.log("editorRef.current:", editorRef.current);

                if (!editorRef.current) {
                  alert("Editor ref is null! TinyMCE might not be loaded yet.");
                  return;
                }

                const textContent = editorRef.current?.getTextContent() || "";
                const htmlContent = editorRef.current?.getContent() || "";
                console.log("HTML Content:", htmlContent);
                console.log("Text Content:", textContent);
                alert(`HTML: ${htmlContent}\n\nText: ${textContent}`);
              }}
            >
              🧪 Test Text Extraction
            </Button>
          </div>

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
