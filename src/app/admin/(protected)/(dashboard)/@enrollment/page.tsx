'use client';

import { CourseEnrollmentChart } from './_/course-enrollment-chart';
import { motion } from 'framer-motion';

export default function EnrollmentPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <CourseEnrollmentChart />
    </motion.div>
  );
}
