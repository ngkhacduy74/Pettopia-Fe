"use client";
import { useEffect, useState } from "react";
import { getPostsService, getUserById } from "@/services/authService";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getPostsService();
      const enriched = await Promise.all(
        data.map(async (post: any) => {
          const author = await getUserById(post.authorId);
          return { ...post, authorName: author.name };
        })
      );
      setPosts(enriched);
    })();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl mb-4">Danh sách bài viết</h1>
        {posts.map((post) => (
          <div key={post.id} className="mb-4 border p-3 rounded">
            <h2 className="text-xl">{post.title}</h2>
            <p>{post.content}</p>
            <p className="text-sm text-gray-500">Tác giả: {post.authorName}</p>
          </div>
        ))}
      </div>
    </ProtectedRoute>
  );
}
