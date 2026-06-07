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
  const image =  getAnimePoster(anime) || getAnimeImage(anime);


  function getTextColor(bgColor: string) {
  const hex = bgColor.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "#000000" : "#FFFFFF";
}

function formatRank(rank: number) {
  return rank.toString().padStart(2, "0");
}

const bgColor = anime.coverImage.color ?? "#6e5ab0";
const textColor = getTextColor(bgColor);

  if (variant === "compact") {
    return (
      <Link
        href={href}
        aria-label={`Open ${title}`}
        className="group h-full flex gap-3 border border-zinc-800 bg-zinc-900/70 p-2 text-white transition-colors hover:border-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        <div className="relative overflow-hidden bg-zinc-950">
          {image && (
            <CustomImage
              src={image}
              width={120}
              height={180}
              alt=""
              className="w-12 h-16 object-cover transition-transform duration-500 group-hover:scale-105"
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
      className="
        group block h-full border transition-colors duration-300
        bg-primary/2
        text-foreground
        hover:bg-[var(--bg)]
        hover:text-[var(--text)]
      "
      style={
        {
          "--bg": bgColor,
          "--text": textColor,
          textShadow: "0 1px 2px rgba(0,0,0,0.4)",
        } as React.CSSProperties
      }
    >
      <div className={`relative overflow-hidden bg-zinc-900 ${variant === "poster" ? "aspect-[2/3]" : "aspect-[16/9]"}`}>
        {image && (
          <CustomImage
            src={image}
            width={420}
            height={236}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 to-transparent" />
        {rank && (
          <span
            className="absolute left-0 top-0 px-3 py-2 text-[24px] font-bold"
            style={{
              backgroundColor: bgColor,
              color: getTextColor(bgColor),
              textShadow: "0 1px 2px rgba(0,0,0,0.4)",
            }}
          >
            {formatRank(rank)}
          </span>
        )}
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-400 absolute inset-x-0 bottom-0 px-2">
          <span className="truncate">{formatAnimeMeta(anime)}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            {formatScore(anime.averageScore)}
          </span>
        </div>
      </div>
      <div className="p-2">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-black leading-snug">{title}</h3>
      </div>
    </Link>
  );
}