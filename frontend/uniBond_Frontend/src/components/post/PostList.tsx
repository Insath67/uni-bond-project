import PostCard from "./PostCard";
import EmptyState from "@/components/common/EmptyState";
import { FileText } from "lucide-react";
import type { Post } from "@/types/post";

type Props = {
  posts: Post[];
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onComment: (postId: string, commentText: string) => void;
  onDelete?: (postId: string) => void;
  loading?: boolean;
};

export default function PostList({ posts, onLike, onRepost, onComment, onDelete, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No posts yet"
        description="Be the first to share something with your community!"
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLike}
          onRepost={onRepost}
          onComment={onComment}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}