import {
  ApiResponse,
  CategoryResponse,
  FollowStatsResponse,
  Notification,
  PageResponse,
  PostResponse,
  PostSummaryAIResponse,
  PostSummaryResponse,
  ToggleFollowResponse,
  UserResponse,
  UserUpdateRequest,
  ChatbotRequest,
  ChatbotResponse,
  Comment,
  MediumLink,
} from "@/types/api";

class ApiService {
  private static instance: ApiService | undefined;
  private baseUrl = "https://api.sportbooking.site";
  private accessToken = "";
  private constructor() {
    this.loadAccessToken();
  }

  private loadAccessToken() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("authState");
    if (!raw) { this.accessToken = ""; return; }
    const parsed = JSON.parse(raw);
    this.accessToken = parsed?.accessToken || "";
  } catch {
    this.accessToken = "";
  }
}

  public reloadAccessToken() {
    this.loadAccessToken();
  }

  public clearAccessToken() {
    this.accessToken = "";
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async fetchApi<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  async getUserFollowStats(userId: string) {
    return this.fetchApi<ApiResponse<FollowStatsResponse>>(
      `/blog/follow/${userId}`
    );
  }

  async getUserBlogs(userId: string, page = 0) {
    return this.fetchApi<ApiResponse<PageResponse<PostSummaryResponse>>>(
      `/blog/post/user/${userId}?page=${page}`
    );
  }

  async checkFollowStatus(userId: string, pid: string) {
    if (pid != "") {
      return this.fetchApi<ApiResponse<boolean>>(
        `/blog/follow/isFollow?pid=${pid}`
      );
    }
    return this.fetchApi<ApiResponse<boolean>>(
      `/blog/follow/isFollow?userId=${userId}`
    );
  }

  async toggleFollow(userId: string, isFollowing: boolean) {
    return this.fetchApi<ApiResponse<ToggleFollowResponse>>(
      `/blog/follow/${userId}`,
      {
        method: "POST",
      }
    );
  }

  async getBlogSummary(postId: string) {
    return this.fetchApi<ApiResponse<PostSummaryAIResponse>>(
      `/blog/post/summary?pid=${postId}`
    );
  }

  async postBlog(
    title: string,
    content: string,
    textContent: string,
    cids: number[],
    hashtags: string[],
    cover: string | null
  ) {
    return this.fetchApi<ApiResponse<PostSummaryAIResponse>>(`/blog/post`, {
      method: "POST",
      body: JSON.stringify({
        title: title,
        content: content,
        cids: cids,
        textContent: textContent,
        hashtags: hashtags,
        cover: cover,
      }),
    });
  }

  async getBlogList(page = 0, size = 10, filters?: any) {
    let url = `/blog/post?page=${page}`;

    if (filters) {
      if (filters.query) {
        url += `&search=${encodeURIComponent(filters.query)}`;
      }
      if (filters.topics && filters.topics.length > 0) {
        url += `&categories=${encodeURIComponent(filters.topics.join(","))}`;
      }
    }

    return this.fetchApi<ApiResponse<PageResponse<PostSummaryResponse>>>(url);
  }

  async getTopics() {
    return this.fetchApi<{
      code: number;
      message: string;
      data: CategoryResponse[];
    }>(`/blog/category`);
  }

  async getBlogDetail(id: string) {
    return this.fetchApi<ApiResponse<PostResponse>>(`/blog/post/${id}`);
  }

  async fetchNotifications() {
    return this.fetchApi<ApiResponse<Notification[]>>(`/blog/notification`);
  }

  async updateUser(user: UserUpdateRequest) {
    return this.fetchApi<ApiResponse<UserResponse>>(`/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: user.name,
        dob: user.dob,
        gender: user.gender,
        avatar: user.avatar ?? "",
      }),
    });
  }

  async getUserById(uid: string) {
    return this.fetchApi<ApiResponse<UserResponse>>(
      `/users/fetchUserById/${uid}`
    );
  }

  async getMyInf() {
    return this.fetchApi<ApiResponse<UserUpdateRequest>>(`/users/my-info`);
  }

  async deleteBlog(postId: string) {
    return this.fetchApi<ApiResponse<any>>(`/blog/post/delete/${postId}`, {
      method: "DELETE",
    });
  }

  async updateBlog(
    postId: string,
    updateData: {
      title?: string;
      content?: string;
      cids?: number[];
      hashtags?: string[];
      cover?: string | null;
    }
  ) {
    return this.fetchApi<ApiResponse<PostResponse>>(`/blog/post/${postId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  // ===== Comments =====
  async getCommentsByPost(pid: string) {
  // const safe = encodeURIComponent(pidOrSlug);
  return this.fetchApi<ApiResponse<Comment[]>>(`/blog/comment/${pid}`, {
    method: "GET",
  });
}

  async createComment(payload: {
    content: string;
    pid: string;
    parentId?: string;
  }) {
    return this.fetchApi<ApiResponse<Comment>>(`/blog/comment`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /** Cập nhật bình luận */
  async updateComment(
    commentId: string,
    payload: {
      content: string;
      pid: string; 
    }
  ) {
    return this.fetchApi<ApiResponse<Comment>>(
      `/blog/comment/update/${commentId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
  }

  /** Xoá bình luận */
  async deleteComment(commentId: string) {
    return this.fetchApi<ApiResponse<any>>(
      `/blog/comment/delete/${commentId}`,
      { method: "DELETE" }
    );
  }

  // ===== Chatbot =====
  /** Gửi tin nhắn tới chatbot */
  async sendChatMessage(payload: ChatbotRequest) {
    return this.fetchApi<ApiResponse<ChatbotResponse>>(`/blog/post/chat`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

// ===========================================
// ===== Medium Follow (query ?url=...)
// ===========================================
async addMediumFollowLink(url: string) {
  const qs = new URLSearchParams({ url }).toString();
  return this.fetchApi<ApiResponse<any>>(`/blog/follow/medium?${qs}`, {
    method: "POST",
  });
}

async listMediumFollowLinks() {
  return this.fetchApi<ApiResponse<any>>(`/blog/follow/medium`, {
    method: "GET",
  });
}

async unfollowMediumLink(url: string) {
  const qs = new URLSearchParams({ url }).toString();
  return this.fetchApi<ApiResponse<any>>(`/blog/follow/medium/un?${qs}`, {
    method: "POST",
  });
}

async triggerMediumCrawl(tokenOverride?: string) {
  this.reloadAccessToken();

  const token = tokenOverride ?? this.accessToken ?? "";

  const masked = token ? `${token.slice(0, 8)}…${token.slice(-6)}` : "(empty)";
  console.log("[triggerMediumCrawl] accessToken (masked):", masked);
  if (process.env.NODE_ENV === "development") {
    console.log("[triggerMediumCrawl] accessToken (raw):", token);
  }

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  console.log("[triggerMediumCrawl] headers to send:", headers);

  return this.fetchApi<ApiResponse<any>>(`/blog/follow/medium/crawl`, {
    method: "GET",
    headers,
  });
}

}

export const apiService = ApiService.getInstance();
