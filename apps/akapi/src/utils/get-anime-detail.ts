// ─────────────────────────────────────────────────────────────
//  AniList GraphQL — Get Anime Details + Episodes
//  Companion to: @/anilist/search-animes.ts
//  API Docs    : https://anilist.gitbook.io/anilist-apiv2-docs
// ─────────────────────────────────────────────────────────────

import config from "../mine.config.js";

import type {
  AnimeCharacter,
  AnimeCoverImage,
  AnimeDetails,
  AnimeRanking,
  AnimeStreamingEpisode,
  AnimeTag,
  AnimeTitle,
  FuzzyDate,
  MediaFormat,
  MediaSeason,
  MediaStatus,
  RelationType,
  RelatedAnime,
  AnimeTrailer,
  AnimeStudio,
  AnimeExternalLink,
  AiringEpisode,
  AiringSchedulePage,
} from "./types.js";

import { AniListError } from "./classes.js";


const ANILIST_ENDPOINT = config.ANILIST.URI;

// ─────────────────────────────────────────────────────────────
//  HOW EPISODE DATA WORKS ON ANILIST
//
//  ┌─────────────────────┬──────────────────────────────────────┐
//  │ Field               │ What it is                           │
//  ├─────────────────────┼──────────────────────────────────────┤
//  │ Media.episodes      │ Total episode count from the         │
//  │                     │ publisher/studio. Plain integer,     │
//  │                     │ null when the count is unknown       │
//  │                     │ (ongoing shows that haven't          │
//  │                     │ announced an end).                   │
//  ├─────────────────────┼──────────────────────────────────────┤
//  │ nextAiringEpisode   │ The single next episode scheduled    │
//  │                     │ to air. null for finished shows.     │
//  ├─────────────────────┼──────────────────────────────────────┤
//  │ airingSchedule      │ Per-episode air dates stored by      │
//  │                     │ AniList. Paginated at 50/page.       │
//  │                     │ Does NOT include future eps AniList  │
//  │                     │ has no schedule data for yet.        │
//  ├─────────────────────┼──────────────────────────────────────┤
//  │ streamingEpisodes   │ Streaming links scraped from partner │
//  │                     │ sites. Hard-capped at ~50. NOT a     │
//  │                     │ reliable episode counter — use it    │
//  │                     │ only for its URL/thumbnail data.     │
//  └─────────────────────┴──────────────────────────────────────┘
//
//  STRATEGY
//  • getAnime()    — fetches everything in ONE request, including
//                    the first 50 airing episodes. Good enough for
//                    most shows (≤50 eps). For longer shows the
//                    caller can follow up with getEpisodes().
//
//  • getEpisodes() — fetches the total episode count + ALL airing
//                    schedule pages in parallel. Fast even for
//                    1000+ episode shows because pages are fetched
//                    concurrently instead of sequentially.
// ─────────────────────────────────────────────────────────────


// ─── GraphQL Queries ──────────────────────────────────────────

const GET_ANIME_QUERY = /* graphql */ `
  query GetAnimeDetails($id: Int!) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      synonyms
      description(asHtml: false)
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      trailer {
        id
        site
        thumbnail
      }
      format
      status
      season
      seasonYear
      source
      countryOfOrigin
      isAdult
      episodes
      duration
      chapters
      volumes
      startDate { year month day }
      endDate   { year month day }
      averageScore
      meanScore
      popularity
      favourites
      trending

      nextAiringEpisode {
        id
        episode
        airingAt
        timeUntilAiring
      }

      airingSchedule(page: 1, perPage: 50, notYetAired: false) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        nodes {
          id
          episode
          airingAt
          timeUntilAiring
        }
      }

      rankings {
        rank
        type
        format
        year
        season
        allTime
        context
      }
      genres
      tags {
        name
        description
        rank
        isMediaSpoiler
        isGeneralSpoiler
      }
      relations {
        edges {
          relationType
          node {
            id
            title { romaji english native userPreferred }
            coverImage { extraLarge large medium color }
            format
            status
            episodes
            season
            seasonYear
          }
        }
      }
      studios {
        edges {
          isMain
          node {
            id
            name
            isAnimationStudio
            siteUrl
          }
        }
      }
      characters(sort: [ROLE, ID], perPage: 24) {
        edges {
          role
          voiceActors(language: JAPANESE, sort: RELEVANCE) {
            id
            name { full native }
            image { large }
            languageV2
          }
          node {
            id
            name { full native }
            image { large medium }
            description(asHtml: false)
            gender
            siteUrl
          }
        }
      }
      externalLinks {
        id
        url
        site
        type
        icon
        color
      }
      streamingEpisodes {
        title
        thumbnail
        url
        site
      }
      siteUrl
    }
  }
`;

