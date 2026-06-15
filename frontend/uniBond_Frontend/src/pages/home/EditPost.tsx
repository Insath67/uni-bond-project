import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import SectionCard from "@/components/common/SectionCard";
import { handleUpdatePost } from "@/controllers/postController";
import { validatePost } from "@/utils/validators";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";

const mediaTypeOptions = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
] as const;

type MediaType = "image" | "video";

function isMediaType(value: string): value is MediaType {
  return ["image", "video"].includes(value);
}

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const post = location.state?.post;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!post) {
      // If we landed here without post data, navigate back
      navigate(ROUTES.HOME);
      return;
    }
    setContent(post.content || "");
    setMediaUrl(post.mediaUrl || "");
    setMediaType((post.mediaType as MediaType) || "image");
  }, [post, navigate]);

  if (!user || !post) return null;

  const submitPost = async () => {
    setError("");

    const validation = validatePost(content, mediaUrl || undefined, mediaUrl ? mediaType : undefined);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }

    if (!id) return;

    const res = await handleUpdatePost(
      id,
      {
        content,
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaUrl ? mediaType : undefined,
      },
      setLoading,
      setError
    );

    if (res) {
      navigate(ROUTES.HOME);
    }
  };

  const handleMediaTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isMediaType(e.target.value)) {
      setMediaType(e.target.value);
    }
  };

  return (
    <SectionCard title="Edit Post">
      <div className="space-y-4">
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste image or video URL (optional)"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={mediaType}
            onChange={handleMediaTypeChange}
            className="border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {mediaTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={submitPost}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Post"}
          </button>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </SectionCard>
  );
}
