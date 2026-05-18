import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAnime,
  extractIdFromSlug,
  formatFuzzyDate,
  AniListError,
  MediaFormat,
  MediaStatus,
  RelationType,
} from "@/anilist/get-anime-detail";
import type { AnimeDetails, RelatedAnime, AnimeCharacter } from "@/anilist/get-anime-detail";
import AnimeSequence from "./AnimeSequence";
import AnimeCast from "./AnimeCast";
import AnimeExternalLinks from "./AnimeExternalLinks";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ animeId: string }>;
 }): Promise<Metadata> {
  const { animeId } = await params;
  const id = extractIdFromSlug(animeId);
  if (!id) return { title: "Anime Not Found" };

  try {
    const anime = await getAnime(id);
    const title = anime.title.english ?? anime.title.romaji ?? "Unknown Anime";
    const description = (anime.description ?? "")
      .replace(/<[^>]*>/g, "")
      .slice(0, 160);

    return {
      title: `${title} — AnimeApp`,
      description,
      openGraph: {
        title,
        description,
        images: anime.bannerImage
          ? [{ url: anime.bannerImage }]
          : anime.coverImage.large
          ? [{ url: anime.coverImage.large }]
          : [],
      },
    };
  } catch {
    return { title: "Anime Not Found" };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatStatus(status: MediaStatus | null): string {
  const map: Record<MediaStatus, string> = {
    FINISHED: "Finished Airing",
    RELEASING: "Currently Airing",
    NOT_YET_RELEASED: "Not Yet Aired",
    CANCELLED: "Cancelled",
    HIATUS: "On Hiatus",
  };
  return status ? (map[status] ?? status) : "Unknown";
}

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
  return format ? (map[format] ?? format) : "Unknown";
}

function formatSeason(season: string | null, year: number | null): string | null {
  if (!season) return null;
  const s = season.charAt(0) + season.slice(1).toLowerCase();
  return year ? `${s} ${year}` : s;
}

function cleanDescription(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&[a-z]+;/gi, " ")
    .trim();
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

// ─── Score Ring Component ─────────────────────────────────────────────────────

function ScoreRing({ score, label, sub }: { score: number; label: string; sub: string }) {
  const pct = score / 100;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const gap = circ - dash;
  const color =
    score >= 80 ? "#22d3ee" : score >= 60 ? "#a78bfa" : "#f87171";

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[72px] h-[72px] shrink-0">
        <svg
          viewBox="0 0 72 72"
          className="w-full h-full -rotate-90"
          aria-hidden="true"
        >
          <circle cx="36" cy="36" r={r} fill="none" stroke="#27272a" strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="square"
            strokeDasharray={`${dash} ${gap}`}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-black tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium">{sub}</p>
        <p className="text-sm font-bold text-white mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Stat Box Component ───────────────────────────────────────────────────────

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/60 px-4 py-3 flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-600 font-medium">
        {label}
      </span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

// ─── Detail Row Component ────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-zinc-800/60 last:border-0">
      <span className="text-xs uppercase tracking-[0.15em] text-zinc-600 font-medium shrink-0 w-28">
        {label}
      </span>
      <span className="text-sm text-zinc-300 leading-relaxed">{value}</span>
    </div>
  );
}

// ─── Badge Component ──────────────────────────────────────────────────────────

