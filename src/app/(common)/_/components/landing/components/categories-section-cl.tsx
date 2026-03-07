'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Telescope, Code, Megaphone, Atom, ChevronRight } from 'lucide-react';

const CategoriesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const categories = [
    {
      id: 1,
      name: 'Astrology',
      courses: 11,
      icon: Telescope,
      color: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600',
    },
    {
      id: 2,
      name: 'Development',
      courses: 12,
      icon: Code,
      color: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600',
    },
    {
      id: 3,
      name: 'Marketing',
      courses: 12,
      icon: Megaphone,
      color: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600',
    },
    {
      id: 4,
      name: 'Physics',
      courses: 14,
      icon: Atom,
      color: 'bg-orange-100 dark:bg-orange-900/20',
      iconColor: 'text-orange-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 px-4" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Top Categories
          </h2>
          <Button variant="ghost" className="text-primary hover:text-primary/80">
            See All
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="cursor-pointer border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8 text-center space-y-4">
                  <div
                    className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto`}
                  >
                    <category.icon className={`h-8 w-8 ${category.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {category.courses} Courses
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;
