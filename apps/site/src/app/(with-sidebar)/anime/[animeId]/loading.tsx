export default function AnimeLoading() {
  return (
    <div className="min-h-screen bg-[#0e0e11] animate-pulse">
      {/* Banner skeleton */}
      <div className="w-full h-56 md:h-80 lg:h-96 bg-zinc-900" />

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Hero row */}
        <div className="flex gap-6 md:gap-10 -mt-28 md:-mt-40 relative z-10">
          {/* Cover */}
          <div className="shrink-0 hidden sm:block">
            <div className="w-36 md:w-48 lg:w-56 aspect-[2/3] bg-zinc-800 border-2 border-zinc-700" />
          </div>

          {/* Title area */}
          <div className="flex-1 pt-36 md:pt-48 lg:pt-52 pb-6 space-y-3">
            {/* Chips */}
            <div className="flex gap-2">
              <div className="h-6 w-10 bg-zinc-800" />
              <div className="h-6 w-28 bg-zinc-800" />
            </div>
            {/* Title */}
            <div className="h-10 w-3/4 bg-zinc-800" />
            <div className="h-4 w-1/3 bg-zinc-800/60" />
            {/* Genres */}
            <div className="flex gap-2 pt-2">
              {[80, 64, 96, 72].map((w, i) => (
                <div key={i} className="h-6 bg-zinc-800" style={{ width: w }} />
              ))}
            </div>
            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <div className="h-10 w-32 bg-zinc-800" />
              <div className="h-10 w-32 bg-zinc-800/60" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-8">
            {/* Synopsis */}
            <div className="space-y-2">
              <div className="h-3 w-20 bg-zinc-800" />
              <div className="space-y-1.5 pt-1">
                {[100, 95, 100, 88, 92, 70].map((w, i) => (
                  <div key={i} className="h-3 bg-zinc-800/80" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-4 gap-px bg-zinc-800">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-zinc-900/60" />
              ))}
            </div>

            {/* Details + Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-52 bg-zinc-900/40 border border-zinc-800" />
              <div className="h-52 bg-zinc-900/40 border border-zinc-800" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-2">
            <div className="h-3 w-20 bg-zinc-800 mb-4" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-zinc-900/40 border border-zinc-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}