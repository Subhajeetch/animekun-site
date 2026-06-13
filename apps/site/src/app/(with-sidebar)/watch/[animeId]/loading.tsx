export default function WatchPageSkeleton() {
  return (
    <div className="lg:px-2 animate-pulse">
      {/* Breadcrumb */}
      <div className="pt-4 pb-2 px-1 hidden lg:block">
        <div className="h-4 w-80 bg-muted" />
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-4 xl:gap-5">

          {/* LEFT COLUMN */}
          <div className="flex flex-col">

            {/* Video Player */}
            <div
              className="w-full bg-muted border"
              style={{ aspectRatio: "16/9" }}
            />

            {/* Player Controls */}
            <div className="flex items-center gap-3 px-3 py-2 border border-t-0">
              <div className="h-9 w-24 bg-muted" />
              <div className="h-9 w-28 bg-muted" />
              <div className="h-9 w-24 bg-muted ml-auto" />
            </div>

            {/* Episode Info */}
            <div className="flex gap-3 px-2 py-4 border-x border-b">
              <div className="w-12 h-12 bg-muted shrink-0" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-muted" />
                <div className="h-3 w-64 bg-muted" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">

            {/* Server Selector */}
            <div className="border">
              {/* Accordion Header */}
              <div className="px-4 py-3 border-b">
                <div className="h-4 w-24 bg-muted" />
              </div>

              <div className="p-3 space-y-3">

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-px border">
                  <div className="h-10 bg-muted" />
                  <div className="h-10 bg-muted" />
                  <div className="h-10 bg-muted" />
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-muted" />

                  <div className="flex">
                    <div className="h-8 w-20 bg-muted" />
                    <div className="h-8 w-20 bg-muted border-l" />
                  </div>
                </div>

                {/* Servers */}
                <div className="space-y-1">
                  <div className="h-3 w-14 bg-muted" />

                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-9.5 border bg-primary/2"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Episode List */}
            <div className="border p-2 flex-1">

              {/* Header */}
              <div className="flex justify-between items-center pb-2 mb-2 border-b">
                <div className="h-4 w-24 bg-muted" />
                <div className="h-8 w-24 bg-muted" />
              </div>

              {/* Episode Grid */}
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 bg-muted border"
                  />
                ))}
              </div>
            </div>

            {/* Next Airing Banner */}
            <div className="border p-3">
              <div className="h-4 w-40 bg-muted" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}