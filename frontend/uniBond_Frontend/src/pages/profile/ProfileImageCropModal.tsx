import { useEffect, useMemo, useRef, useState } from "react";
import { Move, Search, X } from "lucide-react";
import {
  clampAvatarCrop,
  createCroppedAvatarFile,
  getBaseScale,
  type AvatarCrop,
  type AvatarImageDimensions,
} from "@/utils/avatarCrop";

const CROP_SIZE = 320;

type Props = {
  open: boolean;
  imageSrc: string;
  fileName?: string;
  dimensions: AvatarImageDimensions | null;
  onClose: () => void;
  onConfirm: (file: File) => void;
};

export default function ProfileImageCropModal({
  open,
  imageSrc,
  fileName,
  dimensions,
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

  const displayMetrics = useMemo(() => {
    if (!dimensions) return null;
    const baseScale = getBaseScale(dimensions, CROP_SIZE);
    const scale = baseScale * crop.zoom;
    return {
      width: dimensions.width * scale,
      height: dimensions.height * scale,
    };
  }, [crop.zoom, dimensions]);

  if (!open || !dimensions || !displayMetrics) return null;

  const updateCrop = (nextCrop: AvatarCrop) => {
    setCrop(clampAvatarCrop(nextCrop, dimensions, CROP_SIZE));
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
      const croppedFile = await createCroppedAvatarFile({
        imageSrc,
        dimensions,
        crop,
        cropSize: CROP_SIZE,
        fileName,
      });
      onConfirm(croppedFile);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="panel-surface w-full max-w-2xl rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Profile Photo</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">Crop your photo</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Drag the image and adjust zoom so your face fits naturally inside the profile circle.
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-secondary h-11 w-11 p-0 shrink-0" aria-label="Close cropper">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-6">
          <div
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-100 via-white to-slate-200 shadow-inner select-none touch-none"
            style={{ width: CROP_SIZE, height: CROP_SIZE }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <img
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
              style={{
                width: `${displayMetrics.width}px`,
                height: `${displayMetrics.height}px`,
                transform: `translate(calc(-50% + ${crop.x}px), calc(-50% + ${crop.y}px))`,
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-slate-950/28" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[260px] w-[260px] rounded-full border-[10px] border-white shadow-[0_18px_45px_rgba(15,23,42,0.22)]" />
            </div>
          </div>

          <div className="w-full rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Move className="h-4 w-4" />
              Drag to position
            </div>
            <div className="mt-4 flex items-center gap-3">
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
              {exporting ? "Preparing..." : "Use This Photo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
