"use client";

import { useState } from "react";
import type { AnimeCharacter } from "@repo/anilist";
import CustomImage from "@/components/custom-image";

interface Props {
  characters: AnimeCharacter[];
}

const INITIAL_SHOW = 12;

export default function AnimeCast({ characters }: Props) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? characters : characters.slice(0, INITIAL_SHOW);
  const hasMore = characters.length > INITIAL_SHOW;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-px bg-zinc-800">
        {visible.map((char) => {
          const name = char.name.full ?? char.name.native ?? "Unknown";
          const vaName = char.voiceActor?.name.full ?? null;
          const img = char.image.large ?? char.image.medium ?? null;
          const vaImg = char.voiceActor?.image.large ?? null;

          return (
            <div
              key={char.id}
              className="bg-zinc-900/80 flex flex-col group"
            >
              {/* Character image */}
              <div className="aspect-[3/4] overflow-hidden bg-zinc-800 relative">
                {img ? (
                  <CustomImage
                    src={img}
                    alt={name}
                    width={120}
                    height={160}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                      <path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h17z" />
                    </svg>
                  </div>
                )}

                {/* Role badge */}
                <div className="absolute top-0 left-0">
                  {char.role === "MAIN" && (
                    <span className="text-[8px] font-black uppercase tracking-wider bg-cyan-500 text-black px-1.5 py-0.5">
                      Main
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="px-2.5 py-2 flex-1 flex flex-col gap-1 border-t border-zinc-800">
                <p className="text-[11px] font-bold text-zinc-200 line-clamp-1 leading-tight">
                  {name}
                </p>

                {vaName && (
                  <div className="flex items-center gap-1.5">
                    {vaImg && (
                      <CustomImage
                        src={vaImg}
                        alt={vaName}
                        width={16}
                        height={16}
                        className="w-4 h-4 object-cover flex-shrink-0"
                      />
                    )}
                    <p className="text-[10px] text-zinc-600 line-clamp-1">
                      {vaName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full py-2.5 border border-zinc-800 text-[11px] uppercase tracking-[0.18em] font-bold text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors bg-zinc-900/40"
        >
          {expanded
            ? "Show Less"
            : `Show All ${characters.length} Characters`}
        </button>
      )}
    </div>
  );
}
