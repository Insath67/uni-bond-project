import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Move, Search, X } from "lucide-react";
import {
  createCroppedRectangularImageFile,
  type AvatarCrop,
  type AvatarImageDimensions,
} from "@/utils/avatarCrop";

const CROP_WIDTH = 960;
const CROP_HEIGHT = 260;
const OUTPUT_WIDTH = 1600;
const OUTPUT_HEIGHT = 430;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type Props = {
  open: boolean;
  imageSrc: string;
  fileName?: string;
  dimensions: AvatarImageDimensions | null;
  uploadError?: string;
  onClose: () => void;
  onConfirm: (file: File) => void;
};

export default function CoverImageCropModal({
  open,
  imageSrc,
  fileName,
  dimensions,
  uploadError = "",
  onClose,
  onConfirm,
}: Props) {
  const pointerState = useRef<{ x: number; y: number } | null>(null);
  const [crop, setCrop] = useState<AvatarCrop>({ x: 0, y: 0, zoom: 1 });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0, zoom: 1 });
    pointerState.current = null;
  }, [open, imageSrc]);

  const metrics = useMemo(() => {
    if (!dimensions) return null;
    const baseScale = Math.max(CROP_WIDTH / dimensions.width, CROP_HEIGHT / dimensions.height);
    const scale = baseScale * crop.zoom;
    return {
      width: dimensions.width * scale,
      height: dimensions.height * scale,
    };
  }, [crop.zoom, dimensions]);

  if (!open || !dimensions || !metrics) return null;

  const updateCrop = (nextCrop: AvatarCrop) => {
    const maxX = Math.max(0, (metrics.width - CROP_WIDTH) / 2);
    const maxY = Math.max(0, (metrics.height - CROP_HEIGHT) / 2);
    setCrop({
      zoom: nextCrop.zoom,
      x: clamp(nextCrop.x, -maxX, maxX),
      y: clamp(nextCrop.y, -maxY, maxY),
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerState.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerState.current) return;
    const deltaX = event.clientX - pointerState.current.x;
    const deltaY = event.clientY - pointerState.current.y;
    pointerState.current = { x: event.clientX, y: event.clientY };
    updateCrop({ ...crop, x: crop.x + deltaX, y: crop.y + deltaY });
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleConfirm = async () => {
    try {
      setExporting(true);
      const croppedFile = await createCroppedRectangularImageFile({
        imageSrc,
        dimensions,
        crop,
        cropWidth: CROP_WIDTH,
        cropHeight: CROP_HEIGHT,
        outputWidth: OUTPUT_WIDTH,
        outputHeight: OUTPUT_HEIGHT,
        fileName,
      });
      await onConfirm(croppedFile);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="panel-surface w-full max-w-5xl rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Cover Photo</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">Crop your cover image</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Drag the image to choose the best part for your profile header.
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-secondary h-11 w-11 p-0 shrink-0" aria-label="Close cover cropper">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div
            className="relative mx-auto max-w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-blue-400 to-indigo-600 shadow-inner select-none touch-none"
            style={{ width: "100%", aspectRatio: `${CROP_WIDTH} / ${CROP_HEIGHT}` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <img
              src={imageSrc}
              alt="Cover crop preview"
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
              style={{
                width: `${metrics.width}px`,
                height: `${metrics.height}px`,
                transform: `translate(calc(-50% + ${crop.x}px), calc(-50% + ${crop.y}px))`,
              }}
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/30" />
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <ImagePlus className="h-4 w-4" />
              Facebook-style header framing
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Move className="h-4 w-4 text-[var(--text-muted)]" />
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={crop.zoom}
                onChange={(event) => updateCrop({ ...crop, zoom: Number(event.target.value) })}
                className="w-full accent-[var(--brand)]"
              />
              <span className="w-12 text-right text-sm font-semibold text-[var(--text-secondary)]">
                {Math.round(crop.zoom * 100)}%
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary px-5 py-3">
              Cancel
            </button>
            <button type="button" onClick={handleConfirm} disabled={exporting} className="btn-primary px-6 py-3 disabled:opacity-60">
              {exporting ? "Uploading..." : "Upload Cover Photo"}
            </button>
          </div>
          {uploadError ? <div className="status-error">{uploadError}</div> : null}
        </div>
      </div>
    </div>
  );
}
