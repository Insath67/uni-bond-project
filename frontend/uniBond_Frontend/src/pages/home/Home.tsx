import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertCircle,
    ArrowRight,
    Briefcase,
    Building2,
    MessageCircle,
    RefreshCw,
    Sparkles,
    Users,
} from "lucide-react";
import CreatePostEntry from "@/components/post/CreatePostEntry";
import PostList from "@/components/post/PostList";
import {
    handleAddComment,
    handleDeletePost,
    handleGetPosts,
    handleLikePost,
    handleRepostPost,
} from "@/controllers/postController";
import type { Post } from "@/types/post";

const quickActions = [
    {
        title: "View Tasks",
        description: "Find project tasks, academic work, and collaboration opportunities.",
        path: "/tasks",
        icon: Briefcase,
    },
    {
        title: "Partner Companies",
        description: "Explore companies connected with UniBond students.",
        path: "/companies",
        icon: Building2,
    },
    {
        title: "Groups",
        description: "Join learning groups and connect with your academic circle.",
        path: "/groups",
        icon: Users,
    },
];

export default function Home() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPosts = async () => {
        try {
            setError("");
            setLoading(true);

            const fetchedPosts = await handleGetPosts();
            setPosts(fetchedPosts);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const refreshPosts = async () => {
        try {
            setError("");
            setRefreshing(true);

            const fetchedPosts = await handleGetPosts();
            setPosts(fetchedPosts);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    return (
        <main className="space-y-6">
            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface)]/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.18),transparent_35%)]" />
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--accent)]/20 blur-3xl" />
                <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[var(--brand)]/20 blur-3xl" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">
                        <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                        UniBond Home Feed
                    </div>

                    <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl xl:text-6xl">
                        Connect, collaborate, and grow with{" "}
                        <span className="bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] bg-clip-text text-transparent">
                            UniBond
                        </span>
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                        Discover posts, opportunities, academic discussions, tasks, and professional
                        connections from students, universities, and companies.
                    </p>

                    <div className="mt-7 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-[var(--brand)]/15 p-2 text-[var(--brand)]">
                                    <MessageCircle className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-2xl font-black text-[var(--text-primary)]">
                                        {posts.length}
                                    </p>
                                    <p className="text-xs font-semibold text-[var(--text-secondary)]">
                                        Posts
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-[var(--brand)]/15 p-2 text-[var(--brand)]">
                                    <Users className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-2xl font-black text-[var(--text-primary)]">
                                        4
                                    </p>
                                    <p className="text-xs font-semibold text-[var(--text-secondary)]">
                                        Roles
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-[var(--brand)]/15 p-2 text-[var(--brand)]">
                                    <Sparkles className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-2xl font-black text-[var(--text-primary)]">
                                        Live
                                    </p>
                                    <p className="text-xs font-semibold text-[var(--text-secondary)]">
                                        Feed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <button
                            key={action.title}
                            type="button"
                            onClick={() => navigate(action.path)}
                            className="group rounded-[1.5rem] border border-white/10 bg-[var(--surface)]/80 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="rounded-2xl bg-[var(--brand)]/15 p-3 text-[var(--brand)] transition group-hover:bg-[var(--brand)] group-hover:text-white">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <ArrowRight className="mt-2 h-4 w-4 text-[var(--text-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]" />
                            </div>

                            <h3 className="mt-4 text-lg font-black text-[var(--text-primary)]">
                                {action.title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                {action.description}
                            </p>
                        </button>
                    );
                })}
            </section>

            <section className="rounded-[1.7rem] border border-white/10 bg-[var(--surface)]/80 p-4 shadow-sm backdrop-blur sm:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-primary)]">
                            Share something with UniBond
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Post updates, questions, achievements, or collaboration ideas.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={refreshPosts}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--brand)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        {refreshing ? "Refreshing..." : "Refresh feed"}
                    </button>
                </div>

                <CreatePostEntry />
            </section>

            {error ? (
                <div
                    className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300"
                    role="alert"
                    aria-live="polite"
                >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <p className="font-bold">Could not load posts</p>
                        <p className="mt-1 leading-6">{error}</p>
                    </div>
                </div>
            ) : null}

            <section className="rounded-[1.7rem] border border-white/10 bg-[var(--surface)]/80 p-4 shadow-sm backdrop-blur sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-primary)]">
                            Latest posts
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Stay updated with the newest UniBond activity.
                        </p>
                    </div>
                </div>

                <PostList
                    posts={posts}
                    loading={loading}
                    onLike={async (postId) => {
                        try {
                            const { status, count } = await handleLikePost(postId);

                            setPosts((currentPosts) =>
                                currentPosts.map((post) => {
                                    if (post.id === postId) {
                                        return {
                                            ...post,
                                            likes: count,
                                            isLikedByUser: status === "liked",
                                        };
                                    }

                                    return post;
                                })
                            );
                        } catch (err) {
                            console.error(err);
                        }
                    }}
                    onRepost={async (postId) => {
                        try {
                            const { status, count } = await handleRepostPost(postId);

                            setPosts((currentPosts) =>
                                currentPosts.map((post) => {
                                    if (post.id === postId) {
                                        return {
                                            ...post,
                                            reposts: count,
                                            isRepostedByUser: status === "reposted",
                                        };
                                    }

                                    return post;
                                })
                            );
                        } catch (err) {
                            console.error(err);
                        }
                    }}
                    onComment={async (postId, commentText) => {
                        try {
                            const updatedPost = await handleAddComment(postId, commentText);

                            setPosts((currentPosts) =>
                                currentPosts.map((post) =>
                                    post.id === postId ? updatedPost : post
                                )
                            );
                        } catch (err) {
                            console.error(err);
                        }
                    }}
                    onDelete={async (postId) => {
                        const success = await handleDeletePost(postId, () => {}, setError);

                        if (success) {
                            setPosts((currentPosts) =>
                                currentPosts.filter((post) => post.id !== postId)
                            );
                        }
                    }}
                />
            </section>
        </main>
    );
}