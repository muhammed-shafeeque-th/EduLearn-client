'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function SignupHero() {
  return (
    <div className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="/register-bg.png"
            alt="Student learning online"
            fill
            className="object-cover"
            priority
          />

          {/* Overlay content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
            <div className="text-white">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-2xl font-bold mb-2"
              >
                Start Your Learning Journey
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-white/90"
              >
                Join millions of learners and unlock your potential
              </motion.p>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 dark:bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-2xl">📚</span>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 10, 0],
            x: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 dark:bg-green-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-lg">🎓</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
