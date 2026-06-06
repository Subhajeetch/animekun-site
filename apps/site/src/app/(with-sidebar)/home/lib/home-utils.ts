import type { HomepageAnime, SpotlightAnime } from "./home-types";

export function getAnimeTitle(anime: Pick<HomepageAnime, "title">): string {
  return (
    anime.title.english ??
    anime.title.userPreferred ??
    anime.title.romaji ??
    anime.title.native ??
    "Unknown Anime"
  );
}

export function getAnimeImage(anime: HomepageAnime): string {
  return (
    anime.bannerImage ??
    anime.coverImage.extraLarge ??
    anime.coverImage.large ??
    anime.coverImage.medium ??
    ""
  );
}

export function getAnimePoster(anime: HomepageAnime): string {
  return anime.coverImage.extraLarge ?? anime.coverImage.large ?? anime.coverImage.medium ?? "";
}

export function getAnimeHref(anime: HomepageAnime): string {
  return `/anime/${anime.id}`;
}

export function getWatchHref(anime: HomepageAnime): string {
  return `/watch/${anime.id}`;
}

export function cleanDescription(html: string | null): string {
  if (!html) return "";

  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getHeroDescription(anime: SpotlightAnime): string {
  const description = cleanDescription(anime.description);
  return description.length > 260 ? `${description.slice(0, 257).trim()}...` : description;
}

export function formatAnimeMeta(anime: HomepageAnime): string {
  const parts = [
    anime.format?.replace(/_/g, " "),
    anime.duration ? `${anime.duration}m` : null,
    anime.seasonYear ? String(anime.seasonYear) : null,
  ];

  return parts.filter(Boolean).join(" • ");
}

export function formatScore(score: number | null): string {
  return score == null ? "N/A" : `${score}%`;
}

export function formatEpisodeCount(episodes: number | null): string {
  return episodes == null ? "EP ?" : `EP ${episodes}`;
}

export function formatLatestEpisode(episode: number | null): string {
  return episode == null ? "Latest episode" : `Episode ${episode}`;
}

export function genreHref(genre: string): string {
  return `/search?genres=${encodeURIComponent(genre)}`;
}

export function makeItemListJsonLd(items: HomepageAnime[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.slice(0, 10).map((anime, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}${getAnimeHref(anime)}`,
      name: getAnimeTitle(anime),
    })),
  };
}