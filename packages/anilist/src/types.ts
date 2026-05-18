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


