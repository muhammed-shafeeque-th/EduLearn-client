'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Pagination as SPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from './paginationss';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Returns a pagination range with ellipsis when necessary.
 */
function getPaginationRange(
  current: number,
  total: number,
  delta: number = 1
): (number | string)[] {
  // always show first, last and current +/- delta
  const range: (number | string)[] = [];

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    } else if (range[range.length - 1] !== '...') {
      range.push('...');
    }
  }
  return range;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageList = getPaginationRange(currentPage, totalPages);

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className={cn('flex justify-center', className)}>
      <SPagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
              aria-disabled={currentPage === 1}
              tabIndex={currentPage === 1 ? -1 : undefined}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" />
            </PaginationPrevious>
          </PaginationItem>
          {pageList.map((item, idx) => (
            <PaginationItem key={idx}>
              {typeof item === 'number' ? (
                <PaginationLink
                  isActive={item === currentPage}
                  aria-current={item === currentPage ? 'page' : undefined}
                  onClick={() => handlePageChange(item)}
                  tabIndex={item === currentPage ? -1 : undefined}
                  className={cn(item === currentPage ? 'pointer-events-none' : 'cursor-pointer')}
                >
                  {item}
                </PaginationLink>
              ) : (
                <span aria-hidden="true" className="px-2 text-muted-foreground select-none">
                  ...
                </span>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              aria-disabled={currentPage === totalPages}
              tabIndex={currentPage === totalPages ? -1 : undefined}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" />
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </SPagination>
    </div>
  );
}
