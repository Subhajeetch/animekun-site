import { Hono } from "hono";
import { MediaSeason } from "../../../utils/types.js";
import type { AnimeResult } from "../../../utils/types.js";
import config from "../../../mine.config.js";
import type {
  CacheEntry,
  HomepageAnime,
  HomepageData,
  LatestEpisodeAnime,
  SpotlightAnime,
} from "../../../utils/homepage.types.js";

import type { Context } from "hono";

const homepageRoute = new Hono();

const ANILIST_GRAPHQL_URL = config.ANILIST.URI;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const CACHE_TTL_SECONDS = CACHE_TTL_MS / 1000;
const ANILIST_TIMEOUT_MS = 15_000;

let homepageCache: CacheEntry<HomepageData> | null = null;
let buildInFlight: Promise<HomepageData> | null = null;

const HOMEPAGE_QUERY = `
query Homepage($season: MediaSeason, $seasonYear: Int, $now: Int!) {
  spotlight: Page(page: 1, perPage: 10) {
    media(type: ANIME, sort: [TRENDING_DESC], format_in: [TV, TV_SHORT], isAdult: false) {
      ...SpotlightCard
    }
  }

  trending: Page(page: 1, perPage: 20) {
    media(type: ANIME, sort: [TRENDING_DESC], format_in: [TV, TV_SHORT], isAdult: false) {
      ...AnimeCard
    }
  }

  topByDay: Page(page: 1, perPage: 10) {
    media(type: ANIME, sort: [TRENDING_DESC], status: RELEASING, format_in: [TV, TV_SHORT], isAdult: false) {
      ...AnimeCard
    }
  }

  topByWeek: Page(page: 1, perPage: 10) {
    media(type: ANIME, sort: [POPULARITY_DESC], status: RELEASING, format_in: [TV, TV_SHORT], isAdult: false) {
      ...AnimeCard
    }
  }

  topByMonth: Page(page: 1, perPage: 10) {
    media(type: ANIME, sort: [SCORE_DESC], status: RELEASING, format_in: [TV, TV_SHORT], isAdult: false) {
      ...AnimeCard
    }
  }

  mostWatched: Page(page: 1, perPage: 24) {
    media(type: ANIME, sort: [TRENDING_DESC], format_in: [TV, TV_SHORT], isAdult: false) {
      ...AnimeCard
    }
  }

  mostPopular: Page(page: 1, perPage: 24) {
    media(type: ANIME, sort: [POPULARITY_DESC], format_in: [TV, TV_SHORT], isAdult: false) {
      ...AnimeCard
    }
  }

  topRated: Page(page: 1, perPage: 24) {
    media(type: ANIME, sort: [SCORE_DESC], format_in: [TV, TV_SHORT], isAdult: false) {
      ...AnimeCard
    }
  }

  thisSeasonPopular: Page(page: 1, perPage: 24) {
    media(
      type: ANIME
      season: $season
      seasonYear: $seasonYear
      sort: [POPULARITY_DESC]
      format_in: [TV, TV_SHORT]
      isAdult: false
    ) {
      ...AnimeCard
    }
  }

  latestEpisodes: Page(page: 1, perPage: 50) {
    airingSchedules(notYetAired: false, airingAt_lesser: $now, sort: [TIME_DESC]) {
      episode
      airingAt
      media {
        ...AnimeCard
      }
    }
  }
}

fragment SpotlightCard on Media {
  ...AnimeCard
  description
}

fragment AnimeCard on Media {
  id
  idMal
  title {
    romaji
    english
    native
    userPreferred
  }
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
      siteUrl
    }
  }
  siteUrl
}
`;

interface AniListResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface RawHomepageData {
  spotlight?: RawMediaPage | null;
  trending?: RawMediaPage | null;
  topByDay?: RawMediaPage | null;
  topByWeek?: RawMediaPage | null;
  topByMonth?: RawMediaPage | null;
  mostWatched?: RawMediaPage | null;
  mostPopular?: RawMediaPage | null;
  topRated?: RawMediaPage | null;
  thisSeasonPopular?: RawMediaPage | null;
  latestEpisodes?: RawAiringSchedulePage | null;
}

interface RawMediaPage {
  media?: RawMedia[] | null;
}

interface RawAiringSchedulePage {
  airingSchedules?: RawAiringSchedule[] | null;
}

interface RawAiringSchedule {
  episode?: number | null;
  airingAt?: number | null;
  media?: RawMedia | null;
}

