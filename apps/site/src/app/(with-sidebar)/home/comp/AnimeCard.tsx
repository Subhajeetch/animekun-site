import Link from "next/link";
import { Play, Star } from "lucide-react";
import CustomImage from "@/components/custom-image";
import type { HomepageAnime, LatestEpisodeAnime } from "../lib/home-types";
import {
  formatAnimeMeta,
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
  const imageCompact = getAnimeImage(anime) || getAnimePoster(anime);


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
      className="group relative flex h-24 w-full items-center justify-between border-l border-2 bg-background p-0 text-white transition-colors focus-visible:outline-none rounded-none  hover:border-l-(--bg)"
       style={
        {
          "--bg": bgColor,
        } as React.CSSProperties
      }
    >
      {/* 1. Rank Indicator with an Accent Border */}
      {rank && (
        <div className="flex h-full items-center gap-3 pl-3 pr-2">
          <span className="text-3xl font-black italic tracking-tighter text-primary/30 group-hover:text-(--bg) transition-all duration-300 group-hover:scale-130 "
          style={
                {
                  "--bg": bgColor,
                } as React.CSSProperties
              }>
            {formatRank(rank)}
          </span>
        </div>
      )}

      {/* 2. Content & Image Wrapper with Fading Effect */}
      <div className="relative flex h-full flex-1 items-center justify-between pl-2 pr-4">
        
        {/* Text Metadata (Stays on top of the image fade) */}
        <div className="z-10 min-w-0 py-2 flex flex-col justify-center">
          <h3 className="line-clamp-1 text-base font-bold tracking-wide group-hover:text-(--bg)"
          style={
                {
                  "--bg": bgColor,
                } as React.CSSProperties
              }>
            {title}
          </h3>
          
          {/* Subtitles / Episode counters */}
          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <span className="inline-flex items-center gap-1 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              {formatScore(anime.averageScore)}
            </span>
            <span>•</span>
            <span className="truncate">{formatAnimeMeta(anime)}</span>
          </div>
        </div>

        {/* The Fading Image Container */}
        {image && (
          <div className="absolute inset-y-0 right-0 h-full w-full overflow-hidden rounded-none"
          >
            <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-1"
                  style={{
                    background: `
                      linear-gradient(
                        90deg,
                        var(--background) 0%,
                        color-mix(in srgb, var(--background) 97%, transparent) 16%,
                        color-mix(in srgb, var(--background) 76%, transparent) 35%,
                        color-mix(in srgb, var(--background) 36%, transparent) 58%,
                        transparent 78%
                      ),
                      linear-gradient(
                        270deg,
                        color-mix(in srgb, var(--background) 78%, transparent) 0%,
                        color-mix(in srgb, var(--background) 46%, transparent) 12%,
                        color-mix(in srgb, var(--background) 18%, transparent) 28%,
                        transparent 48%
                      )
                    `,
                  }}
                />
            {/* The Image itself */}
            <CustomImage
              src={imageCompact}
              width={300}
              height={80}
              alt=""
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 rounded-none"
              aria-hidden="true"
            />
            
            {/* The Magic Fading Mask Layer */}
            {/* Fades from dark zinc-950 on the left to completely transparent on the right */}
            <div className="absolute inset-0 bg-linear-to-r from-zinc-950 via-zinc-950/70 to-transparent pointer-events-none rounded-none" />
          </div>
        )}

        {/* 3. Play Button Overlay on Hover */}
        <div className="z-10 ml-4 shrink-0 p-2.5 text-foreground shadow-2xl opacity-0 transition-all duration-300 transform scale-90 group-hover:opacity-100 group-hover:scale-100 group-hover:bg-primary rounded-none">
          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
        </div>
      </div>
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
      <div className={`relative overflow-hidden bg-zinc-900 ${variant === "poster" ? "aspect-2/3" : "aspect-video"}`}>
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