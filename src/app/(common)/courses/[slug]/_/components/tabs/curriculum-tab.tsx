'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  HelpCircle,
  Clock,
  Eye,
  Lock,
  Download,
  BookOpen,
} from 'lucide-react';
import { VideoPreview } from '../video-preview';
import { useState } from 'react';
import { Course, Lesson } from '@/types/course';
import { toast } from '@/hooks/use-toast';

interface CurriculumTabProps {
  course: Course;
}

type VideoData = {
  title: string;
  duration: number;
  url: string;
  type: 'preview';
  thumbnail: string;
};

export function CurriculumTab({ course }: CurriculumTabProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['1']);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  // const [completedLessons, setCompletedLessons] = useState<string[]>(['1', '5']);
  const curriculum = course.sections || [];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.isPreview) {
      const videoData = {
        title: lesson.title,
        duration: lesson.estimatedDuration || 0,
        url:
          lesson.contentUrl ||
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'preview' as const,
        thumbnail: '/course-thumbnail.jpg',
      };
      setSelectedVideo(videoData);
    } else {
      toast.info({ title: 'This lesson is available after course enrollment' });
    }
  };

  // const markAsComplete = (lessonId: string) => {
  //   setCompletedLessons((prev) =>
  //     prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
  //   );
  //   toast.success('Lesson marked as complete!');
  // };

  const getLessonIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return Play;
      case 'quiz':
        return HelpCircle;
      case 'assignment':
        return FileText;
      default:
        return Play;
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-blue-600';
      case 'quiz':
        return 'text-green-600';
      case 'assignment':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTotalDuration = () => {
    return curriculum.reduce((total, section) => {
      const sectionMinutes = parseInt(
        section.lessons
          .reduce((total, lesson) => total + (lesson.estimatedDuration || 0), 0)
          .toString()
          .replace(/\D/g, '')
      );
      return total + sectionMinutes;
    }, 0);
  };

  const getTotalLessons = () => {
    return curriculum.reduce((total, section) => total + section.lessons.length, 0);
  };

  // const getCompletionPercentage = (sectionId: string) => {
  //   const section = curriculum.find((s) => s.id === sectionId);
  //   if (!section) return 0;

  //   const completedCount = section.lessons.filter((lesson) =>
  //     completedLessons.includes(lesson.id)
  //   ).length;

  //   return Math.round((completedCount / section.lessons.length) * 100);
  // };

  return (
    <>
      <div className="space-y-6">
        {/* Enhanced Course Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Lessons</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {getTotalLessons()}
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Quizzes</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {curriculum.reduce((total, section) => total + (section.quiz ? 1 : 0), 0)}
            </div>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Resources</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {curriculum.reduce((total, section) => total + (section.lessons.length || 0), 0)}
            </div>
          </div>
        </motion.div>

        {/* Curriculum Sections */}
        <div className="space-y-4">
          {curriculum.map((section, index) => {
            // const completionPercentage = getCompletionPercentage(section.id);

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <button
                      className="flex items-center justify-between cursor-pointer group w-full bg-transparent border-0 p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      onClick={() => toggleSection(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleSection(section.id);
                        }
                      }}
                      type="button"
                      tabIndex={0}
                      // role="button"
                      aria-expanded={expandedSections.includes(section.id)}
                      aria-controls={`section-panel-${section.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                        >
                          {expandedSections.includes(section.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-base group-hover:text-orange-600 transition-colors">
                              {section.title}
                            </CardTitle>
                            {/* {completionPercentage > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {completionPercentage}% complete
                              </Badge>
                            )} */}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{section.lessons.length} lessons</span>
                            <span>•</span>
                            <span>
                              {section.lessons.reduce(
                                (total, lesson) => total + (lesson.estimatedDuration || 0),
                                0
                              )}{' '}
                              minutes
                            </span>
                            {/* {completionPercentage > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-green-600">
                                  {
                                    section.lessons.filter((l) => completedLessons.includes(l.id))
                                      .length
                                  }{' '}
                                  completed
                                </span>
                              </>
                            )} */}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {/* {completionPercentage > 0 && (
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                      )} */}
                    </button>
                  </CardHeader>

                  <AnimatePresence>
                    {expandedSections.includes(section.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {section.lessons.map((lesson: Lesson, lessonIndex: number) => {
                              const Icon = getLessonIcon(lesson.contentType);
                              // const isCompleted = completedLessons.includes(lesson.id);

                              return (
                                <motion.div
                                  key={lesson.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: lessonIndex * 0.05 }}
                                  className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                                    lesson.isPreview
                                      ? 'hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer'
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }`}
                                  onClick={() => handleLessonClick(lesson)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <Icon
                                        className={`w-4 h-4 ${getLessonTypeColor(lesson.contentType)}`}
                                      />
                                      {/* {isCompleted && (
                                        <CheckCircle className="w-3 h-3 text-green-600 absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full" />
                                      )} */}
                                    </div>

                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`text-sm font-medium ${
                                            // isCompleted
                                            //   ? 'text-green-700 dark:text-green-400'
                                            //   :
                                            'text-gray-900 dark:text-white'
                                          } ${lesson.isPreview ? 'group-hover:text-green-700' : ''}`}
                                        >
                                          {lesson.title}
                                        </span>

                                        {lesson.isPreview && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs border-green-500 text-green-600"
                                          >
                                            <Eye className="w-3 h-3 mr-1" />
                                            Preview
                                          </Badge>
                                        )}

                                        {!lesson.isPreview && (
                                          <Lock className="w-3 h-3 text-gray-400" />
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {lesson.contentType}
                                        </Badge>
                                        {lesson.contentType === 'video' && (
                                          <span className="text-xs text-gray-500">HD Quality</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500">
                                      {lesson.estimatedDuration} minutes
                                    </span>

                                    {lesson.isPreview && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleLessonClick(lesson);
                                        }}
                                      >
                                        <Play className="w-4 h-4" />
                                      </Button>
                                    )}

                                    {/* {!lesson.isPreview && !isCompleted && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsComplete(lesson.id);
                                        }}
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                    )} */}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Section Summary */}
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-4">
                                <span>{section.lessons.length} lessons</span>
                                <span>•</span>
                                <span>
                                  {section.lessons.reduce(
                                    (total, lesson) => total + (lesson.estimatedDuration || 0),
                                    0
                                  )}{' '}
                                  minutes total
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>Section {index + 1}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Course Progress Summary */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="p-6 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Course Progress
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {completedLessons.length} of {getTotalLessons()} lessons completed
                </span>
                <span>•</span>
                <span>
                  {Math.round((completedLessons.length / getTotalLessons()) * 100)}% complete
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {Math.round((completedLessons.length / getTotalLessons()) * 100)}%
              </div>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{
                    width: `${Math.round((completedLessons.length / getTotalLessons()) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div> */}
      </div>

      {/* Video Preview Modal */}
      {selectedVideo && (
        <VideoPreview
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoData={selectedVideo}
        />
      )}
    </>
  );
}
