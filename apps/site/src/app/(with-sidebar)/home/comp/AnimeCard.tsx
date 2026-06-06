import Link from "next/link";
import { Play, Star } from "lucide-react";
import CustomImage from "@/components/custom-image";
import type { HomepageAnime, LatestEpisodeAnime } from "../lib/home-types";
import {
  formatAnimeMeta,
  formatLatestEpisode,
  formatScore,
  getAnimeHref,
  getAnimeImage,
  getAnimePoster,
  getAnimeTitle,
} from "../lib/home-utils";

interface AnimeCardProps {
  anime: HomepageAnime | LatestEpisodeAnime;
  variant?: "wide" | "poster" | "compact";
  rank?: number;
}

function isLatestEpisodeAnime(anime: HomepageAnime | LatestEpisodeAnime): anime is LatestEpisodeAnime {
  return "latestEpisode" in anime;
}

export default function AnimeCard({ anime, variant = "wide", rank }: AnimeCardProps) {
  const title = getAnimeTitle(anime);
  const href = getAnimeHref(anime);
  const image = variant === "poster" ? getAnimePoster(anime) : getAnimeImage(anime);

  if (variant === "compact") {
    return (
      <Link
        href={href}
        aria-label={`Open ${title}`}
        className="group grid h-full grid-cols-[74px_1fr_44px] gap-3 border border-zinc-800 bg-zinc-900/70 p-2 text-white transition-colors hover:border-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-zinc-950">
          {image && (
            <CustomImage
              src={image}
              width={120}
              height={180}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="min-w-0 py-1">
          <h3 className="line-clamp-2 text-sm font-black leading-snug">{title}</h3>
          <p className="mt-1 text-xs font-semibold text-zinc-400">{formatAnimeMeta(anime)}</p>
          {isLatestEpisodeAnime(anime) && (
            <p className="mt-1 text-xs text-zinc-500">
              {formatLatestEpisode(anime.latestEpisode.episode)}
            </p>
          )}
        </div>
        <span className="self-end bg-red-600 p-2 text-white transition-colors group-hover:bg-white group-hover:text-red-600">
          <Play className="h-5 w-5 fill-current" aria-hidden="true" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={`Open ${title}`}
      className="group block h-full border border-zinc-800 bg-zinc-950 text-white transition-colors hover:border-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
    >
      <div className={`relative overflow-hidden bg-zinc-900 ${variant === "poster" ? "aspect-[2/3]" : "aspect-[16/9]"}`}>
        {image && (
          <CustomImage
            src={image}
            width={420}
            height={236}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 to-transparent" />
        {rank && (
          <span className="absolute left-2 top-2 bg-red-600 px-2 py-1 text-xs font-black text-white">
            #{rank}
          </span>
        )}
      </div>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-black leading-snug">{title}</h3>
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-400">
          <span className="truncate">{formatAnimeMeta(anime)}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            {formatScore(anime.averageScore)}
          </span>
        </div>
      </div>
    </Link>
  );
}