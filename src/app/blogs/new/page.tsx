"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useBlog } from "@/hooks/useBlog";

import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadToNuuls } from "@/lib/uploadToImgur";
import { apiService } from "@/lib/api-service";
import { Card } from "@/components/ui/card";

import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogEditor, BlogEditorRef } from "@/components/blog/BlogEditor";
import { BlogSettings } from "@/components/blog/BlogSettings";
import { BlogPublishBar } from "@/components/blog/BlogPublishBar";

export default function NewBlogPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { categories, categoriesLoading, categoriesError } = useBlog();
  const blogEditorRef = useRef<BlogEditorRef>(null);

  // Debug effect to check when ref gets set
  useEffect(() => {
    console.log("blogEditorRef changed:", blogEditorRef.current);
  }, [blogEditorRef.current]);

  // States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [textContent, setTextContent] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    };
    checkAuth();
  }, [isAuthenticated]);

  // Handlers (giữ nguyên logic cũ)
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleTopicToggle = (topicId: number) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleCoverImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setCoverImageFile(file);
    try {
      const urlImage = await uploadToNuuls(file);
      setCoverImage(urlImage);
      toast({
        title: "Upload thành công",
        description: "Ảnh bìa đã được tải lên",
      });
    } catch (error) {
      toast({
        title: "Lỗi upload",
        description: "Không thể tải ảnh lên. Vui lòng thử lại.",
        variant: "destructive",
      });
      setCoverImageFile(null);
      setCoverImage(null);
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverImageFile(null);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast({
        title: "Thiếu tiêu đề",
        description: "Vui lòng nhập tiêu đề cho bài viết",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Thiếu nội dung",
        description: "Vui lòng nhập nội dung cho bài viết",
        variant: "destructive",
      });
      return;
    }

    if (selectedTopics.length === 0) {
      toast({
        title: "Thiếu chủ đề",
        description: "Vui lòng chọn ít nhất một chủ đề cho bài viết",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      const response = await apiService.postBlog(
        title,
        content,
        textContent,
        selectedTopics,
        tags,
        coverImage
      );
      if (response.code === 200) {
        toast({
          title: "🎉 Đăng bài thành công",
          description: "Bài viết của bạn đã được đăng tải",
        });
        router.push("/blogs");
      }
    } catch (error) {
      toast({
        title: "Lỗi đăng bài",
        description: "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Loading state
  if (isLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Đang tải...</h3>
              <p className="text-sm text-muted-foreground">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Auth required
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Yêu cầu đăng nhập</h3>
              <p className="text-muted-foreground mt-2">
                Bạn cần đăng nhập để có thể viết bài
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Đăng Nhập Ngay</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container max-w-6xl mx-auto py-6 px-4">
        <div className="space-y-8">
          {/* Header với gradient */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl -z-10" />
            <Card className="p-6 border-0 shadow-sm backdrop-blur-sm">
              <BlogHeader user={user} />
            </Card>
          </div>

          {/* Main content với card design */}
          <Card className="border-0 shadow-lg backdrop-blur-sm">
            <Tabs defaultValue="editor" className="w-full">
              <div className="border-b bg-muted/30 rounded-t-lg">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 m-4">
                  <TabsTrigger value="editor" className="gap-2">
                    ✏️ Soạn thảo
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2">
                    ⚙️ Cài đặt
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="editor" className="mt-0">
                  <BlogEditor
                    ref={blogEditorRef}
                    title={title}
                    setTitle={setTitle}
                    content={content}
                    textContent={textContent}
                    setTextContent={setTextContent}
                    setContent={setContent}
                    coverImage={coverImage}
                    handleCoverImageChange={handleCoverImageChange}
                    handleRemoveCoverImage={handleRemoveCoverImage}
                  />
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                  <BlogSettings
                    categories={categories}
                    categoriesError={categoriesError}
                    selectedTopics={selectedTopics}
                    handleTopicToggle={handleTopicToggle}
                    tags={tags}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    handleAddTag={handleAddTag}
                    handleRemoveTag={handleRemoveTag}
                    handleKeyDown={handleKeyDown}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </Card>

          {/* Publish bar với gradient */}
          <div className="sticky bottom-0 z-10">
            <Card className="border-0 shadow-xl backdrop-blur-md bg-background/95 p-4">
              <BlogPublishBar
                handlePublish={handlePublish}
                isPublishing={isPublishing}
                hasTitle={!!title.trim()}
                hasContent={!!content.trim()}
                hasTopics={selectedTopics.length > 0}
                mode="new"
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
