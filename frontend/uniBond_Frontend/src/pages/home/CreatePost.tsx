import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ImagePlus, Search, Upload, Video, X } from "lucide-react";
import SectionCard from "@/components/common/SectionCard";
import { handleCreateModeratedPostWithFile } from "@/controllers/postController";
import { handleCheckPostModeration } from "@/controllers/moderationController";
import { handleSemanticSearch } from "@/controllers/searchController";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";
import type { ModerationCheckResponse } from "@/types/moderation";
import type { SemanticSearchResult } from "@/types/search";
import {
  ALL_MEDIA_ACCEPT_ATTR,
  IMAGE_ACCEPT_ATTR,
  VIDEO_ACCEPT_ATTR,
  validatePickedMediaFile,
} from "@/utils/mediaUploadValidation";

export default function CreatePost() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [moderationResult, setModerationResult] = useState<ModerationCheckResponse | null>(null);
  const [semanticMatches, setSemanticMatches] = useState<SemanticSearchResult[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Pre-select media type from navigation state ────────────────────────────
  useEffect(() => {
    if (!fileInputRef.current) return;

    if (location.state?.defaultMediaType === "video") {
      fileInputRef.current.accept = VIDEO_ACCEPT_ATTR;
      return;
    }

    if (location.state?.defaultMediaType === "image") {
      fileInputRef.current.accept = IMAGE_ACCEPT_ATTR;
    }
  }, [location.state]);

  // ── Clean up object URL to prevent memory leaks ────────────────────────────
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!user) return null;

  const imageResult = moderationResult?.image_result ?? null;
  const textResult = moderationResult?.text_result ?? null;
  const moderationTone =
    moderationResult?.final_status === "allowed"
      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
      : moderationResult?.final_status === "rejected"
        ? "border-red-300 bg-red-50 text-red-950"
        : "border-amber-300 bg-amber-50 text-amber-950";

  // ── File picker handler ────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side MIME type + size validation (strict whitelist).
    const validation = validatePickedMediaFile(file);
    if (!validation.ok) {
      setError(validation.error);
      resetFile();
      return;
    }

    // Generate an object URL for preview (browser memory only, not uploaded yet)
    const objectUrl = URL.createObjectURL(file);

    setError("");
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setPreviewType(validation.mediaKind);
    setModerationResult(null);
    setSemanticMatches([]);
  };

  const resetFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPreviewType(null);
    setModerationResult(null);
    setSemanticMatches([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runAiChecks = async () => {
    setError("");
    setSuccessMessage("");

    if (!content.trim() && !selectedFile) {
        setError("Please write something or attach study media.");
        return;
      }

    try {
      setChecking(true);
      const [moderation, semantic] = await Promise.all([
        handleCheckPostModeration(
          content.trim(),
          selectedFile && previewType === "image" ? selectedFile : undefined
        ),
        content.trim().length >= 3
          ? handleSemanticSearch(content.trim(), 3)
          : Promise.resolve({ query: "", totalResults: 0, results: [] }),
      ]);

      setModerationResult(moderation);
      setSemanticMatches(semantic.results);
    } catch (err) {
      const axiosError = err as any;
      const detail = axiosError?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : (err instanceof Error ? err.message : "Failed to run AI checks."));
    } finally {
      setChecking(false);
    }
  };

  // ── Form submit ────────────────────────────────────────────────────────────
  const submitPost = async () => {
    setError("");
    setSuccessMessage("");

    if (!content.trim() && !selectedFile) {
      setError("Please write something or attach a file.");
      return;
    }

    const res = await handleCreateModeratedPostWithFile(
      content.trim(),
      selectedFile ?? undefined,
      setLoading,
      setError
    );

    if (res) {
      setSuccessMessage(res.message);
      setModerationResult(res.moderation);
      setContent("");
      resetFile();
      setSemanticMatches([]);
      setTimeout(() => navigate(ROUTES.HOME), 900);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <SectionCard title="Create New Post">
      <div className="space-y-4">

        {/* ── Text content ─────────────────────────────────────────────── */}
        <textarea
          placeholder="Share a study question, solution, or academic discussion..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setModerationResult(null);
            setSemanticMatches([]);
          }}
          rows={4}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition placeholder-gray-400"
        />

        {/* ── File preview (shown after user picks a file) ──────────────── */}
        {previewUrl && (
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border-soft)] bg-[var(--surface-muted)]">
            {/* Remove file button */}
            <button
              onClick={resetFile}
              className="absolute top-3 right-3 z-10 rounded-full border border-white/70 bg-[rgba(15,23,42,0.72)] p-1.5 text-white shadow
                         hover:bg-[rgba(220,38,38,0.85)] transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>

            {previewType === "image" ? (
              <div className="flex max-h-[34rem] min-h-[18rem] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(17,24,39,0.88))] p-3 sm:p-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[30rem] w-full rounded-2xl object-contain shadow-[0_18px_45px_rgba(15,23,42,0.28)]"
                />
              </div>
            ) : (
              <video
                src={previewUrl}
                controls
                className="w-full max-h-[30rem] rounded-2xl bg-black"
              />
            )}
          </div>
        )}

        {/* ── File picker row ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-3">
          {/* Hidden real file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALL_MEDIA_ACCEPT_ATTR}
            onChange={handleFileChange}
            className="hidden"
            id="post-file-input"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Add to your post</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Upload a study-related image or video. Videos currently use text moderation, so add a clear academic caption.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="post-file-input"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.accept = IMAGE_ACCEPT_ATTR;
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold
                           text-emerald-700 hover:bg-emerald-100 cursor-pointer transition-colors"
              >
                <ImagePlus className="w-4 h-4" />
                {selectedFile ? "Change Photo" : "Choose Photo"}
              </label>

              <label
                htmlFor="post-file-input"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.accept = VIDEO_ACCEPT_ATTR;
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold
                           text-violet-700 hover:bg-violet-100 cursor-pointer transition-colors"
              >
                <Video className="w-4 h-4" />
                {previewType === "video" ? "Change Video" : "Choose Video"}
              </label>

              {selectedFile && (
                <span className="max-w-[220px] truncate rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
                  {selectedFile.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Error message ─────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {moderationResult && (
          <div className={`space-y-4 rounded-xl border px-4 py-3 text-sm ${moderationTone}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold">AI Moderation: {moderationResult.final_status.toUpperCase()}</span>
              {moderationResult.final_status === "allowed" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
            <p className="mt-2">{moderationResult.explanation}</p>
            {previewType === "video" ? (
              <p className="mt-2 text-xs font-medium text-inherit/80">
                Video uploads are currently checked using the caption text because UniBond does not have video AI moderation yet.
              </p>
            ) : null}
            {moderationResult.reasons.length > 0 ? (
              <ul className="mt-2 list-disc pl-5">
                {moderationResult.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : null}

            {imageResult ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      Image Analysis
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      Detected as: {imageResult.detected_subject}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full border border-slate-300 bg-slate-900 px-2.5 py-1 text-white">
                      Confidence {imageResult.confidence_percentage}
                    </span>
                    <span className="rounded-full border border-slate-300 bg-slate-900 px-2.5 py-1 text-white">
                      Level {imageResult.confidence_level.toUpperCase()}
                    </span>
                    <span className="rounded-full border border-slate-300 bg-slate-900 px-2.5 py-1 text-white capitalize">
                      {imageResult.academic_relevance.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900">Why this image was flagged</p>
                    <p className="mt-1 leading-6 text-slate-800">{imageResult.moderation_reason}</p>
                    <p className="mt-1 leading-6 text-slate-700">{imageResult.explanation}</p>
                  </div>

                  {imageResult.upload_guidance.length > 0 ? (
                    <div>
                      <p className="font-semibold text-slate-900">What to upload instead</p>
                      <ul className="mt-1 list-disc pl-5 leading-6 text-slate-800">
                        {imageResult.upload_guidance.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {imageResult.top_predictions.length > 0 ? (
                    <div>
                      <p className="font-semibold text-slate-900">Top AI matches</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {imageResult.top_predictions.map((prediction) => (
                          <span
                            key={`${prediction.label}-${prediction.confidence_percentage}`}
                            className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800"
                          >
                            {prediction.label} ({prediction.confidence_percentage})
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {textResult ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Text Analysis
                </p>
                <p className="mt-1 leading-6 text-slate-800">{textResult.explanation}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-slate-800">
                    Label {textResult.predicted_label.replace(/_/g, " ")}
                  </span>
                  <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-slate-800">
                    Confidence {textResult.confidence_percentage}
                  </span>
                  <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-slate-800">
                    Level {textResult.confidence_level.toUpperCase()}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {semanticMatches.length > 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
              <Search className="w-4 h-4" />
              Similar study posts already exist
            </div>
            <div className="mt-3 space-y-3">
              {semanticMatches.map((match) => (
                <div key={match.postId} className="rounded-lg border border-blue-100 bg-white px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{match.title}</p>
                      <p className="mt-1 text-sm text-gray-600">{match.contentPreview}</p>
                      <p className="mt-2 text-xs text-gray-500">By {match.authorName}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                      {match.similarityScore.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={runAiChecks}
            disabled={checking || loading}
            className="flex items-center gap-2 bg-slate-700 text-white px-5 py-2 rounded-lg text-sm font-semibold
                       hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {checking ? "Checking..." : "Check AI"}
          </button>

          <button
            onClick={submitPost}
            disabled={loading || checking || moderationResult?.final_status !== "allowed"}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                {/* Spinner */}
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Post with AI Approval
              </>
            )}
          </button>

          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="bg-gray-100 text-gray-600 px-5 py-2 rounded-lg text-sm font-semibold
                       hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </SectionCard>
  );
}
