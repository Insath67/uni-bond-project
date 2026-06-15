import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuthHook";
import { ROUTES } from "@/utils/constants";
import type { Post } from "@/types/post";
import Avatar from "@/components/common/Avatar";
import PostActions from "./PostActions";
import { formatDateTime } from "@/utils/formatters";
import { extractYouTubeVideoId, resolveMediaSrc } from "@/utils/media";

type Props = {
    post: Post;
    onLike: (postId: string) => void;
    onRepost: (postId: string) => void;
    onComment: (postId: string, commentText: string) => void;
    onDelete?: (postId: string) => void;
};

export default function PostCard({ post, onLike, onRepost, onComment, onDelete }: Props) {
    const [commentText, setCommentText] = useState("");
    const [commentError, setCommentError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    const commentInputRef = useRef<HTMLInputElement>(null);

    const mediaSrc = post.mediaUrl ? resolveMediaSrc(post.mediaUrl) : null;
    const COLLAPSED_CHAR_LIMIT = 360;
    const COLLAPSED_LINE_LIMIT = 8;

    const buildCollapsedContent = (content: string) => {
        const trimmed = content.trim();
        const lines = trimmed.split("\n");
        let preview = lines.slice(0, COLLAPSED_LINE_LIMIT).join("\n").trim();
        let isTruncated = lines.length > COLLAPSED_LINE_LIMIT;

        if (preview.length > COLLAPSED_CHAR_LIMIT) {
            const shortened = preview.slice(0, COLLAPSED_CHAR_LIMIT);
            const lastSpace = shortened.lastIndexOf(" ");
            preview = (lastSpace > 220 ? shortened.slice(0, lastSpace) : shortened).trim();
            isTruncated = true;
        }

        if (!isTruncated && trimmed.length > preview.length) {
            isTruncated = true;
        }

        return {
            preview: isTruncated ? `${preview}...` : preview,
            isTruncated,
        };
    };

    const { preview: collapsedContent, isTruncated: canExpand } = buildCollapsedContent(post.content || "");
    const displayedContent = isExpanded ? post.content : collapsedContent;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            onDelete?.(post.id);
        }
        setShowMenu(false);
    };

    const handleEdit = () => {
        navigate(ROUTES.EDIT_POST.replace(":id", post.id), { state: { post } });
        setShowMenu(false);
    };

    const isAuthor = user?.id === post.authorId;

    const submitComment = async () => {
        if (!commentText.trim()) {
            setCommentError("Please type something to comment.");
            return;
        }
        setCommentError("");
        setIsSubmitting(true);
        try {
            await onComment(post.id, commentText);
            setCommentText("");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderVideo = (url: string) => {
        const youtubeVideoId = extractYouTubeVideoId(url);
        if (youtubeVideoId) {
            return (
                <iframe
                    className="w-full aspect-video rounded-lg mb-3"
                    src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                ></iframe>
            );
        }
        
        // Fallback Native Video for direct MP4 links
        return (
            <video controls className="w-full rounded-lg mb-3">
                <source src={url} />
                Your browser does not support the video tag.
            </video>
        );
    };

    return (
        <div className="bg-white shadow-sm rounded-2xl p-5 relative">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <Avatar src={post.authorAvatar} alt={post.authorName} />
                    <div>
                        <h3 className="font-bold text-lg">{post.authorName}</h3>
                        <p className="text-sm text-gray-500 capitalize">{post.authorRole}</p>
                        <p className="text-xs text-gray-400">
                            {formatDateTime(post.createdAt)}
                        </p>
                    </div>
                </div>

                {isAuthor && (
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        
                        {showMenu && (
                            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                <button
                                    onClick={handleEdit}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {post.content && (
                <div className="mb-4">
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-[var(--text-primary)]">
                        {displayedContent}
                    </p>
                    {canExpand && (
                        <button
                            onClick={() => setIsExpanded((current) => !current)}
                            className="mt-2 text-sm font-semibold text-[var(--accent)] hover:opacity-80"
                        >
                            {isExpanded ? "See less" : "See more"}
                        </button>
                    )}
                </div>
            )}

            {mediaSrc && post.mediaType === "image" && (
                <div className="mb-3 overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.88))]">
                    <div className="flex max-h-[42rem] min-h-[18rem] items-center justify-center p-2 sm:p-3">
                        <img
                            src={mediaSrc}
                            alt="post media"
                            className="max-h-[38rem] w-full rounded-[1.15rem] object-contain"
                        />
                    </div>
                </div>
            )}

            {mediaSrc && post.mediaType === "video" && renderVideo(mediaSrc)}

            <PostActions
                likes={post.likes}
                commentsCount={post.commentsCount}
                reposts={post.reposts}
                isLiked={post.isLikedByUser}
                isReposted={post.isRepostedByUser}
                onLike={() => onLike(post.id)}
                onComment={() => commentInputRef.current?.focus()}
                onRepost={() => onRepost(post.id)}
            />

            <div className="flex flex-col gap-1 mt-3">
                <div className="flex gap-2">
                    <input
                        ref={commentInputRef}
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => {
                            setCommentText(e.target.value);
                            if (commentError) setCommentError("");
                        }}
                        className={`flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${commentError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    />
                    <button
                        onClick={submitComment}
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
                            isSubmitting ? 'bg-blue-400 cursor-wait' : 'bg-gray-800 hover:bg-gray-700 active:bg-blue-600'
                        }`}
                    >
                        {isSubmitting ? "..." : "Comment"}
                    </button>
                </div>
                {commentError && <p className="text-red-500 text-xs ml-1">{commentError}</p>}
            </div>

            {post.comments && post.comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                    {!showAllComments && post.comments.length > 1 && (
                        <button 
                            onClick={() => setShowAllComments(true)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium pb-1"
                        >
                            View all {post.comments.length} comments
                        </button>
                    )}

                    {(showAllComments ? post.comments : [post.comments[post.comments.length - 1]]).map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Avatar 
                                src={comment.user.avatar}
                                alt={comment.user.fullName}
                                size="sm" 
                            />
                            <div className="flex-1 bg-gray-50 rounded-2xl p-3">
                                <p className="font-semibold text-sm">{comment.user.fullName}</p>
                                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatDateTime(comment.createdAt)}</p>
                            </div>
                        </div>
                    ))}

                    {showAllComments && post.comments.length > 1 && (
                        <button 
                            onClick={() => setShowAllComments(false)}
                            className="text-sm text-gray-500 hover:text-gray-700 font-medium pt-1"
                        >
                            Show less comments
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
