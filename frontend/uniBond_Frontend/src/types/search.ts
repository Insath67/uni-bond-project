export type SearchResultType = "user" | "post" | "group" | "notice" | "task";

export type SearchResult = {
  type: SearchResultType;
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  href: string;
  avatar?: string;
  createdAt?: string;
  isStudyRelated?: boolean;
};

export type SearchResponse = {
  query: string;
  total: number;
  results: SearchResult[];
};

export type SemanticSearchResult = {
  rank: number;
  postId: string;
  title: string;
  contentPreview: string;
  authorName: string;
  similarityScore: number;
  createdAt: string;
};

export type SemanticSearchResponse = {
  query: string;
  totalResults: number;
  results: SemanticSearchResult[];
};
