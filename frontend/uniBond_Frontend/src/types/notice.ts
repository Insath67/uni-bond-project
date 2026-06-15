export interface Notice {
  id: string;
  title: string;
  content: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
  type?: "official" | "department" | "general";
  isPinned?: boolean;
}