'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

const HERO_IMAGE = {
  src: '/instructors/instructors-gathering.jpg',
  alt: 'Excited instructor with books',
  width: 500,
  height: 600,
};

export function BecomeInstructorHero() {
  const router = useRouter();

  // Navigation handler as a callback for better optimization
  const handleRegisterClick = React.useCallback(() => {
    router.push('/become-instructor/register');
  }, [router]);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden 
      bg-gradient-to-br from-primary/5 via-white to-blue-50 dark:from-gray-900 
      dark:via-gray-800 dark:to-gray-900"
      aria-label="Become an Instructor Hero Section"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none select-none"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-6"
          >
            <div className="space-y-4">
              {/* Feature Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/90/30 text-primary/60 dark:text-primary/90 px-4 py-2 rounded-full text-sm font-medium"
                aria-label="Join over 20,000 instructors"
              >
                <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>Join 20k+ successful instructors</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
              >
                Become an{' '}
                <span className="bg-gradient-to-r from-primary/50 to-blue-500 bg-clip-text text-transparent">
                  Instructor
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0"
              >
                Become an instructor &amp; start teaching with certified courses. Launch your first
                class and make your mark globally. Share your expertise in{' '}
                <span className="font-semibold text-primary/80 dark:text-primary/90">
                  7+ countries
                </span>
                .
              </motion.p>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={handleRegisterClick}
                size="lg"
                className="bg-primary/80 hover:bg-primary text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label="Register as Instructor"
              >
                <span>Register Now</span>
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
              </Button>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative order-first lg:order-last"
            aria-hidden="true"
          >
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-blue-400 rounded-3xl blur-3xl opacity-30 animate-pulse" />
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
                <Image
                  src={HERO_IMAGE.src}
                  alt={HERO_IMAGE.alt}
                  width={HERO_IMAGE.width}
                  height={HERO_IMAGE.height}
                  className="w-full h-auto rounded-2xl object-cover"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
