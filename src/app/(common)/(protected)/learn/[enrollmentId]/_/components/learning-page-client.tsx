/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  X,
  BookOpen,
  BarChart3,
  List,
  Award,
  Star,
  Loader2,
  Medal,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import type {
  EnrollmentDetail,
  CourseItem,
  LessonWithProgress,
  QuizWithProgress,
} from '@/types/enrollment/enrollment.type';

import { CourseSidebar } from './course-sidebar';
import { CourseProgressTab } from './tabs/course-progress-tab';
import { CourseDetailsTab } from './tabs/course-detail-tab';
import { CourseStructureTab } from './tabs/course-structure-tab';
import { CourseQuizzesTab } from './tabs/course-quizzes-tab';
import { CourseReviewsTab } from './tabs/course-review-tab';
import { QuizRunner } from './quiz-runner';
import { useEnrollmentProgress } from '@/states/server/enrollment/use-enrollment-progress';
import { SecureVideoPlayer } from './video-player';
import { CourseCertificateTab } from './tabs/course-certificate-tab';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { AuthUser } from '@/lib/auth/require-auth/types';
import { useMessaging } from '@/services/ws/chat/hooks/use-instructor-messaging';

interface EnrollmentLearningClientProps {
  enrollmentId: string;
  initialEnrollment: EnrollmentDetail;
  user: AuthUser;
  initialItemId?: string;
  initialItemType?: 'lesson' | 'quiz';
}

