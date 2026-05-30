/* eslint-disable @next/next/no-img-element */

import { Share2 } from "lucide-react";
import type { AnimeDetails } from "@repo/anilist";
import AnimeSequence from "@/components/AnimeSequence";

import { MediaStatus } from "@repo/anilist";

interface AnimeDetailsProps {
  anime: AnimeDetails;
  displayTitle?: string;
}

export default function AnimeDetailsComponent({
  anime,
  displayTitle,
}: AnimeDetailsProps) {
  const title =
    displayTitle ??
    anime.title.english ??
    anime.title.romaji ??
    anime.title.native ??
    "Unknown Anime";

  const cover =
    anime.coverImage.extraLarge ??
    anime.coverImage.large ??
    anime.coverImage.medium;

  const year = anime.seasonYear ?? anime.startDate.year;
  const description = cleanDescription(anime.description);
  const genres = anime.genres.slice(0, 8);
  const hasLongDescription = description.length > 260;

  return (
    <section className="px-2 pb-10 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_460px] lg:items-stretch">
      <div className="  min-w-0">

        <div className="flex gap-5">
          <div className="relative h-44 w-30 md:h-60 md:w-42 shrink-0 overflow-hidden border border-zinc-900 bg-zinc-950">
            {cover ? (
              <>
                <img
                  src={cover}
                  alt={title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black to-transparent" />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-widest text-zinc-700">
                No Cover
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pr-8">
            <h2 className="text-[22px] font-black leading-tight text-zinc-100 truncate">
              {title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-black uppercase tracking-wide text-white">
              {anime.format && <span>{formatEnum(anime.format)}</span>}

              {anime.status && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className={`border px-1 ${getStatusColor(anime.status)}`}>
                    {formatEnum(anime.status)}
                  </span>
                </>
              )}

              {year && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span>{year}</span>
                </>
              )}

              {anime.episodes != null && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="inline-flex items-center gap-2 border px-1 bg-primary/15 border-primary/50">
                    <span className="font-bold">EP</span>
                    {anime.episodes}
                  </span>
                </>
              )}
            </div>

            <div className="mt-3 space-y-1 text-[13px] font-bold">
              <DetailRow label="Type" value="ANIME" />
              <DetailRow label="Season" value={formatEnum(anime.season)} />
              <DetailRow label="Country" value={anime.countryOfOrigin} />
              <DetailRow
                label="Duration"
                value={anime.duration != null ? `${anime.duration}min` : null}
              />

              <div className="hidden md:block">
                 <DetailRow
                label="Popularity"
                value={
                  anime.popularity != null
                    ? `${formatNumber(anime.popularity)} Users`
                    : null
                }
              />
              </div>
             
            </div>
          </div>
        </div>

                    {genres.length > 0 && (
              <div className="mt-3 lg;mt-5 flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="border border-zinc-700 px-3 py-1.5 text-[13px] font-bold text-zinc-100"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

        <div className="mt-4 border p-1">
        {hasLongDescription ? (
            <div className="h-53.75 pr-1 overflow-y-auto bg-">
                  <p className="text-sm text-zinc-400 leading-[1.85] whitespace-pre-line">
                    {description}
                  </p>
                </div>
          ) : (
            <p className="p-3 whitespace-pre-line text-[13px] leading-7 text-zinc-300">
            {description}
            </p>
        )}
        </div>
      </div>

      <div className="min-w-0 lg:relative lg:self-stretch lg:overflow-hidden">
       <div
        className="
            [&>div]:max-h-87.5 [&>div]:overflow-y-auto
            lg:absolute lg:inset-0 lg:overflow-y-auto
            lg:[&>div]:max-h-none lg:[&>div]:overflow-visible pr-1
        "
        >
            <AnimeSequence relations={anime.relations} currentId={anime.id} />
        </div>
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <p>
      <span className="text-white">{label}:</span>{" "}
      <span className="text-zinc-400">{value}</span>
    </p>
  );
}

function formatEnum(value?: string | null) {
  return value ? value.replace(/_/g, " ") : null;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getStatusColor(status: MediaStatus | null): string {
  switch (status) {
    case MediaStatus.RELEASING:
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    case MediaStatus.FINISHED:
      return "bg-sky-500/20 text-sky-400 border-sky-500/40";
    case MediaStatus.NOT_YET_RELEASED:
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case MediaStatus.CANCELLED:
      return "bg-red-500/20 text-red-400 border-red-500/40";
    case MediaStatus.HIATUS:
      return "bg-orange-500/20 text-orange-400 border-orange-500/40";
    default:
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/40";
  }
}

function cleanDescription(value?: string | null) {
  if (!value) return "No description available.";

  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-[11px] uppercase tracking-[0.22em] font-bold text-zinc-500">
        {children}
      </h2>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}