'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Users, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { InstructorMeta } from '@/types/user';
import { useRouter } from 'next/navigation';

function getInitials(username: string) {
  if (!username) return '?';
  return username
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
}

export function InstructorCard({ instructor }: { instructor: InstructorMeta }) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleViewDetail = useCallback(() => {
    router.push(`instructors/${instructor.id}`);
  }, [router, instructor]);

  function formatStudentCount(count: number) {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toLocaleString();
  }

  const {
    username = '',
    role = '',
    avatar,
    rating = 0,
    totalStudents = 0,
    tags,
    experience,
    bio,
  } = instructor;

  function getTrimmedBio(bio?: string, maxLength: number = 80) {
    if (!bio) return null;
    if (bio.length <= maxLength) return bio;
    return bio.slice(0, maxLength).trimEnd() + '...';
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleViewDetail}
      className="group cursor-pointer relative"
    >
      <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 text-center shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 hover:border-blue-500/30">
        {/* Top Actions */}
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-slate-400 hover:text-blue-500 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </div>
        </div>

        {/* Experience Badge */}
        {typeof experience === 'number' && experience > 0 && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">
              {experience}+ YRS EXP
            </div>
          </div>
        )}

        {/* Avatar */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
          <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-800 shadow-2xl transition-transform duration-500 group-hover:scale-110">
            <AvatarImage src={avatar} alt={username} className="object-cover" />
            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-xl font-black">
              {getInitials(username)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name & Role */}
        <div className="space-y-1 mb-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
            {username}
          </h3>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {role}
          </p>
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-6 h-10">
            {getTrimmedBio(bio)}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-6 min-h-[50px]">
          {tags?.slice(0, 3).map((tag, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2.5 py-0.5 border-transparent"
            >
              {tag}
            </Badge>
          ))}
          {tags && tags.length > 3 && (
            <Badge
              variant="secondary"
              className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-bold px-2.5 py-0.5 border-transparent"
            >
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-6" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white mb-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-sm font-black">{Number(rating || 0).toFixed(1)}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Rating
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white mb-0.5">
              <Users className="w-3 h-3 text-blue-500" />
              <span className="text-sm font-black">
                {formatStudentCount(Number(totalStudents || 0))}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Students
            </span>
          </div>
        </div>

        {/* View Profile Button (Hidden until hover) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          className="mt-6"
        >
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-12 shadow-lg shadow-blue-500/30">
            View Profile
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
