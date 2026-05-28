import { Input } from "@/components/ui/input";
import { Search, X, Film, Tv, Loader2, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AnimeResult, MediaFormat, AniListError } from "@repo/anilist";
//import type { AnimeResult } from "@/anilist/search-animes";
import CustomImage from "@/components/custom-image";
import Link from "next/link";

import { searchAnimes } from "@/utils/search-animes";

import config from "@/mine.config"



interface SearchResult {
  id: number;
  title: string;
  type: "anime" | "movie";
  genre: string[];
  year: number;
  rating: number;
  image: string;
  description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TRENDING = config.TRENDING;

// ─── Mapper: AnimeResult → SearchResult ──────────────────────────────────────

function mapAnimeResult(anime: AnimeResult): SearchResult {
  const isMovie = anime.format === MediaFormat.MOVIE;

  // AniList descriptions sometimes contain leftover HTML tags even in plain-text mode
  const cleanDescription = (anime.description ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .trim();

  // AniList scores are out of 100 — convert to a single decimal (e.g. 86 → 8.6)
  const rating =
    anime.averageScore !== null
      ? Math.round(anime.averageScore) / 10
      : 0;

  return {
    id: anime.id,
    title:
      anime.title.english ??
      anime.title.romaji ??
      anime.title.native ??
      "Unknown Title",
    type: isMovie ? "movie" : "anime",
    genre: anime.genres.slice(0, 3),
    year: anime.seasonYear ?? anime.startDate.year ?? 0,
    rating,
    image: anime.coverImage.large ?? anime.coverImage.medium ?? "",
    description: cleanDescription,
  };
}

// ─── Custom hook: debounced search ────────────────────────────────────────────

function useDebouncedSearch(query: string, delay = 500) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      // Clear everything instantly when the input is empty
      if (timerRef.current) clearTimeout(timerRef.current);
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Show spinner immediately so the UI feels responsive while the user types
    setLoading(true);
    setError(null);

    // Cancel any pending request from the previous keystroke
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const { results: animes } = await searchAnimes({
          query,
          perPage: 20,
        });
        setResults(animes.map(mapAnimeResult));
        console.log("Search results:", animes);
      } catch (err) {
        if (err instanceof AniListError) {
          setError(`Search failed: ${err.message}`);
        } else {
          setError("Something went wrong. Please try again.");
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    // Cleanup: cancel the pending timer on unmount or when query changes before
    // the timer fires — prevents setting state on a stale closure
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, delay]);

  return { results, loading, error };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultCard({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: (title: string) => void;
}) {
  // Sanitize title for URL: remove special characters, handle spaces, remove duplicates
  const sanitizedTitle = result.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Keep only lowercase letters, numbers, spaces, dashes
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/-+/g, "-") // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes

  const url = `/anime/${sanitizedTitle}-${result.id}`;

  return (
    <Link
      href={url}
      onClick={() => onSelect(result.title)}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left group hover:cursor-pointer"
    >
      <CustomImage
        src={result.image}
        alt={result.title}
        width={70}
        height={70}
        className="w-18 h-24 object-cover shrink-0 ring-1 ring-primary/50"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[16px] text-foreground truncate group-hover:text-primary transition-colors">
            {result.title}
          </span>
          <Badge
            variant="outline"
            className="text-[12px] px-1.5 py-0 border-primary/50 text-primary/50 flex items-center gap-1 rounded-none"
          >
            {result.type === "anime" ? (
              <Tv size={9} />
            ) : (
              <Film size={9} />
            )}
            {result.type === "anime" ? "Anime" : "Movie"}
          </Badge>
        </div>
        <p className="text-xs text-foreground/50 mt-0.5 line-clamp-2">{result.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[14px] text-yellow-500">★ {result.rating}</span>
          <span className="text-[13px] text-foreground/30">·</span>
          <span className="text-[13px] text-foreground/30">{result.year}</span>
          {result.genre.slice(0, 2).map((g) => (
            <span
              key={g}
              className="text-[13px] text-violet-400/70 bg-violet-500/10 px-1.5 py-0.5"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ query }: { query: string }) {
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-14 h-14 bg-primary/10 flex items-center justify-center">
          <Search size={22} className="text-primary/50" />
        </div>
        <p className="text-sm font-medium text-foreground/50">Start typing to search</p>
        <p className="text-xs text-foreground/30">Find anime, anime movies, and more</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-14 h-14 bg-primary/10 flex items-center justify-center">
        <Search size={22} className="text-primary/50" />
      </div>
      <p className="text-sm font-medium text-foreground/50">No results for "{query}"</p>
      <p className="text-xs text-foreground/30">Try a different title or genre</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SearchComponent = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Demon Slayer",
    "Spirited Away",
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogInputRef = useRef<HTMLInputElement>(null);

  const { results, loading, error } = useDebouncedSearch(query);

  const handleOpenChange = useCallback((v: boolean) => {
    if (!v) {
      setOpen(false);
      setQuery("");
    }
  }, []);

  const openDialog = useCallback(() => {
    setOpen(true);
    // Focus dialog input after it mounts
    setTimeout(() => dialogInputRef.current?.focus(), 50);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const handleSelect = useCallback(
    (title: string) => {
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s !== title);
        return [title, ...filtered].slice(0, 5);
      });
      closeDialog();
    },
    [closeDialog]
  );

  const handleTrendingClick = useCallback((term: string) => {
    setQuery(term);
    setTimeout(() => dialogInputRef.current?.focus(), 50);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openDialog();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openDialog]);

  const showEmpty = !loading && !error && results.length === 0;
  const showResults = !loading && !error && results.length > 0;

  return (
    <>
      {/* ── Trigger area ── */}
      <div className="flex items-center gap-2 relative">
        {/* Desktop input */}
        <div className="relative hidden md:block">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search anime, movies, and more..."
            readOnly
            onFocus={openDialog}
            onClick={openDialog}
            className="w-80 lg:w-96 h-10 rounded-none cursor-pointer pr-10 bg-background/60 border-white/10 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <kbd className="hidden lg:inline-flex items-center gap-1 text-[10px] text-muted-foreground/40 bg-white/5 border border-white/10 px-1.5 py-0.5">
              ⌘K
            </kbd>
            <Search size={16} className="text-muted-foreground/50" />
          </div>
        </div>

        {/* Mobile icon button */}
        <Button
          variant="outline"
          size="icon"
          onClick={openDialog}
          className="h-10 w-10 rounded-none md:hidden border-white/10 bg-background/60"
        >
          <Search size={18} className="text-muted-foreground/50" />
        </Button>
      </div>

      {/* ── Dialog ── */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="p-0 gap-0 max-w-2xl w-full border border-border bg-background shadow-2xl overflow-hidden"
          style={{ "--tw-ring-shadow": "none" } as React.CSSProperties}
        >
          <DialogTitle className="sr-only">Search</DialogTitle>

          {/* Search bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            {loading ? (
              <Loader2 size={18} className="text-primary animate-spin flex-shrink-0" />
            ) : (
              <Search size={18} className="text-muted-foreground/50 flex-shrink-0" />
            )}
            <input
              ref={dialogInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  closeDialog();
                }
              }}
              placeholder="Search anime, anime movies more..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-muted-foreground/50 rounded-none hover:text-foreground transition-colors shrink-0 border-r pr-2"
              >
                <X size={16} />
              </button>
            )}
            <DialogClose className="text-muted-foreground/50 rounded-none hover:text-primary hover:border-primary transition-colors shrink-0 bg-transparent h-7 w-7 flex items-center justify-center border">
              <X size={16} />
            </DialogClose>
          </div>

          {/* Content */}
          <div className="max-h-105 overflow-y-auto overscroll-contain">
            {/* Error */}
            {error && (
              <div className="px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="px-4 py-3 space-y-3">
                <div className="h-3 w-1/5 mb-2 bg-primary/10 animate-pulse"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-18 h-24 bg-primary/10 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-5 bg-primary/10  w-2/5" />
                      <div className="h-2.5 bg-primary/10  w-4/5" />
                      <div className="h-2.5 bg-primary/10  w-4/8" />
                      <div className="h-3 bg-primary/10  w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {showResults && (
              <div className="py-2">
                <p className="text-[10px] uppercase tracking-widest text-foreground/30 px-4 py-2">
                  Results — {results.length} found
                </p>
                {results.map((r) => (
                  <ResultCard key={r.id} result={r} onSelect={handleSelect} />
                ))}
              </div>
            )}

            {/* Empty / idle state */}
            {showEmpty && (
              <>
                <EmptyState query={query} />

                {/* Recent searches */}
                {!query && recentSearches.length > 0 && (
                  <div className="px-4 pb-4">
                    <p className="text-[10px] uppercase tracking-widest text-foreground/30 mb-2 flex items-center gap-1.5">
                      <Clock size={10} /> Recent
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleTrendingClick(s)}
                          className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors border border-white/8"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending */}
                {!query && (
                  <div className="px-4 pb-5">
                    <p className="text-[10px] uppercase tracking-widest text-foreground/30 mb-2 flex items-center gap-1.5">
                      <TrendingUp size={10} /> Trending
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleTrendingClick(s)}
                          className="text-xs px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400/70 hover:bg-violet-500/20 hover:text-violet-300 transition-colors border border-violet-500/20"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t border-white/8 px-4 py-2 flex items-center gap-3 text-[10px] text-foreground/30">
            <span>
              <kbd className="bg-white/5 border border-white/10 px-1 py-0.5">↵</kbd>{" "}
              search
            </span>
            <span>
              <kbd className="bg-white/5 border border-white/10 px-1 py-0.5">Esc</kbd>{" "}
              close
            </span>
            <span className="ml-auto">Powered by AniList</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchComponent;