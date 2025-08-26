"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useBlog } from "@/hooks/useBlog";
import { useBlogDetail } from "@/hooks/useBlogDetail";

import { Loader2, ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadToNuuls } from "@/lib/uploadToImgur";
import { Card } from "@/components/ui/card";

import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogEditor } from "@/components/blog/BlogEditor";
import { BlogSettings } from "@/components/blog/BlogSettings";
import { BlogPublishBar } from "@/components/blog/BlogPublishBar";
import { apiService } from "@/lib/api-service";

interface EditBlogPageProps {
  params: { id: string };
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const {
    blog,
    isLoading,
    error,
    isOwner,
    permissions,
    updateBlog,
    isUpdating,
    retry,
  } = useBlogDetail(params.id, {
    autoFetch: true,
  });

  const { categories, categoriesLoading, categoriesError } = useBlog();

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // UI states
  const [hasChanges, setHasChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const isInitialized = useRef(false);
  const hasLogged = useRef(false);

  useEffect(() => {
    if (blog && categories && categories.length > 0 && !isInitialized.current) {
      if (!hasLogged.current) {
        console.log("✅ Blog data loaded:", blog.title);
        hasLogged.current = true;
      }

      console.log("🔄 Initializing form with blog data:", {
        blogId: blog.id,
        title: blog.title,
        contentLength: blog.content?.length,
        categories: blog.category,
        hashtags: blog.hashtags,
        cover: blog.cover,
      });

      setTitle(blog.title || "");
      setContent(blog.rawContent || blog.content || "");
      setCoverImage(blog.cover || null);
      setTags(blog.hashtags || []);

      if (blog.category && categories.length > 0) {
        const categoryIds = blog.category
          .map((catName) => {
            const found = categories.find((cat) => cat.cname === catName);
            if (!found) {
              console.warn(`⚠️ Category not found: ${catName}`);
            }
            return found?.id;
          })
          .filter((id) => id !== undefined) as number[];

        console.log("🏷️ Mapped categories:", {
          names: blog.category,
          ids: categoryIds,
        });

        setSelectedTopics(categoryIds);
      }

      isInitialized.current = true;
    }
  }, [blog, categories]); 
  useEffect(() => {
    if (isInitialized.current && blog && categories) {
      const originalCategoryIds =
        blog.category
          ?.map(
            (catName) => categories.find((cat) => cat.cname === catName)?.id
          )
          ?.filter((id) => id !== undefined) || [];

      const hasFormChanges =
        title !== (blog.title || "") ||
        content !== (blog.rawContent || blog.content || "") ||
        coverImage !== (blog.cover || null) ||
        JSON.stringify(tags.sort()) !==
          JSON.stringify((blog.hashtags || []).sort()) ||
        JSON.stringify(selectedTopics.sort()) !==
          JSON.stringify(originalCategoryIds.sort());

      setHasChanges(hasFormChanges);
    }
  }, [title, content, coverImage, tags, selectedTopics, blog, categories]);

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
      toast({
        title: "Đang upload...",
        description: "Vui lòng đợi trong giây lát",
      });

      const urlImage = await uploadToNuuls(file);
      setCoverImage(urlImage);

      toast({
        title: "✅ Upload thành công",
        description: "Ảnh bìa đã được cập nhật",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "❌ Lỗi upload",
        description: "Không thể tải ảnh lên. Vui lòng thử lại.",
        variant: "destructive",
      });
      setCoverImageFile(null);
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverImageFile(null);
  };

  const handleUpdate = async () => {
    if (!isOwner || !permissions.canEdit) {
      toast({
        title: "❌ Không có quyền",
        description: "Bạn không có quyền chỉnh sửa bài viết này",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!title.trim()) {
      toast({
        title: "❌ Thiếu tiêu đề",
        description: "Vui lòng nhập tiêu đề cho bài viết",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "❌ Thiếu nội dung",
        description: "Vui lòng nhập nội dung cho bài viết",
        variant: "destructive",
      });
      return;
    }

    if (selectedTopics.length === 0) {
      toast({
        title: "❌ Thiếu chủ đề",
        description: "Vui lòng chọn ít nhất một chủ đề cho bài viết",
        variant: "destructive",
      });
      return;
    }

    console.log("💾 Updating blog with data:", {
      title: title.trim(),
      contentLength: content.trim().length,
      selectedTopics,
      tags,
      coverImage,
    });

    // ✅ SỬ DỤNG updateBlog TỪ HOOK
    const result = await updateBlog({
      title: title.trim(),
      content: content.trim(),
      cids: selectedTopics,
      hashtags: tags,
      cover: coverImage,
    });

    if (result.success) {
      toast({
        title: "✅ Cập nhật thành công",
        description: "Bài viết đã được cập nhật",
      });
      setHasChanges(false); // Reset changes flag
      // Optionally redirect back to blog detail
      // router.push(`/blog/${params.id}`)
    } else {
      toast({
        title: "❌ Lỗi cập nhật",
        description: result.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    }
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
  if (isLoading || categoriesLoading || !isInitialized.current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Đang tải bài viết...</h3>
              <p className="text-sm text-muted-foreground">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Không thể tải bài viết</AlertTitle>
              <AlertDescription>
                {error || "Bài viết không tồn tại hoặc đã bị xóa"}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={retry} variant="outline" className="flex-1">
                Thử lại
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/blogs">Quay lại</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Permission check
  if (!isAuthenticated || !isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Không có quyền truy cập</AlertTitle>
              <AlertDescription>
                {!isAuthenticated
                  ? "Bạn cần đăng nhập để chỉnh sửa bài viết"
                  : "Bạn không có quyền chỉnh sửa bài viết này"}
              </AlertDescription>
            </Alert>
            {/* <Button asChild variant="outline" className="w-full">
              <Link href={`/blogs/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại bài viết
              </Link>
            </Button> */}
            <Button variant="outline" asChild className="mt-8">
              <Link href={`/blogs/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Link>
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
          {/* Header với navigation và status */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/10 rounded-2xl -z-10" />
            <Card className="p-6 border-0 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" asChild className="mt-8">
              <Link href={`/blogs/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Link>
            </Button>
                  <div className="h-6 w-px bg-border" />
                  <div>
                    <h1 className="text-2xl font-bold">Chỉnh sửa bài viết</h1>
                    <p className="text-sm text-muted-foreground">
                      {blog.title}
                    </p>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-3">
                  {hasChanges && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      Có thay đổi
                    </span>
                  )}
                  {isUpdating && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Đang lưu...</span>
                    </div>
                  )}
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Bài viết của bạn
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main content */}
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
                    title={title}
                    setTitle={setTitle}
                    content={content}
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

          {/* Update bar */}
          <div className="sticky bottom-0 z-10">
            <Card className="border-0 shadow-xl backdrop-blur-md bg-background/95 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {hasChanges ? "Có thay đổi chưa lưu" : "Không có thay đổi"}
                  </span>
                  <span>
                    Cập nhật lần cuối:{" "}
                    {new Date(blog.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </Card>
          </div>
          <div className="sticky bottom-0 z-10">
            <Card className="border-0 shadow-xl backdrop-blur-md bg-background/95 p-4">
              <BlogPublishBar
                handlePublish={handleUpdate}
                hasTitle={!!title.trim()}
                hasContent={!!content.trim()}
                hasTopics={selectedTopics.length > 0}
                mode="edit"
                hasChanges={hasChanges}
                cancelHref={`/blog/${params.id}`}
                isUpdating={isUpdating}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
