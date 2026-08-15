'use client';
import { motion } from 'framer-motion';

export function InstructorsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Instructors</h2>
        <p className="text-muted-foreground">Manage and monitor instructor accounts</p>
      </div>
      {/* <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Instructor
      </Button> */}
    </motion.div>
  );
}
