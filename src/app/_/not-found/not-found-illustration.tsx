'use client';

import { motion } from 'framer-motion';

export function NotFoundIllustration() {
  return (
    <div className="relative w-full max-w-lg">
      {/* 404 Large Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-[200px] sm:text-[280px] font-bold text-gray-300 dark:text-gray-600 leading-none text-center select-none"
      >
        404
      </motion.div>

      {/* Character Illustration */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <div className="relative">
          {/* Character Body */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 2, 0, -2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-24 h-32 relative"
          >
            {/* Head */}
            <div className="w-16 h-16 bg-primary/20 dark:bg-primary/30 rounded-full mx-auto relative">
              {/* Hair */}
              <div className="absolute -top-2 left-2 right-2 h-8 bg-primary/40 dark:bg-primary/50 rounded-t-full"></div>

              {/* Eyes */}
              <div className="absolute top-6 left-4 w-2 h-2 bg-gray-800 rounded-full"></div>
              <div className="absolute top-6 right-4 w-2 h-2 bg-gray-800 rounded-full"></div>

              {/* Mouth (confused) */}
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-4 h-2 border-b-2 border-gray-600 rounded-b-full"></div>
            </div>

            {/* Body */}
            <div className="w-12 h-16 bg-yellow-400 dark:bg-yellow-500 mx-auto mt-1 rounded-t-lg relative">
              {/* Arms */}
              <motion.div
                animate={{ rotate: [0, 15, 0, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -left-4 top-2 w-3 h-8 bg-primary/20 dark:bg-primary/30 rounded-full origin-top"
              ></motion.div>
              <motion.div
                animate={{ rotate: [0, -15, 0, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -right-4 top-2 w-3 h-8 bg-primary/20 dark:bg-primary/30 rounded-full origin-top"
              ></motion.div>
            </div>

            {/* Legs */}
            <div className="flex justify-center space-x-2 mt-1">
              <div className="w-3 h-8 bg-blue-500 dark:bg-blue-600 rounded-full"></div>
              <div className="w-3 h-8 bg-blue-500 dark:bg-blue-600 rounded-full"></div>
            </div>
          </motion.div>

          {/* Floating Question Marks */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -30, -60],
                x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className={`absolute top-0 left-8 text-2xl text-primary/50 dark:text-primary/40 font-bold select-none ${
                i === 1 ? 'left-12' : i === 2 ? 'left-4' : ''
              }`}
            >
              ?
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
        className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 dark:bg-primary/80 rounded-full"
      ></motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2 }}
        className="absolute -bottom-8 -right-8 w-12 h-12 bg-primary/10 dark:bg-primary/90 rounded-full"
      ></motion.div>
    </div>
  );
}
