'use client';

import { motion } from 'framer-motion';
import { RevenueChart } from './_/revenue-chart';

export default function RevenuePage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <RevenueChart />
    </motion.div>
  );
}