// Fetches one page of the airing schedule + metadata.
// Used by getEpisodes() to fan out parallel page requests.
const GET_AIRING_PAGE_QUERY = /* graphql */ `
  query GetAiringPage($id: Int!, $page: Int!) {
    Media(id: $id, type: ANIME) {
      episodes
      nextAiringEpisode {
        id
        episode
        airingAt
        timeUntilAiring
      }
      airingSchedule(page: $page, perPage: 50, notYetAired: false) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        nodes {
          id
          episode
          airingAt
          timeUntilAiring
        }
      }
    }
  }
`;


// ─── Raw types (internal only) ────────────────────────────────

interface RawAiringNode {
  id: number;
  episode: number;
  airingAt: number;
  timeUntilAiring: number;
}

interface RawPageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

interface RawAiringSchedule {
  pageInfo: RawPageInfo;
  nodes: RawAiringNode[];
}

interface RawNextAiringEpisode {
  id: number;
  episode: number;
  airingAt: number;
  timeUntilAiring: number;
}

interface RawRelationEdge {
  relationType: string;
  node: {
    id: number;
    title: AnimeTitle;
    coverImage: AnimeCoverImage;
    format: string | null;
    status: string | null;
    episodes: number | null;
    season: string | null;
    seasonYear: number | null;
  };
}

interface RawStudioEdge {
  isMain: boolean;
  node: {
    id: number;
    name: string;
    isAnimationStudio: boolean;
    siteUrl: string | null;
  };
}

interface RawCharacterEdge {
  role: "MAIN" | "SUPPORTING" | "BACKGROUND";
  voiceActors: Array<{
    id: number;
    name: { full: string | null; native: string | null };
    image: { large: string | null };
    languageV2: string | null;
  }>;
  node: {
    id: number;
    name: { full: string | null; native: string | null };
    image: { large: string | null; medium: string | null };
    description: string | null;
    gender: string | null;
    siteUrl: string | null;
  };
}

interface RawMedia {
  id: number;
  idMal: number | null;
  title: AnimeTitle;
  synonyms: string[];
  description: string | null;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  trailer: AnimeTrailer | null;
  format: string | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  source: string | null;
  countryOfOrigin: string | null;
  isAdult: boolean;
  episodes: number | null;
  duration: number | null;
  chapters: number | null;
  volumes: number | null;
  startDate: FuzzyDate;
  endDate: FuzzyDate;
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  favourites: number | null;
  trending: number | null;
  nextAiringEpisode: RawNextAiringEpisode | null;
  airingSchedule: RawAiringSchedule;
  rankings: AnimeRanking[];
  genres: string[];
  tags: AnimeTag[];
  relations: { edges: RawRelationEdge[] };
  studios: { edges: RawStudioEdge[] };
  characters: { edges: RawCharacterEdge[] };
  externalLinks: AnimeExternalLink[];
  streamingEpisodes: AnimeStreamingEpisode[];
  siteUrl: string | null;
}

// Minimal shape returned by GET_AIRING_PAGE_QUERY
interface RawAiringPageMedia {
  episodes: number | null;
  nextAiringEpisode: RawNextAiringEpisode | null;
  airingSchedule: RawAiringSchedule;
}

interface RawApiResponse {
  data?: { Media: RawMedia };
  errors?: Array<{ message?: string; status?: number }>;
}

interface RawAiringPageResponse {
  data?: { Media: RawAiringPageMedia };
  errors?: Array<{ message?: string; status?: number }>;
}


