// ─────────────────────────────────────────────
//  AniList GraphQL — Advanced Anime Search
//  Environment : Next.js (browser / RSC safe)
//  API Docs    : https://anilist.gitbook.io/anilist-apiv2-docs
// ─────────────────────────────────────────────

import config from "../mine.config";
import type {
  AnimeCoverImage,
  AnimeDate,
  AnimeResult,
  AnimeStudio,
  AnimeTitle,
  AnimeTrailer,
  MediaFormat,
  MediaSeason,
  MediaStatus,
  PageInfo,
  SearchAnimesParams,
  SearchAnimesResult,
} from "../types";

import { AniListError } from "../classes";

const ANILIST_ENDPOINT = config.ANILIST.URI;


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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Origin: "https://anilist.co",
        Referer: "https://anilist.co",
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
