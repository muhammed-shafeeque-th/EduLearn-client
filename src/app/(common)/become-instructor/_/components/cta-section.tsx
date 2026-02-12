'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export function CallToActionSection() {
  return (
    <section
      className="py-12 lg:py-20 bg-gradient-to-r from-gray-900 via-primary/90 to-gray-900 dark:from-gray-950 dark:via-primary dark:to-gray-950"
      aria-labelledby="become-instructor-cta-title"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 text-white"
          >
            <div className="space-y-4">
              <h2 id="become-instructor-cta-title" className="text-3xl lg:text-4xl font-bold">
                Start teaching with us and <span className="text-tertiary">inspire others</span>
              </h2>
              <p className="text-lg text-gray-300">
                Become part of the EduLearn community and start teaching students around the world.
                Create your first course and begin your teaching journey today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary/80 hover:bg-primary/90 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
                aria-label="Register as an instructor"
              >
                <Link href="/become-instructor/register" scroll={false}>
                  <span>Register Now</span>
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </motion.div>
          {/* Right: Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="relative"
            aria-hidden="true"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-yellow-400 rounded-3xl blur-2xl opacity-30 animate-pulse pointer-events-none" />
              <Image
                src="/instructors/inspiring-instructor.png"
                alt="Inspiring instructor"
                width={500}
                height={500}
                className="relative w-full h-auto rounded-3xl shadow-2xl"
                priority
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
