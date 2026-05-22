export default function AnimeLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-pulse">
      {/* ── Banner ─────────────────────────────────────────── */}
      <div className="relative">
        {/* Banner image */}
        <div className="relative w-full h-36 md:h-80 lg:h-96 overflow-hidden bg-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/30 via-zinc-900/50 to-background" />

          {/* subtle texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
            }}
          />
        </div>

        {/* Hero row */}
        <div className="absolute flex gap-2 md:gap-6 top-10 md:top-21 lg:top-25 left-2 md:left-8 lg:left-12 right-2">
          {/* Cover */}
          <div className="shrink-0">
            <div className="w-26 md:w-48 lg:w-56 aspect-[2/3] bg-zinc-800 border-2 border-zinc-700 shadow-2xl" />
          </div>

          {/* Meta */}
          <div className="flex-1 min-w-0 mt-19 md:mt-50 lg:mt-61.5">
            {/* Chips */}
            <div className="flex flex-wrap gap-1 md:gap-2 mb-5">
              <div className="h-5 w-12 md:h-6 md:w-16 bg-zinc-800 border border-zinc-700" />
              <div className="h-5 w-12 md:h-6 md:w-28 bg-zinc-800 border border-zinc-700" />
              <div className="h-5 w-12 md:h-6 md:w-16 bg-zinc-800 border border-zinc-700" />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <div className="h-10 w-36 bg-zinc-800" />
              <div className="h-10 w-10 md:w-32 bg-zinc-800/70" />
              <div className="hidden md:block h-10 w-28 bg-zinc-800/50" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout ────────────────────────────────────── */}
      <div className="px-2 md:px-8 lg:px-12 mt-20">
        {/* Title */}
        <div className="space-y-3">
          <div className="h-10 md:h-12 w-3/4 md:w-1/2 bg-zinc-800" />
          <div className="h-4 w-40 bg-zinc-800/60" />
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {[70, 90, 65, 85, 60].map((w, i) => (
            <div
              key={i}
              className="h-6 bg-zinc-800 border border-zinc-700"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* Content grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 xl:gap-6">
          {/* Left column */}
          <div className="min-w-0 space-y-8">
            {/* Synopsis + Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Synopsis */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-20 bg-zinc-800" />
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                <div className="h-53.75 border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 overflow-hidden">
                  {[100, 95, 100, 90, 85, 75, 60].map((w, i) => (
                    <div
                      key={i}
                      className="h-3 bg-zinc-800/80"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </section>

              {/* Ratings */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-20 bg-zinc-800" />
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                <div className="border border-zinc-800 bg-zinc-900/40 px-5 py-5 space-y-5">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-[72px] h-[72px] rounded-full bg-zinc-800 shrink-0" />

                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-20 bg-zinc-800" />
                        <div className="h-4 w-32 bg-zinc-700" />
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-4 pt-2 border-t border-zinc-800">
                    <div className="w-[72px] h-[72px] bg-zinc-800 shrink-0" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-zinc-800" />
                      <div className="h-4 w-36 bg-zinc-700" />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Details + Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Details */}
              <section className="order-2 md:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-20 bg-zinc-800" />
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                <div className="border border-zinc-800 bg-zinc-900/40 px-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 py-3 border-b border-zinc-800 last:border-0"
                    >
                      <div className="h-3 w-20 bg-zinc-800 shrink-0 mt-1" />
                      <div className="h-3 flex-1 bg-zinc-700 mt-1" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Stats + Tags */}
              <div className="order-1 md:order-2 flex flex-col gap-6">
                {/* Stats */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-3 w-16 bg-zinc-800" />
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="border border-zinc-800 bg-zinc-900/40 px-4 py-3 h-20"
                      />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-3 w-16 bg-zinc-800" />
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[90, 110, 80, 100, 70, 95].map((w, i) => (
                      <div
                        key={i}
                        className="h-7 bg-zinc-900 border border-zinc-800"
                        style={{ width: w }}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-24 bg-zinc-800" />
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 border border-zinc-800 bg-zinc-900/40"
                />
              ))}
            </div>
          </aside>
        </div>

        {/* Cast */}
        <div className="mt-6 flex flex-col gap-6">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-36 bg-zinc-800" />
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="border border-zinc-800 bg-zinc-900/40 p-2"
                >
                  <div className="aspect-[3/4] bg-zinc-800 mb-2" />
                  <div className="h-3 w-3/4 bg-zinc-700 mb-1" />
                  <div className="h-2.5 w-1/2 bg-zinc-800" />
                </div>
              ))}
            </div>
          </section>

          {/* External links */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-44 bg-zinc-800" />
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-11 w-40 bg-zinc-900 border border-zinc-800"
                />
              ))}
            </div>
          </section>
        </div>

        <div className="h-16" />
      </div>
    </div>
  );
}