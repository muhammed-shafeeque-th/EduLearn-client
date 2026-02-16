'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { UsersTableClient } from './users-table-client';
import { useUsers } from '@/states/server/user/use-users';

const PAGE_SIZE = 12;

export function UsersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramsObj = useMemo(() => {
    const obj: Record<string, string> = {};
    if (searchParams.has('search')) {
      obj.search = searchParams.get('search') || '';
    }
    if (searchParams.has('status')) {
      obj.status = searchParams.get('status') || '';
    }
    obj.page = searchParams.get('page') || '1';
    return obj;
  }, [searchParams]);

  const { users, pagination, isSuccess, isLoading, error } = useUsers(
    {
      pageSize: PAGE_SIZE,
      name: paramsObj.search,
      status: paramsObj.status,
      page: parseInt(paramsObj.page),
    },
    {
      enabled: true,
    }
  );

  const { totalPages, total } = pagination || {};

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);

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
        <p className="text-red-500">Failed to load users</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const userSearchParams = {
    search: paramsObj.search ?? '',
    status: paramsObj.status ?? '',
    page: paramsObj.page ?? '1',
  };

  return (
    <UsersTableClient
      users={users}
      totalPages={totalPages ?? 1}
      totalItems={total ?? 0}
      currentPage={parseInt(userSearchParams.page)}
      isLoading={isLoading}
      searchParams={userSearchParams}
      onUpdateSearchParams={updateSearchParams}
    />
  );
}
