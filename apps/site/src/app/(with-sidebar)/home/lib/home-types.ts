export interface AnimeTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
  userPreferred?: string | null;
}

export interface AnimeCoverImage {
  extraLarge?: string | null;
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
  siteUrl?: string | null;
}

export interface HomepageAnime {
  id: number;
  idMal: number | null;
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  format: string | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  genres: string[];
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

export interface SpotlightAnime extends HomepageAnime {
  description: string | null;
}

export interface LatestEpisodeAnime extends HomepageAnime {
  latestEpisode: {
    episode: number | null;
    airingAt: number | null;
    airingAtDate: string | null;
  };
}

export interface HomepageSection<T = HomepageAnime> {
  title: string;
  results: T[];
}

export interface TrendingByTime {
  byDay: HomepageAnime[];
  byWeek: HomepageAnime[];
  byMonth: HomepageAnime[];
}

export interface HomepageData {
  spotlight: SpotlightAnime[];
  trending: HomepageAnime[];
  topByTime: TrendingByTime;
  mostWatched: HomepageSection;
  mostPopular: HomepageSection;
  latestEpisodes: HomepageSection<LatestEpisodeAnime>;
  topRated: HomepageSection;
  thisSeasonPopular: HomepageSection;
  generatedAt: string;
  cacheExpiresAt: number;
}