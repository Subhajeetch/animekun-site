// ─────────────────────────────────────────────────────────────
//  AniList GraphQL — Get Anime Details
//  Companion to: @/anilist/search-animes.ts
//  API Docs    : https://anilist.gitbook.io/anilist-apiv2-docs
// ─────────────────────────────────────────────────────────────

import config from "@/mine.config";

const ANILIST_ENDPOINT = config.ANILIST.URI;

// ─── Re-exported enums (kept in sync with search-animes.ts) ──

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

export enum RelationType {
  ADAPTATION = "ADAPTATION",
  PREQUEL = "PREQUEL",
  SEQUEL = "SEQUEL",
  PARENT = "PARENT",
  SIDE_STORY = "SIDE_STORY",
  CHARACTER = "CHARACTER",
  SUMMARY = "SUMMARY",
  ALTERNATIVE = "ALTERNATIVE",
  SPIN_OFF = "SPIN_OFF",
  OTHER = "OTHER",
  SOURCE = "SOURCE",
  COMPILATION = "COMPILATION",
  CONTAINS = "CONTAINS",
}

// ─── Response Types ───────────────────────────────────────────

export interface AnimeTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
  userPreferred: string | null;
}

export interface AnimeCoverImage {
  extraLarge: string | null;
  large: string | null;
  medium: string | null;
  color: string | null;
}

export interface FuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AnimeStudio {
  id: number;
  name: string;
  isAnimationStudio: boolean;
  siteUrl: string | null;
}

export interface AnimeTrailer {
  id: string | null;
  site: string | null;
  thumbnail: string | null;
}

export interface AnimeTag {
  name: string;
  description: string | null;
  rank: number;
  isMediaSpoiler: boolean;
  isGeneralSpoiler: boolean;
}

export interface AnimeCharacterName {
  full: string | null;
  native: string | null;
}

export interface AnimeCharacterImage {
  large: string | null;
  medium: string | null;
}

export interface AnimeCharacter {
  id: number;
  name: AnimeCharacterName;
  image: AnimeCharacterImage;
  description: string | null;
  gender: string | null;
  siteUrl: string | null;
  /** The voice actor for this character (Japanese VA by default) */
  voiceActor: {
    id: number;
    name: { full: string | null; native: string | null };
    image: { large: string | null };
    languageV2: string | null;
  } | null;
  /** Role in the story: MAIN, SUPPORTING, BACKGROUND */
  role: "MAIN" | "SUPPORTING" | "BACKGROUND";
}

export interface AnimeExternalLink {
  id: number;
  url: string;
  site: string;
  type: string | null;
  icon: string | null;
  color: string | null;
}

export interface AnimeStreamingEpisode {
  title: string | null;
  thumbnail: string | null;
  url: string | null;
  site: string | null;
}

export interface RelatedAnime {
  id: number;
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  format: MediaFormat | null;
  status: MediaStatus | null;
  episodes: number | null;
  season: MediaSeason | null;
  seasonYear: number | null;
  /** How this relates to the current anime */
  relationType: RelationType;
}

export interface AnimeReview {
  id: number;
  summary: string | null;
  score: number | null;
  rating: number | null;
  ratingAmount: number | null;
  user: {
    id: number;
    name: string;
    avatar: { large: string | null } | null;
  };
}

export interface AnimeRanking {
  rank: number;
  type: string;
  format: string;
  year: number | null;
  season: string | null;
  allTime: boolean;
  context: string;
}

export interface AnimeDetails {
  id: number;
  idMal: number | null;

  // Titles & Identity
  title: AnimeTitle;
  synonyms: string[];
  description: string | null;

  // Visuals
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  trailer: AnimeTrailer | null;

  // Classification
  format: MediaFormat | null;
  status: MediaStatus | null;
  season: MediaSeason | null;
  seasonYear: number | null;
  source: string | null;
  countryOfOrigin: string | null;
  isAdult: boolean;

  // Stats
  episodes: number | null;
  duration: number | null;
  chapters: number | null;
  volumes: number | null;

  // Dates
  startDate: FuzzyDate;
  endDate: FuzzyDate;

