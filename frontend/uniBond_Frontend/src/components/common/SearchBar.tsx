import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { validateSearch } from "@/utils/validators";

type Props = {
  placeholder?: string;
  className?: string;
};

export default function SearchBar({ placeholder = "Search people, posts, groups, tasks, and notices...", className = "" }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.pathname === "/search") {
      setQuery(urlQuery);
    }
  }, [location.pathname, urlQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = validateSearch(query);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }

    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleClear = () => {
    setQuery("");
    setError("");
    if (location.pathname === "/search") {
      navigate("/search");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (error) setError("");
          }}
          placeholder={placeholder}
          className="field-shell w-full"
          style={{ paddingLeft: "2.9rem", paddingRight: "3.2rem", paddingTop: "0.9rem", paddingBottom: "0.9rem" }}
          aria-label="Search UniBond"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {error && <p className="field-error mt-1.5 ml-1">{error}</p>}
    </form>
  );
}
