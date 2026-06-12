"use client";

import { usePathname } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface GenrePaginationProps {
  currentPage: number;
  totalPages: number;
  currentSort: string;
}

export default function GenrePagination({ currentPage, totalPages, currentSort }: GenrePaginationProps) {
  const pathname = usePathname();

  // Computes precise destination path arrays safely without altering existing filters
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    params.set("page", pageNumber.toString());
    params.set("sort-by", currentSort);
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  // Generates staggered structural numbers around current view frameworks
  const renderPageItems = () => {
    const items: React.ReactNode[] = [];
    const maxVisiblePages = 3;

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Always include the first page
    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink href={createPageUrl(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Render local core structural tracking loops
    for (let p = startPage; p <= endPage; p++) {
      items.push(
        <PaginationItem key={p}>
          <PaginationLink 
            href={createPageUrl(p)} 
            isActive={p === currentPage}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Render trailing structures safely
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink href={createPageUrl(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <Pagination className="justify-center select-none">
      <PaginationContent className="border border-primary/30 bg-primary/5 p-1 rounded-none gap-0.5">
        
        <PaginationItem>
          <PaginationPrevious 
            href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"} 
            className={currentPage <= 1 ? "pointer-events-none opacity-40" : ""}
            aria-disabled={currentPage <= 1}
          />
        </PaginationItem>

        {renderPageItems()}

        <PaginationItem>
          <PaginationNext 
            href={currentPage < totalPages ? createPageUrl(currentPage + 1) : "#"} 
            className={currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}
            aria-disabled={currentPage >= totalPages}
          />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  );
}