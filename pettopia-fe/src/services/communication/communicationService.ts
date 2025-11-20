import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_PETTOPIA_API_URL; // SỬA: chỉ dùng .env, bỏ fallback sau

type PostsEnvelope = {
  data?: Post[];
  posts?: Post[];
  items?: Post[];
  content?: Post[];
  results?: Post[];
};

export interface Author {
  user_id: string;
  fullname: string;
  avatar: string | null;
}

export interface Post {
    _id: string;
    post_id: string;
    author: Author;
    title: string;
    content: string;
    images: string[];
    tags: string[];
    isHidden: boolean;
    likes: Array<{
        user_id: string;
        likedAt: string;
    }>;
    views: any[];
    reports: any[];
    likeCount: number;
    viewCount: number;
    reportCount: number;
    commentCount: number;
    comments: Array<{
        comment_id: string;
        author: Author;
        content: string;
        likes: any[];
        reports: any[];
        isHidden: boolean;
        isDeleted: boolean;
        createdAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
  images?: string[]; 
  user_id?: string; 
  imageFiles?: File[]; 
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  tags?: string[];
  images?: string[];
}

export interface CommentData {
  post_id: string;
  user_id: string; // required by API spec
  content: string;
  parent_comment_id?: string | null;
}

export interface Comment {
  comment_id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  author: Author;
  replies?: Comment[];
}

class CommunicationService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/communication`;
    this.token = null;
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
  }

  // Get authentication headers
  private getHeaders(contentType: string = 'application/json'): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': contentType,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // ==================== POST OPERATIONS ====================

  /**
   * Get all posts
   * Endpoint: GET /api/v1/communication/all
   */
  async getAllPosts(): Promise<Post[]> {
    const response = await fetch(`${this.baseUrl}/all`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Post[]>(response);
  }

  /**
   * Get post by ID
   * Endpoint: GET /api/v1/communication/:id
   */
  async getPostById(postId: string): Promise<Post> {
    const response = await fetch(`${this.baseUrl}/${postId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Post>(response);
  }

  /**
   * Get posts by user ID
   */
  async getPostsByUserId(userId: string): Promise<Post[]> {
    const response = await fetch(`${this.baseUrl}/user/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Post[]>(response);
  }

  /**
   * Backwards compatible alias for getPostsByUserId used by legacy screens
   */
  async getUserPosts(userId: string): Promise<Post[]> {
    return this.getPostsByUserId(userId);
  }

  /**
   * Create a new post
   * Endpoint: POST /api/v1/communication/create
   */
  async createPost(data: CreatePostData): Promise<Post> {
    // Prefer multipart form as per API example (supports file uploads)
    const formData = new FormData();
    if (data.user_id) formData.append('user_id', data.user_id);
    formData.append('title', data.title);
    formData.append('content', data.content);
    // API expects tags as JSON string (e.g., ["test","postman"]) per screenshot
    formData.append('tags', JSON.stringify(data.tags || []));

    if (data.imageFiles && data.imageFiles.length > 0) {
      for (const file of data.imageFiles) {
        formData.append('images', file);
      }
    } else if (data.images && data.images.length > 0) {
      // Fallback: if only URLs are provided, append as strings (backend must support)
      for (const url of data.images) {
        formData.append('images', url);
      }
    }

    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        // Do NOT set Content-Type here; browser will set correct multipart boundary
      },
      body: formData,
    });
    return this.handleResponse<Post>(response);
  }

  /**
   * Update a post
   * Endpoint: PATCH /api/v1/communication/:id
   */
  async updatePost(postId: string, data: UpdatePostData): Promise<Post> {
    const response = await fetch(`${this.baseUrl}/${postId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Post>(response);
  }

  /**
   * Delete a post
   * Endpoint: DELETE /api/v1/communication/:id
   */
  async deletePost(postId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${postId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete post');
  }

  /**
   * Hide/Unhide a post (soft delete)
   */
  async toggleHidePost(postId: string, isHidden: boolean): Promise<Post> {
    const response = await fetch(`${this.baseUrl}/${postId}/hide`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ isHidden }),
    });
    return this.handleResponse<Post>(response);
  }

  async hidePost(postId: string): Promise<Post> {
    return this.toggleHidePost(postId, true);
  }

  async unhidePost(postId: string): Promise<Post> {
    return this.toggleHidePost(postId, false);
  }

  /**
   * Like a post
   */
  async likePost(postId: string): Promise<{ message: string; likeCount: number }> {
    const response = await fetch(`${this.baseUrl}/${postId}/like`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string; likeCount: number }>(response);
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: string): Promise<{ message: string; likeCount: number }> {
    const response = await fetch(`${this.baseUrl}/${postId}/like`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string; likeCount: number }>(response);
  }

