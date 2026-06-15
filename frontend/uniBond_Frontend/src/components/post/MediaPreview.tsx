import { resolveMediaSrc } from "@/utils/media";

type Props = {
  mediaUrl: string;
  mediaType: "image" | "video";
  className?: string;
};

export default function MediaPreview({ mediaUrl, mediaType, className = "" }: Props) {
  const mediaSrc = resolveMediaSrc(mediaUrl);

  if (mediaType === "image") {
    return (
      <div className={`overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--surface-muted)] ${className}`}>
        <div className="flex max-h-[30rem] min-h-[14rem] items-center justify-center p-2">
          <img
            src={mediaSrc}
            alt="Media content"
            className="max-h-[28rem] w-full object-contain"
          />
        </div>
      </div>
    );
  }

  if (mediaType === "video") {
    return (
      <video
        controls
        className={`w-full rounded-lg ${className}`}
      >
        <source src={mediaSrc} />
        Your browser does not support the video tag.
      </video>
    );
  }

  return null;
}