interface RawMedia {
  id: number;
  idMal?: number | null;
  title?: {
    romaji?: string | null;
    english?: string | null;
    native?: string | null;
    userPreferred?: string | null;
  } | null;
  description?: string | null;
  coverImage?: {
    extraLarge?: string | null;
    large?: string | null;
    medium?: string | null;
    color?: string | null;
  } | null;
  bannerImage?: string | null;
  format?: AnimeResult["format"];
  status?: AnimeResult["status"];
  season?: AnimeResult["season"];
  seasonYear?: number | null;
  episodes?: number | null;
  duration?: number | null;
  genres?: string[] | null;
  averageScore?: number | null;
  popularity?: number | null;
  favourites?: number | null;
  isAdult?: boolean | null;
  startDate?: AnimeResult["startDate"] | null;
  endDate?: AnimeResult["endDate"] | null;
  trailer?: AnimeResult["trailer"] | null;
  studios?: {
    nodes?: AnimeResult["studios"] | null;
  } | null;
  siteUrl?: string | null;
}

function isCacheValid(): boolean {
  return homepageCache !== null && Date.now() < homepageCache.expiresAt;
}

function setCacheHeaders(c: Context) {
  c.header(
    "Cache-Control",
    `public, max-age=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS}`
  );
}

function getCurrentSeason(): { season: MediaSeason; year: number } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (month <= 3) return { season: MediaSeason.WINTER, year };
  if (month <= 6) return { season: MediaSeason.SPRING, year };
  if (month <= 9) return { season: MediaSeason.SUMMER, year };

  return { season: MediaSeason.FALL, year };
}

function emptyDate(): AnimeResult["startDate"] {
  return { year: null, month: null, day: null };
}

function toHomepageAnime(media: RawMedia | null | undefined): HomepageAnime | null {
  if (!media || typeof media.id !== "number") return null;

  return {
    id: media.id,
    idMal: media.idMal ?? null,
    title: {
      romaji: media.title?.romaji ?? null,
      english: media.title?.english ?? null,
      native: media.title?.native ?? null,
      userPreferred: media.title?.userPreferred ?? null,
    } as AnimeResult["title"],
    coverImage: {
      extraLarge: media.coverImage?.extraLarge ?? null,
      large: media.coverImage?.large ?? null,
      medium: media.coverImage?.medium ?? null,
      color: media.coverImage?.color ?? null,
    } as AnimeResult["coverImage"],
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
    startDate: media.startDate ?? emptyDate(),
    endDate: media.endDate ?? emptyDate(),
    trailer: media.trailer ?? null,
    studios: (media.studios?.nodes ?? []) as AnimeResult["studios"],
    siteUrl: media.siteUrl ?? null,
  };
}

function toSpotlightAnime(media: RawMedia | null | undefined): SpotlightAnime | null {
  const anime = toHomepageAnime(media);
  if (!anime) return null;

  return {
    ...anime,
    description: media?.description ?? null,
  };
}

function getHomepageResults(page: RawMediaPage | null | undefined): HomepageAnime[] {
  return (page?.media ?? [])
    .map(toHomepageAnime)
    .filter((anime): anime is HomepageAnime => anime !== null);
}

function getSpotlightResults(page: RawMediaPage | null | undefined): SpotlightAnime[] {
  const withBanner = (page?.media ?? [])
    .map(toSpotlightAnime)
    .filter((anime): anime is SpotlightAnime => anime !== null && Boolean(anime.bannerImage));

  if (withBanner.length >= 6) {
    return withBanner.slice(0, 8);
  }

  return (page?.media ?? [])
    .map(toSpotlightAnime)
    .filter((anime): anime is SpotlightAnime => anime !== null)
    .slice(0, 8);
}

function getLatestEpisodeResults(
  page: RawAiringSchedulePage | null | undefined
): LatestEpisodeAnime[] {
  const results = new Map<number, LatestEpisodeAnime>();

  for (const schedule of page?.airingSchedules ?? []) {
    const anime = toHomepageAnime(schedule.media);

    if (!anime || anime.isAdult || results.has(anime.id)) continue;

    results.set(anime.id, {
      ...anime,
      latestEpisode: {
        episode: schedule.episode ?? null,
        airingAt: schedule.airingAt ?? null,
        airingAtDate: schedule.airingAt
          ? new Date(schedule.airingAt * 1000).toISOString()
          : null,
      },
    });

    if (results.size >= 24) break;
  }

  return [...results.values()];
}

