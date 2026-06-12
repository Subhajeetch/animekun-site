"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import * as React from "react";

interface SortOption {
  value: string;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "popularity-desc", label: "Most Popular" },
  { value: "popularity", label: "Least Popular" },
  { value: "trending-desc", label: "Trending Now" },
  { value: "score-desc", label: "Highest Rated" },
  { value: "start-date-desc", label: "Newest Releases" },
  { value: "start-date", label: "Oldest Classics" },
  { value: "episodes-desc", label: "Most Episodes" },
];

export default function SortDropdown({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Added the ! operator here to guarantee a fallback to the compiler
  const activeOption = SORT_OPTIONS.find((o) => o.value === currentSort) || SORT_OPTIONS[0]!;

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort-by", value);
    params.set("page", "1"); 
    
    setIsOpen(false);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left text-xs md:text-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Sort items, current selection: ${activeOption.label}`}
        className="inline-flex items-center gap-2 px-2.5 py-2 md:px-4 md:py-2.5 bg-primary/10 border border-primary/60 hover:border-primary hover:text-primary font-bold uppercase tracking-wider transition-colors"
      >
        <SlidersHorizontal size={16} />
        <span>Sort: {activeOption.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-activedescendant={`sort-opt-${activeOption.value}`}
          className="absolute right-0 mt-1.5 w-48 bg-muted border border-primary/30 text-foreground/70 font-medium shadow-2xl z-50 focus:outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <li
              key={option.value}
              id={`sort-opt-${option.value}`}
              role="option"
              aria-selected={option.value === currentSort}
              onClick={() => handleSelect(option.value)}
              className={`px-4 py-2.5 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer text-xs font-semibold uppercase tracking-wide flex items-center justify-between ${
                option.value === currentSort ? "bg-primary/10 text-primary border-l-2 border-primary" : ""
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}