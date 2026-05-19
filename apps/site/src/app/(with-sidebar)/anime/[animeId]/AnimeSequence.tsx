"use client";

import Link from "next/link";
import {MediaFormat, RelatedAnime, RelationType} from "@repo/anilist";
import CustomImage from "@/components/custom-image";


// ─── Helpers ──────────────────────────────────────────────────

function formatFormat(format: MediaFormat | null): string {
  const map: Record<MediaFormat, string> = {
    TV: "TV",
    TV_SHORT: "TV Short",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music",
  };
  return format ? (map[format] ?? format) : "—";
}

function relationLabel(type: RelationType): string {
  const map: Partial<Record<RelationType, string>> = {
    [RelationType.PREQUEL]: "Prequel",
    [RelationType.SEQUEL]: "Sequel",
    [RelationType.PARENT]: "Parent Story",
    [RelationType.SIDE_STORY]: "Side Story",
    [RelationType.ALTERNATIVE]: "Alternative",
    [RelationType.SPIN_OFF]: "Spin-off",
    [RelationType.CONTAINS]: "Compilation",
  };
  return map[type] ?? "Related";
}

function buildSlug(title: string, id: number): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `/anime/${slug}-${id}`;
}

// ─── Props ─────────────────────────────────────────────────────

interface Props {
  relations: RelatedAnime[];
  currentId: number;
}

// ─── Component ────────────────────────────────────────────────

export default function AnimeSequence({ relations, currentId }: Props) {
  return (
    <div className="space-y-1 max-h-181.25 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2">
      {relations.map((rel) => {
        const title =
          rel.title.english ??
          rel.title.romaji ??
          rel.title.native ??
          "Unknown Title";

        const isActive = rel.id === currentId;
        const href = buildSlug(title, rel.id);

        return (
          <Link
            key={rel.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`
              flex items-start gap-3 p-3 border transition-colors group
              ${
                isActive
                  ? "border-zinc-500 bg-zinc-800/80"
                  : "border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800/60"
              }
            `}
          >
            {/* Cover thumbnail */}
            <div className="w-12 h-16 shrink-0 overflow-hidden border border-zinc-700 bg-zinc-800">
              {rel.coverImage.medium || rel.coverImage.large ? (
                <CustomImage
                width={40}
                height={64}
                  src={rel.coverImage.medium ?? rel.coverImage.large ?? ""}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-zinc-600 text-[10px] text-center px-1">
                    No&nbsp;img
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Relation type label */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-zinc-600">
                  {relationLabel(rel.relationType)}
                </span>
                {isActive && (
                  <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-cyan-500">
                    · Current
                  </span>
                )}
              </div>

              {/* Title */}
              <p
                className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-zinc-300 group-hover:text-white"
                }`}
              >
                {title}
              </p>

              {/* Format + year */}
              <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">
                {formatFormat(rel.format)}
                {rel.seasonYear ? ` · ${rel.seasonYear}` : ""}
                {rel.episodes ? ` · ${rel.episodes} eps` : ""}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
