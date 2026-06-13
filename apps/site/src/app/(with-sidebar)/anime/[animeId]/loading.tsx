export default function AnimeLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-pulse">
      <div className="relative">
        <div className="relative w-full h-36 md:h-80 lg:h-96 overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />

          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeatinglinear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
            }}
          />
        </div>

        {/* Hero row */}
        <div className="absolute flex gap-2 md:gap-6 top-10 md:top-21 lg:top-25 left-2 md:left-8 lg:left-12 right-2">
          {/* Cover */}
          <div className="shrink-0">
            <div className="w-26 md:w-48 lg:w-56 aspect-[2/3] bg-muted border-2 border-primary/10 shadow-2xl" />
          </div>

          {/* Meta */}
          <div className="flex-1 min-w-0 mt-19 md:mt-50 lg:mt-61.5">
            {/* Chips */}
            <div className="flex flex-wrap gap-1 md:gap-2 mb-5">
              <div className="h-5 w-12 md:h-6 md:w-16 bg-muted border border-primary/10" />
              <div className="h-5 w-12 md:h-6 md:w-28 bg-muted border border-primary/10" />
              <div className="h-5 w-12 md:h-6 md:w-16 bg-muted border border-primary/10" />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <div className="h-10 w-36 bg-muted border border-primary/10" />
              <div className="h-10 w-10 md:w-32 bg-muted border border-primary/10" />
              <div className="hidden md:block h-10 w-28 bg-muted border border-primary/10" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout ────────────────────────────────────── */}
      <div className="px-2 md:px-8 lg:px-12 mt-20">
        {/* Title */}
        <div className="space-y-3">
          <div className="h-10 md:h-12 w-3/4 md:w-1/2 bg-muted" />
          <div className="h-4 w-40 bg-muted" />
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {[70, 90, 65, 85, 60].map((w, i) => (
            <div
              key={i}
              className="h-6 bg-muted border border-primary/10"
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
                  <div className="h-3 w-20 bg-muted" />
                  <div className="flex-1 h-px bg-muted" />
                </div>

                <div className="h-100 border border-primary/10 p-4 space-y-2 overflow-hidden">
                  {[100, 95, 100, 90, 85, 75, 60, 80, 80, 20, 49, 70].map((w, i) => (
                    <div
                      key={i}
                      className="h-3 bg-muted"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </section>

              {/* Ratings */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-20 bg-muted" />
                  <div className="flex-1 h-px bg-muted" />
                </div>

                <div className="border border-primary/10 p-5 space-y-5">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-[72px] h-[72px] rounded-full bg-muted shrink-0" />

                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-20 bg-muted" />
                        <div className="h-4 w-32 bg-muted" />
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-4 pt-2 border-t border-primary/10">
                    <div className="w-[72px] h-[72px] bg-muted shrink-0" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-muted" />
                      <div className="h-4 w-36 bg-muted" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-24 bg-muted" />
              <div className="flex-1 h-px bg-muted" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 border border-primary/10 bg-muted"
                />
              ))}
            </div>
          </aside>
        </div>

        <div className="h-16" />
      </div>
    </div>
  );
}