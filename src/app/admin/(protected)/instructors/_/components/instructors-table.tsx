'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { InstructorsTableClient } from './instructors-table-client';
import { useInstructors } from '@/states/server/user/use-instructors';

interface InstructorsTableProps {
  searchParams: { search?: string; status?: string; page?: string };
}

const PAGE_SIZE = 12;

export function InstructorsTable({ searchParams }: InstructorsTableProps) {
  const router = useRouter();
  const params = useSearchParams();

  const { instructors, isSuccess, isLoading, error, totalPages, totalCount } = useInstructors(
    {
      pageSize: PAGE_SIZE,
      search: searchParams.search,
      // status: searchParams.status,
      page: parseInt(searchParams.page || '1'),
    },
    {
      enabled: true,
    }
  );

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(params);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  if (error || !isSuccess) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Failed to load instructors</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <InstructorsTableClient
      instructors={instructors}
      totalPages={totalPages}
      totalItems={totalCount}
      currentPage={parseInt(searchParams.page || '1')}
      isLoading={isLoading}
      searchParams={searchParams}
      onUpdateSearchParams={updateSearchParams}
    />
  );
}
