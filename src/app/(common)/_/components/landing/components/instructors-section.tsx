'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Users, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const InstructorsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const instructors = [
    {
      id: 1,
      name: 'Ronald Richards',
      title: 'UI/UX Designer',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      students: 2400,
    },
    {
      id: 2,
      name: 'Ronald Richards',
      title: 'UI/UX Designer',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      students: 2400,
    },
    {
      id: 3,
      name: 'Ronald Richards',
      title: 'UI/UX Designer',
      avatar:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      students: 1800,
    },
    {
      id: 4,
      name: 'Ronald Richards',
      title: 'UI/UX Designer',
      avatar:
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      students: 3200,
    },
    {
      id: 5,
      name: 'Ronald Richards',
      title: 'UI/UX Designer',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      rating: 4.7,
      students: 2800,
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
            Top Instructors
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
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {instructors.map((instructor) => (
            <motion.div
              key={instructor.id}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="text-center border-0 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                <CardContent className="p-6 space-y-4">
                  <div className="relative mx-auto w-20 h-20">
                    <Image
                      src={instructor.avatar}
                      alt={instructor.name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {instructor.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{instructor.title}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-sm">{instructor.rating}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{instructor.students} Students</span>
                    </div>
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

export default InstructorsSection;
