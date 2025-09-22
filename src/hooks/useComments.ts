"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { apiService } from "@/lib/api-service";
import type { Comment, UserResponse } from "@/types/api";

const createUserResponse = (u: any): UserResponse => ({
  id: u?.id || "",
  name: u?.name || "",
  avatar: u?.avatar || "",
  email: u?.email || "",
  dob: u?.dob || "",
  gender: u?.gender || "",
});

// fallback nếu comments phẳng (không cần dùng khi API đã trả replies sẵn)
function nestComments(raw: Comment[]): Comment[] {
  const roots = raw.filter((c) => !c.parentId);
  const replies = raw.filter((c) => c.parentId);
  return roots.map((root) => ({
    ...root,
    replies: replies.filter((r) => String(r.parentId) === String(root.id)) || [],
  }));
}

export function useComments(blogId: string, initialComments: Comment[] = []) {
  const { user, isAuthenticated, accessToken } = useAuth();

  // Core states
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [visibleComments, setVisibleComments] = useState(5);

  // Edit/Delete dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: string; content: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Luôn sync token mới nhất
  useEffect(() => {
    apiService.reloadAccessToken();
  }, [accessToken]);

  // ✅ KHỞI TẠO: dùng initialComments (nếu có) để hiện ngay
  useEffect(() => {
    if (initialComments?.length > 0) {
      // Nếu initialComments đã có replies thì dùng luôn, ngược lại nest
      if (initialComments[0].replies !== undefined) {
        setComments(initialComments);
      } else {
        setComments(nestComments(initialComments));
      }
    } else {
      setComments([]); // clear trước khi fetch
    }
  }, [initialComments]);

  // ✅ FETCH TỪ API MỚI: /blog/comment/:pidOrSlug
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!blogId) return;
      try {
        const res = await apiService.getCommentsByPost(blogId);
        const list = Array.isArray(res?.data) ? res.data : [];
        // API đã trả replies sẵn → set thẳng
        if (!cancelled) setComments(list);
      } catch (e: any) {
        if (!cancelled) {
          console.error("fetch comments error:", e);
          toast({
            title: "Không tải được bình luận",
            description: e?.message || "Vui lòng thử lại.",
            variant: "destructive",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blogId]);

  const isOwner = (ur?: UserResponse | null) =>
    !!ur?.id && !!user?.id && String(ur.id) === String(user.id);

  // ===== CREATE
  const handleAddComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;
    try {
      const result = await apiService.createComment({
        content: newComment.trim(),
        pid: blogId,
      });

      if (result.code === 200 && result.data) {
        const responseData = result.data as any;
        const cmt: Comment = {
          id: responseData.id,
          content: responseData.content,
          userResponse: user ? createUserResponse(user) : null,
          leftValue: responseData.leftValue || 0,
          rightValue: responseData.rightValue || 0,
          replies: [],
          createdAt: responseData.createdAt || new Date().toISOString(),
        };
        setComments((prev) => [cmt, ...prev]);
        setNewComment("");
        toast({ title: "Đã đăng bình luận", duration: 1500 });
      } else {
        toast({ title: "Không thể đăng bình luận", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({ title: "Lỗi mạng", description: "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  // ===== REPLY
  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim() || !isAuthenticated) return;
    try {
      const result = await apiService.createComment({
        content: replyContent.trim(),
        pid: blogId,
        parentId,
      });

      if (result.code === 200 && result.data) {
        const responseData = result.data as any;
        const newReply: Comment = {
          id: responseData.id,
          content: responseData.content,
          userResponse: user ? createUserResponse(user) : null,
          leftValue: responseData.leftValue || 0,
          rightValue: responseData.rightValue || 0,
          replies: [],
          createdAt: responseData.createdAt || new Date().toISOString(),
          parentId,
        };

        setComments((prev) =>
          prev.map((comment) => {
            if (String(comment.id) === String(parentId)) {
              return {
                ...comment,
                replies: Array.isArray(comment.replies)
                  ? [...comment.replies, newReply]
                  : [newReply],
              };
            }
            return comment;
          })
        );

        setReplyingTo(null);
        setReplyContent("");
        toast({ title: "Đã trả lời", duration: 1200 });
      } else {
        toast({ title: "Không thể trả lời", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({ title: "Lỗi mạng", description: "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  // ===== EDIT
  const openEdit = (id: string, content: string) => {
    setEditTarget({ id, content });
    setEditValue(content);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editTarget || !editValue.trim()) return;
    try {
      const json = await apiService.updateComment(editTarget.id, {
        content: editValue.trim(),
        pid: blogId,
      });
      if (json.code === 200) {
        setComments((prev) =>
          prev.map((c) => {
            if (String(c.id) === String(editTarget.id)) return { ...c, content: editValue.trim() };
            if (c.replies?.length) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  String(r.id) === String(editTarget.id) ? { ...r, content: editValue.trim() } : r
                ),
              };
            }
            return c;
          })
        );
        toast({ title: "Đã cập nhật bình luận", duration: 1200 });
        setEditOpen(false);
        setEditTarget(null);
        setEditValue("");
      } else {
        toast({ title: "Không thể cập nhật", description: json.message, variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Lỗi mạng", description: "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  // ===== DELETE
  const openDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const json = await apiService.deleteComment(deleteTargetId);
      if (json.code === 200) {
        setComments((prev) =>
          prev
            .map((c) => {
              if (String(c.id) === String(deleteTargetId)) return null as any;
              if (c.replies?.length) {
                return { ...c, replies: c.replies.filter((r) => String(r.id) !== String(deleteTargetId)) };
              }
              return c;
            })
            .filter(Boolean)
        );
        toast({ title: "Đã xoá bình luận", duration: 1200 });
      } else {
        toast({ title: "Không thể xoá", description: json.message, variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Lỗi mạng", description: "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const loadMoreComments = () => setVisibleComments((prev) => prev + 5);

  return {
    // data
    comments,
    user,
    isAuthenticated,

    // compose states
    newComment,
    setNewComment,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    expandedReplies,
    visibleComments,

    // helpers
    isOwner,
    toggleReplies,
    loadMoreComments,

    // edit/delete dialog states
    editOpen,
    setEditOpen,
    editTarget,
    setEditTarget,
    editValue,
    setEditValue,
    confirmOpen,
    setConfirmOpen,

    // actions
    handleAddComment,
    handleAddReply,
    openEdit,
    submitEdit,
    openDelete,
    confirmDelete,
  };
}
