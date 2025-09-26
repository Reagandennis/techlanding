'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Filter,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
interface Review {
  id: string;
  rating: number;
  reviewText: string | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  helpfulCount: number;
  unhelpfulCount: number;
  isReported: boolean;
  user: {
    name: string;
    imageUrl: string | null;
  };
  userVote: 'HELPFUL' | 'UNHELPFUL' | null;
  canEdit: boolean;
  canDelete: boolean;
  canReport: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface CourseReviewsProps {
  courseId: string;
  canReview?: boolean;
  showAddReview?: boolean;
}

export const CourseReviews: React.FC<CourseReviewsProps> = ({
  courseId,
  canReview = false,
  showAddReview = true
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Filters
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating'>('newest');

  // Dialogs
  const [deleteConfirm, setDeleteConfirm] = useState<Review | null>(null);
  const [reportDialog, setReportDialog] = useState<Review | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Load reviews and stats
  const loadReviews = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(filterRating !== 'all' && { rating: filterRating.toString() }),
        sortBy
      });

      const [reviewsResponse, statsResponse] = await Promise.all([
        fetch(`/api/lms/courses/${courseId}/reviews?${params}`),
        fetch(`/api/lms/courses/${courseId}/reviews/stats`)
      ]);

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setReviewStats(statsData.stats);
      }

    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [courseId, filterRating, sortBy]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Submit review
  const handleSubmitReview = async () => {
    if (!user || newRating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/lms/courses/${courseId}/reviews`, {
        method: editingReview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(editingReview && { reviewId: editingReview.id }),
          rating: newRating,
          reviewText: newReviewText.trim() || null,
          isAnonymous
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      toast.success(editingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
      
      // Reset form
      setNewRating(0);
      setNewReviewText('');
      setIsAnonymous(false);
      setShowReviewForm(false);
      setEditingReview(null);
      
      // Reload reviews
      loadReviews();

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Vote on review
  const handleVote = async (reviewId: string, voteType: 'HELPFUL' | 'UNHELPFUL') => {
    if (!user) return;

    try {
      const response = await fetch(`/api/lms/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // Update local state
      setReviews(prev => prev.map(review => {
        if (review.id === reviewId) {
          const wasHelpful = review.userVote === 'HELPFUL';
          const wasUnhelpful = review.userVote === 'UNHELPFUL';
          const isTogglingOff = review.userVote === voteType;

          return {
            ...review,
            helpfulCount: voteType === 'HELPFUL' 
              ? (isTogglingOff ? review.helpfulCount - 1 : review.helpfulCount + (wasUnhelpful ? 0 : 1))
              : (wasHelpful ? review.helpfulCount - 1 : review.helpfulCount),
            unhelpfulCount: voteType === 'UNHELPFUL' 
              ? (isTogglingOff ? review.unhelpfulCount - 1 : review.unhelpfulCount + (wasHelpful ? 0 : 1))
              : (wasUnhelpful ? review.unhelpfulCount - 1 : review.unhelpfulCount),
            userVote: isTogglingOff ? null : voteType
          };
        }
        return review;
      }));

    } catch (error) {
      toast.error('Failed to vote on review');
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/lms/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      toast.success('Review deleted successfully');
      setDeleteConfirm(null);
      loadReviews();

    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  // Report review
  const handleReportReview = async (reviewId: string) => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }

    try {
      const response = await fetch(`/api/lms/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reportReason }),
      });

      if (!response.ok) {
        throw new Error('Failed to report review');
      }

      toast.success('Review reported successfully');
      setReportDialog(null);
      setReportReason('');

    } catch (error) {
      toast.error('Failed to report review');
    }
  };

  // Edit review
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setNewRating(review.rating);
    setNewReviewText(review.reviewText || '');
    setIsAnonymous(review.isAnonymous);
    setShowReviewForm(true);
  };

  // Render star rating
  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
          onClick={() => onStarClick?.(star)}
          disabled={!interactive}
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {reviewStats && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(reviewStats.averageRating))}
                </div>
                <p className="text-gray-600">
                  {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-3">
                    <span className="text-sm w-8">{rating} ★</span>
                    <Progress 
                      value={reviewStats.totalReviews > 0 
                        ? (reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution] / reviewStats.totalReviews) * 100 
                        : 0
                      } 
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-gray-600 w-8">
                      {reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Review Form */}
      {canReview && showAddReview && user && (
        <Card>
          <CardHeader>
            <CardTitle>
              {showReviewForm ? (editingReview ? 'Edit Review' : 'Write a Review') : 'Share Your Experience'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showReviewForm ? (
              <Button onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  {renderStars(newRating, true, setNewRating)}
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review (optional)
                  </label>
                  <Textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share your thoughts about this course..."
                    rows={4}
                  />
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-700">
                    Submit anonymously
                  </label>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting || newRating === 0}
                  >
                    {submitting ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditingReview(null);
                      setNewRating(0);
                      setNewReviewText('');
                      setIsAnonymous(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters and Sort */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={filterRating.toString()} onValueChange={(value) => setFilterRating(value === 'all' ? 'all' : parseInt(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ratings</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
                <SelectItem value="4">4 stars</SelectItem>
                <SelectItem value="3">3 stars</SelectItem>
                <SelectItem value="2">2 stars</SelectItem>
                <SelectItem value="1">1 star</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="helpful">Most helpful</SelectItem>
                <SelectItem value="rating">Highest rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-gray-600">
            Showing {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.isAnonymous ? '' : review.user.imageUrl || ''} />
                    <AvatarFallback>
                      {review.isAnonymous ? '?' : review.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">
                          {review.isAnonymous ? 'Anonymous' : review.user.name}
                        </h4>
                        {renderStars(review.rating)}
                      </div>

                      {/* Review Actions */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                        
                        {(review.canEdit || review.canDelete || review.canReport) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {review.canEdit && (
                                <DropdownMenuItem onClick={() => handleEditReview(review)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {review.canDelete && (
                                <DropdownMenuItem 
                                  onClick={() => setDeleteConfirm(review)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                              {review.canReport && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setReportDialog(review)}>
                                    <Flag className="h-4 w-4 mr-2" />
                                    Report
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    {/* Review Text */}
                    {review.reviewText && (
                      <p className="text-gray-700 mb-3">{review.reviewText}</p>
                    )}

                    {/* Helpful/Unhelpful Votes */}
                    {user && (
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(review.id, 'HELPFUL')}
                            className={review.userVote === 'HELPFUL' ? 'bg-green-50 text-green-600' : ''}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {review.helpfulCount}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(review.id, 'UNHELPFUL')}
                            className={review.userVote === 'UNHELPFUL' ? 'bg-red-50 text-red-600' : ''}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            {review.unhelpfulCount}
                          </Button>
                        </div>

                        {review.updatedAt !== review.createdAt && (
                          <Badge variant="outline" className="text-xs">
                            Edited
                          </Badge>
                        )}

                        {review.isReported && (
                          <Badge variant="destructive" className="text-xs">
                            Reported
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">
                {canReview 
                  ? 'Be the first to share your thoughts about this course!'
                  : 'This course hasn\'t received any reviews yet.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDeleteReview(deleteConfirm.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={!!reportDialog} onOpenChange={() => setReportDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
            <DialogDescription>
              Please let us know why you're reporting this review.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please explain why this review should be reported..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialog(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => reportDialog && handleReportReview(reportDialog.id)}
              disabled={!reportReason.trim()}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseReviews;