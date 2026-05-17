// ─────────────────────────────────────────────
//  AniList GraphQL — Advanced Anime Search
//  Environment : Next.js (browser / RSC safe)
//  API Docs    : https://anilist.gitbook.io/anilist-apiv2-docs
// ─────────────────────────────────────────────

import config from "@/mine.config";

const ANILIST_ENDPOINT = config.ANILIST.URI;

// ─── Enums ────────────────────────────────────

export enum MediaFormat {
  TV = "TV",
  TV_SHORT = "TV_SHORT",
  MOVIE = "MOVIE",
  SPECIAL = "SPECIAL",
  OVA = "OVA",
  ONA = "ONA",
  MUSIC = "MUSIC",
}

export enum MediaStatus {
  FINISHED = "FINISHED",
  RELEASING = "RELEASING",
  NOT_YET_RELEASED = "NOT_YET_RELEASED",
  CANCELLED = "CANCELLED",
  HIATUS = "HIATUS",
}

export enum MediaSeason {
  WINTER = "WINTER",
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FALL = "FALL",
}

export enum MediaSort {
  ID = "ID",
  TITLE_ROMAJI = "TITLE_ROMAJI",
  TITLE_ENGLISH = "TITLE_ENGLISH",
  SCORE = "SCORE",
  SCORE_DESC = "SCORE_DESC",
  POPULARITY = "POPULARITY",
  POPULARITY_DESC = "POPULARITY_DESC",
  TRENDING = "TRENDING",
  TRENDING_DESC = "TRENDING_DESC",
  EPISODES = "EPISODES",
  EPISODES_DESC = "EPISODES_DESC",
  START_DATE = "START_DATE",
  START_DATE_DESC = "START_DATE_DESC",
  END_DATE = "END_DATE",
  END_DATE_DESC = "END_DATE_DESC",
  FAVOURITES = "FAVOURITES",
  FAVOURITES_DESC = "FAVOURITES_DESC",
  SEARCH_MATCH = "SEARCH_MATCH",
  UPDATED_AT_DESC = "UPDATED_AT_DESC",
}

// ─── Input Types ──────────────────────────────

export interface SearchAnimesParams {
  /** The only required field — the search term */
  query: string;

  // ── Filters ──────────────────────────────────
  /** Filter by genre(s)  e.g. ["Action", "Romance"] */
  genres?: string[];
  /** Filter by tag(s)    e.g. ["Isekai", "Magic"] */
  tags?: string[];
  /** Filter by year      e.g. 2024 */
  year?: number;
  /** Filter by season    e.g. MediaSeason.FALL */
  season?: MediaSeason;
  /** Filter by format(s) e.g. [MediaFormat.TV, MediaFormat.MOVIE] */
  formats?: MediaFormat[];
  /** Filter by status    e.g. MediaStatus.RELEASING */
  status?: MediaStatus;
  /** Sort results        e.g. [MediaSort.POPULARITY_DESC] */
  sort?: MediaSort[];
  /** Include adult (18+) content. Defaults to false */
  isAdult?: boolean;

  // ── Pagination ───────────────────────────────
  /** Page number. Defaults to 1 */
  page?: number;
  /** Results per page (max 50). Defaults to 20 */
  perPage?: number;
}

// ─── Response Types ───────────────────────────

export interface AnimeTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface AnimeCoverImage {
  large: string | null;
  medium: string | null;
  color: string | null;
}

export interface AnimeDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AnimeTrailer {
  id: string | null;
  site: string | null;
  thumbnail: string | null;
}

export interface AnimeStudio {
  id: number;
  name: string;
  isAnimationStudio: boolean;
}

export interface AnimeResult {
  id: number;
  idMal: number | null;
  title: AnimeTitle;
  description: string | null;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  format: MediaFormat | null;
  status: MediaStatus | null;
  season: MediaSeason | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  genres: string[];
  tags: Array<{ name: string; rank: number }>;
  averageScore: number | null;
  popularity: number | null;
  favourites: number | null;
  isAdult: boolean;
  startDate: AnimeDate;
  endDate: AnimeDate;
  trailer: AnimeTrailer | null;
  studios: AnimeStudio[];
  siteUrl: string | null;
}

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface SearchAnimesResult {
  pageInfo: PageInfo;
  results: AnimeResult[];
}

// ─── Custom Error ─────────────────────────────

export class AniListError extends Error {
  public readonly status?: number;
  public readonly errors?: Array<{ message: string; status: number }>;

  constructor(
    message: string,
    options?: {
      status?: number;
      errors?: Array<{ message: string; status: number }>;
    }
  ) {
    super(message);
    this.name = "AniListError";
    this.status = options?.status;
    this.errors = options?.errors;
  }
}

// ─── GraphQL Query ────────────────────────────

