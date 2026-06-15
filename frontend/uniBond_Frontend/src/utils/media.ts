export const resolveMediaSrc = (url: string) => {
  const trimmedUrl = url.trim();

  if (
    trimmedUrl.startsWith("http://") ||
    trimmedUrl.startsWith("https://") ||
    trimmedUrl.startsWith("data:") ||
    trimmedUrl.startsWith("blob:")
  ) {
    return trimmedUrl;
  }

  const apiBase =
    ((import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ??
      "http://localhost:8000");
  const apiBaseNormalized = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;

  if (trimmedUrl.startsWith("/")) {
    return `${apiBaseNormalized}${trimmedUrl}`;
  }

  return `${apiBaseNormalized}/${trimmedUrl}`;
};

export const extractYouTubeVideoId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );

  return match?.[1] ?? null;
};
