import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagIcon, X, Hash, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BlogSettings({
  categories,
  categoriesError,
  selectedTopics,
  handleTopicToggle,
  tags,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  handleKeyDown,
}: any) {
  return (
    <div className="space-y-8">
      {/* Categories section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Chủ đề bài viết
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Chọn tối đa 3 chủ đề phù hợp với nội dung bài viết của bạn
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoriesError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Không thể tải danh sách chủ đề: {categoriesError}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-3">
            {categories.map((category: any) => {
              const isSelected = selectedTopics.includes(category.id);
              const isDisabled = selectedTopics.length >= 3 && !isSelected;

              return (
                <Badge
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-secondary border-2",
                    isDisabled &&
                      "opacity-50 cursor-not-allowed hover:scale-100"
                  )}
                  onClick={() => {
                    if (!isDisabled) {
                      handleTopicToggle(category.id);
                    }
                  }}
                >
                  {category.cname}
                  {isSelected && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full ml-2" />
                  )}
                </Badge>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i <= selectedTopics.length ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              {selectedTopics.length}/3 chủ đề đã chọn
            </span>
          </div>

          {selectedTopics.length === 0 && (
            <Alert>
                <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />
              <AlertDescription >
                Vui lòng chọn ít nhất một chủ đề cho bài viết của bạn
              </AlertDescription></div>
              
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tags section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Thẻ (Tags)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Thêm các thẻ để giúp độc giả dễ dàng tìm thấy bài viết của bạn
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập thẻ và nhấn Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              onClick={handleAddTag}
              variant="outline"
              disabled={!tagInput.trim() || tags.includes(tagInput.trim())}
            >
              Thêm
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-2 px-3 py-1 group hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <TagIcon className="h-3 w-3" />#{tag}
                    <button
                      className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {tags.length} thẻ đã thêm
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notice */}
      {/* <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              📢
            </div>
            <div className="space-y-1">
              <p className="font-medium">Thông báo cho người theo dõi</p>
              <p className="text-sm text-muted-foreground">
                Khi bạn đăng bài viết, tất cả người theo dõi sẽ nhận được thông
                báo về bài viết mới của bạn.
              </p>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
