export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getUserDisplayName = (user: {
  role?: string;
  firstname?: string;
  lastname?: string;
  companyName?: string;
}): string => {
  if (user.role === "company" && user.companyName?.trim()) {
    return user.companyName.trim();
  }

  return `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || "UniBond User";
};

export const getInitialsFromName = (name: string): string => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
};