function Chip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide border ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnimePage({
  params,
}: {
  params: Promise<{ animeId: string }>;
}) {
  const { animeId } = await params;
  const id = extractIdFromSlug(animeId);

  if (!id) notFound();

  let anime: AnimeDetails;

  try {
    anime = await getAnime(id);
  } catch (err) {
    if (err instanceof AniListError && err.status === 404) {
      notFound();
    }
    // For other errors, re-throw so Next.js error.tsx catches them
    throw err;
  }

  const displayTitle =
    anime.title.english ?? anime.title.romaji ?? anime.title.native ?? "Unknown Anime";

  const aired = (() => {
    const start = formatFuzzyDate(anime.startDate);
    const end = formatFuzzyDate(anime.endDate);
    if (start && end) return `${start} – ${end}`;
    if (start) return `${start} – Present`;
    return "Unknown";
  })();

  // Filter relations: sequence = prequel/sequel/side_story/parent; the rest go to "related"
  const sequenceTypes = new Set<RelationType>([
    RelationType.PREQUEL,
    RelationType.SEQUEL,
    RelationType.PARENT,
    RelationType.SIDE_STORY,
    RelationType.ALTERNATIVE,
    RelationType.SPIN_OFF,
    RelationType.CONTAINS,
  ]);

  const sequenceRelations: RelatedAnime[] = anime.relations
    .filter((r) => sequenceTypes.has(r.relationType))
    .sort((a, b) => {
      // Sort by year, nulls last
      const ay = a.seasonYear ?? 9999;
      const by = b.seasonYear ?? 9999;
      return ay - by;
    });

  const description = cleanDescription(anime.description);

  const studioNames = anime.studios.map((s) => s.name).join(", ") || "—";
  const producerNames = anime.producers.map((p) => p.name).join(", ") || "—";
  const season = formatSeason(anime.season, anime.seasonYear);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Banner ─────────────────────────────────────────── */}
      <div className="relative w-full h-56 md:h-80 lg:h-96 overflow-hidden">
        {anime.bannerImage ? (
          <>
            <img
              src={anime.bannerImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-top"
              aria-hidden="true"
            />
            {/* Hard-edged gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(14,14,17,0) 30%, rgba(14,14,17,0.8) 75%, rgba(14,14,17,1) 100%)",
              }}
            />
            {/* Subtle scan-line texture */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950" />
        )}
      </div>

      {/* ── Main Layout ────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Hero row */}
        <div className="flex gap-6 md:gap-10 -mt-28 md:-mt-40 relative z-5">
          {/* Cover poster */}
          <div className="shrink-0 hidden sm:block">
            <div
              className="w-36 md:w-48 lg:w-56 aspect-[2/3] overflow-hidden border-2 shadow-2xl"
              style={{
                borderColor: anime.coverImage.color ?? "#3f3f46",
                boxShadow: `0 0 40px ${anime.coverImage.color ?? "#3f3f46"}44`,
              }}
            >
              <img
                src={
                  anime.coverImage.extraLarge ??
                  anime.coverImage.large ??
                  anime.coverImage.medium ??
                  ""
                }
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0 pt-36 md:pt-48 lg:pt-52 pb-6">
            {/* Chips row */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Chip className="border-zinc-700 text-zinc-400 bg-zinc-800/60">
                {formatFormat(anime.format)}
              </Chip>
              {anime.isAdult && (
                <Chip className="border-red-700 text-red-400 bg-red-900/20">18+</Chip>
              )}
              <Chip className={getStatusColor(anime.status)}>
                {formatStatus(anime.status)}
              </Chip>
              {anime.countryOfOrigin && (
                <Chip className="border-zinc-700 text-zinc-400 bg-zinc-800/60">
                  {anime.countryOfOrigin}
                </Chip>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-1">
              {displayTitle}
            </h1>

            {anime.title.romaji && anime.title.romaji !== displayTitle && (
              <p className="text-sm text-zinc-500 mb-4 font-medium">{anime.title.romaji}</p>
            )}

            {/* Genre tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {anime.genres.map((g) => (
                <span
                  key={g}
                  className="text-[11px] px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 uppercase tracking-wider font-semibold"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href={anime.siteUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold uppercase tracking-wider transition-colors"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Watch Now
              </a>
              <button className="inline-flex items-center gap-2 px-6 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-bold uppercase tracking-wider transition-colors bg-zinc-900/60">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="square" d="M10 3v14M3 10h14" />
                </svg>
                Add to List
              </button>
              {anime.trailer?.site === "youtube" && anime.trailer.id && (
                <a
                  href={`https://www.youtube.com/watch?v=${anime.trailer.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-bold uppercase tracking-wider transition-colors bg-zinc-900/60"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="square" d="M5 3l10 7-10 7V3z" />
                  </svg>
                  Trailer
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Content Grid ──────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 xl:gap-12">
          {/* Left column */}
          <div className="min-w-0 space-y-8">
            {/* Description */}
            {description && (
              <section>
                <SectionHeader>Synopsis</SectionHeader>
                <p className="text-sm text-zinc-400 leading-[1.85] whitespace-pre-line">
                  {description}
                </p>
              </section>
            )}

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-800">
              {anime.episodes && (
                <StatBox label="Episodes" value={anime.episodes} />
              )}
              {anime.duration && (
                <StatBox label="Duration" value={`${anime.duration} min`} />
              )}
              {anime.favourites != null && (
                <StatBox label="Favourites" value={anime.favourites.toLocaleString()} />
              )}
              {anime.trending != null && (
                <StatBox label="Trending" value={`#${anime.trending}`} />
              )}
            </div>

            {/* Details + Ratings row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Details */}
              <section>
                <SectionHeader>Details</SectionHeader>
                <div className="border border-zinc-800 bg-zinc-900/40 px-4">
                  <DetailRow label="Aired" value={aired} />
                  {season && <DetailRow label="Premiered" value={season} />}
                  <DetailRow label="Studios" value={studioNames} />
                  {producerNames !== "—" && (
                    <DetailRow label="Producers" value={producerNames} />
                  )}
                  {anime.source && (
                    <DetailRow
                      label="Source"
                      value={anime.source.replace(/_/g, " ")}
                    />
                  )}
                  {anime.title.native && (
                    <DetailRow label="Japanese" value={anime.title.native} />
                  )}
                  {anime.synonyms.length > 0 && (
                    <DetailRow
                      label="Synonyms"
                      value={anime.synonyms.join(", ")}
                    />
                  )}
                </div>
              </section>

              {/* Ratings */}
              <section>
                <SectionHeader>Ratings</SectionHeader>
                <div className="border border-zinc-800 bg-zinc-900/40 px-5 py-5 space-y-5">
                  {anime.averageScore != null && (
                    <ScoreRing
                      score={anime.averageScore}
                      label="AniList Score"
                      sub="Community"
                    />
                  )}
                  {anime.meanScore != null && anime.meanScore !== anime.averageScore && (
                    <ScoreRing
                      score={anime.meanScore}
                      label="Mean Score"
                      sub="Average"
                    />
                  )}
                  {anime.popularity != null && (
                    <div className="flex items-center gap-4 pt-2 border-t border-zinc-800">
                      <div className="w-[72px] h-[72px] shrink-0 flex items-center justify-center border border-zinc-700 bg-zinc-800/60">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-400">
                          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-medium">
                          Popularity
                        </p>
                        <p className="text-sm font-bold text-white mt-0.5">
                          {anime.popularity.toLocaleString()} users
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Tags */}
            {anime.tags.filter((t) => !t.isGeneralSpoiler).length > 0 && (
              <section>
                <SectionHeader>Tags</SectionHeader>
                <div className="flex flex-wrap gap-2">
                  {anime.tags
                    .filter((t) => !t.isGeneralSpoiler)
                    .slice(0, 20)
                    .map((tag) => (
                      <span
                        key={tag.name}
                        title={tag.description ?? undefined}
                        className="text-[11px] px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase tracking-wider font-medium hover:border-zinc-600 hover:text-zinc-300 transition-colors cursor-default"
                      >
                        {tag.name}
                        <span className="ml-1.5 text-zinc-700">{tag.rank}%</span>
                      </span>
                    ))}
                </div>
              </section>
            )}

            {/* Cast & Characters */}
            {anime.characters.length > 0 && (
              <section>
                <SectionHeader>Cast &amp; Characters</SectionHeader>
                <AnimeCast characters={anime.characters} />
              </section>
            )}

            {/* External Links */}
            {anime.externalLinks.length > 0 && (
              <section>
                <SectionHeader>Where to Watch &amp; More</SectionHeader>
                <AnimeExternalLinks links={anime.externalLinks} />
              </section>
            )}
          </div>

          {/* Right column — Sequence sidebar */}
          {sequenceRelations.length > 0 && (
            <aside>
              <SectionHeader>Sequence</SectionHeader>
              <AnimeSequence
                relations={sequenceRelations}
                currentId={anime.id}
              />
            </aside>
          )}
        </div>

        <div className="h-16" />
      </div>
    </div>
  );
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