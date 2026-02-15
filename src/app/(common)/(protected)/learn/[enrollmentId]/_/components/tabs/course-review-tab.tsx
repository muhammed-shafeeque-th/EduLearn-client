'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, Pencil, Trash2 } from 'lucide-react';
import { cn, getErrorMessage } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useEnrollmentReview } from '@/states/server/review/use-enrollment-review';

interface CourseReviewsTabProps {
  enrollmentId: string;
  userId: string;
  overallProgressPercent: number;
}

export function CourseReviewsTab({ enrollmentId, overallProgressPercent }: CourseReviewsTabProps) {
  // Review state for edit/new
  const [showForm, setShowForm] = useState(false); // Show review form
  const [editMode, setEditMode] = useState(false); // Editing an existing review
  const [formRating, setFormRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formComment, setFormComment] = useState('');

  // Review hooks
  const {
    review,
    submitCourseReview,
    updateCourseReview,
    deleteCourseReview,
    isSubmitting,
    isUpdating,
    isDeleting,
    isLoading,
    error,
    refetch,
  } = useEnrollmentReview(enrollmentId);

  const userEligibleToReview = overallProgressPercent >= 80;

  // Effect: when review is available, close form/edit and show review details
  useEffect(() => {
    if (!showForm && review) {
      setFormRating(review.rating);
      setFormComment(review.comment);
    }
  }, [review, showForm]);

  // Helper: reset form values
  const resetForm = () => {
    setShowForm(false);
    setEditMode(false);
    setFormRating(0);
    setFormComment('');
    setHoveredRating(0);
  };

  // Submit handler (new or update)
  const handleFormSubmit = useCallback(async () => {
    if (!userEligibleToReview) {
      toast.error({
        title: 'Not eligible to review',
        description: 'Complete at least 80% of the course to leave a review.',
      });
      return;
    }

    if (formRating === 0) {
      toast.error({ title: 'Please select a rating.' });
      return;
    }
    if (formComment.trim().length < 10) {
      toast.error({ title: 'Please write at least 10 characters.' });
      return;
    }

    try {
      if (editMode && review?.id) {
        await updateCourseReview({
          reviewId: review.id,
          payload: { rating: formRating, comment: formComment.trim() },
        });
        toast.success({ title: 'Review updated successfully!' });
      } else {
        await submitCourseReview({ payload: { rating: formRating, comment: formComment.trim() } });
        toast.success({ title: 'Review submitted successfully!' });
      }
      resetForm();
      refetch?.();
    } catch (err) {
      toast.error({
        title: 'Failed to submit review. Please try again.',
        description: getErrorMessage(err),
      });
    }
  }, [
    editMode,
    formComment,
    formRating,
    refetch,
    review?.id,
    submitCourseReview,
    updateCourseReview,
    userEligibleToReview,
  ]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!review?.id) return;
    if (
      window.confirm('Are you sure you want to delete your review? This action cannot be undone.')
    ) {
      try {
        await deleteCourseReview({ reviewId: review.id });
        toast.success({ title: 'Review deleted successfully!' });
        resetForm();
        refetch?.();
      } catch (err) {
        toast.error({ title: 'Failed to delete review.', description: getErrorMessage(err) });
      }
    }
  }, [deleteCourseReview, refetch, review?.id]);

  // Show form for editing
  const startEdit = () => {
    if (review) {
      setEditMode(true);
      setFormRating(review.rating);
      setFormComment(review.comment);
      setShowForm(true);
    }
  };

  // Show form for new review
  const startNewReview = () => {
    setShowForm(true);
    setEditMode(false);
    setFormRating(0);
    setFormComment('');
  };

  // Render rating stars
  const renderStars = (
    ratingValue: number,
    interactive = false,
    setRatingFn?: (r: number) => void
  ) => {
    const displayRating = interactive ? hoveredRating || ratingValue : ratingValue;

    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            aria-label={interactive ? `Select ${i + 1} stars` : `${i + 1} star`}
            tabIndex={interactive ? 0 : -1}
            onMouseEnter={() => interactive && setHoveredRating(i + 1)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            onClick={() => interactive && setRatingFn?.(i + 1)}
            className={cn(
              interactive && 'cursor-pointer hover:scale-110 transition-transform',
              !interactive && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                'h-6 w-6',
                i < displayRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Review</CardTitle>
            {!showForm && userEligibleToReview && (
              <>
                {review ? (
                  <div className="space-x-2 flex">
                    <Button variant="outline" size="sm" onClick={startEdit}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={startNewReview}
                    disabled={isSubmitting || !userEligibleToReview}
                  >
                    Write Review
                  </Button>
                )}
              </>
            )}
          </div>
          {!userEligibleToReview && (
            <p className="text-xs text-muted-foreground mt-1">
              Complete at least 80% of the course to leave a review.
            </p>
          )}
          {error && (
            <div className="text-destructive text-xs mt-2">{error?.message || String(error)}</div>
          )}
        </CardHeader>

        {/* If loading */}
        {isLoading ? (
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            Loading review...
          </CardContent>
        ) : showForm && userEligibleToReview ? (
          <CardContent className="space-y-4">
            <div>
              <label
                className="text-sm font-medium mb-2 block"
                id="rating-label"
                htmlFor="rating-stars"
              >
                Your Rating
              </label>
              <div id="rating-stars" aria-labelledby="rating-label" role="radiogroup">
                {renderStars(formRating, true, setFormRating)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="review-textarea">
                Your Review
              </label>
              <Textarea
                id="review-textarea"
                maxLength={500}
                placeholder="Share your experience with this course..."
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                rows={5}
                className="resize-none"
                aria-disabled={isSubmitting || isUpdating}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formComment.length}/500 characters minimum 10.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleFormSubmit}
                disabled={
                  isSubmitting || isUpdating || formRating === 0 || formComment.trim().length < 10
                }
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting || isUpdating
                  ? editMode
                    ? 'Updating...'
                    : 'Submitting...'
                  : editMode
                    ? 'Update Review'
                    : 'Submit Review'}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={resetForm}
                disabled={isSubmitting || isUpdating}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        ) : review ? (
          // Show the existing review
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold text-sm">Your Rating</span>
              <div className="mt-1">{renderStars(review.rating, false)}</div>
            </div>
            <div className="pt-2">
              <span className="font-semibold text-sm">Your Review</span>
              <p className="mt-1 text-base text-primary">{review.comment}</p>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Last updated: {review.updatedAt ? new Date(review.updatedAt).toLocaleString() : 'N/A'}
            </div>
          </CardContent>
        ) : (
          // No review yet
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            {userEligibleToReview
              ? 'You have not reviewed this course yet. Click "Write Review" to get started!'
              : 'You need to complete at least 80% of the course to leave a review.'}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
