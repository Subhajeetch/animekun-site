import { Hono } from "hono";
import type { Context } from "hono";
import { MediaSort } from "../../../utils/types.js";
import type { AnimeResult } from "../../../utils/types.js";
import config from "../../../mine.config.js";

export type GenreAnimeResult = Omit<AnimeResult, "tags">;

interface GenreResponse {
  success: boolean;
  results: GenreAnimeResult[];
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  totalPages: number;
  sortBy: string;
}

interface CacheEntry {
  data: GenreResponse;
  expiresAt: number;
}

// ─── Explicitly Defined Response Interfaces ───────────────────
interface AniListError {
  message: string;
}

interface AniListResponse<T> {
  data?: T;
  errors?: AniListError[];
}

interface RawGenreData {
  Page?: {
    pageInfo?: {
      total: number;
      currentPage: number;
      perPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
    media?: any[]; 
  } | null;
}

const genreRoute = new Hono();

const ANILIST_GRAPHQL_URL = config.ANILIST?.URI || "https://graphql.anilist.co";
const ANILIST_TIMEOUT_MS = 15_000;

// Shared global server cache map
const CACHE_TTL_MS = 5 * 24 * 60 * 60 * 1000; 
const genreCache = new Map<string, CacheEntry>();

const GENRE_QUERY = `
query GetAnimeByGenre($genre: String, $page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      perPage
      lastPage
      hasNextPage
    }
    media(type: ANIME, genre: $genre, sort: $sort, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      description
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      format
      status
      season
      seasonYear
      episodes
      duration
      genres
      averageScore
      popularity
      favourites
      isAdult
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      trailer {
        id
        site
        thumbnail
      }
      studios(isMain: true) {
        nodes {
          id
          name
          isAnimationStudio
        }
      }
      siteUrl
    }
  }
}
`;

// ─── Helper Functions ─────────────────────────────────────────

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Returns both the backend sort array and the string representation actually applied
function validateSortMode(sortParam: string | undefined): { convertedSort: MediaSort[]; appliedString: string } {
  if (!sortParam) {
    return { convertedSort: [MediaSort.POPULARITY_DESC], appliedString: "popularity-desc" };
  }
  
  const normalizedSort = sortParam.toUpperCase().replace(/-/g, "_");
  
  if (Object.values(MediaSort).includes(normalizedSort as MediaSort)) {
    return { 
      convertedSort: [normalizedSort as MediaSort], 
      appliedString: sortParam.toLowerCase() 
    };
  }
  
  // Return default configuration if string doesn't match standard enum items
  return { convertedSort: [MediaSort.POPULARITY_DESC], appliedString: "popularity-desc" }; 
}

function toGenreAnimeResult(media: any): GenreAnimeResult | null {
  if (!media || typeof media.id !== "number") return null;

  return {
    id: media.id,
    idMal: media.idMal ?? null,
    title: {
      romaji: media.title?.romaji ?? null,
      english: media.title?.english ?? null,
      native: media.title?.native ?? null,
      userPreferred: media.title?.userPreferred ?? null,
    },
    description: media.description ?? null,
    coverImage: {
      extraLarge: media.coverImage?.extraLarge ?? null,
      large: media.coverImage?.large ?? null,
      medium: media.coverImage?.medium ?? null,
      color: media.coverImage?.color ?? null,
    },
    bannerImage: media.bannerImage ?? null,
    format: media.format ?? null,
    status: media.status ?? null,
    season: media.season ?? null,
    seasonYear: media.seasonYear ?? null,
    episodes: media.episodes ?? null,
    duration: media.duration ?? null,
    genres: media.genres ?? [],
    averageScore: media.averageScore ?? null,
    popularity: media.popularity ?? null,
    favourites: media.favourites ?? null,
    isAdult: Boolean(media.isAdult),
    startDate: {
      year: media.startDate?.year ?? null,
      month: media.startDate?.month ?? null,
      day: media.startDate?.day ?? null,
    },
    endDate: {
      year: media.endDate?.year ?? null,
      month: media.endDate?.month ?? null,
      day: media.endDate?.day ?? null,
    },
    trailer: media.trailer ?? null,
    studios: (media.studios?.nodes ?? []).map((node: any) => ({
      id: node.id,
      name: node.name,
      isAnimationStudio: node.isAnimationStudio,
    })),
    siteUrl: media.siteUrl ?? null,
  };
}

// ─── API Route ────────────────────────────────────────────────

genreRoute.get("/genre/:id", async (c: Context) => {
  const genreId = c.req.param("id");
  
  if (!genreId) {
    return c.json({ success: false, error: "Genre identifier parameter is missing." }, 400);
  }
  
  const pageParam = c.req.query("page");
  const perPageParam = c.req.query("per-page");
  const sortByParam = c.req.query("sort-by") || "popularity-desc";

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const perPage = perPageParam ? parseInt(perPageParam, 10) : 24;

  if (isNaN(perPage) || perPage < 10 || perPage > 60) {
    return c.json(
      { success: false, error: "Invalid 'per-page' value. Must be a number between 10 and 60." },
      400
    );
  }

  if (isNaN(page) || page < 1) {
    return c.json(
      { success: false, error: "Invalid 'page' value. Must be a number greater than or equal to 1." },
      400
    );
  }

  const cacheKey = `${genreId.toLowerCase()}:${page}:${perPage}:${sortByParam.toLowerCase()}`;
  const cachedEntry = genreCache.get(cacheKey);

  if (cachedEntry && Date.now() < cachedEntry.expiresAt) {
    c.header("X-Cache", "HIT");
    return c.json(cachedEntry.data);
  }

  // Extract sort rules alongside what literal string value represents them
  const { convertedSort, appliedString } = validateSortMode(sortByParam);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANILIST_TIMEOUT_MS);

  try {
    const response = await fetch(ANILIST_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: GENRE_QUERY,
        variables: { genre: genreId, page, perPage, sort: convertedSort },
      }),
      signal: controller.signal,
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`AniList returned ${response.status}: ${text.slice(0, 300)}`);
    }

    const payload = JSON.parse(text) as AniListResponse<RawGenreData>;

    if (payload.errors?.length) {
      throw new Error(payload.errors.map((e: AniListError) => e.message).join("; "));
    }

    const pageData = payload.data?.Page;
    const rawMedia = pageData?.media ?? [];
    const pageInfo = pageData?.pageInfo;

    const results = rawMedia
      .map(toGenreAnimeResult)
      .filter((anime: GenreAnimeResult | null): anime is GenreAnimeResult => anime !== null);

    const finalResponse: GenreResponse = {
      success: true,
      results,
      currentPage: pageInfo?.currentPage ?? page,
      perPage: pageInfo?.perPage ?? perPage,
      hasNextPage: pageInfo?.hasNextPage ?? false,
      totalPages: pageInfo?.lastPage ?? 0, 
      sortBy: appliedString, 
    };

    genreCache.set(cacheKey, {
      data: finalResponse,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    c.header("X-Cache", "MISS");
    return c.json(finalResponse);

  } catch (error) {
    console.error(`[genre-api] Fetch failed for genre '${genreId}':`, getErrorMessage(error));

    if (cachedEntry) {
      c.header("X-Cache", "STALE_HIT");
      return c.json(cachedEntry.data);
    }

    if (error instanceof Error && error.name === "AbortError") {
      return c.json({ success: false, error: "Upstream request to AniList timed out." }, 504);
    }

    return c.json({ success: false, error: "Failed to retrieve genre data." }, 502);
  } finally {
    clearTimeout(timeoutId);
  }
});

genreRoute.delete("/genre/cache", (c) => {
  genreCache.clear();
  return c.json({ success: true, message: "Genre cache cleared completely." });
});

export default genreRoute;