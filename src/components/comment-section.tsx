"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { formatDate } from "@/lib/utils";
import type { Comment, UserResponse } from "@/types/api";

interface CommentSectionProps {
  blogId: string;
  comments: Comment[];
}

/** Comment section controller and layout */
export function CommentSection({
  blogId,
  comments: initialComments,
}: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();

  // State for comments, composing, and replies
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});
  const [visibleComments, setVisibleComments] = useState(5);

  // Helper function to create UserResponse with all required fields
  const createUserResponse = (user: any): UserResponse => {
    return {
      id: user?.id || "",
      name: user?.name || "",
      avatar: user?.avatar || "",
      email: user?.email || "",
      dob: user?.dob || "",
      gender: user?.gender || "",
    };
  };

  /** Process raw comments to tree (if needed) */
  useEffect(() => {
    function nestComments(raw: Comment[]): Comment[] {
      const roots = raw.filter((c) => !c.parentId);
      const replies = raw.filter((c) => c.parentId);
      return roots.map((root) => ({
        ...root,
        replies:
          replies.filter((r) => String(r.parentId) === String(root.id)) || [],
      }));
    }

    if (
      initialComments.length > 0 &&
      initialComments[0].replies !== undefined
    ) {
      setComments(initialComments);
    } else {
      setComments(nestComments(initialComments));
    }
  }, [initialComments]);

  /** Add new top-level comment */
  const handleAddComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      const response = await fetch(
        "https://api.sportbooking.site/blog/comment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              JSON.parse(window.localStorage.getItem("authState") || "{}")
                ?.accessToken || ""
            }`,
          },
          body: JSON.stringify({
            content: newComment.trim(),
            pid: blogId,
          }),
        }
      );

      const result = await response.json();

      if (result.code === 200 && result.data) {
        const comment: Comment = {
          id: result.data.id,
          content: result.data.content,
          userResponse: user ? createUserResponse(user) : null, // ← Fix: Use helper function
          leftValue: result.data.leftValue || 0,
          rightValue: result.data.rightValue || 0,
          replies: [],
          createdAt: result.data.createdAt || new Date().toISOString(),
        };

        setComments((prev) => [comment, ...prev]);
        setNewComment("");
      } else {
        console.error("Failed to add comment:", result.message);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  /** Add reply to parent comment */
  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim() || !isAuthenticated) return;

    try {
      const response = await fetch(
        "https://api.sportbooking.site/blog/comment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              JSON.parse(window.localStorage.getItem("authState") || "{}")
                ?.accessToken || ""
            }`,
          },
          body: JSON.stringify({
            content: replyContent.trim(),
            pid: blogId,
            parentId,
          }),
        }
      );

      const result = await response.json();

      if (result.code === 200 && result.data) {
        const newReply: Comment = {
          id: result.data.id,
          content: result.data.content,
          userResponse: user ? createUserResponse(user) : null,
          leftValue: result.data.leftValue || 0,
          rightValue: result.data.rightValue || 0,
          replies: [],
          createdAt: result.data.createdAt || new Date().toISOString(),
          parentId,
        };

        setComments((prev) => {
          // Kiểm tra prev có phải mảng
          if (!Array.isArray(prev)) return prev;

          return prev.map((comment) => {
            // So sánh ID an toàn
            if (String(comment.id) === String(parentId)) {
              return {
                ...comment,
                // Kiểm tra replies trước khi spread
                replies: Array.isArray(comment.replies)
                  ? [...comment.replies, newReply]
                  : [newReply],
              };
            }
            return comment; // Giữ nguyên comment không được update
          });
        });

        setReplyingTo(null);
        setReplyContent("");
      } else {
        console.error("Failed to add reply:", result.message);
      }
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  /** Toggle showing all replies for a comment */
  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  /** Show more comments */
  const loadMoreComments = () => setVisibleComments((prev) => prev + 5);

  /** RENDER */
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">
          Bình Luận ({comments.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Input */}
        {isAuthenticated ? (
          <div className="flex gap-4 p-4 bg-slate-50 rounded-xl">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage
                src={user?.avatar || "/placeholder.svg"}
                alt={user?.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                {user?.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Chia sẻ suy nghĩ của bạn..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] bg-white border-slate-200"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-6"
                >
                  Đăng bình luận
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-slate-900 mb-2">
              Tham gia thảo luận
            </h3>
            <p className="text-slate-600 mb-4">
              Đăng nhập để chia sẻ ý kiến của bạn
            </p>
            <Button asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Chưa có bình luận nào
            </h3>
            <p className="text-slate-600">
              Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.slice(0, visibleComments).map((comment) => (
              <div key={comment.id} className="space-y-4">
                {/* Main comment */}
                <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage
                      src={comment.userResponse?.avatar || "/placeholder.svg"}
                      alt={comment.userResponse?.name || "Ẩn danh"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white font-semibold">
                      {comment.userResponse?.name
                        ? comment.userResponse.name
                            .substring(0, 2)
                            .toUpperCase()
                        : "??"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {comment.userResponse?.name || "Người dùng ẩn danh"}
                      </h4>
                      <span className="text-xs text-slate-500">
                        {formatDate(
                          comment.createdAt || new Date().toISOString()
                        )}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                      {comment.content}
                    </p>

                    {isAuthenticated && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === String(comment.id)
                              ? null
                              : String(comment.id)
                          )
                        }
                        className="text-slate-600 hover:text-blue-600 -ml-2"
                      >
                        Trả lời
                      </Button>
                    )}
                  </div>
                </div>

                {/* Reply Input */}
                {replyingTo === String(comment.id) && (
                  <div className="ml-14 bg-slate-50 rounded-xl p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.avatar || "/placeholder.svg"}
                          alt={user?.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                          {user?.name?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Viết câu trả lời..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[60px] bg-white border-slate-200"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                            size="sm"
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={() => handleAddReply(String(comment.id))}
                            disabled={!replyContent.trim()}
                            size="sm"
                          >
                            Trả lời
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-14 space-y-4">
                    {(expandedReplies[String(comment.id)]
                      ? comment.replies
                      : comment.replies.slice(0, 2)
                    ).map((reply) => (
                      <div
                        key={reply.id}
                        className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              reply.userResponse?.avatar || "/placeholder.svg"
                            }
                            alt={reply.userResponse?.name || "Ẩn danh"}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white text-sm font-semibold">
                            {reply.userResponse?.name
                              ? reply.userResponse.name
                                  .substring(0, 2)
                                  .toUpperCase()
                              : "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-sm text-slate-900">
                              {reply.userResponse?.name || "Người dùng ẩn danh"}
                            </h5>
                            <span className="text-xs text-slate-500">
                              {formatDate(
                                reply.createdAt || new Date().toISOString()
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Show More Replies Button */}
                    {comment.replies.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReplies(String(comment.id))}
                        className="text-blue-600 hover:text-blue-800 ml-11"
                      >
                        {expandedReplies[String(comment.id)]
                          ? "Ẩn bớt trả lời"
                          : `Xem thêm ${comment.replies.length - 2} trả lời`}
                      </Button>
                    )}
                  </div>
                )}

                <Separator className="last:hidden" />
              </div>
            ))}

            {/* Show More Comments Button */}
            {comments.length > visibleComments && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMoreComments}
                  className="px-8"
                >
                  Xem thêm bình luận ({comments.length - visibleComments} còn
                  lại)
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
