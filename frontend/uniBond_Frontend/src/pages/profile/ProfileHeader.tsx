import { useEffect, useRef, useState } from "react";
import { Camera, Edit2, LogOut } from "lucide-react";
import FollowButton from "@/components/user/FollowButton";
import type { ProfileConnectionStats, User } from "@/types/user";
import { getUserDisplayName } from "@/utils/formatters";
import CoverImageCropModal from "./CoverImageCropModal";
import {
  COVER_ALLOWED_TYPES,
  COVER_MAX_SIZE_BYTES,
  IMAGE_INPUT_ACCEPT,
  readImageDimensions,
  validateImageUpload,
  type AvatarImageDimensions,
} from "@/utils/avatarCrop";

type Props = {
  user: User;
  onLogout?: () => void;
  isOwnProfile: boolean;
  stats: ProfileConnectionStats;
  isFollowing?: boolean;
  followLoading?: boolean;
  followError?: string;
  onEditProfile?: () => void;
  onFollowToggle?: () => Promise<void> | void;
  onCoverUpload?: (file: File) => Promise<void> | void;
  coverUploading?: boolean;
  coverUploadError?: string;
};

export default function ProfileHeader({
  user,
  onLogout,
  isOwnProfile,
  stats,
  isFollowing = false,
  followLoading = false,
  followError = "",
  onEditProfile,
  onFollowToggle,
  onCoverUpload,
  coverUploading = false,
  coverUploadError = "",
}: Props) {
  const profileName = getUserDisplayName(user);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [cropSource, setCropSource] = useState("");
  const [cropFileName, setCropFileName] = useState("");
  const [cropDimensions, setCropDimensions] = useState<AvatarImageDimensions | null>(null);
  const [coverError, setCoverError] = useState("");

  const revokeObjectUrl = (value: string) => {
    if (value.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    }
  };

  useEffect(() => {
    return () => {
      revokeObjectUrl(cropSource);
    };
  }, [cropSource]);

  const handleCoverSelection = async (file?: File | null) => {
    setCoverError("");

    const validation = validateImageUpload({
      file,
      allowedTypes: COVER_ALLOWED_TYPES,
      maxSizeBytes: COVER_MAX_SIZE_BYTES,
      invalidTypeMessage: "Please choose only an image file: JPG, PNG, or WebP.",
      invalidSizeMessage: "Cover photo must be smaller than 8 MB.",
    });

    if (!validation.isValid) {
      setCoverError(validation.error);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
      return;
    }

    const nextCropSource = URL.createObjectURL(file as File);
    try {
      const dimensions = await readImageDimensions(nextCropSource);
      revokeObjectUrl(cropSource);
      setCropSource(nextCropSource);
      setCropFileName((file as File).name);
      setCropDimensions(dimensions);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    } catch {
      revokeObjectUrl(nextCropSource);
      setCoverError("That image could not be opened. Please try a different file.");
    }
  };

  const handleCropClose = () => {
    revokeObjectUrl(cropSource);
    setCropSource("");
    setCropFileName("");
    setCropDimensions(null);
  };

  const triggerCoverPicker = () => {
    if (coverUploading) return;

    const input = coverInputRef.current;
    if (!input) return;

    try {
      input.click();
    } catch {
      setCoverError("Image picker could not be opened. Please try again.");
    }
  };

  const handleCoverConfirm = async (file: File) => {
    await onCoverUpload?.(file);
    handleCropClose();
    setCoverError("");
  };

  return (
    <>
      <div className="panel-surface rounded-b-xl mb-6 pb-6 lg:mt-[-24px] lg:mx-[0px]">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 w-full rounded-b-none lg:rounded-t-xl overflow-hidden relative bg-gradient-to-r from-blue-400 to-indigo-600">
          {user.cover ? (
            <img src={user.cover} alt={`${profileName} cover`} className="h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/15 via-transparent to-white/10" />
          {isOwnProfile ? (
            <>
              <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={triggerCoverPicker}
                  disabled={coverUploading}
                  className="relative z-20 inline-flex min-h-12 items-center gap-3 rounded-[1.35rem] border border-[var(--border-soft)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_94%,white)] px-7 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-soft)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-[var(--surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                      <Camera className="h-4 w-4" />
                    </span>
                    {coverUploading ? "Saving Cover..." : user.cover ? "Change Cover Photo" : "Add Cover Photo"}
                </button>
                {coverError ? <div className="status-error max-w-xs text-left text-xs sm:text-sm">{coverError}</div> : null}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept={IMAGE_INPUT_ACCEPT}
                disabled={coverUploading}
                tabIndex={-1}
                aria-hidden="true"
                className="fixed left-[-9999px] top-[-9999px] h-px w-px opacity-0 pointer-events-none"
                onChange={(event) => {
                  void handleCoverSelection(event.target.files?.[0] || null);
                }}
              />
            </>
          ) : null}
        </div>

        {/* Profile Info Overlay */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col sm:flex-row justify-between items-center sm:items-end sm:-mt-24 mb-4 gap-4 sm:gap-0">
            <div className="-mt-16 sm:mt-0 flex bg-white p-1 rounded-full shrink-0 shadow-lg">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=random&size=160`}
                alt="Profile"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-md relative z-10 bg-white"
              />
            </div>
            {isOwnProfile && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="btn-secondary flex items-center gap-1 border border-[var(--border-soft)] px-3 py-2 text-sm sm:gap-2 sm:px-4 sm:text-base"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="inline">Edit Profile</span>
                </button>
                <button
                  onClick={onLogout}
                  className="btn-danger flex items-center gap-1 px-3 py-2 text-sm sm:gap-2 sm:px-4 sm:text-base"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
            {!isOwnProfile && (
              <div className="flex w-full sm:w-auto justify-center sm:justify-end">
                <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--accent-soft)] px-4 py-3 text-left shadow-sm">
                  <div className="flex items-center gap-3">
                    <FollowButton
                      isFollowing={isFollowing}
                      loading={followLoading}
                      onToggle={() => onFollowToggle?.()}
                    />
                    <span className="text-xs font-medium text-[var(--accent)]">
                      {isFollowing ? "You are following this profile." : "Follow this profile to stay updated."}
                    </span>
                  </div>
                  {followError && (
                    <p className="mt-2 text-xs font-medium text-red-600">{followError}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="mt-2 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 border-none pb-0">
              {profileName}
            </h1>
            <p className="text-gray-500 font-medium capitalize flex items-center justify-center sm:justify-start gap-2 text-sm mt-1">
              {user.role.replace('_', ' ')} • UniBond
            </p>

            <p className="mt-3 text-gray-700 max-w-2xl text-sm sm:text-base mx-auto sm:mx-0">
              {user.description?.trim() || "Keep your profile updated so students, companies, and lecturers can understand your background quickly."}
            </p>

            <div className="flex gap-4 mt-4 text-sm font-medium text-gray-600 justify-center sm:justify-start">
              <span className="hover:underline cursor-pointer"><strong className="text-gray-900">{stats.followers}</strong> Followers</span>
              <span className="hover:underline cursor-pointer"><strong className="text-gray-900">{stats.following}</strong> Following</span>
              <span className="hover:underline cursor-pointer"><strong className="text-gray-900">{stats.connections}</strong> Connections</span>
            </div>
          </div>
        </div>
      </div>

      <CoverImageCropModal
        open={Boolean(cropSource)}
        imageSrc={cropSource}
        fileName={cropFileName}
        dimensions={cropDimensions}
        uploadError={coverUploadError}
        onClose={handleCropClose}
        onConfirm={handleCoverConfirm}
      />
    </>
  );
}
