import { Heart, MessageCircle, Repeat } from "lucide-react";

type Props = {
  likes: number;
  commentsCount: number;
  reposts: number;
  isLiked?: boolean;
  isReposted?: boolean;
  onLike: () => void;
  onComment: () => void;
  onRepost: () => void;
};

export default function PostActions({ likes, commentsCount, reposts, isLiked, isReposted, onLike, onComment, onRepost }: Props) {
  return (
    <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
      <button
        onClick={onLike}
        className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-500'}`}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{likes}</span>
      </button>

      <button
        onClick={onComment}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">{commentsCount}</span>
      </button>

      <button
        onClick={onRepost}
        className={`flex items-center gap-2 transition-colors ${isReposted ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`}
      >
        <Repeat className="w-5 h-5" />
        <span className="text-sm font-medium">{reposts}</span>
      </button>
    </div>
  );
}