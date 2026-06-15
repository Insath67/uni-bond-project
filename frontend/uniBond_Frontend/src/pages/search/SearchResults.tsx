import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  FileText,
  Megaphone,
  Search,
  User,
  Users,
} from "lucide-react";
import SectionCard from "@/components/common/SectionCard";
import EmptyState from "@/components/common/EmptyState";
import { handleSearchAll, handleSemanticSearch } from "@/controllers/searchController";
import { validateSearch } from "@/utils/validators";
import type { SearchResponse, SearchResult, SearchResultType, SemanticSearchResponse } from "@/types/search";

const FILTER_OPTIONS: Array<{ label: string; value: "all" | "study" | SearchResultType }> = [
  { label: "All", value: "all" },
  { label: "Study Resources", value: "study" },
  { label: "Posts", value: "post" },
  { label: "Users", value: "user" },
  { label: "Groups", value: "group" },
  { label: "Notices", value: "notice" },
  { label: "Tasks", value: "task" },
];

const getIcon = (type: SearchResult["type"]) => {
  switch (type) {
    case "post":
      return FileText;
    case "user":
      return User;
    case "group":
      return Users;
    case "notice":
      return Megaphone;
    case "task":
      return Briefcase;
    default:
      return Search;
  }
};

const formatResultType = (type: SearchResult["type"]) => type.charAt(0).toUpperCase() + type.slice(1);

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const activeFilter = (searchParams.get("type") || "all") as "all" | "study" | SearchResultType;

  const [searchResponse, setSearchResponse] = useState<SearchResponse>({ query: "", total: 0, results: [] });
  const [semanticResponse, setSemanticResponse] = useState<SemanticSearchResponse>({ query: "", totalResults: 0, results: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setSearchResponse({ query: "", total: 0, results: [] });
        setSemanticResponse({ query: "", totalResults: 0, results: [] });
        setError("");
        return;
      }

      const validation = validateSearch(query);
      if (!validation.isValid) {
        setSearchResponse({ query: "", total: 0, results: [] });
        setSemanticResponse({ query: "", totalResults: 0, results: [] });
        setError(validation.error!);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const [response, semantic] = await Promise.all([
          handleSearchAll(query, { limit: 10 }),
          query.trim().length >= 3
            ? handleSemanticSearch(query, 5)
            : Promise.resolve({ query: "", totalResults: 0, results: [] }),
        ]);
        setSearchResponse(response);
        setSemanticResponse(semantic);
      } catch (err) {
        console.error("Search failed", err);
        setSemanticResponse({ query: "", totalResults: 0, results: [] });
        setError("We couldn't complete your search right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void performSearch();
  }, [query]);

  const resultCounts = useMemo(() => {
    const counts: Record<string, number> = { all: searchResponse.results.length, study: 0 };
    for (const result of searchResponse.results) {
      counts[result.type] = (counts[result.type] || 0) + 1;
      if (result.isStudyRelated) {
        counts.study += 1;
      }
    }
    return counts;
  }, [searchResponse.results]);

  const filteredResults = useMemo(() => {
    return searchResponse.results.filter((result) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "study") return result.isStudyRelated === true;
      return result.type === activeFilter;
    });
  }, [activeFilter, searchResponse.results]);

  const handleFilterChange = (filter: "all" | "study" | SearchResultType) => {
    const nextParams = new URLSearchParams(searchParams);
    if (filter === "all") {
      nextParams.delete("type");
    } else {
      nextParams.set("type", filter);
    }
    setSearchParams(nextParams);
  };

  if (!query) {
    return (
      <SectionCard title="Search Results">
        <EmptyState icon={Search} title="Search UniBond" description="Search real data across people, posts, groups, tasks, and notices." />
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title={`Search Results for "${query}"`}>
        <div className="status-error">{error}</div>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="panel-surface rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Global Search</p>
            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">Results for "{query}"</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {loading ? "Searching across UniBond..." : `${searchResponse.total} total result${searchResponse.total === 1 ? "" : "s"} found`}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            Real-time search across users, posts, groups, tasks, and notices.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => {
          const count = resultCounts[opt.value] || 0;
          const active = activeFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {opt.label} {count > 0 ? `(${count})` : ""}
            </button>
          );
        })}
      </div>

      <SectionCard title={`${filteredResults.length} matching result${filteredResults.length === 1 ? "" : "s"}`}>
        {!loading && semanticResponse.results.length > 0 ? (
          <div className="mb-6 rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Smart Search</p>
                <h3 className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                  Similar study discussions
                </h3>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--brand)]">
                {semanticResponse.totalResults} semantic matches
              </span>
            </div>

            <div className="space-y-3">
              {semanticResponse.results.map((result) => (
                <div
                  key={`semantic-${result.postId}`}
                  className="rounded-2xl border border-white/70 bg-white/80 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        #{result.rank} {result.title}
                      </p>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {result.contentPreview}
                      </p>
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        {result.authorName}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand)]">
                      {result.similarityScore.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-[var(--surface-muted)]"></div>
                <div className="flex-1">
                  <div className="mb-2 h-4 w-1/4 rounded bg-[var(--surface-muted)]"></div>
                  <div className="h-3 w-3/4 rounded bg-[var(--surface-muted)]"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <EmptyState icon={Search} title="No results found" description={`No matches were found for "${query}" in this filter.`} />
        ) : (
          <div className="space-y-4">
            {filteredResults.map((result) => {
              const Icon = getIcon(result.type);
              return (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={result.href}
                  className="group flex items-start gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 transition hover:border-[var(--brand)] hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
                    {result.avatar ? (
                      <img src={result.avatar} alt={result.title} className="h-10 w-10 rounded-xl object-cover" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-strong)]">
                        {result.title}
                      </h3>
                      <span className="rounded-md bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {formatResultType(result.type)}
                      </span>
                      {result.isStudyRelated ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2 py-1 text-[11px] font-bold text-[var(--success)]">
                          <CheckCircle className="h-3 w-3" />
                          Study related
                        </span>
                      ) : null}
                    </div>

                    {result.subtitle ? (
                      <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{result.subtitle}</p>
                    ) : null}

                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {result.description}
                    </p>
                  </div>

                  <div className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[var(--brand)] sm:flex">
                    View
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
