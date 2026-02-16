'use client';

import { motion } from 'framer-motion';
import React from 'react';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999]">
      {/* Centered Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex h-28 w-28 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-green-500 shadow-lg"
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Progress Bar */}
      <div className="mt-12 w-96 h-2 rounded-full bg-gray-200 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500"
          initial={{ x: '-100%' }}
          animate={{ x: ['-100%', '0%', '100%'] }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
}

export default LoadingScreen;
