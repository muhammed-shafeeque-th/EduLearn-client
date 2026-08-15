'use client';

import { useState } from 'react';
import { UsersTableClient } from './users-table-client';
import { useUsers } from '@/states/server/user/use-users';
import { SortingState, ColumnFiltersState } from '@tanstack/react-table';

export function UsersTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchField, setSearchField] = useState<'username' | 'email'>('username');

  // Derive filters
  const searchFilter = columnFilters.find((f) => f.id === searchField);
  const statusFilter = columnFilters.find((f) => f.id === 'status');
  const searchValue = (searchFilter?.value as string) ?? '';
  const statusValue = (statusFilter?.value as string) ?? '';

  // Reset pagination when filters change
  const [prevFilters, setPrevFilters] = useState({
    columnFilters,
    searchField,
    sorting,
  });

  if (
    columnFilters !== prevFilters.columnFilters ||
    searchField !== prevFilters.searchField ||
    sorting !== prevFilters.sorting
  ) {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setPrevFilters({ columnFilters, searchField, sorting });
  }

  // Data fetching
  const {
    users,
    pagination: apiPagination,
    isLoading,
    error,
    refetch,
  } = useUsers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    // Sort is handled client-side per instructions
    // Use specific search field if provided
    ...(searchField === 'username' && searchValue ? { name: searchValue } : {}),
    ...(searchField === 'email' && searchValue ? { email: searchValue } : {}),
    ...(statusValue
      ? { status: statusValue as 'active' | 'inactive' | 'pending' | 'rejected' }
      : {}),
  });

  if (error && !isLoading) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Failed to load users</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <UsersTableClient
      users={users || []}
      isLoading={isLoading}
      pageCount={apiPagination?.totalPages ?? 0}
      pagination={pagination}
      sorting={sorting}
      columnFilters={columnFilters}
      searchField={searchField}
      onPaginationChange={setPagination}
      onSortingChange={setSorting}
      onColumnFiltersChange={setColumnFilters}
      onSearchFieldChange={setSearchField}
      onRefresh={async () => {
        await refetch();
      }}
    />
  );
}
