'use client';

import { motion } from 'framer-motion';
import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function EmptyState({ message }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-12 h-12 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">No courses found</h3>
          <p className="text-muted-foreground">
            {message
              ? message
              : "You haven't created any courses yet. Start sharing your knowledge with students around the world."}
          </p>
        </div>

        <Button asChild size="lg">
          <Link href="/instructor/courses/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Course
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
