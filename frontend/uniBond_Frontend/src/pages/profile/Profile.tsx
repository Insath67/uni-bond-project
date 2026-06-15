import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuthHook";
import { ROUTES } from "@/utils/constants";
import { useNavigate, useParams } from "react-router-dom";
import ProfileHeader from "./ProfileHeader";
import ProfileLeftColumn from "./ProfileLeftColumn";
import RoleSpecificSection from "./RoleSpecificSection";
import EditProfileModal from "./EditProfileModal";
import CreatePostEntry from "@/components/post/CreatePostEntry";
import PostList from "@/components/post/PostList";
import { handleGetUserPosts, handleLikePost, handleAddComment, handleRepostPost } from "@/controllers/postController";
import { handleFollowUser, handleGetFollowing, handleGetUserProfile, handleUnfollowUser, handleUpdateUserProfile, handleUploadUserAvatar, handleUploadUserCover } from "@/controllers/userController";
import type { Post } from "@/types/post";
import type { ProfileConnectionStats, UserProfileData, UserProfileUpdatePayload, UserSummary } from "@/types/user";
import { getUserDisplayName } from "@/utils/formatters";

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [postsError, setPostsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [connections, setConnections] = useState<UserSummary[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [connectionsError, setConnectionsError] = useState("");
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [coverSaving, setCoverSaving] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState("");

  const activeUserId = userId || user?.id;
  const routeOwnProfile = !userId || userId === user?.id;

  const fetchPosts = async () => {
    if (!activeUserId) return;
    setLoading(true);
    setPostsError("");
    try {
      const data = await handleGetUserPosts(activeUserId);
      setPosts(data);
    } catch (error) {
      console.error("Failed to load user posts", error);
      setPosts([]);
      setPostsError("Posts could not be loaded right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !activeUserId) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        setProfileError("");
        setFollowError("");
        const nextProfileData = await handleGetUserProfile(activeUserId);
        setProfileData(nextProfileData);
      } catch (error) {
        console.error("Failed to load profile user", error);
        setProfileData(null);
        setProfileError("This profile could not be loaded.");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [activeUserId, user]);

  useEffect(() => {
    const loadConnections = async () => {
      if (!user || !activeUserId) {
        setConnections([]);
        setConnectionsLoading(false);
        return;
      }

      try {
        setConnectionsLoading(true);
        setConnectionsError("");
        const nextConnections = await handleGetFollowing(activeUserId);
        setConnections(nextConnections);
      } catch (error) {
        console.error("Failed to load profile connections", error);
        setConnections([]);
        setConnectionsError("Connections could not be loaded right now.");
      } finally {
        setConnectionsLoading(false);
      }
    };

    loadConnections();
  }, [activeUserId, user]);

  useEffect(() => {
    fetchPosts();
  }, [activeUserId]);

  if (!user) return null;

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="h-72 rounded-2xl bg-white shadow-sm animate-pulse" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="md:col-span-5 lg:col-span-4">
            <div className="h-64 rounded-2xl bg-white shadow-sm animate-pulse" />
          </div>
          <div className="md:col-span-7 lg:col-span-8">
            <div className="h-80 rounded-2xl bg-white shadow-sm animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
        <p className="text-gray-700 font-semibold">{profileError || "Profile not found."}</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const isOwnProfile = profileData.isOwnProfile || routeOwnProfile;
  const profileUser = profileData.user;
  const profileDisplayName = getUserDisplayName(profileUser);
  const profileStats: ProfileConnectionStats = {
    followers: profileData.followersCount,
    following: profileData.followingCount,
    connections: profileData.followingCount,
  };

  const handleFollowToggle = async () => {
    if (!activeUserId || isOwnProfile || followLoading) {
      return;
    }

    try {
      setFollowLoading(true);
      setFollowError("");
      const nextProfileData = profileData.isFollowing
        ? await handleUnfollowUser(activeUserId)
        : await handleFollowUser(activeUserId);
      setProfileData(nextProfileData);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      setFollowError(typeof detail === "string" ? detail : "Follow action failed. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = async (payload: UserProfileUpdatePayload, avatarFile?: File | null) => {
    if (!activeUserId) return;

    try {
      setEditSaving(true);
      let updatedUser = await handleUpdateUserProfile(activeUserId, payload);
      if (avatarFile) {
        updatedUser = await handleUploadUserAvatar(activeUserId, avatarFile);
      }
      setProfileData((current) => current ? { ...current, user: updatedUser } : current);
      if (isOwnProfile) {
        updateUser(updatedUser);
      }
      setEditOpen(false);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      throw new Error(typeof detail === "string" ? detail : "Profile update failed. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleSaveCover = async (coverFile: File) => {
    if (!activeUserId) return;

    try {
      setCoverSaving(true);
      setCoverUploadError("");
      const updatedUser = await handleUploadUserCover(activeUserId, coverFile);
      setProfileData((current) => current ? { ...current, user: updatedUser } : current);
      if (isOwnProfile) {
        updateUser(updatedUser);
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : "Cover photo upload failed. Please try again.";
      setCoverUploadError(message);
      throw new Error(message);
    } finally {
      setCoverSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <ProfileHeader
        user={profileUser}
        onLogout={handleLogout}
        isOwnProfile={isOwnProfile}
        stats={profileStats}
        isFollowing={profileData.isFollowing}
        followLoading={followLoading}
        followError={followError}
        onEditProfile={() => setEditOpen(true)}
        onFollowToggle={handleFollowToggle}
        onCoverUpload={handleSaveCover}
        coverUploading={coverSaving}
        coverUploadError={coverUploadError}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:px-0 mt-4">
        {/* Left Column */}
        <div className="md:col-span-5 lg:col-span-4">
          <ProfileLeftColumn
            user={profileUser}
            stats={profileStats}
            connections={connections}
            connectionsLoading={connectionsLoading}
            connectionsError={connectionsError}
            isOwnProfile={isOwnProfile}
          />
        </div>
        
        {/* Center / Right Column */}
        <div className="md:col-span-7 lg:col-span-8 space-y-4">
          <RoleSpecificSection user={profileUser} isOwnProfile={isOwnProfile} />
          
          {isOwnProfile && <CreatePostEntry />}
          
          <div className="mt-4">
             <h3 className="font-bold text-gray-900 mb-4 px-2 tracking-tight">
               {isOwnProfile ? "Recent Posts" : `${profileDisplayName}'s Posts`}
             </h3>
             {postsError && (
                <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {postsError}
                </p>
             )}
             {posts.length > 0 ? (
                 <PostList 
                    posts={posts}
                    loading={loading}
                    onLike={async (postId) => {
                        const { status, count } = await handleLikePost(postId);
                        setPosts(posts.map(p => {
                            if (p.id === postId) {
                                return { ...p, likes: count, isLikedByUser: status === "liked" };
                            }
                            return p;
                        }));
                     }}
                    onRepost={async (postId) => {
                        const { status, count } = await handleRepostPost(postId);
                        setPosts(posts.map(p => {
                            if (p.id === postId) {
                                return { ...p, reposts: count, isRepostedByUser: status === "reposted" };
                            }
                            return p;
                        }));
                        await fetchPosts();
                    }}
                    onComment={async (postId, commentText) => {
                        const updatedPost = await handleAddComment(postId, commentText);
                        setPosts(posts.map(p => p.id === postId ? updatedPost : p));
                    }}
                 />
             ) : (
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
                    <p className="text-gray-600 font-medium">No posts to display yet.</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {isOwnProfile
                        ? "When you publish or repost something, it will appear here on your timeline."
                        : "When this user publishes something, it will appear here."}
                    </p>
                </div>
             )}
          </div>
        </div>
      </div>

      <EditProfileModal
        user={profileUser}
        open={editOpen}
        saving={editSaving}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
