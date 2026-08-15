'use client';

import { InstructorPerformanceChart } from './_/instructor-performance-chart';
import { motion } from 'framer-motion';

export default function PerformancePage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <InstructorPerformanceChart />
    </motion.div>
  );
}
