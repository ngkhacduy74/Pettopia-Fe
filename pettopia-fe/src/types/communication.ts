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
    likes: string[];
    views: string[];
    reports: string[];
    likeCount: number;
    viewCount: number;
    reportCount: number;
    commentCount: number;
    comments: Comment[];
    createdAt: string;
    updatedAt: string;
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