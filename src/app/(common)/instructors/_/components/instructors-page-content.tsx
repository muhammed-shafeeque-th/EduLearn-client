'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InstructorCard } from './instructor-card';
import { InstructorCardSkeleton } from './skeletons/instructor-card-skeleton';
import Pagination from '@/components/ui/pagination';
import { useInstructors } from '@/states/server/user/use-instructors';

const ITEMS_PER_PAGE = 8;

export default function InstructorsPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { instructors, isLoading, totalPages } = useInstructors({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE as number,
  });

  const filteredInstructors = useMemo(() => {
    if (!instructors) return [];
    let filtered = instructors;

    if (searchQuery) {
      filtered = filtered.filter(
        (instructor) =>
          instructor.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          instructor.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((instructor) =>
        instructor.role.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (selectedTeacher !== 'all') {
      if (selectedTeacher === 'top-rated') {
        filtered = filtered.slice().sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      } else if (selectedTeacher === 'new') {
        filtered = filtered
          .slice()
          .sort(
            (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
          );
      }
    }
    return filtered;
  }, [instructors, searchQuery, selectedCategory, selectedTeacher]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInstructors = filteredInstructors.slice(startIndex, endIndex);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleTeacherChange = (value: string) => {
    setSelectedTeacher(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTeacher('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <header className="px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-blue-500 hidden sm:block" />
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                Instructors
                <span className="text-blue-600 ml-3">
                  ({isLoading ? '...' : filteredInstructors.length})
                </span>
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium pl-1 sm:pl-11 max-w-2xl">
              Learn from industry experts and passionate teachers dedicated to your success.
            </p>
          </div>

          <div className="flex items-center gap-3 pl-1 sm:pl-11 md:pl-0">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {isLoading ? '...' : filteredInstructors.length} EXPERTS FOUND
            </div>
          </div>
        </div>
      </header>

      {/* Filters Container */}
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-[32px] shadow-2xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-blue-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
              <Input
                placeholder="Search instructors by name or specialty..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-12 h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus-visible:border-blue-500 rounded-2xl font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>

            {/* Selects */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-14 w-full sm:w-[180px] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 px-6">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2">
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTeacher} onValueChange={handleTeacherChange}>
                <SelectTrigger className="h-14 w-full sm:w-[180px] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 px-6">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2">
                  <SelectItem value="all">Default Sort</SelectItem>
                  <SelectItem value="top-rated">Top Rated</SelectItem>
                  <SelectItem value="new">Newcomers</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="h-14 w-full sm:w-14 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 hover:text-blue-500 transition-all"
                onClick={handleClearFilters}
              >
                <Filter className="w-5 h-5" />
                <span className="sm:hidden ml-2 font-bold uppercase tracking-widest text-[10px]">
                  Clear Filters
                </span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-4">
        {/* Instructors Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12"
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => <InstructorCardSkeleton key={index} />)
            : currentInstructors.map((instructor, index) => (
                <motion.div
                  key={instructor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <InstructorCard instructor={instructor} />
                </motion.div>
              ))}
        </motion.div>

        {/* Empty State */}
        {!isLoading && filteredInstructors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/50 dark:bg-slate-900/20 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              No instructors found
            </h3>
            <p className="text-slate-500 font-medium mb-8">
              Try adjusting your search or filter criteria to find what you&apos;re looking for.
            </p>
            <Button onClick={handleClearFilters} className="rounded-xl px-8 h-12 font-bold">
              Clear All Filters
            </Button>
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && filteredInstructors.length > ITEMS_PER_PAGE && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mt-12"
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages || 0}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
