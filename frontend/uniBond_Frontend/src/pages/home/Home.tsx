import { useEffect, useState } from "react";
import CreatePostEntry from "@/components/post/CreatePostEntry";
import PostList from "@/components/post/PostList";
import { handleGetPosts, handleLikePost, handleAddComment, handleRepostPost, handleDeletePost } from "@/controllers/postController";
import type { Post } from "@/types/post";

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const fetchedPosts = await handleGetPosts();
            setPosts(fetchedPosts);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Explore UNI-Bond</h3>
                <p className="text-sm text-gray-500">Discover opportunities and connect with partners.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => window.location.href='/tasks'} className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition">View Tasks</button>
                <button onClick={() => window.location.href='/companies'} className="px-4 py-2 bg-purple-50 text-purple-700 font-semibold rounded-lg hover:bg-purple-100 transition">Partner Companies</button>
              </div>
            </div>

            <CreatePostEntry />

            {error && <p className="text-red-500 text-center">{error}</p>}

            <PostList
                posts={posts}
                loading={loading}
                onLike={async (postId) => {
                    try {
                        const { status, count } = await handleLikePost(postId);
                        setPosts(posts.map(p => {
                            if (p.id === postId) {
                                return { ...p, likes: count, isLikedByUser: status === "liked" };
                            }
                            return p;
                        }));
                    } catch (err) {
                        console.error(err);
                    }
                }}
                onRepost={async (postId) => {
                    try {
                        const { status, count } = await handleRepostPost(postId);
                        setPosts(posts.map(p => {
                            if (p.id === postId) {
                                return { ...p, reposts: count, isRepostedByUser: status === "reposted" };
                            }
                            return p;
                        }));
                    } catch (err) {
                        console.error(err);
                    }
                }}
                onComment={async (postId, commentText) => {
                    try {
                        const updatedPost = await handleAddComment(postId, commentText);
                        setPosts(posts.map(p => p.id === postId ? updatedPost : p));
                    } catch (err) {
                        console.error(err);
                    }
                }}
                onDelete={async (postId) => {
                    const success = await handleDeletePost(postId, () => {}, setError);
                    if (success) {
                        setPosts(posts.filter(p => p.id !== postId));
                    }
                }}
            />
        </div>
    );
}