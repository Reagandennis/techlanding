'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/UserProvider';
import { RichTextEditor } from './RichTextEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Share,
  Bookmark,
  Flag,
  MoreHorizontal,
  Edit,
  Trash,
  Pin,
  Lock,
  CheckCircle,
  Eye,
  Calendar,
  Tag,
  Award,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Copy,
  AlertTriangle,
  Crown,
  Shield,
  User
} from 'lucide-react';
import { ForumTopic, ForumPost, ForumUser, ForumVote } from '@/types/forum';
import { format, formatDistanceToNow } from 'date-fns';
import TimeAgo from 'react-timeago';

interface TopicViewProps {
  topicId: string;
  slug?: string;
}

interface PostWithVoting extends ForumPost {
  userVote?: ForumVote;
  canEdit?: boolean;
  canDelete?: boolean;
  canMarkSolution?: boolean;
}

export const TopicView: React.FC<TopicViewProps> = ({ topicId, slug }) => {
  const { user } = useUser();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<PostWithVoting[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingToPostId, setReplyingToPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState('');
  const [sortBy, setSortBy] = useState<'oldest' | 'newest' | 'votes'>('oldest');
  const [showReportDialog, setShowReportDialog] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [subscribedToTopic, setSubscribedToTopic] = useState(false);

  useEffect(() => {
    fetchTopicData();
  }, [topicId, sortBy]);

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      const [topicRes, postsRes] = await Promise.all([
        fetch(`/api/lms/forum/topics/${topicId}`),
        fetch(`/api/lms/forum/topics/${topicId}/posts?sort=${sortBy}`)
      ]);

      const topicData = await topicRes.json();
      const postsData = await postsRes.json();

      if (topicData.success) {
        setTopic(topicData.data);
      }

      if (postsData.success) {
        setPosts(postsData.data);
      }

      // Check subscription status
      if (user) {
        const subRes = await fetch(`/api/lms/forum/topics/${topicId}/subscription`);
        const subData = await subRes.json();
        setSubscribedToTopic(subData.subscribed);
      }

    } catch (error) {
      console.error('Failed to fetch topic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (targetId: string, targetType: 'topic' | 'post', voteType: 'upvote' | 'downvote') => {
    if (!user) return;

    try {
      const response = await fetch('/api/lms/forum/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, targetType, voteType })
      });

      if (response.ok) {
        // Refresh data to get updated vote counts
        fetchTopicData();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleReply = async (parentId?: string) => {
    if (!user || !replyContent.trim()) return;

    try {
      const response = await fetch('/api/lms/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          content: replyContent,
          parentId
        })
      });

      if (response.ok) {
        setReplyContent('');
        setReplyingToPostId(null);
        fetchTopicData();
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
    }
  };

  const handleEditPost = async (postId: string) => {
    if (!user || !editContent.trim()) return;

    try {
      const response = await fetch(`/api/lms/forum/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        setEditContent('');
        setEditingPostId(null);
        fetchTopicData();
      }
    } catch (error) {
      console.error('Failed to edit post:', error);
    }
  };

  const handleMarkSolution = async (postId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/lms/forum/posts/${postId}/solution`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchTopicData();
      }
    } catch (error) {
      console.error('Failed to mark solution:', error);
    }
  };

  const handleSubscribeToggle = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/lms/forum/topics/${topicId}/subscription`, {
        method: subscribedToTopic ? 'DELETE' : 'POST'
      });

      if (response.ok) {
        setSubscribedToTopic(!subscribedToTopic);
      }
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    }
  };

  const handleReport = async (targetId: string, targetType: 'topic' | 'post') => {
    if (!user || !reportReason) return;

    try {
      const response = await fetch('/api/lms/forum/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          targetType,
          reason: reportReason,
          description: reportDescription
        })
      });

      if (response.ok) {
        setShowReportDialog(null);
        setReportReason('');
        setReportDescription('');
        alert('Report submitted successfully');
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const getUserBadge = (userRole: string) => {
    const badgeMap = {
      admin: { icon: Crown, color: 'text-yellow-600', label: 'Admin' },
      instructor: { icon: Shield, color: 'text-blue-600', label: 'Instructor' },
      moderator: { icon: Shield, color: 'text-green-600', label: 'Moderator' },
      student: { icon: User, color: 'text-gray-600', label: 'Student' }
    };

    const badge = badgeMap[userRole as keyof typeof badgeMap] || badgeMap.student;
    const IconComponent = badge.icon;
    
    return (
      <Badge variant="outline" className="text-xs">
        <IconComponent className={`h-3 w-3 mr-1 ${badge.color}`} />
        {badge.label}
      </Badge>
    );
  };

  const renderPost = (post: PostWithVoting, depth: number = 0) => {
    const maxDepth = 5;
    const isNested = depth > 0;
    
    return (
      <div
        key={post.id}
        className={`${isNested ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}
      >
        <Card className={`${post.isAcceptedAnswer ? 'border-green-500 bg-green-50/50' : ''}`}>
          <CardContent className="p-4">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>
                    {post.author.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{post.author.name}</span>
                    {getUserBadge(post.author.role)}
                    {post.isAcceptedAnswer && (
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Solution
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <TimeAgo date={post.createdAt} />
                    {post.isEdited && (
                      <span className="ml-2">(edited)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setReplyingToPostId(post.id)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  
                  {post.canEdit && (
                    <DropdownMenuItem onClick={() => {
                      setEditingPostId(post.id);
                      setEditContent(post.content);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  
                  {post.canMarkSolution && !post.isAcceptedAnswer && (
                    <DropdownMenuItem onClick={() => handleMarkSolution(post.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Solution
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => setShowReportDialog(post.id)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                  
                  {post.canDelete && (
                    <>
                      <Separator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Content */}
            {editingPostId === post.id ? (
              <div className="space-y-3">
                <RichTextEditor
                  content={editContent}
                  onChange={setEditContent}
                  placeholder="Edit your post..."
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleEditPost(post.id)}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingPostId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            {/* Post Voting and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Voting */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(post.id, 'post', 'upvote')}
                    className={`${post.userVote?.voteType === 'upvote' ? 'text-green-600' : ''}`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{post.votesScore}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(post.id, 'post', 'downvote')}
                    className={`${post.userVote?.voteType === 'downvote' ? 'text-red-600' : ''}`}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* Reply Button */}
                {user && depth < maxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingToPostId(post.id)}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                )}
              </div>

              {/* User Reputation */}
              <div className="text-sm text-muted-foreground">
                <Award className="h-4 w-4 inline mr-1" />
                {post.author.reputation} reputation
              </div>
            </div>

            {/* Reply Form */}
            {replyingToPostId === post.id && user && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium mb-2 block">
                  Reply to {post.author.name}
                </Label>
                <div className="space-y-3">
                  <RichTextEditor
                    content={replyContent}
                    onChange={setReplyContent}
                    placeholder="Write your reply..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleReply(post.id)}>
                      Post Reply
                    </Button>
                    <Button variant="outline" onClick={() => setReplyingToPostId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nested Replies */}
        {post.replies && post.replies.length > 0 && depth < maxDepth && (
          <div className="mt-4">
            {post.replies.map(reply => renderPost(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading topic...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Topic not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topic Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {topic.isPinned && <Pin className="h-5 w-5 text-blue-500" />}
                {topic.isLocked && <Lock className="h-5 w-5 text-gray-500" />}
                {topic.isSolved && <CheckCircle className="h-5 w-5 text-green-500" />}
                {topic.isAnnouncement && (
                  <Badge className="bg-purple-600">Announcement</Badge>
                )}
              </div>
              
              <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={topic.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {topic.author.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>by {topic.author.name}</span>
                </div>
                
                <span>
                  <Calendar className="h-4 w-4 inline mr-1" />
                  <TimeAgo date={topic.createdAt} />
                </span>
                
                <span>
                  <Eye className="h-4 w-4 inline mr-1" />
                  {topic.viewsCount} views
                </span>
                
                <span>
                  <MessageCircle className="h-4 w-4 inline mr-1" />
                  {topic.repliesCount} replies
                </span>
                
                <Badge variant="outline">
                  {topic.category.name}
                </Badge>
              </div>
              
              {topic.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {topic.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Topic Actions */}
            <div className="flex items-center space-x-2">
              {/* Voting */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(topic.id, 'topic', 'upvote')}
                  className="flex-col h-auto p-2"
                >
                  <ArrowUp className="h-4 w-4" />
                  <span className="text-xs">{topic.votesScore}</span>
                </Button>
              </div>

              {user && (
                <Button
                  variant={subscribedToTopic ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleSubscribeToggle}
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  {subscribedToTopic ? 'Unsubscribe' : 'Subscribe'}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowReportDialog(topic.id)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Topic Content */}
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: topic.content }}
          />
        </CardContent>
      </Card>

      {/* Posts Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        
        <div className="flex items-center space-x-2">
          <Label className="text-sm">Sort by:</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {sortBy === 'oldest' ? 'Oldest First' : 
                 sortBy === 'newest' ? 'Newest First' : 'Most Voted'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('votes')}>
                Most Voted
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map(post => renderPost(post))}
      </div>

      {/* New Reply Form */}
      {user && !topic.isLocked && (
        <Card>
          <CardHeader>
            <CardTitle>Add a Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <RichTextEditor
                content={replyContent}
                onChange={setReplyContent}
                placeholder="Write your reply..."
              />
              <Button onClick={() => handleReply()} disabled={!replyContent.trim()}>
                Post Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Dialog */}
      <Dialog open={!!showReportDialog} onOpenChange={() => setShowReportDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for reporting</Label>
              <select 
                value={reportReason} 
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="harassment">Harassment</option>
                <option value="off_topic">Off topic</option>
                <option value="copyright">Copyright violation</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <Label>Additional details (optional)</Label>
              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide more details about the issue..."
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => showReportDialog && handleReport(showReportDialog, showReportDialog === topic.id ? 'topic' : 'post')}
                disabled={!reportReason}
              >
                Submit Report
              </Button>
              <Button variant="outline" onClick={() => setShowReportDialog(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};