const ANILIST_RETRY_COUNT = 3;
const ANILIST_RETRY_DELAY_MS = 700;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function getErrorCauseCode(error: unknown): string | null {
  if (!(error instanceof Error)) return null;

  const cause = error.cause as { code?: string } | undefined;
  return cause?.code ?? null;
}

function isRetryableAniListError(error: unknown): boolean {
  const code = getErrorCauseCode(error);

  return (
    code === "EAI_AGAIN" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    getErrorMessage(error).includes("aborted")
  );
}

async function fetchAniListHomepage(
  season: MediaSeason,
  seasonYear: number,
  now: number
): Promise<RawHomepageData> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= ANILIST_RETRY_COUNT; attempt++) {
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
          query: HOMEPAGE_QUERY,
          variables: { season, seasonYear, now },
        }),
        signal: controller.signal,
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          `AniList returned ${response.status}: ${text.slice(0, 300)}`
        );
      }

      const payload = JSON.parse(text) as AniListResponse<RawHomepageData>;

      if (payload.errors?.length) {
        throw new Error(payload.errors.map((error) => error.message).join("; "));
      }

      if (!payload.data) {
        throw new Error("AniList response did not include data.");
      }

      return payload.data;
    } catch (error) {
      lastError = error;

      const retryable = isRetryableAniListError(error);
      const isLastAttempt = attempt === ANILIST_RETRY_COUNT;

      console.error(
        `[homepage] AniList request failed. Attempt ${attempt}/${ANILIST_RETRY_COUNT}:`,
        getErrorMessage(error)
      );

      if (!retryable || isLastAttempt) break;

      await sleep(ANILIST_RETRY_DELAY_MS * attempt);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("AniList homepage request failed.");
}

async function buildHomepageData(): Promise<HomepageData> {
  const nowMs = Date.now();
  const nowSeconds = Math.floor(nowMs / 1000);
  const { season, year } = getCurrentSeason();

  const raw = await fetchAniListHomepage(season, year, nowSeconds);

  return {
    spotlight: getSpotlightResults(raw.spotlight),
    trending: getHomepageResults(raw.trending),

    topByTime: {
      byDay: getHomepageResults(raw.topByDay),
      byWeek: getHomepageResults(raw.topByWeek),
      byMonth: getHomepageResults(raw.topByMonth),
    },

    mostWatched: {
      title: "Most Watched",
      results: getHomepageResults(raw.mostWatched),
    },

    mostPopular: {
      title: "Most Popular",
      results: getHomepageResults(raw.mostPopular),
    },

    latestEpisodes: {
      title: "Latest Episodes",
      results: getLatestEpisodeResults(raw.latestEpisodes),
    },

    topRated: {
      title: "Top Rated",
      results: getHomepageResults(raw.topRated),
    },

    thisSeasonPopular: {
      title: "Popular This Season",
      results: getHomepageResults(raw.thisSeasonPopular),
    },

    generatedAt: new Date(nowMs).toISOString(),
    cacheExpiresAt: nowMs + CACHE_TTL_MS,
  };
}

homepageRoute.get("/homepage", async (c) => {
  setCacheHeaders(c);

  if (isCacheValid()) {
    return c.json(homepageCache!.data);
  }

  if (!buildInFlight) {
    buildInFlight = buildHomepageData().finally(() => {
      buildInFlight = null;
    });
  }

  try {
    const data = await buildInFlight;

    homepageCache = {
      data,
      expiresAt: data.cacheExpiresAt,
    };

    return c.json(data);
} catch (err) {
    console.error("[homepage] Failed to build homepage data:", err);

    if (homepageCache) {
        return c.json(homepageCache.data);
    }

    return c.json(
        {
        error: "Homepage data is temporarily unavailable.",
        },
        503
    );
}
});

homepageRoute.delete("/homepage/cache", (c) => {
  homepageCache = null;
  buildInFlight = null;

  return c.json({
    success: true,
    message: "Homepage cache cleared.",
  });
});

homepageRoute.get("/homepage/cache/status", (c) => {
  if (!homepageCache) {
    return c.json({
      cached: false,
      message: "No homepage cache exists.",
    });
  }

  const remainingMs = homepageCache.expiresAt - Date.now();
  const cached = remainingMs > 0;

  return c.json({
    cached,
    generatedAt: homepageCache.data.generatedAt,
    expiresAt: new Date(homepageCache.expiresAt).toISOString(),
    remainingSeconds: cached ? Math.floor(remainingMs / 1000) : 0,
  });
});

export default homepageRoute;