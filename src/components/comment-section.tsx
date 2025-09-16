"use client";

import { useComments } from "@/hooks/useComments"; // <— thêm
import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import type { Comment } from "@/types/api";

// Dialogs
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useBlogDetail } from "@/hooks/useBlogDetail";

interface CommentSectionProps {
  blogId: string;
  comments: Comment[];
}

export function CommentSection({ blogId, comments: initialComments }: CommentSectionProps) {
  const {
    comments,
    user,
    isAuthenticated,

    newComment,
    setNewComment,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    expandedReplies,
    visibleComments,

    isOwner,
    toggleReplies,
    loadMoreComments,

    editOpen,
    setEditOpen,
    editTarget,
    setEditTarget,
    editValue,
    setEditValue,
    confirmOpen,
    setConfirmOpen,

    handleAddComment,
    handleAddReply,
    openEdit,
    submitEdit,
    openDelete,
    confirmDelete,
  } = useComments(blogId, initialComments);

  const {blog} = useBlogDetail(blogId)
  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">
            Bình Luận ({blog?.commentsCount || comments.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Input user */}
          {isAuthenticated ? (
            <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex-wrap sm:flex-nowrap">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage
                  src={user?.avatar || "/placeholder.svg"}
                  alt={user?.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                  {user?.name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-[220px] space-y-3">
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

          {/* Danh sách */}
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
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
                  {/* Main comment row */}
                  <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 flex-wrap sm:flex-nowrap">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage
                        src={comment.userResponse?.avatar || "/placeholder.svg"}
                        alt={comment.userResponse?.name || "Ẩn danh"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white font-semibold">
                        {comment.userResponse?.name
                          ? comment.userResponse.name.substring(0, 2).toUpperCase()
                          : "??"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-[220px] space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">
                            {comment.userResponse?.name || "Người dùng ẩn danh"}
                          </h4>
                          <span className="text-xs text-slate-500">
                            {formatDate(comment.createdAt || new Date().toISOString())}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
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
                          {isOwner(comment.userResponse) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-amber-600"
                                onClick={() => openEdit(String(comment.id), comment.content)}
                              >
                                Sửa
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-red-600"
                                onClick={() => openDelete(String(comment.id))}
                              >
                                Xoá
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  {/* Reply Input */}
                  {replyingTo === String(comment.id) && (
                    <div className="ml-0 sm:ml-14 bg-slate-50 rounded-xl p-4 border border-slate-100">
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
                        <div className="flex-1 min-w-[180px] space-y-3">
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
                    <div className="ml-0 sm:ml-14 space-y-4">
                      {(expandedReplies[String(comment.id)]
                        ? comment.replies
                        : comment.replies.slice(0, 2)
                      ).map((reply) => (
                        <div
                          key={reply.id}
                          className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 flex-wrap sm:flex-nowrap"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={reply.userResponse?.avatar || "/placeholder.svg"}
                              alt={reply.userResponse?.name || "Ẩn danh"}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white text-sm font-semibold">
                              {reply.userResponse?.name
                                ? reply.userResponse.name.substring(0, 2).toUpperCase()
                                : "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-[180px] space-y-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-sm text-slate-900">
                                  {reply.userResponse?.name || "Người dùng ẩn danh"}
                                </h5>
                                <span className="text-xs text-slate-500">
                                  {formatDate(reply.createdAt || new Date().toISOString())}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Cho phép reply vào reply nếu muốn */}
                                {/* {isAuthenticated && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setReplyingTo(
                                        replyingTo === String(reply.id)
                                          ? null
                                          : String(reply.id)
                                      )
                                    }
                                    className="text-slate-600 hover:text-blue-600 -ml-2"
                                  >
                                    Trả lời
                                  </Button>
                                )} */}
                                {isOwner(reply.userResponse) && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-600 hover:text-amber-600"
                                      onClick={() => openEdit(String(reply.id), reply.content)}
                                    >
                                      Sửa
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-600 hover:text-red-600"
                                      onClick={() => openDelete(String(reply.id))}
                                    >
                                      Xoá
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
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

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sửa bình luận</DialogTitle>
            <DialogDescription>Chỉnh sửa nội dung và lưu thay đổi.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[120px]"
            placeholder="Nội dung bình luận..."
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button onClick={submitEdit} disabled={!editValue.trim()}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá bình luận?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bình luận sẽ bị xoá vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
