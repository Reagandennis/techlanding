'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/UserProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  MessageSquare,
  Users,
  Clock,
  Pin,
  HelpCircle,
  Video,
  FileText,
  Search,
  Plus,
  Filter,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import { ForumTopic, ForumPost, ForumUser, Course, CourseModule, Lesson } from '@/types/forum';
import { formatDistanceToNow } from 'date-fns';
import VotingComponent from './VotingComponent';
import Link from 'next/link';

interface CourseForumProps {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
}

interface CourseForumData {
  course: Course & { modules: CourseModule[] };
  topics: ForumTopic[];
  stats: {
    totalTopics: number;
    totalPosts: number;
    activeUsers: number;
    totalUsers: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'topic' | 'post' | 'question';
    user: ForumUser;
    content: string;
    relatedContent?: {
      type: 'module' | 'lesson';
      id: string;
      title: string;
    };
    createdAt: string;
  }>;
  pinnedTopics: ForumTopic[];
}

export const CourseForums: React.FC<CourseForumProps> = ({
  courseId,
  moduleId,
  lessonId
}) => {
  const { user } = useUser();
  const [forumData, setForumData] = useState<CourseForumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'questions' | 'discussions' | 'announcements'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    type: 'discussion' as 'discussion' | 'question' | 'announcement',
    moduleId: moduleId || '',
    lessonId: lessonId || ''
  });

  useEffect(() => {
    fetchForumData();
  }, [courseId, moduleId, lessonId, selectedFilter]);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        filter: selectedFilter,
        ...(moduleId && { moduleId }),
        ...(lessonId && { lessonId }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/lms/forum/courses/${courseId}?${params}`);
      const data = await response.json();

      if (data.success) {
        setForumData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!user || !newTopic.title.trim() || !newTopic.content.trim()) return;

    try {
      const response = await fetch('/api/lms/forum/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTopic,
          courseId,
          categoryId: 'course-specific'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNewTopic({
          title: '',
          content: '',
          type: 'discussion',
          moduleId: moduleId || '',
          lessonId: lessonId || ''
        });
        setShowCreateTopic(false);
        fetchForumData();
      }
    } catch (error) {
      console.error('Failed to create topic:', error);
    }
  };

  const getTopicIcon = (type: string) => {
    switch (type) {
      case 'question': return <HelpCircle className="h-4 w-4 text-blue-600" />;
      case 'announcement': return <Pin className="h-4 w-4 text-red-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTopicTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-800';
      case 'announcement': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'module': return <BookOpen className="h-3 w-3" />;
      case 'lesson': return <Video className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading course forum...</div>
      </div>
    );
  }

  if (!forumData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Course forum not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{forumData.course.title}</h1>
                <p className="text-muted-foreground">Course Discussion Forum</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {forumData.stats.totalTopics}
                  </div>
                  <p className="text-sm text-muted-foreground">Topics</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {forumData.stats.totalPosts}
                  </div>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {forumData.stats.activeUsers}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
              onKeyDown={(e) => e.key === 'Enter' && fetchForumData()}
            />
          </div>
          
          <div className="flex space-x-2">
            {(['all', 'questions', 'discussions', 'announcements'] as const).map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
              >
                {filter === 'all' && <Filter className="h-4 w-4 mr-2" />}
                {filter === 'questions' && <HelpCircle className="h-4 w-4 mr-2" />}
                {filter === 'discussions' && <MessageSquare className="h-4 w-4 mr-2" />}
                {filter === 'announcements' && <Pin className="h-4 w-4 mr-2" />}
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={() => setShowCreateTopic(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Topic
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Pinned Topics */}
          {forumData.pinnedTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pin className="h-5 w-5 mr-2 text-red-600" />
                  Pinned Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {forumData.pinnedTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/forum/topics/${topic.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getTopicIcon(topic.type)}
                        <div className="flex-1">
                          <h4 className="font-medium hover:text-blue-600">
                            {topic.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{topic.author.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(topic.createdAt))} ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge className={getTopicTypeColor(topic.type)}>
                        {topic.type}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Topics List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedFilter === 'all' ? 'All Topics' :
                 selectedFilter === 'questions' ? 'Questions' :
                 selectedFilter === 'discussions' ? 'Discussions' : 'Announcements'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forumData.topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/forum/topics/${topic.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <VotingComponent
                          targetId={topic.id}
                          targetType="topic"
                          initialVotes={{
                            upvotes: topic.upvotes || 0,
                            downvotes: topic.downvotes || 0,
                            userVote: topic.userVote
                          }}
                          size="sm"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getTopicIcon(topic.type)}
                            <h4 className="font-medium hover:text-blue-600 text-lg">
                              {topic.title}
                            </h4>
                            <Badge className={getTopicTypeColor(topic.type)}>
                              {topic.type}
                            </Badge>
                          </div>

                          {/* Related Content */}
                          {topic.relatedContent && (
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {getContentIcon(topic.relatedContent.type)}
                                <span className="ml-1">
                                  {topic.relatedContent.type === 'module' ? 'Module' : 'Lesson'}:
                                </span>
                                <span className="ml-1">{topic.relatedContent.title}</span>
                              </Badge>
                            </div>
                          )}

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {topic.excerpt || topic.content.substring(0, 150) + '...'}
                          </p>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={topic.author.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {topic.author.name.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{topic.author.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDistanceToNow(new Date(topic.createdAt))} ago</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{topic.postCount || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{topic.participantCount || 0}</span>
                              </div>
                              {topic.hasAcceptedSolution && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {forumData.topics.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      {searchQuery ? 'No topics match your search' : 'No topics yet'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to start a discussion!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Course Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {forumData.course.modules.map((module) => (
                <div key={module.id} className="space-y-1">
                  <Link
                    href={`/forum/courses/${courseId}?moduleId=${module.id}`}
                    className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                      moduleId === module.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm font-medium">{module.title}</span>
                    </div>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                  
                  {module.lessons && moduleId === module.id && (
                    <div className="ml-6 space-y-1">
                      {module.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/forum/courses/${courseId}?moduleId=${module.id}&lessonId=${lesson.id}`}
                          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm ${
                            lessonId === lesson.id ? 'bg-blue-50 text-blue-700' : 'text-muted-foreground'
                          }`}
                        >
                          <Video className="h-3 w-3" />
                          <span>{lesson.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forumData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="font-medium">{activity.user.name}</span>
                        {' '}
                        {activity.type === 'topic' && 'created a topic'}
                        {activity.type === 'post' && 'replied'}
                        {activity.type === 'question' && 'asked a question'}
                      </p>
                      
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.content}
                      </p>
                      
                      {activity.relatedContent && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {getContentIcon(activity.relatedContent.type)}
                            <span className="ml-1">{activity.relatedContent.title}</span>
                          </Badge>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt))} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Topic Modal */}
      {showCreateTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Create New Topic</CardTitle>
              <CardDescription>
                Start a new discussion in {forumData.course.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic Type</label>
                <div className="flex space-x-2">
                  {(['discussion', 'question', 'announcement'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={newTopic.type === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewTopic(prev => ({ ...prev, type }))}
                    >
                      {getTopicIcon(type)}
                      <span className="ml-2 capitalize">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter topic title..."
                  value={newTopic.title}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Describe your topic..."
                  value={newTopic.content}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateTopic(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTopic}
                  disabled={!newTopic.title.trim() || !newTopic.content.trim()}
                >
                  Create Topic
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};