const SEARCH_QUERY = /* graphql */ `
  query SearchAnimes(
    $search: String
    $genre_in: [String]
    $tag_in: [String]
    $seasonYear: Int
    $season: MediaSeason
    $format_in: [MediaFormat]
    $status: MediaStatus
    $sort: [MediaSort]
    $isAdult: Boolean
    $page: Int
    $perPage: Int
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(
        search: $search
        type: ANIME
        genre_in: $genre_in
        tag_in: $tag_in
        seasonYear: $seasonYear
        season: $season
        format_in: $format_in
        status: $status
        sort: $sort
        isAdult: $isAdult
      ) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description(asHtml: false)
        coverImage {
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
        tags {
          name
          rank
        }
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
        studios(isMain: false) {
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

// ─── Raw API Types (internal) ─────────────────

interface RawMedia {
  id: number;
  idMal: number | null;
  title: AnimeTitle;
  description: string | null;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  format: string | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  genres: string[];
  tags: Array<{ name: string; rank: number }>;
  averageScore: number | null;
  popularity: number | null;
  favourites: number | null;
  isAdult: boolean;
  startDate: AnimeDate;
  endDate: AnimeDate;
  trailer: AnimeTrailer | null;
  studios: { nodes: AnimeStudio[] };
  siteUrl: string | null;
}

interface RawApiResponse {
  data?: {
    Page: {
      pageInfo: PageInfo;
      media: RawMedia[];
    };
  };
  errors?: Array<{ message: string; status: number }>;
}

// ─── Mapper ───────────────────────────────────

function mapMedia(raw: RawMedia): AnimeResult {
  return {
    id: raw.id,
    idMal: raw.idMal,
    title: raw.title,
    description: raw.description,
    coverImage: raw.coverImage,
    bannerImage: raw.bannerImage,
    format: (raw.format as MediaFormat) ?? null,
    status: (raw.status as MediaStatus) ?? null,
    season: (raw.season as MediaSeason) ?? null,
    seasonYear: raw.seasonYear,
    episodes: raw.episodes,
    duration: raw.duration,
    genres: raw.genres,
    tags: raw.tags,
    averageScore: raw.averageScore,
    popularity: raw.popularity,
    favourites: raw.favourites,
    isAdult: raw.isAdult,
    startDate: raw.startDate,
    endDate: raw.endDate,
    trailer: raw.trailer,
    studios: raw.studios.nodes,
    siteUrl: raw.siteUrl,
  };
}

// ─── Main Function ────────────────────────────

/**
 * Search AniList for anime using the GraphQL API.
 *
 * @param params - Search parameters. Only `query` is required.
 * @returns A typed `SearchAnimesResult` with `pageInfo` and `results`.
 * @throws `AniListError` on network failure, bad HTTP status, or GraphQL errors.
 *
 * @example
 * const { results, pageInfo } = await searchAnimes({
 *   query: "Demon Slayer",
 *   genres: ["Action"],
 *   sort: [MediaSort.POPULARITY_DESC],
 *   perPage: 10,
 * });
 */
export async function searchAnimes(
  params: SearchAnimesParams
): Promise<SearchAnimesResult> {
  const {
    query,
    genres,
    tags,
    year,
    season,
    formats,
    status,
    sort,
    isAdult = false,
    page = 1,
    perPage = 20,
  } = params;

  const variables = {
    search: query,
    genre_in: genres?.length ? genres : undefined,
    tag_in: tags?.length ? tags : undefined,
    seasonYear: year ?? undefined,
    season: season ?? undefined,
    format_in: formats?.length ? formats : undefined,
    status: status ?? undefined,
    sort: sort?.length ? sort : undefined,
    isAdult,
    page,
    perPage: Math.min(perPage, 50), // AniList hard cap
  };

  let response: Response;

  try {
    response = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query: SEARCH_QUERY, variables }),
    });
  } catch (networkError) {
    throw new AniListError(
      `Network request failed: ${
        networkError instanceof Error
          ? networkError.message
          : "Unknown network error"
      }`
    );
  }

  if (!response.ok) {
    throw new AniListError(
      `AniList API returned HTTP ${response.status}: ${response.statusText}`,
      { status: response.status }
    );
  }

  let json: RawApiResponse;

  try {
    json = (await response.json()) as RawApiResponse;
  } catch {
    throw new AniListError("Failed to parse AniList API response as JSON.");
  }

  if (json.errors?.length) {
    const first = json.errors[0]!;
    throw new AniListError(
      `AniList GraphQL error: ${first.message}`,
      { status: first.status, errors: json.errors }
    );
  }

  if (!json.data?.Page) {
    throw new AniListError(
      "Unexpected response shape: missing 'data.Page' in AniList response."
    );
  }

  const { pageInfo, media } = json.data.Page;

  return {
    pageInfo,
    results: media.map(mapMedia),
  };
}