// ─── Internal helpers ─────────────────────────────────────────

async function postToAniList<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (networkError) {
    throw new AniListError(
      `Network request failed: ${
        networkError instanceof Error ? networkError.message : "Unknown network error"
      }`
    );
  }

  if (!response.ok) {
    throw new AniListError(
      `AniList API returned HTTP ${response.status}: ${response.statusText}`,
      { status: response.status }
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new AniListError("Failed to parse AniList API response as JSON.");
  }
}

function throwIfGraphQLErrors(
  errors: Array<{ message?: string; status?: number }> | undefined,
  id: number
): void {
  if (!errors || errors.length === 0) return;

  console.error("AniList GraphQL Errors:", JSON.stringify(errors, null, 2));

  const first = errors[0]!;

  if (first.status === 404) {
    throw new AniListError(`Anime with ID ${id} was not found.`, {
      status: 404,
      errors,
    });
  }

  throw new AniListError(
    `AniList GraphQL error: ${first.message ?? "Unknown error"}`,
    { status: first.status, errors }
  );
}

function mapAiringNode(node: RawAiringNode): AiringEpisode {
  return {
    id: node.id,
    episode: node.episode,
    airingAt: node.airingAt,
    airingAtDate: new Date(node.airingAt * 1000),
    timeUntilAiring: node.timeUntilAiring,
    hasAired: node.timeUntilAiring <= 0,
  };
}

function mapMedia(raw: RawMedia): AnimeDetails {
  const studios: AnimeStudio[] = [];
  const producers: AnimeStudio[] = [];

  for (const edge of raw.studios.edges) {
    const studio: AnimeStudio = { ...edge.node };
    if (edge.isMain) {
      studios.push(studio);
    } else {
      producers.push(studio);
    }
  }

  const relations: RelatedAnime[] = raw.relations.edges.map((edge) => ({
    id: edge.node.id,
    title: edge.node.title,
    coverImage: edge.node.coverImage,
    format: (edge.node.format as MediaFormat) ?? null,
    status: (edge.node.status as MediaStatus) ?? null,
    episodes: edge.node.episodes,
    season: (edge.node.season as MediaSeason) ?? null,
    seasonYear: edge.node.seasonYear,
    relationType: edge.relationType as RelationType,
  }));

  const characters: AnimeCharacter[] = raw.characters.edges.map((edge) => ({
    id: edge.node.id,
    name: edge.node.name,
    image: edge.node.image,
    description: edge.node.description,
    gender: edge.node.gender,
    siteUrl: edge.node.siteUrl,
    role: edge.role,
    voiceActor: edge.voiceActors[0] ?? null,
  }));

  const nextAiringEpisode: AiringEpisode | null = raw.nextAiringEpisode
    ? mapAiringNode(raw.nextAiringEpisode)
    : null;

  const airingSchedule: AiringSchedulePage = {
    pageInfo: raw.airingSchedule.pageInfo,
    episodes: raw.airingSchedule.nodes.map(mapAiringNode),
  };

  return {
    id: raw.id,
    idMal: raw.idMal,
    title: raw.title,
    synonyms: raw.synonyms,
    description: raw.description,
    coverImage: raw.coverImage,
    bannerImage: raw.bannerImage,
    trailer: raw.trailer,
    format: (raw.format as MediaFormat) ?? null,
    status: (raw.status as MediaStatus) ?? null,
    season: (raw.season as MediaSeason) ?? null,
    seasonYear: raw.seasonYear,
    source: raw.source,
    countryOfOrigin: raw.countryOfOrigin,
    isAdult: raw.isAdult,
    episodes: raw.episodes,
    duration: raw.duration,
    chapters: raw.chapters,
    volumes: raw.volumes,
    startDate: raw.startDate,
    endDate: raw.endDate,
    averageScore: raw.averageScore,
    meanScore: raw.meanScore,
    popularity: raw.popularity,
    favourites: raw.favourites,
    trending: raw.trending,
    nextAiringEpisode,
    airingSchedule,
    rankings: raw.rankings,
    genres: raw.genres,
    tags: raw.tags,
    relations,
    studios,
    producers,
    characters,
    externalLinks: raw.externalLinks,
    streamingEpisodes: raw.streamingEpisodes,
    siteUrl: raw.siteUrl,
  };
}


