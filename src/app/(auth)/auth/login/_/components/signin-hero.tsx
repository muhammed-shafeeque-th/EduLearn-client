'use client';

import { motion } from 'framer-motion';

export function SigninHero() {
  return (
    <div className="relative w-full bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 dark:from-purple-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-blue-400 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-purple-400 blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-pink-400 blur-xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Main Illustration */}
        <div className="relative">
          {/* Desk */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-80 h-4 bg-blue-600 rounded-lg shadow-lg"
          />

          {/* Desk Legs */}
          <div className="absolute -bottom-24 left-8 w-4 h-24 bg-blue-700 rounded-b-lg"></div>
          <div className="absolute -bottom-24 right-8 w-4 h-24 bg-blue-700 rounded-b-lg"></div>

          {/* Monitor */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute -top-32 left-8 w-32 h-24 bg-gray-800 rounded-lg shadow-xl"
          >
            <div className="w-full h-full bg-gradient-to-b from-blue-400 to-purple-500 rounded-lg p-2">
              <div className="w-full h-full bg-gray-900 rounded flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-green-400 text-xs font-mono"
                >
                  {'</>'}
                </motion.div>
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gray-700 rounded-b-full"></div>
          </motion.div>

          {/* Laptop */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -top-6 right-12 w-20 h-14 bg-gray-300 rounded-lg shadow-lg transform rotate-12"
          >
            <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg p-1">
              <div className="w-full h-3/4 bg-blue-500 rounded-t flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="w-full h-1/4 bg-gray-300 rounded-b"></div>
            </div>
          </motion.div>

          {/* Character */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute -top-20 left-1/2 transform -translate-x-1/2"
          >
            {/* Body */}
            <div className="w-12 h-16 bg-white rounded-2xl shadow-lg relative">
              {/* Head */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-pink-200 rounded-full">
                {/* Hat */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-6 bg-purple-600 rounded-full shadow-md"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-purple-700 rounded-full"></div>

                {/* Eyes */}
                <div className="absolute top-2 left-1.5 w-1 h-1 bg-black rounded-full"></div>
                <div className="absolute top-2 right-1.5 w-1 h-1 bg-black rounded-full"></div>

                {/* Smile */}
                <div className="absolute top-3.5 left-1/2 transform -translate-x-1/2 w-3 h-1.5 border-b-2 border-black rounded-full"></div>
              </div>

              {/* Arms */}
              <motion.div
                animate={{ rotate: [0, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-2 -left-3 w-6 h-2 bg-pink-200 rounded-full transform -rotate-12"
              />
              <motion.div
                animate={{ rotate: [0, -20, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute top-2 -right-3 w-6 h-2 bg-pink-200 rounded-full transform rotate-45"
              />

              {/* Legs */}
              <div className="absolute -bottom-6 left-2 w-3 h-8 bg-blue-600 rounded-full"></div>
              <div className="absolute -bottom-6 right-2 w-3 h-8 bg-blue-600 rounded-full"></div>

              {/* Shoes */}
              <div className="absolute -bottom-8 left-0 w-5 h-3 bg-blue-800 rounded-full"></div>
              <div className="absolute -bottom-8 right-0 w-5 h-3 bg-blue-800 rounded-full"></div>
            </div>
          </motion.div>

          {/* Chair */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-8 h-6 bg-gray-600 rounded-t-lg"></div>
            <div className="w-2 h-8 bg-gray-700 mx-auto"></div>
            <div className="w-12 h-2 bg-gray-700 rounded-full"></div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-10 right-10 w-12 h-12 bg-yellow-400 dark:bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg"
        >
          <span className="text-xl">📚</span>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 12, 0],
            x: [0, -8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-20 left-10 w-10 h-10 bg-green-400 dark:bg-green-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-lg">🎓</span>
        </motion.div>

        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute top-1/2 right-20 w-8 h-8 bg-pink-400 dark:bg-pink-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-sm">💡</span>
        </motion.div>

        {/* Plant */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute -bottom-16 left-4"
        >
          <div className="w-4 h-6 bg-green-500 rounded-full"></div>
          <div className="w-2 h-4 bg-green-600 rounded-full ml-1 -mt-2"></div>
          <div className="w-6 h-4 bg-orange-600 rounded-full -mt-1"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
