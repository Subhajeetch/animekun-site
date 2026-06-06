"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TrendingByTime } from "../lib/home-types";
import AnimeCard from "./AnimeCard";
import SectionTitle from "./SectionTitle";

interface TopByTimeTabsProps {
  items: TrendingByTime;
}

const TAB_CONFIG = [
  { value: "day", label: "Today", key: "byDay" },
  { value: "week", label: "Week", key: "byWeek" },
  { value: "month", label: "Month", key: "byMonth" },
] as const;

export default function TopByTimeTabs({ items }: TopByTimeTabsProps) {
  return (
    <section className="px-4 py-6 md:px-10 lg:px-16" aria-labelledby="top-by-time-heading">
      <SectionTitle id="top-by-time-heading">Top 10 Anime</SectionTitle>
      <Tabs defaultValue="day" className="w-full">
        <TabsList
          aria-label="Choose top anime time range"
          className="mb-4 h-auto justify-start gap-2 bg-transparent p-0"
        >
          {TAB_CONFIG.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border border-zinc-700 bg-zinc-950 px-5 py-2 text-xs font-black uppercase text-zinc-400 shadow-none data-[state=active]:border-red-600 data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_CONFIG.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              {items[tab.key].slice(0, 10).map((anime, index) => (
                <AnimeCard key={`${tab.value}-${anime.id}`} anime={anime} variant="compact" rank={index + 1} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}