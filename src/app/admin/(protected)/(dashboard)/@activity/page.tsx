'use client';

import { RecentActivity } from './_/recent-activity';
import { motion } from 'framer-motion';

export default function ActivityPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.7 }}
    >
      <RecentActivity />
    </motion.div>
  );
}
