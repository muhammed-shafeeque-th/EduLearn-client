'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Filter,
  TrendingUp,
  MessageSquare,
  Flag,
  Search,
  Calendar,
  Verified,
  SortAsc,
} from 'lucide-react';
import { toast } from 'sonner';
import { Course, mockReviews } from '@/types/course';

interface ReviewsTabProps {
  course: Course;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

export function ReviewsTab({ course }: ReviewsTabProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([]);
  const [reportedReviews, setReportedReviews] = useState<string[]>([]);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    comment: '',
  });

  const reviews = mockReviews;

  const ratingDistribution = [
    { stars: 5, count: 856, percentage: 67 },
    { stars: 4, count: 284, percentage: 22 },
    { stars: 3, count: 89, percentage: 7 },
    { stars: 2, count: 38, percentage: 3 },
    { stars: 1, count: 17, percentage: 1 },
  ];

  const filters = [
    { id: 'all', label: 'All Reviews', count: course.totalRatings },
    { id: '5', label: '5 Stars', count: 856 },
    { id: '4', label: '4 Stars', count: 284 },
    { id: '3', label: '3 Stars', count: 89 },
    { id: '2', label: '2 Stars', count: 38 },
    { id: '1', label: '1 Star', count: 17 },
  ];

  const sortOptions = [
    { id: 'recent', label: 'Most Recent' },
    { id: 'helpful', label: 'Most Helpful' },
    { id: 'rating-high', label: 'Highest Rating' },
    { id: 'rating-low', label: 'Lowest Rating' },
  ];

  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulReviews((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]
    );
    toast.success(helpfulReviews.includes(reviewId) ? 'Removed from helpful' : 'Marked as helpful');
  };

  const handleReportReview = (reviewId: string) => {
    setReportedReviews((prev) => [...prev, reviewId]);
    toast.success('Review reported. Thank you for your feedback.');
  };

  const handleSubmitReview = () => {
    if (reviewForm.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    // Here you would submit to your API
    toast.success('Review submitted successfully!');
    setShowReviewForm(false);
    setReviewForm({ rating: 0, title: '', comment: '' });
  };

  const renderStars = (
    rating: number,
    interactive: boolean = false,
    onRate?: (rating: number) => void
  ) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-colors ${
          interactive ? 'cursor-pointer hover:scale-110' : ''
        } ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        onClick={interactive && onRate ? () => onRate(i + 1) : undefined}
      />
    ));
  };

  const renderInteractiveStars = (rating: number, onRate: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <motion.div key={i} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <Star
              className={`w-6 h-6 cursor-pointer transition-colors ${
                i < rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
              }`}
              onClick={() => onRate(i + 1)}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesFilter = selectedFilter === 'all' || review.rating.toString() === selectedFilter;
    const matchesSearch =
      searchQuery === '' ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Student Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Overall Rating */}
              <div className="text-center">
                <motion.div
                  className="text-6xl font-bold text-gray-900 dark:text-white mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {course.rating}
                </motion.div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.floor(course.rating))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Course Rating • {course.totalRatings?.toLocaleString()} reviews
                </p>

                <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Write a Review
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                {ratingDistribution.map((item, index) => (
                  <motion.div
                    key={item.stars}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <div className="flex items-center gap-1 w-16">{renderStars(item.stars)}</div>
                    <Progress value={item.percentage} className="flex-1 h-3" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {item.percentage}%
                    </span>
                    <span className="text-xs text-gray-500 w-12 text-right">({item.count})</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SortAsc className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={selectedFilter === filter.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter(filter.id)}
            className={`${
              selectedFilter === filter.id
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'hover:border-orange-600 hover:text-orange-600'
            }`}
          >
            <Filter className="w-4 h-4 mr-1" />
            {filter.label}
            <Badge variant="secondary" className="ml-2 text-xs">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </motion.div>

      {/* Reviews List */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`${reportedReviews.includes(review.id) ? 'opacity-50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {review.user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {review.user.name}
                            </h4>
                            <Verified className="w-4 h-4 text-blue-500" />
                            <Badge variant="outline" className="text-xs">
                              Verified Purchase
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReportReview(review.id)}
                            disabled={reportedReviews.includes(review.id)}
                          >
                            <Flag className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="prose dark:prose-invert max-w-none mb-4">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${
                              helpfulReviews.includes(review.id)
                                ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => handleHelpfulClick(review.id)}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Helpful ({review.helpful + (helpfulReviews.includes(review.id) ? 1 : 0)}
                            )
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            Not Helpful
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Enrolled 3 months ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <Button
          variant="outline"
          size="lg"
          className="hover:border-orange-600 hover:text-orange-600"
        >
          Load More Reviews
        </Button>
      </motion.div>

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Rating Selection */}
            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium text-gray-900 dark:text-white mb-3"
              >
                Overall Rating *
              </label>
              <div className="flex items-center gap-2">
                {renderInteractiveStars(reviewForm.rating, (rating) =>
                  setReviewForm((prev) => ({ ...prev, rating }))
                )}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {reviewForm.rating === 0
                    ? 'Select a rating'
                    : reviewForm.rating === 1
                      ? 'Poor'
                      : reviewForm.rating === 2
                        ? 'Fair'
                        : reviewForm.rating === 3
                          ? 'Good'
                          : reviewForm.rating === 4
                            ? 'Very Good'
                            : 'Excellent'}
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
              >
                Review Title (Optional)
              </label>
              <Input
                placeholder="Summarize your review or highlight key points"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Review Comment */}
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
              >
                Your Review *
              </label>
              <Textarea
                placeholder="Tell others about your experience with this course. What did you like? What could be improved?"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                {reviewForm.comment.length}/1000 characters
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={reviewForm.rating === 0 || !reviewForm.comment.trim()}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
