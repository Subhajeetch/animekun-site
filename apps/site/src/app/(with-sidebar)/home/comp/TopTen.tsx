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
    /* Removed md:w-max and lg:max-w-[435px] so width is determined by the parent layout container */
    <section className="mt-6 w-full pr-0 lg:pr-2" aria-labelledby="top-by-time-heading">
      <SectionTitle id="top-by-time-heading">Top 10 Anime</SectionTitle>
      
      {/* Ensure full width is utilized */}
      <div className="w-full bg-primary/5 p-2">
        <Tabs defaultValue="day" className="w-full">
          <TabsList
            aria-label="Choose top anime time range"
            className="h-auto justify-start gap-2 bg-transparent p-0 w-full"
          >
            {TAB_CONFIG.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border bg-background hover:border-primary px-5 py-2 text-xs font-black uppercase text-zinc-400 shadow-none data-[state=active]:!border-primary data-[state=active]:!bg-primary/30 data-[state=active]:!text-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TAB_CONFIG.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-2">
              <div className="w-full flex flex-col gap-1">
                {items[tab.key].slice(0, 10).map((anime, index) => (
                  <AnimeCard key={`${tab.value}-${anime.id}`} anime={anime} variant="compact" rank={index + 1} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
    </section>
  );
}