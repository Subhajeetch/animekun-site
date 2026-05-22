'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Server } from '@/types/watch';
import { fetchKwikUrl } from '@/utils/getServers';
import { addServerToHistory } from '@/utils/watchStorage';

interface ServerSelectorProps {
  servers: {
    anilist: Server[];
    mal: Server[];
    tmdb: Server[];
  };
  selectedServerId: string | null;
  language: 'sub' | 'dub';
  malId?: string | number;
  episodeNumber: number;
  onServerSelect: (server: Server, resolvedUrl: string) => void;
  onLanguageChange: (lang: 'sub' | 'dub') => void;
}

const TAB_LABELS: Record<string, string> = {
  mal: 'MyAnimeList',
  anilist: 'AniList',
  tmdb: 'TMDB',
};

export default function ServerSelector({
  servers,
  selectedServerId,
  language,
  malId,
  episodeNumber,
  onServerSelect,
  onLanguageChange,
}: ServerSelectorProps) {
  const [loadingServerId, setLoadingServerId] = useState<string | null>(null);
  const [errorServerId, setErrorServerId] = useState<string | null>(null);

  const allServerIds = [
    ...servers.anilist,
    ...servers.mal,
    ...servers.tmdb,
  ].map((s) => s.id);

  useEffect(() => {
    setErrorServerId(null);
  }, [episodeNumber]);

  const handleServerClick = async (server: Server) => {
    setErrorServerId(null);

    if (server.isStatic) {
      addServerToHistory(server.id);
      onServerSelect(server, server.url);
      return;
    }

    // Dynamic — needs fetch
    if (server.id === 'kwik.cx') {
      if (!malId) {
        setErrorServerId(server.id);
        return;
      }
      setLoadingServerId(server.id);
      try {
        const url = await fetchKwikUrl(malId, episodeNumber, language);
        if (!url) throw new Error('No URL returned');
        addServerToHistory(server.id);
        onServerSelect(server, url);
      } catch {
        setErrorServerId(server.id);
      } finally {
        setLoadingServerId(null);
      }
    }
  };

  const renderServerList = (
    list: Server[],
    showLanguage: boolean,
    tabKey: string
  ) => {
    if (!list.length) {
      return (
        <p className="text-xs text-zinc-600 uppercase tracking-widest py-3 px-1">
          No servers available
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-0">
        
        {showLanguage && (
            <>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary/50 mb-0.5">
          Languages
        </span>
          <div className="flex gap-0 mb-3">
            {(['sub', 'dub'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                aria-pressed={language === lang}
                className={`px-4 py-1.5 text-[13px] uppercase tracking-widest font-bold border transition-colors ${
                  language === lang
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                } ${lang === 'sub' ? 'border-r-0' : ''}`}
              >
                {lang === 'sub' ? 'SUB' : 'DUB'}
              </button>
            ))}
          </div>
          </>
        )}

<span className="text-[13px] mt-2 font-bold uppercase tracking-widest text-primary/50 mb-0.5">
          Servers
        </span>
        <div className="flex flex-col gap-1" role="listbox" aria-label={`${TAB_LABELS[tabKey]} servers`}>
            
          {list.map((server) => {
            const isSelected = selectedServerId === server.id;
            const isLoading = loadingServerId === server.id;
            const hasError = errorServerId === server.id;

            return (
              <button
                key={server.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleServerClick(server)}
                disabled={isLoading}
                className={`flex items-center justify-between px-3 py-2.5 border text-left text-[13px] transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : hasError
                    ? 'border-red-800 bg-red-900/10 text-red-400'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">
                  {server.name}
                </span>
                <span className="flex items-center gap-2">
                  {!server.isStatic && (
                    <span className="text-[9px] uppercase tracking-wider text-zinc-600 border border-zinc-700 px-1.5 py-0.5">
                      Dynamic
                    </span>
                  )}
                  {isLoading && (
                    <svg
                      className="w-3 h-3 animate-spin text-zinc-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  )}
                  {hasError && (
                    <span className="text-[9px] text-red-500 uppercase tracking-wider">
                      Failed
                    </span>
                  )}
                  {isSelected && !isLoading && (
                    <span className="w-1.5 h-1.5 bg-primary" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const hasAnyServer =
    servers.anilist.length > 0 ||
    servers.mal.length > 0 ||
    servers.tmdb.length > 0;

  const defaultTab = selectedServerId
  ? servers.mal.some((s) => s.id === selectedServerId)
    ? 'mal'
    : servers.anilist.some((s) => s.id === selectedServerId)
    ? 'anilist'
    : servers.tmdb.some((s) => s.id === selectedServerId)
    ? 'tmdb'
    : servers.mal.length
    ? 'mal'
    : servers.anilist.length
    ? 'anilist'
    : 'tmdb'
  : servers.mal.length
  ? 'mal'
  : servers.anilist.length
  ? 'anilist'
  : 'tmdb';

  return (
    <div className="border border-zinc-800 bg-zinc-900/30">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-zinc-500"
        >
          <path d="M3.75 3a.75.75 0 00-.75.75v.5c0 .414.336.75.75.75H4c6.075 0 11 4.925 11 11v.25c0 .414.336.75.75.75h.5a.75.75 0 00.75-.75V16C17 8.82 11.18 3 4 3h-.25z" />
          <path d="M3 8.75A.75.75 0 013.75 8H4a8 8 0 018 8v.25a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75V16a6 6 0 00-6-6h-.25A.75.75 0 013 9.25v-.5zM7 15a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="text-[14px] uppercase tracking-[0.22em] font-bold text-zinc-500">
          Servers
        </span>
      </div>

      <div className="p-3">
        {!hasAnyServer ? (
          <p className="text-xs text-zinc-600 uppercase tracking-widest py-2 px-1">
            Select an episode first
          </p>
        ) : (
          <Tabs defaultValue={defaultTab}>
            <TabsList className="w-full bg-zinc-900 border border-zinc-800 h-auto p-0 gap-0">
              {(['mal', 'anilist', 'tmdb'] as const).map((tab, i) => (
                servers[tab].length > 0 && (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={`flex-1 text-[12px] uppercase tracking-widest font-bold py-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-none ${
                      i < 2 ? 'border-r border-zinc-800' : ''
                    }`}
                  >
                    {TAB_LABELS[tab]}
                  </TabsTrigger>
                )
              ))}
            </TabsList>

            <div className="mt-3">
              <TabsContent value="anilist" className="mt-0">
                {renderServerList(servers.anilist, true, 'anilist')}
              </TabsContent>
              <TabsContent value="mal" className="mt-0">
                {renderServerList(servers.mal, true, 'mal')}
              </TabsContent>
              <TabsContent value="tmdb" className="mt-0">
                {renderServerList(servers.tmdb, false, 'tmdb')}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
}