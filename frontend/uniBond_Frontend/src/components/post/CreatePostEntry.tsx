import { Link } from "react-router-dom";
import { Image, Plus, Video } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import SectionCard from "@/components/common/SectionCard";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";
import { buildUserAvatar } from "@/utils/userMedia";

export default function CreatePostEntry() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <SectionCard title="Create Post" className="mb-6">
      <div className="flex items-start gap-3">
        <Avatar src={buildUserAvatar(user)} alt={user.firstname} />
        <div className="flex-1">
          <Link
            to={ROUTES.CREATE_POST}
            className="block w-full p-3 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          >
            What's on your mind, {user.firstname}?
          </Link>
          <div className="flex gap-2 mt-3">
            <Link
              to={ROUTES.CREATE_POST}
              state={{ defaultMediaType: "image" }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Image className="w-4 h-4" />
              Photo
            </Link>
            <Link
              to={ROUTES.CREATE_POST}
              state={{ defaultMediaType: "video" }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Video className="w-4 h-4" />
              Video
            </Link>
            <Link
              to={ROUTES.CREATE_POST}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              More
            </Link>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
