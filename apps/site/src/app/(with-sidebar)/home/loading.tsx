import "./comp/some.css"

export default function HomepageLoading() {
    const genreSkeletonItems = Array.from({ length: 12 });
    const trendingSkeletonItems = Array.from({ length: 9 });

  return (
    <div>
        <section 
            className="relative w-full bg-muted animate-pulse overflow-hidden" 
            aria-hidden="true"
            >
            <div className="relative h-[320px] w-full md:h-[560px] lg:h-[590px]">
                
                {/* Mock Content Container matching padding and positioning */}
                <div className="relative z-10 flex h-full items-center px-2 pt-10">
                <div className="mt-16 max-w-160 md:mt-20 w-full">
                    
                    {/* Spotlight # Tag Line */}
                    <div className="mb-4 h-3 w-24 bg-primary/10 uppercase" />

                    {/* Title (Simulating 2 lines) */}
                    <div className="space-y-2 max-w-155">
                    <div className="h-7 w-3/4 bg-primary/10 md:h-12 lg:h-14" />
                    <div className="h-7 w-1/2 bg-primary/10 md:h-12 lg:h-14 md:block hidden" />
                    </div>

                    {/* Meta tags line */}
                    <div className="mt-5 h-4 w-40 bg-primary/10" />

                    {/* Badges (Episodes, Score, HD) */}
                    <div className="mt-4 flex gap-2">
                    <div className="h-6 w-16 bg-primary/10" />
                    <div className="h-6 w-12 bg-primary/10" />
                    <div className="h-6 w-10 bg-primary/10" />
                    </div>

                    {/* Description (3 lines, desktop only) */}
                    <div className="mt-6 space-y-2 max-w-[600px] hidden md:block">
                    <div className="h-3.5 w-full bg-primary/10" />
                    <div className="h-3.5 w-11/12 bg-primary/10" />
                    <div className="h-3.5 w-4/5 bg-primary/10" />
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex gap-3">
                    {/* Watch Now Button */}
                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 md:px-6 md:py-3 text-sm text-transparent select-none pointer-events-none">
                        Watch Now
                    </div>

                    {/* Details Button (Desktop only) */}
                    <div className="items-center hidden md:flex gap-2 border border-primary/10 bg-primary/2 px-6 py-3 text-sm text-transparent select-none pointer-events-none">
                        Details
                    </div>
                    </div>

                </div>
                </div>

            </div>
        </section>


        <section className="pt-6 px-2 max-h-41 overflow-hidden" aria-hidden="true">
            <div className="genre-grid grid animate-pulse">
                {genreSkeletonItems.map((_, i) => (
                <div
                    key={i}
                    className="h-16 w-full bg-muted relative overflow-hidden"
                >
                    <div 
                    className="absolute right-[-6px] bottom-[-2px] h-[50px] w-[50px] rotate-[20deg] bg-primary/10" 
                    />
                    
                    <div className="absolute top-3 left-3 h-4 w-16 bg-primary/10" />
                </div>
                ))}
            </div>
        </section>

        <section className="px-2 mt-6" aria-hidden="true">
      <div className="mb-4 h-6 w-48 bg-muted animate-pulse" />
      
      {/* Mimics the horizontal scrolling layout */}
      <div className="flex gap-4 overflow-hidden animate-pulse">
        {trendingSkeletonItems.map((_, index) => (
          <div 
            key={index} 
            className="w-[170px] md:w-[210px] shrink-0"
          >
            {/* Poster Card Container */}
            <div className="block h-full border border-primary/10 bg-muted">
              
              {/* Media Block matching aspect-2/3 exactly */}
              <div className="relative overflow-hidden bg-muted aspect-2/3">
                
                {/* Numeric Rank Slot placeholder (Hardcoded True) */}
                <div className="absolute left-0 top-0 h-10 w-10 bg-primary/5" />
                
                {/* Lower Gradient metadata bar replacement */}
                <div className="flex items-center justify-between gap-2 absolute inset-x-0 bottom-0 px-2 h-8 bg-gradient-to-t from-background to-transparent">
                  <div className="h-3 w-16 bg-primary/10" />
                  <div className="h-3 w-8 bg-primary/10" />
                </div>
              </div>

              {/* Text Block replacement representing a 2-line title */}
              <div className="p-2 space-y-1.5">
                <div className="h-3.5 w-full bg-primary/10" />
                <div className="h-3.5 w-3/4 bg-primary/10" />
              </div>

            </div>
          </div>
        ))}
      </div>
    </section>
    </div>
  );
}