export function EnrollmentLearningClient({
  enrollmentId,
  initialEnrollment,
  user,
  initialItemId,
  initialItemType,
}: EnrollmentLearningClientProps) {
  const router = useRouter();

  const {
    progress,
    isLoading,
    isLoadingProgress,
    isItemCompleted,
    submitQuizAttempt,
    refetchProgress,
    prefetchVideoUrl,
  } = useEnrollmentProgress(enrollmentId);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'progress' | 'details' | 'structure' | 'quizzes' | 'reviews'
  >('progress');
  const [currentItemId, setCurrentItemId] = useState<string | undefined>(initialItemId);
  const [showQuizMode, setShowQuizMode] = useState(initialItemType === 'quiz');
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const completedToastRef = useRef<string | null>(null);

  const courseItems = useMemo<CourseItem[]>(() => {
    const sortedSections = [...initialEnrollment.sections].sort((a, b) => a.order - b.order);

    const items: CourseItem[] = [];

    sortedSections.forEach((section) => {
      const sortedLessons = [...section.lessons].sort((a, b) => a.order - b.order);

      sortedLessons.forEach((lesson) => {
        items.push({
          id: lesson.id,
          type: 'lesson',
          sectionId: section.id,
          sectionTitle: section.title,
          title: lesson.title,
          order: lesson.order,
          data: lesson,
        });
      });

      if (section.quiz) {
        items.push({
          id: section.quiz.id,
          type: 'quiz',
          sectionId: section.id,
          sectionTitle: section.title,
          title: section.quiz.title,
          order: sortedLessons.length > 0 ? Math.max(...sortedLessons.map((l) => l.order)) + 1 : 1,
          data: section.quiz,
        });
      }
    });

    return items;
  }, [initialEnrollment]);

  const currentItem = useMemo(() => {
    if (currentItemId) {
      const found = courseItems.find((item) => item.id === currentItemId);
      if (found) return found;
    }

    if (progress) {
      const firstIncomplete = courseItems.find((item) => !isItemCompleted(item.id, item.type));
      if (firstIncomplete) return firstIncomplete;
    }

    return courseItems[0] || null;
  }, [currentItemId, courseItems, progress, isItemCompleted]);

  useEffect(() => {
    if (!currentItemId && currentItem) {
      setCurrentItemId(currentItem.id);
      setShowQuizMode(currentItem.type === 'quiz');
    }
  }, [currentItem, currentItemId]);

  const isItemLocked = useCallback(
    (item: CourseItem): boolean => {
      if (!progress) return true;
      const itemIndex = courseItems.findIndex((i) => i.id === item.id);

      if (itemIndex === 0) return false;

      const previousItem = courseItems[itemIndex - 1];
      return !isItemCompleted(previousItem.id, previousItem.type);
    },
    [courseItems, progress, isItemCompleted]
  );

  const handleItemHover = useCallback(() => {}, []);

  const handleChatWithInstructor = useCallback(async () => {
    setIsCreatingChat(true);
    try {
      router.push(`/profile/my-chats?enrollmentId=${enrollmentId}`);
    } catch (err) {
      toast.error({
        title: 'Failed to create chat with instructor.',
        description: getErrorMessage(err),
      });
    } finally {
      setIsCreatingChat(false);
    }
  }, [enrollmentId, router]);

  const handleItemClick = useCallback(
    (item: CourseItem, bypassLock = false) => {
      if (!bypassLock && isItemLocked(item)) {
        toast.error({ title: 'Complete the previous item first to unlock this one' });
        return;
      }
      setCurrentItemId(item.id);
      setShowQuizMode(item.type === 'quiz');
      setIsSidebarOpen(false);

      router.push(`/learn/${enrollmentId}?itemId=${item.id}&itemType=${item.type}`, {
        scroll: false,
      });
    },
    [enrollmentId, router, isItemLocked]
  );

  const handleVideoEnd = useCallback(async () => {
    if (!currentItem) return;

    if (completedToastRef.current === currentItem?.id) return;
    completedToastRef.current = currentItem?.id;

    toast.success({ title: 'Lesson completed 🎉' });

    refetchProgress();

    const currentIndex = courseItems.findIndex((i) => i.id === currentItem?.id);
    const nextItem = courseItems[currentIndex + 1];

    if (!nextItem) {
      toast.success({ title: "🎉 Congratulations! You've completed all items!" });
      return;
    }

    if (nextItem.type === 'lesson') {
      console.log('Prefetching next lesson:', nextItem.title);
      prefetchVideoUrl(nextItem.id);
    }

    setTimeout(() => {
      handleItemClick(nextItem, true);
    }, 1500);
  }, [courseItems, currentItem, handleItemClick, refetchProgress, prefetchVideoUrl]);

  const handleQuizSubmit = useCallback(
    async (
      quizId: string,
      answers: { questionId: string; answers: string[] }[],
      timeSpent: number
    ) => {
      try {
        const result = await submitQuizAttempt(quizId, { answers, timeSpent });

        await refetchProgress();

        if (result.passed) {
          toast.success({
            title: `🎉 Quiz passed! Score: ${result.score}% (${result.attempts} ${result.attempts === 1 ? 'attempt' : 'attempts'})`,
          });

          setShowQuizMode(false);

          const currentIndex = courseItems.findIndex((i) => i.id === quizId);
          const nextItem = courseItems[currentIndex + 1];

          if (nextItem) {
            setTimeout(() => {
              handleItemClick(nextItem, true);
            }, 1500);
          }
        } else {
          toast.error({ title: `Quiz not passed. Score: ${result.score}%. You can try again.` });
        }

        if (result.milestone) {
          setTimeout(() => {
            toast.success({ title: `🏆 ${result.milestone?.type.replace('_', ' ')}` });
          }, 500);
        }
      } catch (error) {
        console.error('Quiz submission error:', error);
        toast.error({
          title: 'Failed to submit quiz. Please try again.',
          description: getErrorMessage(error),
        });
      }
    },
    [submitQuizAttempt, courseItems, handleItemClick, refetchProgress]
  );

  if (isLoading || isLoadingProgress || !progress || !currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/*  HEADER  */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="border-b bg-background/95 backdrop-blur sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/profile/my-courses')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-3">
              <h1 className="font-semibold text-lg truncate max-w-md">
                {currentItem.sectionTitle}
              </h1>
              <div className="hidden sm:flex items-center space-x-2">
                <Badge variant="secondary" className="font-normal">
                  {Math.round(progress.overallProgress)}% complete
                </Badge>
              </div>
            </div>
          </div>

          {/* --- Chat With Instructor Button --- */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 px-3"
              onClick={handleChatWithInstructor}
              disabled={isCreatingChat}
              title="Chat with Instructor"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden md:inline">Chat with Instructor</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              {/* <Menu className="h-5 w-5" /> */}
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/*  MAIN CONTENT  */}
          <motion.main
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            {/* Video Player or Quiz */}
            {currentItem.type === 'lesson' && !showQuizMode ? (
              <div className="mb-6">
                <SecureVideoPlayer
                  key={currentItem.id}
                  enrollmentId={enrollmentId}
                  lesson={currentItem.data as LessonWithProgress}
                  onVideoEnd={handleVideoEnd}
                />
              </div>
            ) : currentItem.type === 'quiz' && showQuizMode ? (
              <div className="mb-6">
                <QuizRunner
                  enrollmentId={enrollmentId}
                  quiz={currentItem.data as QuizWithProgress}
                  onSubmit={(answers, timeSpent) =>
                    handleQuizSubmit(currentItem.id, answers, timeSpent)
                  }
                  onCancel={() => setShowQuizMode(false)}
                />
              </div>
            ) : null}

            {/* Tabs */}

            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="progress" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Progress</span>
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Details</span>
                </TabsTrigger>
                <TabsTrigger value="structure" className="flex items-center gap-1">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Structure</span>
                </TabsTrigger>
                <TabsTrigger value="quizzes" className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Quizzes</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Reviews</span>
                </TabsTrigger>
                <TabsTrigger value="certificate" className="flex items-center gap-1 relative">
                  <Medal className="h-4 w-4" />
                  <span className="hidden sm:inline">Certificate</span>
                  {progress.overallProgress === 100 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  )}
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="progress" className="mt-0">
                    <CourseProgressTab enrollment={initialEnrollment} progress={progress} />
                  </TabsContent>

                  <TabsContent value="details" className="mt-0">
                    <CourseDetailsTab enrollment={initialEnrollment} />
                  </TabsContent>

                  <TabsContent value="structure" className="mt-0">
                    <CourseStructureTab
                      enrollment={initialEnrollment}
                      progress={progress}
                      onItemClick={handleItemClick}
                      isItemLocked={isItemLocked}
                    />
                  </TabsContent>

                  <TabsContent value="quizzes" className="mt-0">
                    <CourseQuizzesTab
                      enrollment={initialEnrollment}
                      progress={progress}
                      onQuizStart={(quizId) => {
                        const quizItem = courseItems.find(
                          (i) => i.id === quizId && i.type === 'quiz'
                        );
                        if (quizItem) {
                          handleItemClick(quizItem);
                        }
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-0">
                    <CourseReviewsTab
                      enrollmentId={enrollmentId}
                      userId={user.id}
                      overallProgressPercent={progress.overallProgress}
                    />
                  </TabsContent>

                  <TabsContent value="certificate" className="mt-0">
                    <CourseCertificateTab
                      enrollmentId={enrollmentId}
                      enrollment={initialEnrollment}
                      overallProgress={progress.overallProgress}
                      userName={user.name!}
                    />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </motion.main>

          {/*  SIDEBAR - DESKTOP  */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:block lg:w-80 xl:w-96"
          >
            <div className="sticky top-24">
              <CourseSidebar
                courseItems={courseItems}
                currentItemId={currentItem.id}
                progress={progress}
                onItemClick={handleItemClick}
                isItemLocked={isItemLocked}
                onItemHover={handleItemHover}
              />
            </div>
          </motion.aside>

          {/*  SIDEBAR - MOBILE  */}
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
                <motion.aside
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l z-50 lg:hidden overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Course Content</h3>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="h-[calc(100vh-73px)] overflow-auto p-4">
                    <CourseSidebar
                      courseItems={courseItems}
                      currentItemId={currentItem.id}
                      progress={progress}
                      onItemClick={handleItemClick}
                      isItemLocked={isItemLocked}
                    />
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