  // ==================== COMMENT OPERATIONS ====================

  /**
   * Get comments for a post
   */
  async getComments(postId: string): Promise<Comment[]> {
    const response = await fetch(`${this.baseUrl}/${postId}/comments`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Comment[]>(response);
  }

  /**
   * Create a comment or reply
   * Endpoint: POST /api/v1/communication/:id/comment
   */
  async createComment(data: CommentData): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/${data.post_id}/comment`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Comment>(response);
  }

  /**
   * Update a comment
   * Endpoint: PATCH /api/v1/communication/:id/comment/:comment_id
   */
  async updateComment(postId: string, commentId: string, content: string): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/${postId}/comment/${commentId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ content }),
    });
    return this.handleResponse<Comment>(response);
  }

  /**
   * Delete a comment
   * Endpoint: DELETE /api/v1/communication/:id/comment/:comment_id
   */
  async deleteComment(postId: string, commentId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${postId}/comment/${commentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  /**
   * Like a comment
   */
  async likeComment(postId: string, commentId: string): Promise<{ message: string; likeCount: number }> {
    const response = await fetch(`${this.baseUrl}/${postId}/comment/${commentId}/like`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string; likeCount: number }>(response);
  }

  /**
   * Unlike a comment
   */
  async unlikeComment(postId: string, commentId: string): Promise<{ message: string; likeCount: number }> {
    const response = await fetch(`${this.baseUrl}/${postId}/comment/${commentId}/like`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string; likeCount: number }>(response);
  }

  // ==================== REPORT OPERATIONS ====================

  /**
   * Report a post
   */
  async reportPost(postId: string, reason: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/report/${postId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // ==================== SEARCH & FILTER ====================

  /**
   * Search posts by keyword
   */
  async searchPosts(keyword: string): Promise<Post[]> {
    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Post[]>(response);
  }

  /**
   * Get posts by tag
   */
  async getPostsByTag(tag: string): Promise<Post[]> {
    const response = await fetch(`${this.baseUrl}/tag/${encodeURIComponent(tag)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Post[]>(response);
  }

  /**
   * Get trending posts
   */
  async getTrendingPosts(limit: number = 5): Promise<Post[]> {
    // Calculate date for one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const query = new URLSearchParams({
      limit: String(limit),
      fromDate: oneWeekAgo.toISOString(),
      sortBy: 'likeCount',
      order: 'desc',
    }).toString();
    const response = await fetch(`${this.baseUrl}/trending?${query}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    const data = await this.handleResponse<Post[] | PostsEnvelope>(response);
    const normalized = this.extractPostsArray(data);
    
    // Additional client-side filtering if needed
    return normalized
        .filter(post => !post.isHidden)
        .filter(post => {
            const postDate = new Date(post.createdAt);
            return postDate >= oneWeekAgo;
        })
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, limit);
}

  private extractPostsArray(response: Post[] | PostsEnvelope): Post[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === 'object') {
      const possibleKeys: (keyof PostsEnvelope)[] = ['data', 'posts', 'items', 'content', 'results'];
      for (const key of possibleKeys) {
        const value = response[key];
        if (Array.isArray(value)) {
          return value;
        }
      }
    }

    return [];
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Upload image (if you have a separate upload endpoint)
   */
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
      body: formData,
    });
    return this.handleResponse<{ url: string }>(response);
  }

  /**
   * Parse tags from API format
   */
  parseTags(tags: string[]): string[] {
    if (!tags || tags.length === 0) return [];
    try {
      return tags.map(tag => {
        if (typeof tag === 'string' && tag.startsWith('[')) {
          return JSON.parse(tag);
        }
        return tag;
      }).flat();
    } catch {
      return tags;
    }
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTimeAgo(date: string | Date): string {
    const now = new Date();
    const d = new Date(date);
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d trước`;
    return d.toLocaleDateString('vi-VN');
  }

  /**
   * Get post detail by ID
   */
  async getPostDetail(postId: string): Promise<Post> {
    const response = await fetch(`${this.baseUrl}/${postId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Post>(response);
  }

  private parsePost(data: any): Post {
    return {
      ...data,
      tags: data.tags?.map((tag: string) => {
        // Nếu tag là JSON string, parse nó
        if (typeof tag === 'string' && tag.startsWith('[')) {
          try {
            return JSON.parse(tag);
          } catch {
            return tag;
          }
        }
        return tag;
      }).flat() || [],
    };
  }
}

// Export singleton instance
export const communicationService = new CommunicationService();

// Export class for creating new instances if needed
export default CommunicationService;