// ─── Public Utilities ─────────────────────────────────────────

/**
 * Format a FuzzyDate to a human-readable string.
 * Exported so the UI layer can reuse it without reimplementing.
 *
 * @example
 * formatFuzzyDate({ year: 2009, month: 4, day: 5 }) // "Apr 5 2009"
 * formatFuzzyDate({ year: 2009, month: null, day: null }) // "2009"
 * formatFuzzyDate({ year: null, month: null, day: null }) // null
 */
export function formatFuzzyDate(date: FuzzyDate): string | null {
  if (!date.year) return null;
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const month = date.month ? months[date.month - 1] : null;
  return [month, date.day, date.year].filter(Boolean).join(" ");
}

/**
 * Extract the numeric AniList ID from a slug like "demon-slayer-12345".
 *
 * @example
 * extractIdFromSlug("fullmetal-alchemist-brotherhood-5114") // 5114
 * extractIdFromSlug(null) // null
 */
export function extractIdFromSlug(slug: string | undefined | null): number | null {
  if (!slug || typeof slug !== "string") return null;
  const lastDash = slug.lastIndexOf("-");
  if (lastDash === -1) return null;
  const id = parseInt(slug.slice(lastDash + 1), 10);
  return isNaN(id) ? null : id;
}


// ─── getAnime ─────────────────────────────────────────────────

/**
 * Fetch full details for a single anime from AniList in **one request**.
 *
 * What you get:
 * - `episodes`          — total episode count from the publisher (plain integer).
 *                         e.g. 1000+ for One Piece. null when unannounced.
 *                         This is NOT streamingEpisodes.length — that field is
 *                         capped at ~50 and should only be used for its links.
 * - `nextAiringEpisode` — the next episode to air, with Unix timestamp and
 *                         a pre-converted Date object. null for finished shows.
 * - `airingSchedule`    — first 50 per-episode air dates AniList has on record,
 *                         plus pageInfo. If `pageInfo.hasNextPage` is true the
 *                         show has more episode data — call `getEpisodes(id)`.
 *
 * @param id - The AniList media ID (positive integer)
 * @returns A fully-typed `AnimeDetails` object
 * @throws `AniListError` on network failure, bad HTTP status, GraphQL errors,
 *         or when the anime is not found.
 *
 * @example
 * // Finished show — all episodes in airingSchedule already
 * const fmab = await getAnime(5114);
 * fmab.title.english                    // "Fullmetal Alchemist: Brotherhood"
 * fmab.episodes                         // 64
 * fmab.nextAiringEpisode                // null
 * fmab.airingSchedule.pageInfo.hasNextPage // false
 *
 * // Long-running show — follow up with getEpisodes() if you need them all
 * const op = await getAnime(21);
 * op.episodes                           // 1000+ (or null)
 * op.nextAiringEpisode?.episode         // e.g. 1122
 * op.nextAiringEpisode?.airingAtDate    // Date object
 * op.airingSchedule.pageInfo.hasNextPage // true → call getEpisodes(21)
 */
export async function getAnime(id: number): Promise<AnimeDetails> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AniListError(`Invalid anime ID: "${id}". Must be a positive integer.`);
  }

  const json = await postToAniList<RawApiResponse>(GET_ANIME_QUERY, { id });

  throwIfGraphQLErrors(json.errors, id);

  if (!json.data?.Media) {
    throw new AniListError(
      `Unexpected response shape: missing 'data.Media' for ID ${id}.`
    );
  }

  return mapMedia(json.data.Media);
}


// ─── getEpisodes ──────────────────────────────────────────────

/** Return value of `getEpisodes()` */
export interface EpisodesResult {
  /** Total episode count from the publisher. null when unknown (ongoing, unannounced). */
  totalEpisodes: number | null;
  /**
   * The next episode yet to air, with a pre-converted Date object.
   * null for finished or unreleased shows.
   */
  nextAiringEpisode: AiringEpisode | null;
  /**
   * Every episode AniList has airing schedule data for, sorted ascending
   * by episode number.
   *
   * Note: AniList may not store schedule data for every episode of very
   * long-running shows. `totalEpisodes` is the source of truth for how
   * many episodes exist — this array may be shorter.
   */
  episodes: AiringEpisode[];
}

