'use client';

import { motion } from 'framer-motion';

export default function DashboardPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">
        Welcome back to EduLearn Admin - Here&apos;s what&apos;s happening today
      </p>
    </motion.div>
  );
}
