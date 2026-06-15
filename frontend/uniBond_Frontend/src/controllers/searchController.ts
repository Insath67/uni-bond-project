import { searchAll, semanticSearchPosts } from "@/models/searchModel";
import type { SearchResponse, SearchResultType, SemanticSearchResponse } from "@/types/search";

export const handleSearchAll = async (
  query: string,
  options?: { limit?: number; types?: SearchResultType[] }
): Promise<SearchResponse> => {
  return await searchAll(query, options);
};

export const handleSemanticSearch = async (
  query: string,
  topK = 5
): Promise<SemanticSearchResponse> => {
  return await semanticSearchPosts(query, topK);
};
