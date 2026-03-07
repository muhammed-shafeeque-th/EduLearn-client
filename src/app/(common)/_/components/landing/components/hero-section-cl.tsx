'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Users, BookOpen, Star } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

const HeroSection = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Welcome to EduLearn! Check your email for next steps.');
    setEmail('');
    setIsLoading(false);
  };

  return (
    <section className="relative min-h-screen flex items-center py-20 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
              >
                Unlock Your Potential
                <span className="block text-primary">with EduLearn</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed"
              >
                Welcome to EduLearn, where learning knows no bounds. We believe that education is
                the key to personal and professional growth, and we&apos;re here to guide you on
                your journey to success.
              </motion.p>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email to get started"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <Button
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  className="h-12 px-8 text-base font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Starting...</span>
                    </div>
                  ) : (
                    'Start your instructor journey'
                  )}
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Join 25,000+ learners</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.8/5 average rating</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Illustrations */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              {/* Main character */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                <div className="w-80 h-80 md:w-96 md:h-96 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                    alt="Student learning"
                    width={200}
                    height={200}
                    className="rounded-full border-4 border-white shadow-lg"
                  />
                </div>
              </motion.div>

              {/* Floating elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <BookOpen className="h-8 w-8 text-white" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-20 left-0 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Live Classes</p>
                    <p className="text-xs text-gray-500">Join our community</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-1/2 -right-4 bg-yellow-400 p-3 rounded-xl shadow-lg"
              >
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800">2400+</p>
                  <p className="text-xs text-gray-700">Courses</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 dark:bg-purple-800 rounded-full opacity-50 blur-xl" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full opacity-50 blur-xl" />
    </section>
  );
};

export default HeroSection;
