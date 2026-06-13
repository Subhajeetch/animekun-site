export default function GenreLoading() {
  const skeletonItems = Array.from({ length: 32 });

  return (
    <div className="min-h-screen p-2">
      
      {/* Header Skeleton */}
      <section className="flex flex-col border-b border-muted pb-5 animate-pulse">
        <div className="flex justify-between items-center gap-4">
          <div className="h-10 w-64 bg-primary/10" />
          <div className="h-10 w-62 bg-primary/10" />
        </div>
        <div className="h-4 w-80 bg-primary/10 mt-3" />
      </section>

      {/* Grid Skeleton */}
      <section className="mt-8 grid anime-grid gap-4 animate-pulse">
        {skeletonItems.map((_, index) => (
          <div 
            key={index} 
            className="w-[170px] md:w-[210px] shrink-0"
          >
            {/* Poster Card Container */}
            <div className="block h-full border border-primary/10 bg-muted">
              
              {/* Media Block matching aspect-2/3 exactly */}
              <div className="relative overflow-hidden bg-muted aspect-2/3">
                
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
      </section>

      {/* Pagination Skeleton */}
      <section className="mt-12 mb-6 flex justify-center">
        <div className="h-10 w-64 bg-primary/10 border border-primary/20 animate-pulse" />
      </section>
    </div>
  );
}