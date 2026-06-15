export const AVATAR_ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const COVER_ALLOWED_TYPES = AVATAR_ALLOWED_TYPES;
export const COVER_MAX_SIZE_BYTES = 8 * 1024 * 1024;
export const IMAGE_INPUT_ACCEPT = "image/jpeg,image/png,image/webp,image/*";

export type AvatarCrop = {
  x: number;
  y: number;
  zoom: number;
};

export type AvatarImageDimensions = {
  width: number;
  height: number;
};

export const validateImageUpload = ({
  file,
  allowedTypes,
  maxSizeBytes,
  invalidTypeMessage,
  invalidSizeMessage,
}: {
  file?: File | null;
  allowedTypes: Set<string>;
  maxSizeBytes: number;
  invalidTypeMessage: string;
  invalidSizeMessage: string;
}) => {
  if (!file) {
    return { isValid: false, error: "No image file was selected." };
  }

  if (!allowedTypes.has(file.type)) {
    return { isValid: false, error: invalidTypeMessage };
  }

  if (file.size > maxSizeBytes) {
    return { isValid: false, error: invalidSizeMessage };
  }

  return { isValid: true, error: "" };
};

export const readImageDimensions = (src: string): Promise<AvatarImageDimensions> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Selected image could not be loaded."));
    image.src = src;
  });

export const getBaseScale = (dimensions: AvatarImageDimensions, cropSize: number) =>
  Math.max(cropSize / dimensions.width, cropSize / dimensions.height);

export const clampCropOffset = (value: number, imageLength: number, cropSize: number) => {
  const maxOffset = Math.max(0, (imageLength - cropSize) / 2);
  return Math.min(maxOffset, Math.max(-maxOffset, value));
};

export const clampAvatarCrop = (
  crop: AvatarCrop,
  dimensions: AvatarImageDimensions,
  cropSize: number,
): AvatarCrop => {
  const baseScale = getBaseScale(dimensions, cropSize);
  const scale = baseScale * crop.zoom;
  const imageWidth = dimensions.width * scale;
  const imageHeight = dimensions.height * scale;

  return {
    zoom: crop.zoom,
    x: clampCropOffset(crop.x, imageWidth, cropSize),
    y: clampCropOffset(crop.y, imageHeight, cropSize),
  };
};

export const createCroppedAvatarFile = async ({
  imageSrc,
  dimensions,
  crop,
  cropSize,
  outputSize = 512,
  fileName = "avatar.jpg",
}: {
  imageSrc: string;
  dimensions: AvatarImageDimensions;
  crop: AvatarCrop;
  cropSize: number;
  outputSize?: number;
  fileName?: string;
}): Promise<File> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error("Selected image could not be processed."));
    nextImage.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image crop is not supported in this browser.");
  }

  const baseScale = getBaseScale(dimensions, cropSize);
  const scale = baseScale * crop.zoom;
  const displayedWidth = dimensions.width * scale;
  const displayedHeight = dimensions.height * scale;
  const imageLeft = cropSize / 2 - displayedWidth / 2 + crop.x;
  const imageTop = cropSize / 2 - displayedHeight / 2 + crop.y;

  const sourceX = Math.max(0, (0 - imageLeft) / scale);
  const sourceY = Math.max(0, (0 - imageTop) / scale);
  const sourceWidth = Math.min(dimensions.width - sourceX, cropSize / scale);
  const sourceHeight = Math.min(dimensions.height - sourceY, cropSize / scale);
  const sourceSize = Math.min(sourceWidth, sourceHeight);

  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  if (!blob) {
    throw new Error("Cropped image could not be exported.");
  }

  const normalizedName = fileName.replace(/\.[^.]+$/, "") || "avatar";
  return new File([blob], `${normalizedName}.jpg`, { type: "image/jpeg" });
};

export const createCroppedRectangularImageFile = async ({
  imageSrc,
  dimensions,
  crop,
  cropWidth,
  cropHeight,
  outputWidth,
  outputHeight,
  fileName = "cover.jpg",
}: {
  imageSrc: string;
  dimensions: AvatarImageDimensions;
  crop: AvatarCrop;
  cropWidth: number;
  cropHeight: number;
  outputWidth: number;
  outputHeight: number;
  fileName?: string;
}): Promise<File> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error("Selected image could not be processed."));
    nextImage.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image crop is not supported in this browser.");
  }

  const baseScale = Math.max(cropWidth / dimensions.width, cropHeight / dimensions.height);
  const scale = baseScale * crop.zoom;
  const displayedWidth = dimensions.width * scale;
  const displayedHeight = dimensions.height * scale;
  const imageLeft = cropWidth / 2 - displayedWidth / 2 + crop.x;
  const imageTop = cropHeight / 2 - displayedHeight / 2 + crop.y;

  const sourceX = Math.max(0, (0 - imageLeft) / scale);
  const sourceY = Math.max(0, (0 - imageTop) / scale);
  const sourceWidth = Math.min(dimensions.width - sourceX, cropWidth / scale);
  const sourceHeight = Math.min(dimensions.height - sourceY, cropHeight / scale);

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  if (!blob) {
    throw new Error("Cropped image could not be exported.");
  }

  const normalizedName = fileName.replace(/\.[^.]+$/, "") || "cover";
  return new File([blob], `${normalizedName}.jpg`, { type: "image/jpeg" });
};
