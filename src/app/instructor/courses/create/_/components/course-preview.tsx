'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users, Clock, PlayCircle, BookOpen, CheckCircle2, Globe, Award } from 'lucide-react';
import { formatDuration } from '../utils/curriculum-utils';
import Image from 'next/image';

interface CoursePreviewData {
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  category: string;
  level: string;
  language: string;
  price?: number;
  discountPrice?: number;
  currency?: string;
  stats: {
    totalSections: number;
    totalLessons: number;
    totalDuration: number;
    previewContent: number;
  };
  learningOutcomes?: Array<{ text: string }>;
  targetAudience?: Array<{ text: string }>;
  requirements?: Array<{ text: string }>;
  instructor: {
    name: string;
    avatar?: string;
    rating: number;
    studentsCount: number;
    coursesCount: number;
  };
}

interface CoursePreviewProps {
  data: CoursePreviewData;
  className?: string;
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({ data, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Course Header */}
      <div className="relative">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
          {data.thumbnail ? (
            <Image src={data.thumbnail} alt={data.title} className="w-full h-full object-cover" />
          ) : (
            <PlayCircle className="w-16 h-16 text-white/80" />
          )}
        </div>

        {/* Preview Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            Preview
          </span>
        </div>

        {/* Price */}
        {data.price && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
            <div className="text-right">
              {data.discountPrice && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {data.currency || ''}
                  {data.price}
                </p>
              )}
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.currency || ''}
                {data.discountPrice || data.price}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6 space-y-6">
        {/* Title and Subtitle */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 dark:text-gray-400">{data.subtitle}</p>}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm rounded-full">
            {data.category}
          </span>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
            {data.level}
          </span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
            {data.language}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Sections</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.stats.totalSections}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <PlayCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Lessons</p>
            <p className="font-semibold text-gray-900 dark:text-white">{data.stats.totalLessons}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatDuration(data.stats.totalDuration)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Free</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.stats.previewContent}
            </p>
          </div>
        </div>

        {/* Learning Outcomes */}
        {data.learningOutcomes && data.learningOutcomes.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              What you&apos;ll learn:
            </h3>
            <div className="space-y-2">
              {data.learningOutcomes.slice(0, 6).map((outcome, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{outcome.text}</span>
                </div>
              ))}
              {data.learningOutcomes.length > 6 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-7">
                  +{data.learningOutcomes.length - 6} more learning outcomes...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Instructor */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Instructor</h3>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
              {data.instructor.avatar ? (
                <Image
                  src={data.instructor.avatar}
                  alt={data.instructor.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold">
                  {data.instructor.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">{data.instructor.name}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" />
                  {data.instructor.rating}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {data.instructor.studentsCount.toLocaleString()} students
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  {data.instructor.coursesCount} courses
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            Enroll Now
          </button>
          <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-3 px-6 rounded-lg transition-colors">
            Add to Wishlist
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>30-day money-back guarantee</p>
          <p>Full lifetime access</p>
        </div>
      </div>
    </motion.div>
  );
};
