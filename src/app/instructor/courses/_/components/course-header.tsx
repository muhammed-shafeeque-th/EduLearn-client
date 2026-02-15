'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function CoursesHeader() {
  const currentTime = new Date().getHours();
  const greeting =
    currentTime < 12 ? 'Good Morning' : currentTime < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <p className="text-sm text-muted-foreground">{greeting}</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Courses</h1>
      </div>

      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link href="/instructor/courses/create">
          <Plus className="w-4 h-4 mr-2" />
          Create New Course
        </Link>
      </Button>
    </motion.div>
  );
}
