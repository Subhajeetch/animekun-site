"use client";

import type { AnimeExternalLink } from "@/anilist/get-anime-detail";

interface Props {
  links: AnimeExternalLink[];
}

// Known streaming sites to highlight
const STREAMING_SITES = new Set([
  "Crunchyroll",
  "Funimation",
  "Netflix",
  "Amazon Prime Video",
  "HIDIVE",
  "Disney+",
  "Hulu",
  "VRV",
  "Bilibili",
  "Muse Asia",
]);

function isStreaming(link: AnimeExternalLink): boolean {
  return link.type === "STREAMING" || STREAMING_SITES.has(link.site);
}

export default function AnimeExternalLinks({ links }: Props) {
  const streaming = links.filter(isStreaming);
  const others = links.filter((l) => !isStreaming(l));

  return (
    <div className="space-y-4">
      {/* Streaming */}
      {streaming.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {streaming.map((link) => (
            <ExternalLinkButton key={link.id} link={link} highlight />
          ))}
        </div>
      )}

      {/* Other links */}
      {others.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {others.map((link) => (
            <ExternalLinkButton key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExternalLinkButton({
  link,
  highlight = false,
}: {
  link: AnimeExternalLink;
  highlight?: boolean;
}) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center gap-2 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider border transition-colors
        ${
          highlight
            ? "border-zinc-600 bg-zinc-800/80 text-zinc-200 hover:border-zinc-400 hover:text-white"
            : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
        }
      `}
    >
      {/* Favicon / icon */}
      {link.icon ? (
        <img
          src={link.icon}
          alt=""
          className="w-3.5 h-3.5 object-contain"
          aria-hidden="true"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5 shrink-0 opacity-50"
          aria-hidden="true"
        >
          <path d="M8.75 3.75a.75.75 0 00-1.5 0v3.5h-3.5a.75.75 0 000 1.5h3.5v3.5a.75.75 0 001.5 0v-3.5h3.5a.75.75 0 000-1.5h-3.5v-3.5z" />
        </svg>
      )}
      {link.site}
    </a>
  );
}