/**
 * Fetch the total episode count and **all** per-episode airing dates for an
 * anime, using parallel requests so it's fast even for 1000+ episode shows.
 *
 * How it works:
 *  1. Fetches page 1 to discover `lastPage` and collect the first 50 episodes.
 *  2. Fires requests for pages 2…lastPage **all at once** with Promise.all.
 *  3. Merges and sorts everything by episode number.
 *
 * For a 1000-episode show this means ~20 parallel requests instead of 20
 * sequential ones — roughly 20× faster than a loop.
 *
 * ⚠️  AniList rate-limits unauthenticated clients at ~90 req/min.
 *     Shows with >90 pages (4 500+ episodes with full data) could hit that.
 *     In practice AniList doesn't store schedule data for every episode of
 *     ultra-long shows, so lastPage stays well below that ceiling.
 *
 * @param id - AniList media ID (positive integer)
 * @returns `EpisodesResult` with totalEpisodes, nextAiringEpisode, and episodes[]
 * @throws `AniListError` on network failure, bad HTTP status, or GraphQL errors.
 *
 * @example
 * const { totalEpisodes, nextAiringEpisode, episodes } = await getEpisodes(21);
 *
 * totalEpisodes                // 1000+ (or null if unannounced)
 * nextAiringEpisode?.episode   // e.g. 1122
 * nextAiringEpisode?.airingAtDate  // Date object
 * episodes.length              // however many AniList has data for
 * episodes[0].episode          // 1
 * episodes[0].airingAtDate     // Date("1999-10-20T…")
 * episodes[0].hasAired         // true
 */
export async function getEpisodes(id: number): Promise<EpisodesResult> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AniListError(`Invalid anime ID: "${id}". Must be a positive integer.`);
  }

  // ── Step 1: fetch page 1 to learn lastPage ──────────────────
  const page1Json = await postToAniList<RawAiringPageResponse>(
    GET_AIRING_PAGE_QUERY,
    { id, page: 1 }
  );

  throwIfGraphQLErrors(page1Json.errors, id);

  if (!page1Json.data?.Media) {
    throw new AniListError(
      `Unexpected response shape: missing 'data.Media' for ID ${id}.`
    );
  }

  const {
    episodes: totalEpisodes,
    nextAiringEpisode: rawNext,
    airingSchedule: firstSchedule,
  } = page1Json.data.Media;

  const { lastPage, hasNextPage } = firstSchedule.pageInfo;

  // Start collecting from page 1
  const allNodes: RawAiringNode[] = [...firstSchedule.nodes];

  // ── Step 2: fetch remaining pages in parallel ───────────────
  if (hasNextPage && lastPage > 1) {
    const remainingPages = Array.from(
      { length: lastPage - 1 },
      (_, i) => i + 2  // [2, 3, … lastPage]
    );

    const pageResults = await Promise.all(
      remainingPages.map((page) =>
        postToAniList<RawAiringPageResponse>(GET_AIRING_PAGE_QUERY, { id, page })
      )
    );

    for (const result of pageResults) {
      throwIfGraphQLErrors(result.errors, id);
      const nodes = result.data?.Media?.airingSchedule?.nodes;
      if (nodes) {
        allNodes.push(...nodes);
      }
    }
  }

  // ── Step 3: map + deduplicate + sort ───────────────────────
  // Deduplicate by episode id in case of any edge-case overlap between pages
  const seen = new Set<number>();
  const episodes: AiringEpisode[] = [];

  for (const node of allNodes) {
    if (!seen.has(node.id)) {
      seen.add(node.id);
      episodes.push(mapAiringNode(node));
    }
  }

  episodes.sort((a, b) => a.episode - b.episode);

  const nextAiringEpisode: AiringEpisode | null = rawNext
    ? mapAiringNode(rawNext)
    : null;

  return { totalEpisodes, nextAiringEpisode, episodes };
}