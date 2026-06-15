export const buildAvatar = (firstname: string, lastname: string, email: string) => {
  const label = `${firstname} ${lastname}`.trim() || email || "Uni Bond";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=e5e7eb&color=374151`;
};

export const resolveAssetUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  const trimmed = path.replace(/^\.?\/*/, "");
  const uploadsIndex = trimmed.indexOf("uploads/");
  const publicPath = uploadsIndex >= 0 ? `/${trimmed.slice(uploadsIndex)}` : `/${trimmed}`;
  const baseUrl = ((import.meta as any).env?.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
  return `${baseUrl}${publicPath}`;
};

export const buildUserAvatar = (
  user: {
    first_name?: string;
    last_name?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    avatar?: string | null;
    avatar_path?: string | null;
  },
) => {
  const firstname = user.first_name || user.firstname || "User";
  const lastname = user.last_name || user.lastname || "";
  const email = user.email || "";

  return (
    resolveAssetUrl(user.avatar_path || user.avatar) ||
    buildAvatar(firstname, lastname, email)
  );
};