  // Scores
  averageScore: number | null;     // 0–100
  meanScore: number | null;        // 0–100
  popularity: number | null;
  favourites: number | null;
  trending: number | null;

  // Rankings
  rankings: AnimeRanking[];

  // Taxonomy
  genres: string[];
  tags: AnimeTag[];

  // Relations
  relations: RelatedAnime[];
  studios: AnimeStudio[];
  producers: AnimeStudio[];

  // People & Characters
  characters: AnimeCharacter[];

  // Links
  externalLinks: AnimeExternalLink[];
  streamingEpisodes: AnimeStreamingEpisode[];
  siteUrl: string | null;
}

// ─── Custom Error ─────────────────────────────────────────────

export class AniListError extends Error {
  public readonly status?: number;
  public readonly errors?: Array<{ message?: string; status?: number }>;

  constructor(
    message: string,
    options?: {
      status?: number;
      errors?: Array<{ message?: string; status?: number }>;
    }
  ) {
    super(message);
    this.name = "AniListError";
    this.status = options?.status;
    this.errors = options?.errors;
  }
}

// ─── GraphQL Query ────────────────────────────────────────────

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

// ─── Raw types (internal only) ────────────────────────────────

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

interface RawApiResponse {
  data?: { Media: RawMedia };
  errors?: Array<{ message?: string; status?: number }>;
}

// ─── Helpers ──────────────────────────────────────────────────

function formatFuzzyDate(date: FuzzyDate): string | null {
  if (!date.year) return null;
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const month = date.month ? months[date.month - 1] : null;
  return [month, date.day, date.year].filter(Boolean).join(" ");
}

// ─── Mapper ───────────────────────────────────────────────────

function mapMedia(raw: RawMedia): AnimeDetails {
  // Studios vs Producers
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

// ─── Public Utilities ──────────────────────────────────────────

/**
 * Format a FuzzyDate to a human-readable string.
 * Exported so the UI layer can reuse it without reimplementing.
 */
export { formatFuzzyDate };

/**
 * Extract the numeric AniList ID from a slug like "demon-slayer-12345"
 */
export function extractIdFromSlug(slug: string | undefined | null): number | null {
  if (!slug || typeof slug !== "string") return null;
  const lastDash = slug.lastIndexOf("-");
  if (lastDash === -1) return null;
  const id = parseInt(slug.slice(lastDash + 1), 10);
  return isNaN(id) ? null : id;
}
// ─── Main Function ─────────────────────────────────────────────

/**
 * Fetch full details for a single anime from AniList.
 *
 * @param id - The AniList media ID (integer)
 * @returns A fully-typed `AnimeDetails` object
 * @throws `AniListError` on network failure, bad HTTP status, GraphQL errors,
 *         or when the anime is not found.
 *
 * @example
 * const anime = await getAnime(21);
 * console.log(anime.title.english); // "Fullmetal Alchemist: Brotherhood"
 */
export async function getAnime(id: number): Promise<AnimeDetails> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AniListError(`Invalid anime ID: "${id}". Must be a positive integer.`);
  }

  let response: Response;

  try {
    response = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: GET_ANIME_QUERY,
        variables: { id },
      }),
      // Next.js — revalidate every 6 hours, tag for on-demand purging
      next: { revalidate: 21600, tags: [`anime-${id}`] },
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

  let json: RawApiResponse;

  try {
    json = (await response.json()) as RawApiResponse;
  } catch {
    throw new AniListError("Failed to parse AniList API response as JSON.");
  }

  if (json.errors && json.errors.length > 0) {
    const first = json.errors[0]!;
    // 404 from AniList comes back as a GraphQL error with status 404
    if (first.status === 404) {
      throw new AniListError(`Anime with ID ${id} was not found.`, {
        status: 404,
        errors: json.errors,
      });
    }
    throw new AniListError(`AniList GraphQL error: ${first.message || "Unknown error"}`, {
      status: first.status,
      errors: json.errors,
    });
  }

  if (!json.data?.Media) {
    throw new AniListError(
      `Unexpected response shape: missing 'data.Media' for ID ${id}.`
    );
  }

  return mapMedia(json.data.Media);
}