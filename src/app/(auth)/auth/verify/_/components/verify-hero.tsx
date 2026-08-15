'use client';

import { motion } from 'framer-motion';

export function VerifyHero() {
  return (
    <div className="relative w-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-green-400 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-emerald-400 blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-teal-400 blur-xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Main Email Illustration */}
        <div className="relative">
          {/* Large Email Envelope */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-64 h-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
          >
            {/* Envelope Body */}
            <div className="w-full h-full bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-2xl p-6">
              {/* Envelope Top Flap */}
              <motion.div
                initial={{ rotateX: 0 }}
                animate={{ rotateX: -25 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -top-6 left-0 right-0 h-12 bg-blue-200 dark:bg-blue-700 rounded-t-2xl origin-bottom shadow-lg"
              />

              {/* OTP Code Display */}
              <div className="flex items-center justify-center h-full">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 Shadow-lg">
                  <div className="text-center space-y-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      Your verification code
                    </div>
                    <div className="flex space-x-2 justify-center">
                      {['1', '2', '3', '4', '5', '6'].map((digit, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: 1.2 + index * 0.1,
                            type: 'spring',
                            stiffness: 200,
                          }}
                          className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center"
                        >
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {digit}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Flying Email Animation */}
          <motion.div
            initial={{ x: -100, y: -50, opacity: 0, rotate: -45 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            transition={{
              duration: 1.2,
              delay: 1.8,
              type: 'spring',
              stiffness: 100,
            }}
            className="absolute -top-8 -right-8 w-16 h-12 bg-yellow-400 dark:bg-yellow-500 rounded-lg shadow-lg flex items-center justify-center"
          >
            <span className="text-2xl">📧</span>
          </motion.div>

          {/* Character Receiving Email */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute -bottom-20 left-1/2 transform -translate-x-1/2"
          >
            {/* Character Body */}
            <div className="w-16 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg relative">
              {/* Head */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-pink-200 rounded-full">
                {/* Eyes */}
                <div className="absolute top-3 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>

                {/* Smile */}
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-4 h-2 border-b-2 border-black rounded-full"></div>
              </div>

              {/* Phone in hand */}
              <motion.div
                animate={{
                  y: [0, -3, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-4 right-2 w-4 h-6 bg-gray-800 dark:bg-gray-200 rounded-md"
              >
                <div className="w-full h-2 bg-green-400 rounded-t-md"></div>
              </motion.div>

              {/* Arms */}
              <div className="absolute top-3 -left-4 w-8 h-3 bg-pink-200 rounded-full transform -rotate-12"></div>
              <div className="absolute top-3 -right-2 w-6 h-3 bg-pink-200 rounded-full transform rotate-12"></div>

              {/* Legs */}
              <div className="absolute -bottom-8 left-3 w-4 h-10 bg-blue-600 rounded-full"></div>
              <div className="absolute -bottom-8 right-3 w-4 h-10 bg-blue-600 rounded-full"></div>
            </div>
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
          className="absolute top-10 right-10 w-12 h-12 bg-green-400 dark:bg-green-500 rounded-lg flex items-center justify-center shadow-lg"
        >
          <span className="text-xl">✅</span>
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
          className="absolute bottom-10 left-10 w-10 h-10 bg-blue-400 dark:bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-lg">🔐</span>
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
          className="absolute top-1/2 left-20 w-8 h-8 bg-purple-400 dark:bg-purple-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-sm">📱</span>
        </motion.div>

        {/* Success Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.7, 1, 0.7],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
