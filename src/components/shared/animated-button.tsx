'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedButton wraps children with a scale animation for hover/tap.
 * @param children - The content to animate
 * @param className - Optional CSS classes
 */
type Props = {
  children: ReactNode;
  className?: string;
};

const AnimatedButton: React.FC<Props> = ({ children, className }) => {
  return (
    <motion.div
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

export default React.memo(AnimatedButton);
