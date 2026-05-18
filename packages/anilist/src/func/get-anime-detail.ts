// ─────────────────────────────────────────────────────────────
//  AniList GraphQL — Get Anime Details
//  Companion to: @/anilist/search-animes.ts
//  API Docs    : https://anilist.gitbook.io/anilist-apiv2-docs
// ─────────────────────────────────────────────────────────────

import config from "../mine.config";

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
} from "../types";

import { AniListError } from "../classes";

const ANILIST_ENDPOINT = config.ANILIST.URI;


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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Origin: "https://anilist.co",
        Referer: "https://anilist.co",
      },
      body: JSON.stringify({
        query: GET_ANIME_QUERY,
        variables: { id },
      }),
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
