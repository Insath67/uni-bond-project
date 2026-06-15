export type MediaKind = "image" | "video";

export const MAX_UPLOAD_FILE_SIZE_MB = 20;
export const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024;

// Keep these MIME lists in one place so frontend + backend stay aligned.
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const; // MOV from iPhone

export const ALL_ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES] as const;

export const IMAGE_ACCEPT_ATTR = IMAGE_MIME_TYPES.join(",");
export const VIDEO_ACCEPT_ATTR = [...VIDEO_MIME_TYPES, ".mov"].join(",");
export const ALL_MEDIA_ACCEPT_ATTR = [
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
  ".mov",
].join(",");

function normalizeMime(mime: string): string {
  // Some browsers/frameworks may include codec params (e.g. "; codecs=...").
  return mime.trim().toLowerCase().split(";")[0].trim();
}

export function getMediaKindFromMime(mime: string): MediaKind | null {
  const normalized = normalizeMime(mime);
  if ((IMAGE_MIME_TYPES as readonly string[]).includes(normalized)) return "image";
  if ((VIDEO_MIME_TYPES as readonly string[]).includes(normalized)) return "video";
  return null;
}

export function validatePickedMediaFile(file: File): { ok: true; mediaKind: MediaKind } | { ok: false; error: string } {
  const mime = file.type || "";
  const mediaKind = getMediaKindFromMime(mime);

  if (!mediaKind) {
    return {
      ok: false,
      error: `Unsupported file type (${mime || "unknown"}). Please upload JPG, PNG, WebP images or MP4/WebM/MOV videos.`,
    };
  }

  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `File is too large. Maximum allowed size is ${MAX_UPLOAD_FILE_SIZE_MB} MB.`,
    };
  }

  return { ok: true, mediaKind };
}

