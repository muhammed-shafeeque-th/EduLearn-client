'use client';

import { ReviewsChart } from './_/reviews-chart';
import { motion } from 'framer-motion';

export default function ReviewsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <ReviewsChart />
    </motion.div>
  );
}
