'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Key, CheckCircle } from 'lucide-react';

export function ResetPasswordHero() {
  return (
    <div className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-lg mx-auto"
      >
        {/* Main Illustration */}
        <div className="relative">
          {/* 3D Character Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-80 h-80 mx-auto"
          >
            {/* Desk */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-56 h-2 bg-blue-900 rounded-lg" />

            {/* Monitor */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 -translate-y-2 w-32 h-24 bg-gray-800 rounded-lg shadow-xl border-4 border-gray-700">
              <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded p-2 flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Monitor Stand */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-gray-600" />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-600 rounded" />

            {/* Character */}
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 translate-x-8"
            >
              {/* Body */}
              <div className="w-16 h-20 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-full" />

              {/* Head */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-b from-orange-200 to-orange-300 rounded-full border-2 border-orange-400" />

              {/* Hat */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full" />
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-purple-700 rounded-t-full" />

              {/* Arms */}
              <div className="absolute top-4 -left-4 w-8 h-3 bg-orange-200 rounded-full transform rotate-45" />
              <div className="absolute top-4 -right-4 w-8 h-3 bg-orange-200 rounded-full transform -rotate-45" />

              {/* Hand with peace sign */}
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 -right-8 w-4 h-6 bg-orange-200 rounded-full"
              >
                <div className="absolute top-1 left-1 w-1 h-3 bg-orange-300 rounded-full" />
                <div className="absolute top-1 right-1 w-1 h-3 bg-orange-300 rounded-full" />
              </motion.div>

              {/* Legs */}
              <div className="absolute -bottom-12 left-2 w-4 h-12 bg-blue-600 rounded-full" />
              <div className="absolute -bottom-12 right-2 w-4 h-12 bg-blue-600 rounded-full" />

              {/* Shoes */}
              <div className="absolute -bottom-16 left-0 w-6 h-4 bg-gray-800 rounded-full" />
              <div className="absolute -bottom-16 right-0 w-6 h-4 bg-gray-800 rounded-full" />
            </motion.div>

            {/* Laptop */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 -translate-x-8 w-16 h-12 bg-gray-700 rounded-lg shadow-lg">
              <div className="w-full h-8 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-t-lg p-1">
                <div className="w-full h-full bg-blue-500 rounded flex items-center justify-center">
                  <Lock className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Security Icons */}
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
          className="absolute top-8 right-8 w-12 h-12 bg-green-400 dark:bg-green-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <CheckCircle className="w-6 h-6 text-white" />
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
          className="absolute top-20 left-8 w-10 h-10 bg-yellow-400 dark:bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Key className="w-5 h-5 text-white" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute bottom-20 right-4 w-8 h-8 bg-red-400 dark:bg-red-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Lock className="w-4 h-4 text-white" />
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Secure Password Reset
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Your account security is our priority</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
