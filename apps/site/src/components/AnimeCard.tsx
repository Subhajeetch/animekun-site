import Link from "next/link";
import { Star } from "lucide-react";
import CustomImage from "@/components/custom-image";
import {
  formatAnimeMeta,
  formatScore,
  getAnimeHref,
  getAnimeImage,
  getAnimePoster,
  getAnimeTitle,
} from "@/utils/anime-card";

import { AnimeType } from "@/types/anime-card";


interface AnimeCardProps {
  anime: AnimeType;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
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


const bgColor = anime.coverImage.color ?? "#6e5ab0";
const textColor = getTextColor(bgColor);

  return (
    <Link
      href={href}
      aria-label={`Open ${title}`}
      className="
        group block h-full border transition-colors duration-300
        bg-primary/2
        text-foreground
        hover:bg-(--bg)
        hover:text-(--text)
      "
      style={
        {
          "--bg": bgColor,
          "--text": textColor,
          textShadow: "0 1px 2px rgba(0,0,0,0.4)",
        } as React.CSSProperties
      }
    >
      <div className="relative overflow-hidden bg-muted aspect-2/3">
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
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
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