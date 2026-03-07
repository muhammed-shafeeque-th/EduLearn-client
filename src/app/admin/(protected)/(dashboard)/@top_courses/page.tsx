'use client';

import { TopCoursesChart } from './_/top-course-chart';
import { motion } from 'framer-motion';

export default function TopCoursesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <TopCoursesChart />
    </motion.div>
  );
}
